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
    getMostRecentExerciseSets,
    getMuscleGroups,
    getEquipmentTypes,
    getExerciseMetadata
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

// Library view state
let libraryViewMode = 'list'; // 'list' or 'grid'
let librarySearchQuery = '';
let librarySelectedMuscles = [];
let librarySelectedEquipment = [];
let libraryFavorites = JSON.parse(localStorage.getItem('lagomstronk_favorites') || '[]');

// Calendar state
let calendarDisplayDate = new Date(); // The month being displayed
let calendarIntensityCache = new Map(); // Cache for intensity calculations

// Day names for week calendar
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// DOM Elements
const views = {
    today: document.getElementById('today-view'),
    workout: document.getElementById('workout-view'),
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

// Active workout state
let activeWorkout = {
    isActive: false,
    name: '',
    startTime: null,
    timerInterval: null
};

// Mini-player DOM elements
const miniPlayer = document.getElementById('mini-player');
const miniPlayerName = document.getElementById('mini-player-name');
const miniPlayerTimer = document.getElementById('mini-player-timer');
const miniPlayerExpand = document.getElementById('mini-player-expand');
const miniPlayerFinish = document.getElementById('mini-player-finish');
const miniPlayerWorkoutName = document.getElementById('mini-player-workout-name');
const miniPlayerExercise = document.getElementById('mini-player-exercise');
const miniPlayerProgress = document.getElementById('mini-player-progress');
const fabStartWorkout = document.getElementById('fab-start-workout');

// Workout view DOM elements
const workoutView = document.getElementById('workout-view');
const workoutMinimizeBtn = document.getElementById('workout-minimize-btn');
const workoutFinishBtn = document.getElementById('workout-finish-btn');
const workoutNameInput = document.getElementById('workout-name-input');
const workoutTimerValue = document.getElementById('workout-timer-value');
const workoutExerciseContainer = document.getElementById('workout-exercise-container');
const workoutAddExerciseBtn = document.getElementById('workout-add-exercise-btn');

// Exercise Wizard state
let wizardState = {
    currentStep: 1,
    exerciseName: '',
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: 'other'
};

// Exercise Wizard DOM elements
const exerciseWizardModal = document.getElementById('exercise-wizard-modal');

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

    // Hero Volume Chart
    const weekData = getWeekVolumeData();
    const hasData = weekData.some(v => v > 0);

    const chartContainer = document.getElementById('hero-volume-chart-container');
    if (chartContainer) {
        // Show/hide chart based on data availability
        if (hasData) {
            chartContainer.style.display = '';
            initHeroVolumeChart(weekData);
        } else {
            chartContainer.style.display = 'none';
            // Destroy chart if hidden
            if (heroVolumeChart) {
                heroVolumeChart.destroy();
                heroVolumeChart = null;
            }
        }
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

// ========== WORKOUT FLOW (MINI-PLAYER) ==========

// Start a workout session - opens workout screen
function startWorkout(workoutName = null) {
    const workout = getWorkoutByDate(appData, currentDate);

    // Generate workout name if not provided
    if (!workoutName) {
        if (workout && workout.exercises.length > 0) {
            // Use first exercise name or generic name
            workoutName = workout.name || `My Workout`;
        } else {
            // Count existing workouts for naming
            const workoutCount = appData.workouts.filter(w =>
                w.name && w.name.startsWith('My Workout')
            ).length;
            workoutName = `My Workout #${workoutCount + 1}`;
        }
    }

    activeWorkout.isActive = true;
    activeWorkout.name = workoutName;
    activeWorkout.startTime = Date.now();

    // Start timer
    updateWorkoutTimer();
    activeWorkout.timerInterval = setInterval(updateWorkoutTimer, 1000);

    // Open workout screen
    openWorkoutScreen();

    // Update UI
    updateFABVisibility();

    // Add body class for padding adjustment
    document.body.classList.add('workout-active');
}

// Finish the current workout
function finishWorkout() {
    if (!activeWorkout.isActive) return;

    // Ask for confirmation
    if (!confirm('Finish this workout?')) {
        return;
    }

    // Stop timer
    if (activeWorkout.timerInterval) {
        clearInterval(activeWorkout.timerInterval);
        activeWorkout.timerInterval = null;
    }

    // Reset state
    activeWorkout.isActive = false;
    activeWorkout.name = '';
    activeWorkout.startTime = null;

    // Close workout screen
    if (workoutView) {
        workoutView.classList.remove('active');
    }

    // Update UI
    updateMiniPlayerVisibility();
    updateFABVisibility();

    // Remove body class
    document.body.classList.remove('workout-active');

    // Navigate to Today to show completed workout
    switchView('today');

    // Clear calendar cache since workout data changed
    clearCalendarCache();
}

// Open workout screen (fullscreen takeover)
function openWorkoutScreen() {
    if (!workoutView) return;

    // Show workout view
    workoutView.classList.add('active');

    // Hide bottom nav
    document.body.classList.add('workout-active');

    // Set workout name
    if (workoutNameInput) {
        workoutNameInput.value = activeWorkout.name;
    }

    // Render exercises in workout view
    renderWorkoutExercises();

    // Hide other views
    Object.keys(views).forEach(key => {
        if (key !== 'workout') {
            views[key].classList.remove('active');
        }
    });

    // Update nav to show no selection (workout screen is separate)
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Hide mini-player when on workout screen
    updateMiniPlayerVisibility();
}

// Minimize workout (collapse to mini-player)
function minimizeWorkout() {
    if (!workoutView) return;

    // Hide workout view
    workoutView.classList.remove('active');

    // Show bottom nav
    document.body.classList.remove('workout-active');

    // Return to today view
    switchView('today');

    // Show mini-player
    updateMiniPlayerVisibility();
}

// Expand workout (return from mini-player to workout screen)
function expandWorkout() {
    openWorkoutScreen();
}

// Render exercises in workout screen
function renderWorkoutExercises() {
    if (!workoutExerciseContainer) return;

    const workout = getWorkoutByDate(appData, currentDate);

    if (!workout || workout.exercises.length === 0) {
        workoutExerciseContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💪</div>
                <p>No exercises added yet.</p>
                <p>Tap "Add Exercise" below to get started!</p>
            </div>
        `;
        return;
    }

    workoutExerciseContainer.innerHTML = workout.exercises.map((exercise, exIdx) => {
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
                            const weightPlaceholder = prev ? `Last: ${prev.weight}` : '';
                            const repsPlaceholder = prev ? `Last: ${prev.reps}` : '';
                            return `
                                <tr class="inline-set-row ${isCompleted ? 'completed' : ''}" data-exercise="${exIdx}" data-set="${setIdx}">
                                    <td class="set-num">${setIdx + 1}</td>
                                    <td class="set-prev">${prev ? `${prev.weight} x ${prev.reps}` : '-'}</td>
                                    <td><input type="number" class="inline-input set-kg" value="${set.weight}" step="2.5" min="0" readonly data-numpad-type="weight" placeholder="${weightPlaceholder}"></td>
                                    <td><input type="number" class="inline-input set-reps-input" value="${set.reps}" min="0" readonly data-numpad-type="reps" placeholder="${repsPlaceholder}"></td>
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

// Update workout timer (both mini-player and workout screen)
function updateWorkoutTimer() {
    if (!activeWorkout.startTime) return;

    const elapsed = Date.now() - activeWorkout.startTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000) % 60;
    const hours = Math.floor(elapsed / 3600000);

    let timeStr;
    if (hours > 0) {
        timeStr = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Update workout screen timer
    if (workoutTimerValue) {
        workoutTimerValue.textContent = timeStr;
    }

    // Update mini-player timer
    if (miniPlayerTimer) {
        miniPlayerTimer.textContent = timeStr;
    }
}

// Update mini-player timer display (deprecated, keeping for compatibility)
function updateMiniPlayerTimer() {
    updateWorkoutTimer();
}

// Update mini-player visibility based on current view and workout state
function updateMiniPlayerVisibility() {
    if (!miniPlayer) return;

    // Show mini-player when workout is active AND not on workout screen
    const isOnWorkoutScreen = workoutView && workoutView.classList.contains('active');
    const shouldShow = activeWorkout.isActive && !isOnWorkoutScreen;

    if (shouldShow) {
        miniPlayer.classList.add('active');
        updateMiniPlayerContent();
    } else {
        miniPlayer.classList.remove('active');
    }
}

// Update mini-player content (exercise, progress, workout name)
function updateMiniPlayerContent() {
    const workout = getWorkoutByDate(appData, currentDate);

    // Update workout name
    if (miniPlayerWorkoutName) {
        miniPlayerWorkoutName.textContent = activeWorkout.name || 'Workout';
    }

    // Update current exercise and progress
    if (workout && workout.exercises.length > 0) {
        // Find the first exercise with incomplete sets (or last exercise)
        let currentExercise = workout.exercises[workout.exercises.length - 1];
        for (const ex of workout.exercises) {
            const hasIncompleteSets = ex.sets.some(s => s.completed === false);
            if (hasIncompleteSets) {
                currentExercise = ex;
                break;
            }
        }

        // Update exercise name
        if (miniPlayerExercise) {
            miniPlayerExercise.textContent = currentExercise.name;
        }

        // Calculate progress (completed / total sets)
        const completedSets = currentExercise.sets.filter(s => s.completed !== false).length;
        const totalSets = currentExercise.sets.length;

        if (miniPlayerProgress) {
            miniPlayerProgress.textContent = `${completedSets}/${totalSets} sets`;
        }
    } else {
        // No exercises
        if (miniPlayerExercise) {
            miniPlayerExercise.textContent = 'No exercises';
        }
        if (miniPlayerProgress) {
            miniPlayerProgress.textContent = '0/0 sets';
        }
    }
}

// Update FAB visibility
function updateFABVisibility() {
    if (!fabStartWorkout) return;

    // Hide FAB when workout is active, show otherwise
    if (activeWorkout.isActive) {
        fabStartWorkout.classList.add('hidden');
    } else {
        fabStartWorkout.classList.remove('hidden');
    }
}

// Setup mini-player event listeners
function setupMiniPlayerListeners() {
    // Expand (tap mini-player content) - return to workout screen
    if (miniPlayerExpand) {
        miniPlayerExpand.addEventListener('click', (e) => {
            // Don't trigger if clicking the finish button
            if (e.target.closest('.mini-player-finish-btn')) return;
            expandWorkout();
        });
    }

    // Finish button
    if (miniPlayerFinish) {
        miniPlayerFinish.addEventListener('click', (e) => {
            e.stopPropagation();
            finishWorkout();
        });
    }

    // FAB - start workout
    if (fabStartWorkout) {
        fabStartWorkout.addEventListener('click', () => {
            // Always start workout directly (opens empty workout screen)
            // User can add exercises from within the workout screen
            startWorkout();
        });
    }
}

// Initialize app
function init() {
    setupNavigation();
    setupEventListeners();
    setupMiniPlayerListeners();
    renderTodayView();
    updateTodayDate();
    updateFABVisibility();
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

    // Update mini-player visibility (show when workout active and not on Today)
    updateMiniPlayerVisibility();

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
    // Workout screen buttons
    if (workoutMinimizeBtn) {
        workoutMinimizeBtn.addEventListener('click', minimizeWorkout);
    }
    if (workoutFinishBtn) {
        workoutFinishBtn.addEventListener('click', finishWorkout);
    }
    if (workoutAddExerciseBtn) {
        workoutAddExerciseBtn.addEventListener('click', openExerciseModal);
    }
    if (workoutNameInput) {
        workoutNameInput.addEventListener('change', (e) => {
            activeWorkout.name = e.target.value;
            if (miniPlayerName) {
                miniPlayerName.textContent = activeWorkout.name;
            }
        });
    }

    // Workout exercise container events (delegation)
    if (workoutExerciseContainer) {
        workoutExerciseContainer.addEventListener('click', handleTodayClick);
        workoutExerciseContainer.addEventListener('change', handleTodayInputChange);
        // Also listen for focus events for better input reliability
        workoutExerciseContainer.addEventListener('focus', handleNumpadFocus, true);
    }

    // Add exercise button removed from landing page
    // The workout-add-exercise-btn is handled above in this function

    // Exercise search modal
    document.getElementById('close-exercise-modal').addEventListener('click', closeExerciseModal);
    document.getElementById('exercise-search').addEventListener('input', (e) => {
        renderExerciseSearchResults(e.target.value);
    });
    document.getElementById('exercise-search-results').addEventListener('click', (e) => {
        const item = e.target.closest('.exercise-search-item');
        if (!item) return;

        // Handle wizard option
        if (item.dataset.wizard !== undefined) {
            closeExerciseModal();
            openExerciseWizard();
            // Pre-fill name if provided
            if (item.dataset.wizard) {
                setTimeout(() => {
                    document.getElementById('wizard-exercise-name').value = item.dataset.wizard;
                }, 100);
            }
            return;
        }

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
    // Also listen for focus events for better input reliability
    todayExercisesEl.addEventListener('focus', handleNumpadFocus, true);

    // Custom exercise modal
    document.getElementById('add-custom-exercise-btn').addEventListener('click', openExerciseWizard);
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

    // Library controls
    const librarySearchInput = document.getElementById('library-search');
    if (librarySearchInput) {
        librarySearchInput.addEventListener('input', (e) => {
            librarySearchQuery = e.target.value;
            renderLibraryView();
        });
    }

    const filterBtn = document.getElementById('library-filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', openFilterDrawer);
    }

    const viewToggleBtn = document.getElementById('library-view-toggle');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', toggleLibraryView);
    }

    // Filter drawer
    const closeFilterBtn = document.getElementById('close-filter-drawer');
    if (closeFilterBtn) {
        closeFilterBtn.addEventListener('click', closeFilterDrawer);
    }

    const filterOverlay = document.getElementById('filter-drawer-overlay');
    if (filterOverlay) {
        filterOverlay.addEventListener('click', closeFilterDrawer);
    }

    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Calendar navigation
    const calendarPrevBtn = document.getElementById('calendar-prev');
    if (calendarPrevBtn) {
        calendarPrevBtn.addEventListener('click', () => navigateMonth(-1));
    }

    const calendarNextBtn = document.getElementById('calendar-next');
    if (calendarNextBtn) {
        calendarNextBtn.addEventListener('click', () => navigateMonth(1));
    }

    // Calendar popup close
    const calendarPopupClose = document.getElementById('calendar-popup-close');
    if (calendarPopupClose) {
        calendarPopupClose.addEventListener('click', closeCalendarPopup);
    }

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('calendar-popup');
        const calendarGrid = document.getElementById('calendar-grid');
        if (popup && popup.classList.contains('active')) {
            // Check if click is outside popup and calendar grid
            if (!popup.contains(e.target) && !calendarGrid.contains(e.target)) {
                closeCalendarPopup();
            }
        }
    });
}

// Render today's dashboard (stats only, no exercise list)
function renderTodayView() {
    // Render hero section with streak and calendar
    renderHero();
    // Render stats cards (volume chart, PRs)
    renderHeroStats();
    // Render last workout summary
    renderLastWorkout();

    // Dashboard shows stats only - exercise logging is in workout screen
    // Hide the exercises container on dashboard
    if (todayExercisesEl) {
        todayExercisesEl.style.display = 'none';
    }
}

// Render last workout summary card
function renderLastWorkout() {
    const dateEl = document.getElementById('last-workout-date');
    const summaryEl = document.getElementById('last-workout-summary');
    if (!dateEl || !summaryEl) return;

    const workouts = getWorkoutsSorted(appData);

    if (workouts.length === 0) {
        dateEl.textContent = '-';
        summaryEl.innerHTML = '<p class="empty-hint">No workouts yet. Tap + to start!</p>';
        return;
    }

    // Get most recent workout
    const lastWorkout = workouts[0];
    dateEl.textContent = formatDate(lastWorkout.date);

    // Calculate summary stats
    const totalSets = lastWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = lastWorkout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
    }, 0);

    // Render exercise list
    const exercisesHtml = lastWorkout.exercises.slice(0, 4).map(ex => {
        const sets = ex.sets.length;
        const maxWeight = Math.max(...ex.sets.map(s => s.weight));
        return `
            <div class="last-workout-exercise">
                <span class="last-workout-exercise-name">${ex.name}</span>
                <span class="last-workout-exercise-sets">${sets} sets • ${maxWeight}kg</span>
            </div>
        `;
    }).join('');

    const moreCount = lastWorkout.exercises.length - 4;
    const moreHtml = moreCount > 0 ? `<div class="last-workout-exercise"><span class="empty-hint">+${moreCount} more exercises</span></div>` : '';

    summaryEl.innerHTML = `
        <div class="last-workout-exercises">
            ${exercisesHtml}
            ${moreHtml}
        </div>
    `;
}

