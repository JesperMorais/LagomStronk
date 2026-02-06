import {
    loadData,
    saveData,
    getTodayStr,
    formatDate,
    getWorkoutByDate,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addCustomExercise,
    removeExerciseFromLibrary,
    getWorkoutsSorted,
    getUsedExercises,
    getWorkoutTemplates,
    getWorkoutTemplateById,
    addWorkoutTemplate,
    deleteWorkoutTemplate,
    applyWorkoutTemplate,
    saveWorkoutAsTemplate,
    getPersonalRecords,
    getOverallStats,
    getFrequencyStats,
    getWeeklySummary,
    getEstimated1RMs,
    getMuscleGroupStats,
    getExerciseHistory,
    getMostRecentExerciseSets
} from './data.js';

import {
    updateProgressChart,
    updateVolumeChart
} from './charts.js';

// App state
let appData = loadData();
let currentView = 'today';
let currentDate = getTodayStr();
let heroVolumeChart = null;

// Day names for week calendar
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// DOM Elements
const views = {
    today: document.getElementById('today-view'),
    history: document.getElementById('history-view'),
    progress: document.getElementById('progress-view'),
    library: document.getElementById('library-view'),
    workouts: document.getElementById('workouts-view')
};

const navButtons = document.querySelectorAll('.nav-btn');
const todayDateEl = document.getElementById('today-date');
const todayExercisesEl = document.getElementById('today-exercises');
const historyListEl = document.getElementById('history-list');
const exerciseLibraryListEl = document.getElementById('exercise-library-list');
const exerciseSelectEl = document.getElementById('exercise-select');

// Modals
const exerciseModal = document.getElementById('exercise-modal');
const customExerciseModal = document.getElementById('custom-exercise-modal');
const workoutModal = document.getElementById('workout-modal');
const createTemplateModal = document.getElementById('create-template-modal');
const viewTemplateModal = document.getElementById('view-template-modal');
const saveTemplateModal = document.getElementById('save-template-modal');

// Workout templates state
let editingTemplateId = null;
let viewingTemplateId = null;

// ========== HERO SECTION FUNCTIONS ==========

// Calculate current workout streak (consecutive days)
function calculateStreak() {
    if (appData.workouts.length === 0) return 0;

    const dates = appData.workouts.map(w => w.date).sort().reverse();
    const uniqueDates = [...new Set(dates)];

    const today = getTodayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Streak only counts if last workout was today or yesterday
    const lastWorkoutDate = uniqueDates[0];
    if (lastWorkoutDate !== today && lastWorkoutDate !== yesterdayStr) {
        return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currDate = new Date(uniqueDates[i]);
        const nextDate = new Date(uniqueDates[i + 1]);
        const diffDays = Math.round((currDate - nextDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Get which days this week have workouts
function getWeekWorkoutDays() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        weekDays.push({
            dayIndex: i,
            dateStr,
            dayLabel: DAY_NAMES[i],
            dayNum: date.getDate(),
            isToday: dateStr === getTodayStr(),
            hasWorkout: appData.workouts.some(w => w.date === dateStr)
        });
    }

    return weekDays;
}

// Get total volume for the current week (Mon-Sun or Sun-Sat based on locale)
function getThisWeekVolume() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let totalVolume = 0;

    for (const workout of appData.workouts) {
        const workoutDate = new Date(workout.date);
        if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
            for (const exercise of workout.exercises) {
                for (const set of exercise.sets) {
                    totalVolume += (set.weight || 0) * (set.reps || 0);
                }
            }
        }
    }

    return totalVolume;
}

// Get count of recent PRs (last 7 days)
function getRecentPRs() {
    const prs = getPersonalRecords(appData);
    const exercises = Object.keys(prs);

    if (exercises.length === 0) return { count: 0, exercises: [] };

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentPRExercises = [];

    for (const exercise of exercises) {
        const pr = prs[exercise];
        // Check if any PR was set in last 7 days
        const maxWeightDate = new Date(pr.maxWeight.date);
        const maxVolumeDate = new Date(pr.maxVolume.date);
        const maxRepsDate = new Date(pr.maxReps.date);

        if (maxWeightDate >= sevenDaysAgo || maxVolumeDate >= sevenDaysAgo || maxRepsDate >= sevenDaysAgo) {
            recentPRExercises.push(exercise);
        }
    }

    return {
        count: recentPRExercises.length,
        exercises: recentPRExercises.slice(0, 3) // Top 3 for display
    };
}