// Render history view
function renderHistoryView() {
    // Render calendar first
    renderHistoryCalendar();

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

// ========== CALENDAR FUNCTIONS ==========

// Get month name
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Render the history calendar for the current display month
function renderHistoryCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    if (!calendarGrid || !monthYearEl) return;

    const year = calendarDisplayDate.getFullYear();
    const month = calendarDisplayDate.getMonth();

    // Update month/year display
    monthYearEl.textContent = `${MONTH_NAMES[month]} ${year}`;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, adjust to Monday start)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Mon=0

    // Calculate max volume for this month for intensity normalization
    const maxVolume = getMonthMaxVolume(year, month);

    // Build calendar grid (6 weeks x 7 days = 42 cells)
    const today = getTodayStr();
    let html = '';

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dateStr = formatDateStr(year, month - 1, day);
        html += renderCalendarDay(day, dateStr, today, true, maxVolume);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateStr(year, month, day);
        html += renderCalendarDay(day, dateStr, today, false, maxVolume);
    }

    // Next month days (fill remaining cells)
    const totalCells = 42;
    const filledCells = startDayOfWeek + daysInMonth;
    const remainingCells = totalCells - filledCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dateStr = formatDateStr(year, month + 1, day);
        html += renderCalendarDay(day, dateStr, today, true, maxVolume);
    }

    calendarGrid.innerHTML = html;
}