// Format volume for display
function formatVolumeDisplay(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M kg';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K kg';
    }
    return volume + ' kg';
}

// Get volume data for current week (Mon-Sun)
function getWeekVolumeData() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Calculate Monday (start of week)
    // If today is Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Create array for Mon-Sun (7 days)
    const weekVolumes = [0, 0, 0, 0, 0, 0, 0];

    for (const workout of appData.workouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        // Calculate which day of the week (0=Mon, 6=Sun)
        const diffDays = Math.round((workoutDate - monday) / (1000 * 60 * 60 * 24));

        // Check if workout is within this week (Mon-Sun)
        if (diffDays >= 0 && diffDays < 7) {
            let dayVolume = 0;
            for (const exercise of workout.exercises) {
                for (const set of exercise.sets) {
                    dayVolume += (set.weight || 0) * (set.reps || 0);
                }
            }
            weekVolumes[diffDays] += dayVolume;
        }
    }

    return weekVolumes;
}

// Initialize hero volume chart with gradient bars
function initHeroVolumeChart(weekData) {
    const canvas = document.getElementById('hero-volume-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Create gradient (mint to transparent)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#D1FFC6');
    gradient.addColorStop(1, 'rgba(209, 255, 198, 0.1)');

    // Destroy existing chart if it exists
    if (heroVolumeChart) {
        heroVolumeChart.destroy();
    }

    heroVolumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: weekData,
                backgroundColor: gradient,
                borderColor: '#D1FFC6',
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: '#D1FFC6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(35, 44, 51, 0.95)',
                    titleColor: '#D1FFC6',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(209, 255, 198, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K kg';
                            }
                            return value + ' kg';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 10,
                            weight: '500'
                        }
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

// Render hero stat cards
function renderHeroStats() {
    // This Week Volume
    const volumeEl = document.getElementById('this-week-volume');
    if (volumeEl) {
        const volume = getThisWeekVolume();
        volumeEl.textContent = formatVolumeDisplay(volume);
    }

    // Recent PRs
    const prsEl = document.getElementById('recent-prs-count');
    if (prsEl) {
        const recentPRs = getRecentPRs();
        prsEl.textContent = recentPRs.count > 0 ? recentPRs.count : '-';
    }
}