// Format a date as YYYY-MM-DD
function formatDateStr(year, month, day) {
    // Handle month overflow
    const date = new Date(year, month, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Render a single calendar day cell
function renderCalendarDay(day, dateStr, today, isOtherMonth, maxVolume) {
    const intensity = calculateDayIntensity(dateStr, maxVolume);
    const isToday = dateStr === today;
    const hasWorkout = intensity > 0;

    const classes = ['calendar-day'];
    if (isOtherMonth) classes.push('other-month');
    if (isToday) classes.push('today');
    if (hasWorkout) {
        classes.push('has-workout');
        // Map intensity (0-1) to intensity classes (1-5)
        const intensityLevel = Math.min(5, Math.max(1, Math.ceil(intensity * 5)));
        classes.push(`intensity-${intensityLevel}`);
    }

    return `<div class="${classes.join(' ')}" data-date="${dateStr}" onclick="showCalendarPopup('${dateStr}')">${day}</div>`;
}

// Calculate day intensity based on volume (0-1)
function calculateDayIntensity(dateStr, maxVolume) {
    if (maxVolume === 0) return 0;

    const workout = getWorkoutByDate(appData, dateStr);
    if (!workout || workout.exercises.length === 0) return 0;

    let dayVolume = 0;
    for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
            dayVolume += (set.weight || 0) * (set.reps || 0);
        }
    }

    return dayVolume / maxVolume;
}

// Get max volume for a month (for normalization)
function getMonthMaxVolume(year, month) {
    const cacheKey = `${year}-${month}`;
    if (calendarIntensityCache.has(cacheKey)) {
        return calendarIntensityCache.get(cacheKey);
    }

    let maxVolume = 0;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    for (const workout of appData.workouts) {
        const workoutDate = new Date(workout.date);
        if (workoutDate >= startDate && workoutDate <= endDate) {
            let dayVolume = 0;
            for (const exercise of workout.exercises) {
                for (const set of exercise.sets) {
                    dayVolume += (set.weight || 0) * (set.reps || 0);
                }
            }
            maxVolume = Math.max(maxVolume, dayVolume);
        }
    }

    calendarIntensityCache.set(cacheKey, maxVolume);
    return maxVolume;
}

// Get intensity color based on intensity value (0-1)
function getIntensityColor(intensity) {
    // Mint color with varying opacity
    const alpha = 0.2 + (intensity * 0.8); // 0.2 to 1.0
    return `rgba(209, 255, 198, ${alpha})`;
}

// Navigate calendar month
function navigateMonth(delta) {
    calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() + delta);
    renderHistoryCalendar();
}

// Clear intensity cache when data changes
function clearCalendarCache() {
    calendarIntensityCache.clear();
}

// Show calendar popup with workout summary
function showCalendarPopup(dateStr) {
    const popup = document.getElementById('calendar-popup');
    const dateEl = document.getElementById('calendar-popup-date');
    const bodyEl = document.getElementById('calendar-popup-body');
    if (!popup || !dateEl || !bodyEl) return;

    // Format the date for display
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = date.toLocaleDateString('en-US', options);

    // Get workout for this date
    const workout = getWorkoutByDate(appData, dateStr);

    if (!workout || workout.exercises.length === 0) {
        bodyEl.innerHTML = `<div class="calendar-popup-rest">Rest day</div>`;
    } else {
        let totalSets = 0;
        const exercisesHtml = workout.exercises.map(ex => {
            totalSets += ex.sets.length;
            return `
                <div class="calendar-popup-exercise">
                    <div class="calendar-popup-exercise-name">${ex.name}</div>
                    <div class="calendar-popup-exercise-sets">${ex.sets.length} sets</div>
                </div>
            `;
        }).join('');

        bodyEl.innerHTML = exercisesHtml + `
            <div class="calendar-popup-total">
                ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''} • ${totalSets} total sets
            </div>
        `;
    }

    popup.classList.add('active');
}

// Close calendar popup
function closeCalendarPopup() {
    const popup = document.getElementById('calendar-popup');
    if (popup) {
        popup.classList.remove('active');
    }
}

// Make showCalendarPopup available globally for onclick handlers
window.showCalendarPopup = showCalendarPopup;

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

// ========== LIBRARY VIEW FUNCTIONS ==========