// Render the hero section
function renderHero() {
    const streakCount = calculateStreak();
    const weekDays = getWeekWorkoutDays();

    // Update streak display
    const streakEl = document.getElementById('streak-count');
    if (streakEl) {
        streakEl.textContent = streakCount;
    }

    // Update streak label for singular/plural
    const streakLabel = document.querySelector('.streak-label');
    if (streakLabel) {
        streakLabel.textContent = streakCount === 1 ? 'day streak' : 'day streak';
    }

    // Render week calendar
    const weekCalendarEl = document.getElementById('week-calendar');
    if (weekCalendarEl) {
        weekCalendarEl.innerHTML = weekDays.map(day => {
            const classes = ['week-day-dot'];
            if (day.isToday) classes.push('today');
            if (day.hasWorkout) classes.push('has-workout');

            return `
                <div class="week-day">
                    <span class="week-day-label">${day.dayLabel}</span>
                    <span class="${classes.join(' ')}">${day.dayNum}</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize app
function init() {
    setupNavigation();
    setupEventListeners();
    renderTodayView();
    updateTodayDate();
}

// Setup navigation
function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

// Switch between views
function switchView(viewName) {
    currentView = viewName;

    // Update nav buttons
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    Object.keys(views).forEach(key => {
        views[key].classList.toggle('active', key === viewName);
    });

    // Render view content
    switch (viewName) {
        case 'today':
            renderTodayView();
            break;
        case 'history':
            renderHistoryView();
            break;
        case 'progress':
            renderProgressView();
            break;
        case 'library':
            renderLibraryView();
            break;
        case 'workouts':
            renderWorkoutsView();
            break;
    }
}

// Update today's date display
function updateTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayDateEl.textContent = today.toLocaleDateString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    // Add exercise button
    document.getElementById('add-exercise-btn').addEventListener('click', openExerciseModal);

    // Exercise search modal
    document.getElementById('close-exercise-modal').addEventListener('click', closeExerciseModal);
    document.getElementById('exercise-search').addEventListener('input', (e) => {
        renderExerciseSearchResults(e.target.value);
    });
    document.getElementById('exercise-search-results').addEventListener('click', (e) => {
        const item = e.target.closest('.exercise-search-item');
        if (!item) return;
        const exerciseName = item.dataset.exercise;
        if (item.dataset.create === 'true') {
            appData = addCustomExercise(appData, exerciseName);
        }
        addNewExerciseToWorkout(exerciseName);
        closeExerciseModal();
    });

    // Inline today view events (delegation)
    todayExercisesEl.addEventListener('click', handleTodayClick);
    todayExercisesEl.addEventListener('change', handleTodayInputChange);

    // Custom exercise modal
    document.getElementById('add-custom-exercise-btn').addEventListener('click', openCustomExerciseModal);
    document.getElementById('close-custom-modal').addEventListener('click', closeCustomExerciseModal);
    document.getElementById('cancel-custom').addEventListener('click', closeCustomExerciseModal);
    document.getElementById('save-custom').addEventListener('click', saveCustomExercise);

    // Workout detail modal
    document.getElementById('close-workout-modal').addEventListener('click', closeWorkoutModal);
    document.getElementById('close-workout-btn').addEventListener('click', closeWorkoutModal);

    // Exercise select for progress charts
    exerciseSelectEl.addEventListener('change', (e) => {
        if (e.target.value) {
            updateProgressChart(appData, e.target.value);
        }
    });

    // Close modals on background click
    [exerciseModal, customExerciseModal, workoutModal, createTemplateModal, viewTemplateModal, saveTemplateModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Create template modal
    document.getElementById('create-workout-btn').addEventListener('click', openCreateTemplateModal);
    document.getElementById('close-create-template-modal').addEventListener('click', closeCreateTemplateModal);
    document.getElementById('cancel-template').addEventListener('click', closeCreateTemplateModal);
    document.getElementById('save-template').addEventListener('click', saveTemplate);
    document.getElementById('add-template-exercise-btn').addEventListener('click', addTemplateExerciseRow);

    // View template modal
    document.getElementById('close-view-template-modal').addEventListener('click', closeViewTemplateModal);
    document.getElementById('close-template-btn').addEventListener('click', closeViewTemplateModal);
    document.getElementById('start-template-btn').addEventListener('click', startTemplateWorkout);

    // Save as template modal
    document.getElementById('save-today-as-template-btn').addEventListener('click', openSaveTemplateModal);
    document.getElementById('close-save-template-modal').addEventListener('click', closeSaveTemplateModal);
    document.getElementById('cancel-save-template').addEventListener('click', closeSaveTemplateModal);
    document.getElementById('confirm-save-template').addEventListener('click', confirmSaveAsTemplate);
}

// Render today's workout with inline editable sets
function renderTodayView() {
    // Render hero section first
    renderHero();
    renderHeroStats();

    const workout = getWorkoutByDate(appData, currentDate);

    if (!workout || workout.exercises.length === 0) {
        todayExercisesEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💪</div>
                <p>No exercises logged today.</p>
                <p>Tap the button below to add your first exercise!</p>
            </div>
        `;
        return;
    }

    todayExercisesEl.innerHTML = workout.exercises.map((exercise, exIdx) => {
        const prevSets = getMostRecentExerciseSets(appData, exercise.name, currentDate);
        return `
            <div class="exercise-card" data-exercise-index="${exIdx}">
                <div class="exercise-card-header">
                    <span class="exercise-card-title">${exercise.name}</span>
                    <div class="exercise-card-actions">
                        <button class="btn-icon delete-exercise-btn" data-index="${exIdx}" title="Delete">🗑️</button>
                    </div>
                </div>
                <table class="inline-sets">
                    <thead>
                        <tr>
                            <th>SET</th>
                            <th>PREVIOUS</th>
                            <th>KG</th>
                            <th>REPS</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exercise.sets.map((set, setIdx) => {
                            const prev = prevSets[setIdx];
                            const isCompleted = set.completed !== false;
                            return `
                                <tr class="inline-set-row ${isCompleted ? 'completed' : ''}" data-exercise="${exIdx}" data-set="${setIdx}">
                                    <td class="set-num">${setIdx + 1}</td>
                                    <td class="set-prev">${prev ? `${prev.weight} x ${prev.reps}` : '-'}</td>
                                    <td><input type="number" class="inline-input set-kg" value="${set.weight}" step="0.5" min="0"></td>
                                    <td><input type="number" class="inline-input set-reps-input" value="${set.reps}" min="0"></td>
                                    <td><button class="set-check-btn ${isCompleted ? 'checked' : ''}">✓</button></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <button class="btn-add-inline-set" data-exercise="${exIdx}">+ Add Set</button>
            </div>
        `;
    }).join('');
}

// Render history view
function renderHistoryView() {
    const workouts = getWorkoutsSorted(appData);

    if (workouts.length === 0) {
        historyListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>No workout history yet.</p>
                <p>Start logging workouts to see them here!</p>
            </div>
        `;
        return;
    }

    historyListEl.innerHTML = workouts.map(workout => {
        const exerciseCount = workout.exercises.length;
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const exerciseNames = workout.exercises.map(ex => ex.name).join(', ');

        return `
            <div class="history-card" onclick="viewWorkout('${workout.date}')">
                <div class="history-card-date">${formatDate(workout.date)}</div>
                <div class="history-card-summary">
                    ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${totalSets} sets
                </div>
                <div class="history-card-summary">${exerciseNames}</div>
            </div>
        `;
    }).join('');
}

// Render progress view
function renderProgressView() {
    // Only show exercises that have workout data
    const usedExercises = getUsedExercises(appData);
    const hasData = appData.workouts.length > 0;

    // Show empty state if no workouts
    if (!hasData) {
        renderEmptyProgressView();
        return;
    }

    // Show all stats sections
    document.getElementById('overall-stats').parentElement.style.display = '';
    document.getElementById('frequency-stats').parentElement.style.display = '';
    document.getElementById('weekly-summary').parentElement.style.display = '';
    document.getElementById('muscle-group-stats').parentElement.style.display = '';
    document.getElementById('exercise-select').parentElement.parentElement.style.display = '';
    document.getElementById('volume-chart').parentElement.parentElement.style.display = '';
    document.getElementById('personal-records').parentElement.style.display = '';
    document.getElementById('estimated-1rms').parentElement.style.display = '';

    // Render overall stats
    renderOverallStats();

    // Render frequency stats
    renderFrequencyStats();

    // Render weekly summary
    renderWeeklySummary();

    // Render muscle group stats
    renderMuscleGroupStats();

    // Populate exercise select
    exerciseSelectEl.innerHTML = '<option value="">Select Exercise</option>' +
        usedExercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');

    // Update volume chart
    updateVolumeChart(appData);

    // If there are exercises, select the first one
    if (usedExercises.length > 0) {
        exerciseSelectEl.value = usedExercises[0];
        updateProgressChart(appData, usedExercises[0]);
    }

    // Render personal records
    renderPersonalRecords();

    // Render estimated 1RMs
    renderEstimated1RMs();
}

// Render empty progress view
function renderEmptyProgressView() {
    // Hide all stats sections except overall stats
    document.getElementById('frequency-stats').parentElement.style.display = 'none';
    document.getElementById('weekly-summary').parentElement.style.display = 'none';
    document.getElementById('muscle-group-stats').parentElement.style.display = 'none';
    document.getElementById('exercise-select').parentElement.parentElement.style.display = 'none';
    document.getElementById('volume-chart').parentElement.parentElement.style.display = 'none';
    document.getElementById('personal-records').parentElement.style.display = 'none';
    document.getElementById('estimated-1rms').parentElement.style.display = 'none';

    // Show welcome message in overall stats
    const container = document.getElementById('overall-stats');
    container.innerHTML = `
        <div class="empty-progress-state">
            <div class="empty-state-icon">📊</div>
            <h3>No Stats Yet</h3>
            <p>Start logging workouts to see your progress here!</p>
            <p class="empty-state-hint">Go to Today and add your first exercise.</p>
        </div>
    `;
}

// Render overall stats
function renderOverallStats() {
    const stats = getOverallStats(appData);
    const container = document.getElementById('overall-stats');

    container.innerHTML = `
        <div class="stat-card highlight">
            <div class="stat-value">${stats.totalWorkouts}</div>
            <div class="stat-label">Total Workouts</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatVolume(stats.totalVolume)}</div>
            <div class="stat-label">Total Volume</div>
            <div class="stat-sublabel">kg lifted</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalSets}</div>
            <div class="stat-label">Total Sets</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgExercisesPerWorkout}</div>
            <div class="stat-label">Avg Exercises</div>
            <div class="stat-sublabel">per workout</div>
        </div>
    `;
}

// Render frequency stats
function renderFrequencyStats() {
    const stats = getFrequencyStats(appData);
    const container = document.getElementById('frequency-stats');

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.thisWeek}</div>
            <div class="stat-label">This Week</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.thisMonth}</div>
            <div class="stat-label">This Month</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgPerWeek}</div>
            <div class="stat-label">Avg/Week</div>
        </div>
        <div class="stat-card ${stats.currentStreak > 0 ? 'highlight' : ''}">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">Current Streak</div>
            <div class="stat-sublabel">days</div>
        </div>
    `;
}

// Render weekly summary
function renderWeeklySummary() {
    const weeks = getWeeklySummary(appData);
    const container = document.getElementById('weekly-summary');

    const maxVolume = Math.max(...weeks.map(w => w.volume), 1);

    container.innerHTML = weeks.map(week => {
        const percentage = (week.volume / maxVolume) * 100;
        return `
            <div class="weekly-bar">
                <span class="weekly-bar-label">${week.label}</span>
                <div class="weekly-bar-track">
                    <div class="weekly-bar-fill" style="width: ${percentage}%"></div>
                    <span class="weekly-bar-value">${week.workouts} workouts</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render muscle group stats
function renderMuscleGroupStats() {
    const stats = getMuscleGroupStats(appData);
    const container = document.getElementById('muscle-group-stats');

    const totalSets = Object.values(stats).reduce((sum, s) => sum + s.sets, 0);
    if (totalSets === 0) {
        container.innerHTML = '<div class="empty-state"><p>No workout data yet</p></div>';
        return;
    }

    const groups = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

    container.innerHTML = groups.map(group => {
        const data = stats[group];
        const percentage = (data.sets / totalSets) * 100;
        return `
            <div class="muscle-group-bar">
                <span class="muscle-group-label">${group}</span>
                <div class="muscle-group-track">
                    <div class="muscle-group-fill ${group.toLowerCase()}" style="width: ${percentage}%"></div>
                </div>
                <span class="muscle-group-value">${data.sets} sets</span>
            </div>
        `;
    }).join('');
}

// Render personal records
function renderPersonalRecords() {
    const prs = getPersonalRecords(appData);
    const container = document.getElementById('personal-records');

    const exercises = Object.keys(prs).sort();

    if (exercises.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No records yet. Start training!</p></div>';
        return;
    }

    container.innerHTML = exercises.slice(0, 5).map(exercise => {
        const pr = prs[exercise];
        return `
            <div class="pr-item">
                <div class="pr-item-header">
                    <span class="pr-exercise-name">${exercise}</span>
                    <span class="pr-badge">PR</span>
                </div>
                <div class="pr-details">
                    <div class="pr-detail">
                        <span class="pr-detail-value">${pr.maxWeight.value} kg</span>
                        <span>Max Weight</span>
                    </div>
                    <div class="pr-detail">
                        <span class="pr-detail-value">${pr.maxVolume.value} kg</span>
                        <span>Best Volume</span>
                    </div>
                    <div class="pr-detail">
                        <span class="pr-detail-value">${pr.maxReps.value}</span>
                        <span>Most Reps</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render estimated 1RMs
function renderEstimated1RMs() {
    const e1rms = getEstimated1RMs(appData);
    const container = document.getElementById('estimated-1rms');

    const exercises = Object.keys(e1rms).sort();

    if (exercises.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No data yet</p></div>';
        return;
    }

    container.innerHTML = exercises.slice(0, 6).map(exercise => {
        const e1rm = e1rms[exercise];
        return `
            <div class="e1rm-item">
                <div class="e1rm-exercise">${exercise}</div>
                <div class="e1rm-value">${e1rm.value}<span class="e1rm-unit"> kg</span></div>
                <div class="e1rm-based-on">${e1rm.basedOn.weight}kg x ${e1rm.basedOn.reps}</div>
            </div>
        `;
    }).join('');
}

// Format large volume numbers
function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
}

// Render library view
function renderLibraryView() {
    exerciseLibraryListEl.innerHTML = appData.exerciseLibrary.map(exercise => `
        <div class="library-item">
            <span class="library-item-name">${exercise}</span>
            <button class="btn-icon" onclick="deleteFromLibrary('${exercise}')" title="Remove">🗑️</button>
        </div>
    `).join('');
}

// ========== EXERCISE SEARCH MODAL ==========

// Open exercise modal with search
function openExerciseModal() {
    const searchInput = document.getElementById('exercise-search');
    searchInput.value = '';
    renderExerciseSearchResults('');
    exerciseModal.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
}

// Close exercise modal
function closeExerciseModal() {
    exerciseModal.classList.remove('active');
}

// Render filtered exercise search results
function renderExerciseSearchResults(query) {
    const resultsList = document.getElementById('exercise-search-results');
    const q = query.toLowerCase().trim();
    const filtered = appData.exerciseLibrary.filter(ex =>
        ex.toLowerCase().includes(q)
    );

    let html = filtered.map(ex =>
        `<div class="exercise-search-item" data-exercise="${ex}">${ex}</div>`
    ).join('');

    // Show "Create" option if query doesn't match any exercise exactly
    if (q && !appData.exerciseLibrary.some(ex => ex.toLowerCase() === q)) {
        html += `<div class="exercise-search-item exercise-search-create" data-exercise="${query.trim()}" data-create="true">+ Create "${query.trim()}"</div>`;
    }

    resultsList.innerHTML = html;
}

// Add a new exercise to today's workout
function addNewExerciseToWorkout(exerciseName) {
    const prevSets = getMostRecentExerciseSets(appData, exerciseName, currentDate);
    const exercise = {
        name: exerciseName,
        sets: prevSets.length > 0
            ? prevSets.map(s => ({ weight: s.weight, reps: s.reps, completed: false }))
            : [{ weight: 20, reps: 10, completed: false }]
    };
    appData = addExerciseToWorkout(appData, currentDate, exercise);
    renderTodayView();
}

// ========== INLINE TODAY VIEW EVENT HANDLERS ==========

// Handle clicks on today's exercise cards (delegation)
function handleTodayClick(e) {
    // Check/uncheck set
    if (e.target.classList.contains('set-check-btn')) {
        const row = e.target.closest('.inline-set-row');
        const exIdx = parseInt(row.dataset.exercise);
        const setIdx = parseInt(row.dataset.set);
        toggleSetCompletion(exIdx, setIdx);
        return;
    }

    // Delete exercise
    if (e.target.classList.contains('delete-exercise-btn')) {
        const idx = parseInt(e.target.dataset.index);
        if (confirm('Delete this exercise?')) {
            appData = removeExerciseFromWorkout(appData, currentDate, idx);
            renderTodayView();
        }
        return;
    }

    // Add set
    if (e.target.classList.contains('btn-add-inline-set')) {
        const exIdx = parseInt(e.target.dataset.exercise);
        addInlineSet(exIdx);
        return;
    }
}

// Handle input changes on inline sets (delegation)
function handleTodayInputChange(e) {
    if (!e.target.classList.contains('inline-input')) return;
    const row = e.target.closest('.inline-set-row');
    const exIdx = parseInt(row.dataset.exercise);
    const setIdx = parseInt(row.dataset.set);
    updateInlineSetValue(exIdx, setIdx, row);
}

// Toggle set completion
function toggleSetCompletion(exIdx, setIdx) {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout) return;
    const set = workout.exercises[exIdx].sets[setIdx];
    const isCompleted = set.completed !== false;
    set.completed = !isCompleted;
    saveData(appData);
    renderTodayView();
}

// Update set weight/reps from inline inputs
function updateInlineSetValue(exIdx, setIdx, row) {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout) return;
    const set = workout.exercises[exIdx].sets[setIdx];
    set.weight = parseFloat(row.querySelector('.set-kg').value) || 0;
    set.reps = parseInt(row.querySelector('.set-reps-input').value) || 0;
    saveData(appData);
}

// Add a new set to an exercise inline
function addInlineSet(exIdx) {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout) return;
    const exercise = workout.exercises[exIdx];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false
    });
    saveData(appData);
    renderTodayView();
}

// Open custom exercise modal
function openCustomExerciseModal() {
    document.getElementById('custom-exercise-name').value = '';
    customExerciseModal.classList.add('active');
}

// Close custom exercise modal
function closeCustomExerciseModal() {
    customExerciseModal.classList.remove('active');
}

// Save custom exercise
function saveCustomExercise() {
    const name = document.getElementById('custom-exercise-name').value.trim();

    if (!name) {
        alert('Please enter an exercise name.');
        return;
    }

    appData = addCustomExercise(appData, name);
    closeCustomExerciseModal();
    renderLibraryView();
}

// Delete from library
window.deleteFromLibrary = function(exerciseName) {
    if (confirm(`Remove "${exerciseName}" from library?`)) {
        appData = removeExerciseFromLibrary(appData, exerciseName);
        renderLibraryView();
    }
};

// View workout details
window.viewWorkout = function(dateStr) {
    const workout = getWorkoutByDate(appData, dateStr);
    if (!workout) return;

    document.getElementById('workout-modal-title').textContent = formatDate(dateStr);

    const modalBody = document.getElementById('workout-modal-body');
    modalBody.innerHTML = workout.exercises.map(exercise => `
        <div class="workout-detail-exercise">
            <h4>${exercise.name}</h4>
            <table class="sets-table">
                <thead>
                    <tr>
                        <th>Set</th>
                        <th>Reps</th>
                        <th>Weight (kg)</th>
                    </tr>
                </thead>
                <tbody>
                    ${exercise.sets.map((set, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${set.reps}</td>
                            <td>${set.weight}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('');

    workoutModal.classList.add('active');
};

// Close workout modal
function closeWorkoutModal() {
    workoutModal.classList.remove('active');
}

// ========== WORKOUT TEMPLATES ==========

// Render workouts view
function renderWorkoutsView() {
    const templates = getWorkoutTemplates(appData);
    const templatesListEl = document.getElementById('workout-templates-list');

    if (templates.length === 0) {
        templatesListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No workout templates yet.</p>
                <p>Create a new workout or save today's workout as a template!</p>
            </div>
        `;
        return;
    }

    // Separate default and custom templates
    const defaultTemplates = templates.filter(t => t.isDefault);
    const customTemplates = templates.filter(t => !t.isDefault);

    let html = '';

    if (customTemplates.length > 0) {
        html += '<h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">My Workouts</h3>';
        html += customTemplates.map(template => renderTemplateCard(template)).join('');
        html += '<div style="margin-top: var(--spacing-lg);"></div>';
    }

    if (defaultTemplates.length > 0) {
        html += '<h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Preset Workouts</h3>';
        html += defaultTemplates.map(template => renderTemplateCard(template)).join('');
    }

    templatesListEl.innerHTML = html;
}

// Render a single template card
function renderTemplateCard(template) {
    const exerciseNames = template.exercises.map(e => e.name).join(', ');
    const totalSets = template.exercises.reduce((sum, e) => sum + e.sets, 0);

    return `
        <div class="template-card" onclick="viewTemplate('${template.id}')">
            <div class="template-card-header">
                <span class="template-card-name">${template.name}</span>
                <span class="template-card-badge ${template.isDefault ? '' : 'custom'}">${template.isDefault ? 'Preset' : 'Custom'}</span>
            </div>
            <div class="template-card-exercises">${exerciseNames}</div>
            <div class="template-card-summary">${template.exercises.length} exercises • ${totalSets} sets</div>
        </div>
    `;
}

// Open create template modal
function openCreateTemplateModal() {
    editingTemplateId = null;
    document.getElementById('template-name').value = '';
    document.getElementById('create-template-title').textContent = 'Create Workout';
    const exercisesList = document.getElementById('template-exercises-list');
    exercisesList.innerHTML = '';

    // Add initial exercise row
    addTemplateExerciseRow();

    createTemplateModal.classList.add('active');
}

// Close create template modal
function closeCreateTemplateModal() {
    createTemplateModal.classList.remove('active');
    editingTemplateId = null;
}

// Add exercise row to template modal
function addTemplateExerciseRow() {
    const exercisesList = document.getElementById('template-exercises-list');

    const row = document.createElement('div');
    row.className = 'template-exercise-row';
    row.innerHTML = `
        <select class="select-input template-ex-name">
            ${appData.exerciseLibrary.map(ex => `<option value="${ex}">${ex}</option>`).join('')}
        </select>
        <label>Sets</label>
        <input type="number" class="number-input template-ex-sets" value="3" min="1" max="10">
        <label>Reps</label>
        <input type="number" class="number-input template-ex-reps" value="10" min="1" max="100">
        <button class="btn-icon" onclick="removeTemplateExerciseRow(this)" title="Remove">✕</button>
    `;

    exercisesList.appendChild(row);
}

// Remove exercise row from template
window.removeTemplateExerciseRow = function(btn) {
    btn.closest('.template-exercise-row').remove();
};

// Save template
function saveTemplate() {
    const name = document.getElementById('template-name').value.trim();
    if (!name) {
        alert('Please enter a workout name.');
        return;
    }

    const exercisesList = document.getElementById('template-exercises-list');
    const rows = exercisesList.querySelectorAll('.template-exercise-row');

    if (rows.length === 0) {
        alert('Please add at least one exercise.');
        return;
    }

    const exercises = Array.from(rows).map(row => ({
        name: row.querySelector('.template-ex-name').value,
        sets: parseInt(row.querySelector('.template-ex-sets').value) || 3,
        reps: parseInt(row.querySelector('.template-ex-reps').value) || 10
    }));

    appData = addWorkoutTemplate(appData, { name, exercises });
    closeCreateTemplateModal();
    renderWorkoutsView();
}

// View template
window.viewTemplate = function(templateId) {
    const template = getWorkoutTemplateById(appData, templateId);
    if (!template) return;

    viewingTemplateId = templateId;

    document.getElementById('view-template-title').textContent = template.name;

    const body = document.getElementById('view-template-body');
    body.innerHTML = template.exercises.map(ex => `
        <div class="template-detail-exercise">
            <span class="template-detail-name">${ex.name}</span>
            <span class="template-detail-info">${ex.sets} sets × ${ex.reps} reps</span>
        </div>
    `).join('');

    // Add delete button for custom templates
    const footer = viewTemplateModal.querySelector('.modal-footer');
    const existingDeleteBtn = footer.querySelector('.btn-danger');
    if (existingDeleteBtn) existingDeleteBtn.remove();

    if (!template.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTemplate(templateId);
        footer.insertBefore(deleteBtn, footer.firstChild);
    }

    viewTemplateModal.classList.add('active');
};

// Close view template modal
function closeViewTemplateModal() {
    viewTemplateModal.classList.remove('active');
    viewingTemplateId = null;
}

// Start workout from template
function startTemplateWorkout() {
    if (!viewingTemplateId) return;

    appData = applyWorkoutTemplate(appData, currentDate, viewingTemplateId);
    closeViewTemplateModal();
    switchView('today');
}

// Delete template
function deleteTemplate(templateId) {
    if (confirm('Delete this workout template?')) {
        appData = deleteWorkoutTemplate(appData, templateId);
        closeViewTemplateModal();
        renderWorkoutsView();
    }
}

// Open save as template modal
function openSaveTemplateModal() {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout || workout.exercises.length === 0) {
        alert('No exercises to save. Add some exercises first!');
        return;
    }

    document.getElementById('save-template-name').value = '';
    saveTemplateModal.classList.add('active');
}

// Close save as template modal
function closeSaveTemplateModal() {
    saveTemplateModal.classList.remove('active');
}

// Confirm save as template
function confirmSaveAsTemplate() {
    const name = document.getElementById('save-template-name').value.trim();
    if (!name) {
        alert('Please enter a template name.');
        return;
    }

    appData = saveWorkoutAsTemplate(appData, currentDate, name);
    closeSaveTemplateModal();
    alert('Workout saved as template!');
}

// Initialize the app
init();