// Render library view with search, filters, and recent exercises
function renderLibraryView() {
    // Render filter drawer chips
    renderFilterDrawerChips();

    // Render recent exercises
    renderRecentExercises();

    // Update filter badge
    updateFilterBadge();

    // Apply filters and render exercise list
    const filteredExercises = filterExercises(librarySearchQuery, librarySelectedMuscles, librarySelectedEquipment);

    // Sort: favorites first, then alphabetically
    const sortedExercises = [...filteredExercises].sort((a, b) => {
        const aFav = libraryFavorites.includes(a);
        const bFav = libraryFavorites.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.localeCompare(b);
    });

    // Apply view mode class
    exerciseLibraryListEl.className = `library-list ${libraryViewMode === 'grid' ? 'grid-view' : ''}`;

    if (sortedExercises.length === 0) {
        exerciseLibraryListEl.innerHTML = `
            <div class="empty-state">
                <p>No exercises match your filters.</p>
                <button class="btn btn-secondary" onclick="clearAllFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    // Check custom exercises from localStorage
    const customExercises = JSON.parse(localStorage.getItem('lagomstronk_custom_exercises') || '{}');

    exerciseLibraryListEl.innerHTML = sortedExercises.map(exercise => {
        // Get metadata - prefer custom metadata if available
        const customMeta = customExercises[exercise];
        const meta = customMeta || getExerciseMetadata(exercise);
        const isFavorite = libraryFavorites.includes(exercise);
        const isCustom = customMeta?.isCustom;

        const muscleDisplay = meta.primaryMuscles?.length > 0
            ? meta.primaryMuscles.map(m => getMuscleGroups()[m]?.displayName || m).join(', ')
            : '';
        const equipmentDisplay = getEquipmentTypes()[meta.equipment]?.displayName || '';
        const customIcon = isCustom ? '<span class="custom-exercise-icon" title="Custom exercise">👤</span>' : '';

        return `
            <div class="library-card">
                <div class="library-card-info">
                    <div class="library-card-name">${exercise}${customIcon}${isFavorite ? '<span class="library-item-favorite">★</span>' : ''}</div>
                    ${muscleDisplay ? `<div class="library-card-muscles">${muscleDisplay}</div>` : ''}
                    ${equipmentDisplay ? `<div class="library-card-equipment">${equipmentDisplay}</div>` : ''}
                </div>
                <div class="library-card-actions">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="handleFavoriteToggle('${exercise}')" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">★</button>
                    <button class="btn-icon" onclick="deleteFromLibrary('${exercise}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter exercises based on query, muscle groups, and equipment
function filterExercises(query, muscleGroups, equipment) {
    let filtered = [...appData.exerciseLibrary];

    // Filter by search query
    if (query) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(ex => ex.toLowerCase().includes(q));
    }

    // Filter by muscle groups
    if (muscleGroups.length > 0) {
        filtered = filtered.filter(ex => {
            const meta = getExerciseMetadata(ex);
            return muscleGroups.some(mg =>
                meta.primaryMuscles.includes(mg) || meta.secondaryMuscles.includes(mg)
            );
        });
    }

    // Filter by equipment
    if (equipment.length > 0) {
        filtered = filtered.filter(ex => {
            const meta = getExerciseMetadata(ex);
            return equipment.includes(meta.equipment);
        });
    }

    return filtered;
}

// Toggle favorite status for an exercise
function toggleFavorite(exerciseName) {
    const index = libraryFavorites.indexOf(exerciseName);
    if (index >= 0) {
        libraryFavorites.splice(index, 1);
    } else {
        libraryFavorites.push(exerciseName);
    }
    localStorage.setItem('lagomstronk_favorites', JSON.stringify(libraryFavorites));
    renderLibraryView();
}

// Get recent exercises (last 5 used)
function getRecentExercisesForLibrary() {
    const recentSet = new Set();
    const sortedWorkouts = getWorkoutsSorted(appData);

    for (const workout of sortedWorkouts) {
        for (const exercise of workout.exercises) {
            recentSet.add(exercise.name);
            if (recentSet.size >= 5) break;
        }
        if (recentSet.size >= 5) break;
    }

    return Array.from(recentSet);
}

// Toggle library view between list and grid
function toggleLibraryView() {
    libraryViewMode = libraryViewMode === 'list' ? 'grid' : 'list';
    const icon = document.getElementById('view-toggle-icon');
    if (icon) {
        icon.textContent = libraryViewMode === 'list' ? '☰' : '▦';
    }
    renderLibraryView();
}

// Render recent exercises chips
function renderRecentExercises() {
    const recentChipsEl = document.getElementById('library-recent-chips');
    const recentContainerEl = document.getElementById('library-recent');
    const recent = getRecentExercisesForLibrary();

    if (recent.length === 0) {
        if (recentContainerEl) recentContainerEl.style.display = 'none';
        return;
    }

    if (recentContainerEl) recentContainerEl.style.display = '';

    if (recentChipsEl) {
        recentChipsEl.innerHTML = recent.map(ex =>
            `<span class="recent-chip" onclick="addRecentToWorkout('${ex}')">${ex}</span>`
        ).join('');
    }
}

// Render filter drawer chips
function renderFilterDrawerChips() {
    const muscleChipsEl = document.getElementById('muscle-filter-chips');
    const equipmentChipsEl = document.getElementById('equipment-filter-chips');

    // Muscle group chips
    if (muscleChipsEl) {
        const muscleGroups = getMuscleGroups();
        muscleChipsEl.innerHTML = Object.keys(muscleGroups).map(key => {
            const mg = muscleGroups[key];
            const isActive = librarySelectedMuscles.includes(key);
            return `<span class="filter-chip ${isActive ? 'active' : ''}" data-muscle="${key}" onclick="toggleMuscleFilter('${key}')">${mg.displayName}</span>`;
        }).join('');
    }

    // Equipment chips
    if (equipmentChipsEl) {
        const equipmentTypes = getEquipmentTypes();
        equipmentChipsEl.innerHTML = Object.keys(equipmentTypes).map(key => {
            const eq = equipmentTypes[key];
            const isActive = librarySelectedEquipment.includes(key);
            return `<span class="filter-chip ${isActive ? 'active' : ''}" data-equipment="${key}" onclick="toggleEquipmentFilter('${key}')">${eq.displayName}</span>`;
        }).join('');
    }
}

// Toggle muscle group filter
function toggleMuscleFilter(muscleKey) {
    const index = librarySelectedMuscles.indexOf(muscleKey);
    if (index >= 0) {
        librarySelectedMuscles.splice(index, 1);
    } else {
        librarySelectedMuscles.push(muscleKey);
    }
    renderFilterDrawerChips();
}

// Toggle equipment filter
function toggleEquipmentFilter(equipmentKey) {
    const index = librarySelectedEquipment.indexOf(equipmentKey);
    if (index >= 0) {
        librarySelectedEquipment.splice(index, 1);
    } else {
        librarySelectedEquipment.push(equipmentKey);
    }
    renderFilterDrawerChips();
}

// Update filter badge count
function updateFilterBadge() {
    const badge = document.getElementById('filter-badge');
    const count = librarySelectedMuscles.length + librarySelectedEquipment.length;
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
    }
}

// Clear all filters
function clearAllFilters() {
    librarySearchQuery = '';
    librarySelectedMuscles = [];
    librarySelectedEquipment = [];
    const searchInput = document.getElementById('library-search');
    if (searchInput) searchInput.value = '';
    renderFilterDrawerChips();
    renderLibraryView();
}

// Apply filters (close drawer and refresh)
function applyFilters() {
    closeFilterDrawer();
    renderLibraryView();
}

// Open filter drawer
function openFilterDrawer() {
    const overlay = document.getElementById('filter-drawer-overlay');
    const drawer = document.getElementById('filter-drawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    renderFilterDrawerChips();
}

// Close filter drawer
function closeFilterDrawer() {
    const overlay = document.getElementById('filter-drawer-overlay');
    const drawer = document.getElementById('filter-drawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
}

// Add recent exercise to today's workout
window.addRecentToWorkout = function(exerciseName) {
    addNewExerciseToWorkout(exerciseName);
    switchView('today');
};

// Handle favorite toggle from card
window.handleFavoriteToggle = function(exerciseName) {
    toggleFavorite(exerciseName);
};

// Window functions for filter chips
window.toggleMuscleFilter = function(muscleKey) {
    toggleMuscleFilter(muscleKey);
};

window.toggleEquipmentFilter = function(equipmentKey) {
    toggleEquipmentFilter(equipmentKey);
};

window.clearAllFilters = function() {
    clearAllFilters();
};

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

    // Check if exercise is custom (has metadata in localStorage)
    const customExercises = JSON.parse(localStorage.getItem('lagomstronk_custom_exercises') || '{}');

    let html = filtered.map(ex => {
        const isCustom = customExercises[ex]?.isCustom;
        const customIcon = isCustom ? '<span class="custom-exercise-icon" title="Custom exercise">👤</span>' : '';
        return `<div class="exercise-search-item" data-exercise="${ex}">${ex}${customIcon}</div>`;
    }).join('');

    // Show "Create" options if query doesn't match any exercise exactly
    if (q && !appData.exerciseLibrary.some(ex => ex.toLowerCase() === q)) {
        html += `<div class="exercise-search-item exercise-search-create" data-exercise="${query.trim()}" data-create="true">+ Quick add "${query.trim()}"</div>`;
        html += `<div class="exercise-search-item exercise-search-wizard" data-wizard="${query.trim()}">+ Create with wizard</div>`;
    }

    // Show wizard option when no results
    if (filtered.length === 0 && !q) {
        html = `<div class="exercise-search-item exercise-search-wizard" data-wizard="">+ Create custom exercise</div>`;
    }

    resultsList.innerHTML = html;
}

// Add a new exercise to today's workout
function addNewExerciseToWorkout(exerciseName) {
    // Check if this is the first exercise (will start workout)
    const existingWorkout = getWorkoutByDate(appData, currentDate);
    const isFirstExercise = !existingWorkout || existingWorkout.exercises.length === 0;

    const prevSets = getMostRecentExerciseSets(appData, exerciseName, currentDate);
    const exercise = {
        name: exerciseName,
        sets: prevSets.length > 0
            ? prevSets.map(s => ({ weight: s.weight, reps: s.reps, completed: false }))
            : [{ weight: 20, reps: 10, completed: false }]
    };
    appData = addExerciseToWorkout(appData, currentDate, exercise);

    // Auto-start workout when first exercise is added
    if (isFirstExercise && !activeWorkout.isActive) {
        startWorkout();
    }

    renderTodayView();

    // If workout screen is active, render exercises there too
    if (workoutView && workoutView.classList.contains('active')) {
        renderWorkoutExercises();
    }

    // Update mini-player content
    if (activeWorkout.isActive) {
        updateMiniPlayerContent();
    }
}

// ========== INLINE TODAY VIEW EVENT HANDLERS ==========

// Handle focus events on numpad-enabled inputs (for better reliability)
function handleNumpadFocus(e) {
    // Check if the focused element is a numpad-enabled input
    if (e.target && e.target.classList && e.target.classList.contains('inline-input')) {
        const isWeightInput = e.target.classList.contains('set-kg');
        showNumpad(e.target, {
            type: isWeightInput ? 'weight' : 'reps',
            step: isWeightInput ? 2.5 : 1
        });
    }
}

// Handle clicks on today's exercise cards (delegation)
function handleTodayClick(e) {
    // Input focus - show numpad
    if (e.target.classList.contains('inline-input')) {
        const isWeightInput = e.target.classList.contains('set-kg');
        showNumpad(e.target, {
            type: isWeightInput ? 'weight' : 'reps',
            step: isWeightInput ? 2.5 : 1
        });
        return;
    }

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
            // If workout screen is active, render exercises there too
            if (workoutView && workoutView.classList.contains('active')) {
                renderWorkoutExercises();
            }
            // Update mini-player content
            if (activeWorkout.isActive) {
                updateMiniPlayerContent();
            }
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

// Toggle set completion with animations
function toggleSetCompletion(exIdx, setIdx, buttonElement) {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout) return;
    const set = workout.exercises[exIdx].sets[setIdx];
    const wasCompleted = set.completed !== false;
    set.completed = !wasCompleted;
    saveData(appData);

    // Update mini-player content
    if (activeWorkout.isActive) {
        updateMiniPlayerContent();
    }

    // Get the row and button elements
    const row = document.querySelector(`.inline-set-row[data-exercise="${exIdx}"][data-set="${setIdx}"]`);
    const btn = row ? row.querySelector('.set-check-btn') : null;

    // Only trigger animations when COMPLETING a set (not unchecking)
    if (!wasCompleted && row && btn) {
        // Add checkmark checked state
        btn.classList.add('checked');

        // Trigger pop animation
        btn.classList.remove('animate-pop');
        // Force reflow for animation restart
        void btn.offsetWidth;
        btn.classList.add('animate-pop');

        // Add row highlight
        row.classList.add('completed', 'highlight-complete');

        // Fire confetti at button position
        fireSetConfetti(btn);

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    } else if (wasCompleted && row && btn) {
        // Unchecking - remove completed state
        btn.classList.remove('checked', 'animate-pop');
        row.classList.remove('completed', 'highlight-complete');
    }

    // Update hero stats after set completion (don't re-render whole view)
    renderHeroStats();
}

// Fire confetti from a specific element's position
function fireSetConfetti(element) {
    if (typeof confetti !== 'function') return;

    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Small burst of mint-colored confetti
    confetti({
        particleCount: 20,
        spread: 40,
        origin: { x, y },
        colors: ['#D1FFC6', '#86efac', '#4ade80'],
        startVelocity: 15,
        gravity: 0.8,
        ticks: 50,
        scalar: 0.7,
        disableForReducedMotion: true
    });
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
    // If workout screen is active, render exercises there too
    if (workoutView && workoutView.classList.contains('active')) {
        renderWorkoutExercises();
    }
    // Update mini-player content
    if (activeWorkout.isActive) {
        updateMiniPlayerContent();
    }
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

// ========== CUSTOM NUMPAD ==========

// Numpad state
let numpadState = {
    currentInput: null,
    inputType: 'weight', // 'weight' or 'reps'
    value: '',
    step: 2.5,
    useSystemKeyboard: false
};

// Numpad DOM elements
const numpadOverlay = document.getElementById('numpad-overlay');
const numpadValueEl = document.getElementById('numpad-value');
const numpadLabelEl = document.getElementById('numpad-label');

// Show numpad for an input element
function showNumpad(inputElement, options = {}) {
    // Defensive check: ensure input element exists and is valid
    if (!inputElement || !inputElement.classList) {
        console.warn('showNumpad: Invalid input element');
        return;
    }

    if (numpadState.useSystemKeyboard) {
        // If user prefers system keyboard, just focus the input
        inputElement.removeAttribute('readonly');
        inputElement.focus();
        return;
    }

    numpadState.currentInput = inputElement;
    numpadState.inputType = options.type || 'weight';
    numpadState.step = options.step || (numpadState.inputType === 'weight' ? 2.5 : 1);
    numpadState.value = inputElement.value || '';

    // Update display
    if (numpadLabelEl) numpadLabelEl.textContent = numpadState.inputType === 'weight' ? 'Weight (kg)' : 'Reps';
    if (numpadValueEl) numpadValueEl.textContent = numpadState.value || '0';

    // Show numpad (defensive check)
    if (!numpadOverlay) {
        console.warn('showNumpad: Numpad overlay element not found');
        return;
    }
    numpadOverlay.classList.add('active');

    // Highlight current input
    inputElement.classList.add('numpad-active');
}

// Hide numpad
function hideNumpad() {
    numpadOverlay.classList.remove('active');

    if (numpadState.currentInput) {
        numpadState.currentInput.classList.remove('numpad-active');

        // Trigger change event to save value
        numpadState.currentInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    numpadState.currentInput = null;
    numpadState.value = '';
}

// Handle numpad digit input
function handleNumpadDigit(digit) {
    if (!numpadState.currentInput) return;

    // Prevent multiple decimals
    if (digit === '.' && numpadState.value.includes('.')) return;

    // Prevent leading zeros (except for decimals like 0.5)
    if (numpadState.value === '0' && digit !== '.') {
        numpadState.value = digit;
    } else {
        numpadState.value += digit;
    }

    updateNumpadDisplay();
}

// Handle backspace
function handleNumpadBackspace() {
    if (!numpadState.currentInput) return;

    numpadState.value = numpadState.value.slice(0, -1);
    updateNumpadDisplay();
}

// Handle stepper (+/-)
function handleNumpadStepper(direction) {
    if (!numpadState.currentInput) return;

    const currentValue = parseFloat(numpadState.value) || 0;
    const newValue = direction === 'plus'
        ? currentValue + numpadState.step
        : Math.max(0, currentValue - numpadState.step);

    // Format value (remove trailing zeros for whole numbers)
    numpadState.value = newValue % 1 === 0 ? newValue.toString() : newValue.toFixed(1);
    updateNumpadDisplay();
}

// Update numpad display and input
function updateNumpadDisplay() {
    numpadValueEl.textContent = numpadState.value || '0';

    if (numpadState.currentInput) {
        numpadState.currentInput.value = numpadState.value;
    }
}

// Handle NEXT button - advance to next input or close
function handleNumpadNext() {
    if (!numpadState.currentInput) {
        hideNumpad();
        return;
    }

    // Find all numpad-enabled inputs in the workout
    const allInputs = Array.from(document.querySelectorAll('.inline-input'));
    const currentIndex = allInputs.indexOf(numpadState.currentInput);

    if (currentIndex === -1 || currentIndex === allInputs.length - 1) {
        // Last input or not found, close numpad
        hideNumpad();
        return;
    }

    // Move to next input
    const nextInput = allInputs[currentIndex + 1];
    const isWeightInput = nextInput.classList.contains('set-kg');

    // Hide current, show for next
    numpadState.currentInput.classList.remove('numpad-active');
    showNumpad(nextInput, {
        type: isWeightInput ? 'weight' : 'reps',
        step: isWeightInput ? 2.5 : 1
    });
}

// Toggle between custom numpad and system keyboard
function toggleKeyboardMode() {
    numpadState.useSystemKeyboard = !numpadState.useSystemKeyboard;

    if (numpadState.useSystemKeyboard && numpadState.currentInput) {
        // Switch to system keyboard
        hideNumpad();
        numpadState.currentInput.removeAttribute('readonly');
        numpadState.currentInput.focus();
    }

    // Update all inputs readonly state
    document.querySelectorAll('.inline-input').forEach(input => {
        if (numpadState.useSystemKeyboard) {
            input.removeAttribute('readonly');
        } else {
            input.setAttribute('readonly', 'readonly');
        }
    });
}

// Setup numpad event listeners
function setupNumpadListeners() {
    // Digit buttons
    document.querySelectorAll('.numpad-btn[data-value]').forEach(btn => {
        btn.addEventListener('click', () => {
            handleNumpadDigit(btn.dataset.value);
        });
    });

    // Backspace
    document.getElementById('numpad-backspace')?.addEventListener('click', handleNumpadBackspace);

    // Steppers
    document.getElementById('numpad-plus')?.addEventListener('click', () => handleNumpadStepper('plus'));
    document.getElementById('numpad-minus')?.addEventListener('click', () => handleNumpadStepper('minus'));

    // NEXT button
    document.getElementById('numpad-next')?.addEventListener('click', handleNumpadNext);

    // Keyboard toggle
    document.getElementById('numpad-keyboard')?.addEventListener('click', toggleKeyboardMode);

    // Close on overlay tap (outside numpad)
    numpadOverlay?.addEventListener('click', (e) => {
        if (e.target === numpadOverlay) {
            hideNumpad();
        }
    });
}

// ========== EXERCISE WIZARD ==========

// Open exercise wizard modal
function openExerciseWizard() {
    // Reset wizard state
    wizardState = {
        currentStep: 1,
        exerciseName: '',
        primaryMuscles: [],
        secondaryMuscles: [],
        equipment: 'other'
    };

    // Reset UI
    document.getElementById('wizard-exercise-name').value = '';
    document.getElementById('wizard-name-error').style.display = 'none';
    document.getElementById('wizard-muscle-error').style.display = 'none';

    // Render wizard chips
    renderWizardChips();

    // Reset to step 1
    goToWizardStep(1);

    // Show modal
    exerciseWizardModal.classList.add('active');

    // Focus name input
    setTimeout(() => document.getElementById('wizard-exercise-name').focus(), 100);
}

// Close exercise wizard modal
function closeExerciseWizard() {
    exerciseWizardModal.classList.remove('active');
}

// Go to a specific wizard step
function goToWizardStep(step) {
    wizardState.currentStep = step;

    // Update progress indicator
    document.querySelectorAll('.wizard-step').forEach((el, idx) => {
        const stepNum = idx + 1;
        el.classList.remove('active', 'completed');
        if (stepNum === step) {
            el.classList.add('active');
        } else if (stepNum < step) {
            el.classList.add('completed');
        }
    });

    // Update step lines
    document.querySelectorAll('.wizard-step-line').forEach((el, idx) => {
        el.classList.toggle('active', idx < step - 1);
    });

    // Show current panel
    document.querySelectorAll('.wizard-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === String(step));
    });

    // Update buttons
    const backBtn = document.getElementById('wizard-back');
    const nextBtn = document.getElementById('wizard-next');

    backBtn.style.display = step === 1 ? 'none' : '';
    nextBtn.textContent = step === 4 ? 'Add Exercise' : 'Next';

    // If step 4, populate summary
    if (step === 4) {
        populateWizardSummary();
    }
}

// Render wizard muscle and equipment chips
function renderWizardChips() {
    const muscleGroups = getMuscleGroups();
    const equipmentTypes = getEquipmentTypes();

    // Primary muscles
    const primaryEl = document.getElementById('wizard-primary-muscles');
    primaryEl.innerHTML = Object.keys(muscleGroups).map(key => {
        const mg = muscleGroups[key];
        const isSelected = wizardState.primaryMuscles.includes(key);
        return `<span class="wizard-chip ${isSelected ? 'selected' : ''}" data-muscle="${key}" data-type="primary">${mg.displayName}</span>`;
    }).join('');

    // Secondary muscles
    const secondaryEl = document.getElementById('wizard-secondary-muscles');
    secondaryEl.innerHTML = Object.keys(muscleGroups).map(key => {
        const mg = muscleGroups[key];
        const isSelected = wizardState.secondaryMuscles.includes(key);
        return `<span class="wizard-chip ${isSelected ? 'selected' : ''}" data-muscle="${key}" data-type="secondary">${mg.displayName}</span>`;
    }).join('');

    // Equipment
    const equipmentEl = document.getElementById('wizard-equipment');
    equipmentEl.innerHTML = Object.keys(equipmentTypes).map(key => {
        const eq = equipmentTypes[key];
        const isSelected = wizardState.equipment === key;
        return `<span class="wizard-chip ${isSelected ? 'selected' : ''}" data-equipment="${key}">${eq.displayName}</span>`;
    }).join('');
}

// Handle wizard chip click
function handleWizardChipClick(e) {
    const chip = e.target.closest('.wizard-chip');
    if (!chip) return;

    if (chip.dataset.muscle) {
        // Muscle chip
        const muscle = chip.dataset.muscle;
        const type = chip.dataset.type;

        if (type === 'primary') {
            const idx = wizardState.primaryMuscles.indexOf(muscle);
            if (idx >= 0) {
                wizardState.primaryMuscles.splice(idx, 1);
            } else {
                wizardState.primaryMuscles.push(muscle);
            }
        } else {
            const idx = wizardState.secondaryMuscles.indexOf(muscle);
            if (idx >= 0) {
                wizardState.secondaryMuscles.splice(idx, 1);
            } else {
                wizardState.secondaryMuscles.push(muscle);
            }
        }
        renderWizardChips();
    } else if (chip.dataset.equipment) {
        // Equipment chip (single select)
        wizardState.equipment = chip.dataset.equipment;
        renderWizardChips();
    }
}

// Validate current wizard step
function validateWizardStep() {
    const step = wizardState.currentStep;

    if (step === 1) {
        const name = document.getElementById('wizard-exercise-name').value.trim();
        if (!name) {
            document.getElementById('wizard-name-error').style.display = 'block';
            return false;
        }
        document.getElementById('wizard-name-error').style.display = 'none';
        wizardState.exerciseName = name;
    }

    if (step === 2) {
        if (wizardState.primaryMuscles.length === 0) {
            document.getElementById('wizard-muscle-error').style.display = 'block';
            return false;
        }
        document.getElementById('wizard-muscle-error').style.display = 'none';
    }

    return true;
}

// Handle wizard next button
function handleWizardNext() {
    if (!validateWizardStep()) return;

    if (wizardState.currentStep === 4) {
        // Save the exercise
        saveWizardExercise();
    } else {
        goToWizardStep(wizardState.currentStep + 1);
    }
}

// Handle wizard back button
function handleWizardBack() {
    if (wizardState.currentStep > 1) {
        goToWizardStep(wizardState.currentStep - 1);
    }
}

// Populate wizard summary on step 4
function populateWizardSummary() {
    const muscleGroups = getMuscleGroups();
    const equipmentTypes = getEquipmentTypes();

    document.getElementById('wizard-summary-name').textContent = wizardState.exerciseName;

    const primaryNames = wizardState.primaryMuscles.map(m => muscleGroups[m]?.displayName || m).join(', ');
    document.getElementById('wizard-summary-primary').textContent = primaryNames || 'None';

    const secondaryNames = wizardState.secondaryMuscles.map(m => muscleGroups[m]?.displayName || m).join(', ');
    document.getElementById('wizard-summary-secondary').textContent = secondaryNames || 'None';

    const equipmentName = equipmentTypes[wizardState.equipment]?.displayName || 'Other';
    document.getElementById('wizard-summary-equipment').textContent = equipmentName;
}

// Save exercise from wizard
function saveWizardExercise() {
    const name = wizardState.exerciseName.trim();

    // Check if exercise already exists
    if (appData.exerciseLibrary.includes(name)) {
        alert('An exercise with this name already exists.');
        goToWizardStep(1);
        return;
    }

    // Add to exercise library
    appData = addCustomExercise(appData, name);

    // Store custom exercise metadata in localStorage
    const customExercisesKey = 'lagomstronk_custom_exercises';
    let customExercises = {};
    try {
        customExercises = JSON.parse(localStorage.getItem(customExercisesKey) || '{}');
    } catch (e) {
        customExercises = {};
    }

    customExercises[name] = {
        primaryMuscles: wizardState.primaryMuscles,
        secondaryMuscles: wizardState.secondaryMuscles,
        equipment: wizardState.equipment,
        isCustom: true
    };

    localStorage.setItem(customExercisesKey, JSON.stringify(customExercises));

    // Close wizard and refresh library
    closeExerciseWizard();
    renderLibraryView();
}

// Setup wizard event listeners
function setupWizardListeners() {
    // Close button
    document.getElementById('close-exercise-wizard')?.addEventListener('click', closeExerciseWizard);

    // Next/Back buttons
    document.getElementById('wizard-next')?.addEventListener('click', handleWizardNext);
    document.getElementById('wizard-back')?.addEventListener('click', handleWizardBack);

    // Chip clicks (delegation)
    document.getElementById('wizard-primary-muscles')?.addEventListener('click', handleWizardChipClick);
    document.getElementById('wizard-secondary-muscles')?.addEventListener('click', handleWizardChipClick);
    document.getElementById('wizard-equipment')?.addEventListener('click', handleWizardChipClick);

    // Close on background click
    exerciseWizardModal?.addEventListener('click', (e) => {
        if (e.target === exerciseWizardModal) {
            closeExerciseWizard();
        }
    });

    // Enter key on name input moves to next step
    document.getElementById('wizard-exercise-name')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleWizardNext();
        }
    });
}

// Make openExerciseWizard available globally
window.openExerciseWizard = openExerciseWizard;

// Initialize the app
init();

// Setup numpad after DOM is ready
setupNumpadListeners();

// Setup wizard listeners
setupWizardListeners();
