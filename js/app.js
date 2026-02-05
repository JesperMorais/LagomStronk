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
    toggleFavoriteExercise,
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
    getMostRecentExerciseFirstSet
} from './data.js';

import {
    updateProgressChart,
    updateVolumeChart
} from './charts.js';

import { initializeStorage } from './core/storage.js';
import { migrateToIndexedDB, retryMigration } from './data/migration.js';
import { checkStorageCapacity } from './core/storageMonitor.js';
import { showMigrationError } from './ui/toast.js';
import { eventBus, EVENTS } from './core/eventBus.js';
import { initNumpad, showNumpad, hideNumpad, getNumpad } from './ui/components/numpad.js';
import { showMiniPlayer, hideMiniPlayer, getMiniPlayer } from './ui/components/miniPlayer.js';
import { renderCalendar } from './ui/components/calendar.js';
import { initFilterDrawer, openFilterDrawer, closeFilterDrawer, getFilterDrawer } from './ui/components/filterDrawer.js';
import { renderExerciseList, renderExerciseGrid, renderRecentExercises } from './ui/components/exerciseCard.js';
import { searchExercises, filterExercises, getRecentExercises } from './data/exercises.js';
import { openExerciseWizard } from './ui/components/exerciseWizard.js';
import { animateCheckmark } from './ui/animations/checkmark.js';
import { burstConfetti } from './ui/animations/confetti.js';
import { renderHero } from './ui/dashboard/hero.js';
import { renderDashboardVolumeChart } from './ui/dashboard/volumeChart.js';
import { renderPRCards } from './ui/dashboard/prCards.js';

// App state
let appData = null;
let currentView = 'today';
let currentDate = getTodayStr();
let editingExerciseIndex = null;
let activeWorkout = null; // Track active workout for mini-player
let workoutStartTime = null; // Track workout start time
let workoutTimerInterval = null; // Timer interval
let historyCalendar = null; // Calendar instance
let historyViewMode = 'calendar'; // 'calendar' or 'list'

// Library view state
let libraryViewMode = 'list'; // 'list' or 'grid'
let librarySearchQuery = '';
let libraryFilters = { muscleGroups: [], equipment: [] };

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

// Initialize app
async function init() {
    try {
        // 1. Initialize storage (check if already migrated)
        await initializeStorage();

        // 2. Run migration (silent, skips if already done)
        const migrationResult = await migrateToIndexedDB();

        if (!migrationResult.success) {
            // Show error toast with retry button
            showMigrationError(migrationResult.error, async () => {
                const retryResult = await retryMigration();
                if (retryResult.success) {
                    // Reload app after successful retry
                    window.location.reload();
                } else {
                    showMigrationError(retryResult.error, null);
                }
            });
            // Continue loading with localStorage fallback (initializeStorage handles this)
        }

        // 3. Load app data (now async)
        appData = await loadData();

        // 4. Check storage capacity (emits events if thresholds exceeded)
        await checkStorageCapacity();

        // 5. Continue with existing initialization
        setupNavigation();
        setupEventListeners();

        // 6. Initialize custom numpad
        initNumpad({
            step: 2.5, // Default step for weight
            onNext: handleNumpadNext,
            onSettings: openPlateCalculator
        });
        attachNumpadToInputs();

        // Check for active workout
        checkActiveWorkout();

        renderTodayView();
        updateTodayDate();

    } catch (error) {
        console.error('App initialization failed:', error);
        // Fallback: try to load with localStorage
        appData = await loadData();
        setupNavigation();
        setupEventListeners();

        // Initialize custom numpad
        initNumpad({
            step: 2.5,
            onNext: handleNumpadNext,
            onSettings: openPlateCalculator
        });
        attachNumpadToInputs();

        // Check for active workout
        checkActiveWorkout();

        renderTodayView();
        updateTodayDate();
    }
}

// Numpad handlers
function handleNumpadNext(value, currentInput) {
    // Find next input in the same row or next row
    const setRow = currentInput.closest('.set-row');
    if (!setRow) {
        hideNumpad();
        return;
    }

    const inputs = setRow.querySelectorAll('input[type="number"]');
    const currentIndex = Array.from(inputs).indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
        // Move to next input in same row
        const nextInput = inputs[currentIndex + 1];
        showNumpad(nextInput, nextInput.value);
    } else {
        // Move to next row's first input, or close numpad
        const nextRow = setRow.nextElementSibling;
        if (nextRow && nextRow.classList.contains('set-row')) {
            const nextInput = nextRow.querySelector('input[type="number"]');
            if (nextInput) {
                showNumpad(nextInput, nextInput.value);
                return;
            }
        }
        // No more inputs, hide numpad
        hideNumpad();
    }
}

function openPlateCalculator() {
    // Open plate calculator modal
    const modal = document.getElementById('plate-calculator-modal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.log('Plate calculator - TODO: implement modal');
    }
}

function attachNumpadToInputs() {
    // Show numpad when number inputs are focused
    document.addEventListener('focus', (e) => {
        if (e.target.matches('.number-input, input[type="number"]')) {
            e.target.setAttribute('readonly', 'readonly'); // Prevent system keyboard

            // Determine step based on input class or default
            const step = e.target.step ? parseFloat(e.target.step) : 2.5;
            const numpad = getNumpad();
            if (numpad) numpad.step = step;

            showNumpad(e.target, e.target.value);
        }
    }, true);

    // Hide numpad when clicking outside
    document.addEventListener('click', (e) => {
        const numpad = getNumpad();
        if (!numpad?.isVisible) return;

        const clickedNumpad = e.target.closest('.numpad');
        const clickedInput = e.target.matches('.number-input, input[type="number"]');

        if (!clickedNumpad && !clickedInput) {
            hideNumpad();
        }
    });
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

    // Handle mini-player for active workouts - ALWAYS show when workout active
    const workout = getWorkoutByDate(appData, currentDate);
    const hasActiveWorkout = workout && workout.startTime;

    if (hasActiveWorkout) {
        // Show mini-player on ALL views when workout is active (Spotify-style)
        if (!activeWorkout) {
            activeWorkout = {
                name: workout.name || "Today's Workout",
                date: currentDate,
                startTime: workout.startTime
            };
            workoutStartTime = workout.startTime;
        }
        showMiniPlayer(activeWorkout);
    } else {
        // No active workout, hide mini-player
        hideMiniPlayer();
        activeWorkout = null;
        workoutStartTime = null;
    }

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
    document.getElementById('add-exercise-btn').addEventListener('click', () => {
        editingExerciseIndex = null;
        openExerciseModal();
    });

    // Exercise modal
    document.getElementById('close-exercise-modal').addEventListener('click', closeExerciseModal);
    document.getElementById('cancel-exercise').addEventListener('click', closeExerciseModal);
    document.getElementById('save-exercise').addEventListener('click', saveExercise);
    document.getElementById('add-set-btn').addEventListener('click', handleAddSet);

    // Custom exercise - FAB button
    document.getElementById('add-custom-exercise-btn').addEventListener('click', openCustomExerciseWizard);

    // Custom exercise - Header + button
    document.getElementById('add-custom-exercise-header-btn')?.addEventListener('click', openCustomExerciseWizard);

    // Old custom exercise modal handlers (kept for backward compatibility if needed)
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

    // Mini-player expand event
    window.addEventListener('mini-player:expand', () => {
        switchView('today');
    });

    // FAB click handler - Start new workout
    document.addEventListener('click', (e) => {
        if (e.target.closest('#start-workout-fab')) {
            startNewWorkout();
        }
    });

    // History view toggle
    document.getElementById('history-calendar-btn').addEventListener('click', () => {
        historyViewMode = 'calendar';
        document.getElementById('history-calendar-btn').classList.add('active');
        document.getElementById('history-list-btn').classList.remove('active');
        renderHistoryView();
    });

    document.getElementById('history-list-btn').addEventListener('click', () => {
        historyViewMode = 'list';
        document.getElementById('history-list-btn').classList.add('active');
        document.getElementById('history-calendar-btn').classList.remove('active');
        renderHistoryView();
    });

    // Library view controls
    document.getElementById('library-search').addEventListener('input', (e) => {
        librarySearchQuery = e.target.value.trim();
        renderLibraryExercises();
    });

    document.getElementById('open-filter-btn').addEventListener('click', () => {
        openFilterDrawer();
    });

    document.getElementById('library-list-btn').addEventListener('click', () => {
        libraryViewMode = 'list';
        document.getElementById('library-list-btn').classList.add('active');
        document.getElementById('library-grid-btn').classList.remove('active');
        renderLibraryExercises();
    });

    document.getElementById('library-grid-btn').addEventListener('click', () => {
        libraryViewMode = 'grid';
        document.getElementById('library-grid-btn').classList.add('active');
        document.getElementById('library-list-btn').classList.remove('active');
        renderLibraryExercises();
    });
}

// Render today's workout
function renderTodayView() {
    const workout = getWorkoutByDate(appData, currentDate);
    const hasActiveWorkout = workout && workout.startTime;

    // Render dashboard stats section (side-by-side)
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        renderDashboardStats(statsContainer, appData);
    }

    // Hide hero section (replaced by compact stats)
    const heroContainer = document.getElementById('dashboard-hero');
    if (heroContainer) {
        heroContainer.style.display = 'none';
    }

    // Show/hide FAB based on active workout
    const fab = document.getElementById('start-workout-fab');
    if (fab) {
        if (hasActiveWorkout) {
            fab.style.display = 'none';
        } else {
            fab.style.display = 'flex';
            fab.classList.add('visible');
        }
    }

    // Render workout exercises
    if (!workout || workout.exercises.length === 0) {
        if (hasActiveWorkout) {
            // Active workout with no exercises yet
            todayExercisesEl.innerHTML = `
                <div class="active-workout-section">
                    <div class="active-workout-header">
                        <h3 class="active-workout-name">${workout.name || "Today's Workout"}</h3>
                        <span class="active-workout-timer" id="workout-timer">${formatWorkoutTimer(workout.startTime)}</span>
                    </div>
                    <div class="empty-state empty-state-compact">
                        <p>No exercises yet. Add your first exercise!</p>
                    </div>
                    <button class="btn btn-primary btn-add-exercise-inline" onclick="openExerciseModal()">
                        + Add Exercise
                    </button>
                </div>
            `;
            startWorkoutTimerUpdate();
        } else {
            todayExercisesEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💪</div>
                    <p>Ready to train?</p>
                    <p class="empty-state-hint">Tap "Start Workout" to begin</p>
                </div>
            `;
        }
        return;
    }

    // Render exercises (with or without active workout header)
    let exercisesHtml = '';

    if (hasActiveWorkout) {
        exercisesHtml = `
            <div class="active-workout-section">
                <div class="active-workout-header">
                    <h3 class="active-workout-name">${workout.name || "Today's Workout"}</h3>
                    <span class="active-workout-timer" id="workout-timer">${formatWorkoutTimer(workout.startTime)}</span>
                </div>
        `;
        startWorkoutTimerUpdate();
    }

    exercisesHtml += workout.exercises.map((exercise, index) => `
        <div class="exercise-card">
            <div class="exercise-card-header">
                <span class="exercise-card-title">${exercise.name}</span>
                <div class="exercise-card-actions">
                    <button class="btn-icon" onclick="editExercise(${index})" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteExercise(${index})" title="Delete">🗑️</button>
                </div>
            </div>
            <table class="sets-table">
                <thead>
                    <tr>
                        <th>Set</th>
                        <th>Reps</th>
                        <th>Weight (kg)</th>
                    </tr>
                </thead>
                <tbody>
                    ${exercise.sets.map((set, setIndex) => `
                        <tr>
                            <td>${setIndex + 1}</td>
                            <td>${set.reps}</td>
                            <td>${set.weight}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('');

    if (hasActiveWorkout) {
        exercisesHtml += `
                <button class="btn btn-primary btn-add-exercise-inline" onclick="openExerciseModal()">
                    + Add Exercise
                </button>
            </div>
        `;
    }

    todayExercisesEl.innerHTML = exercisesHtml;
}

// Render compact side-by-side dashboard stats
function renderDashboardStats(container, data) {
    const weekData = getWeeklyVolume(data.workouts);
    const totalVolume = weekData.reduce((sum, v) => sum + v, 0);
    const prs = getRecentPRsCompact(data.workouts, 2);

    container.innerHTML = `
        <div class="dashboard-stats-row">
            <div class="stats-card stats-card-volume">
                <div class="stats-card-header">
                    <h4 class="stats-card-title">This Week</h4>
                    <button class="stats-settings-btn" onclick="openVolumeSettings()" title="Settings">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
                <div class="stats-card-value">${formatVolumeCompact(totalVolume)}</div>
                <div class="stats-mini-chart">
                    ${weekData.map((vol, i) => {
                        const maxVol = Math.max(...weekData, 1);
                        const height = Math.max(4, (vol / maxVol) * 100);
                        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                        return `<div class="mini-bar-container">
                            <div class="mini-bar" style="height: ${height}%"></div>
                            <span class="mini-bar-label">${days[i]}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <div class="stats-card stats-card-prs">
                <div class="stats-card-header">
                    <h4 class="stats-card-title">Recent PRs</h4>
                    ${prs.length > 2 ? '<a class="stats-view-all" onclick="switchView(\'progress\')">View all</a>' : ''}
                </div>
                ${prs.length > 0 ? prs.map(pr => `
                    <div class="pr-compact">
                        <span class="pr-compact-exercise">${pr.exercise}</span>
                        <span class="pr-compact-value">💪 ${pr.value}kg</span>
                    </div>
                `).join('') : '<div class="pr-empty-compact">No PRs yet</div>'}
            </div>
        </div>
    `;
}

// Get compact PR list
function getRecentPRsCompact(workouts, limit = 2) {
    if (!workouts || workouts.length === 0) return [];

    const exerciseBests = {};
    const prs = [];

    const sortedWorkouts = [...workouts].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    for (let i = sortedWorkouts.length - 1; i >= 0; i--) {
        const workout = sortedWorkouts[i];
        workout.exercises.forEach(exercise => {
            const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
            if (!exerciseBests[exercise.name] || maxWeight > exerciseBests[exercise.name]) {
                if (exerciseBests[exercise.name] && maxWeight > exerciseBests[exercise.name]) {
                    prs.push({
                        exercise: exercise.name,
                        value: maxWeight,
                        date: workout.date
                    });
                }
                exerciseBests[exercise.name] = maxWeight;
            }
        });
    }

    return prs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

// Get weekly volume data
function getWeeklyVolume(workouts) {
    if (!workouts || workouts.length === 0) {
        return Array(7).fill(0);
    }

    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const weekVolume = Array(7).fill(0);

    workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        const daysSinceMonday = Math.floor((workoutDate - monday) / (1000 * 60 * 60 * 24));

        if (daysSinceMonday >= 0 && daysSinceMonday < 7) {
            const volume = workout.exercises.reduce((total, exercise) => {
                return total + exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (set.reps * set.weight);
                }, 0);
            }, 0);
            weekVolume[daysSinceMonday] += volume;
        }
    });

    return weekVolume;
}

// Format volume for compact display
function formatVolumeCompact(volume) {
    if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'k kg';
    }
    return volume + ' kg';
}

// Format workout timer
function formatWorkoutTimer(startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Start workout timer updates
function startWorkoutTimerUpdate() {
    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
    }

    const updateTimer = () => {
        const timerEl = document.getElementById('workout-timer');
        if (timerEl && workoutStartTime) {
            timerEl.textContent = formatWorkoutTimer(workoutStartTime);
        }
    };

    workoutTimerInterval = setInterval(updateTimer, 1000);
}

// Volume settings placeholder
function openVolumeSettings() {
    console.log('Volume settings - TODO');
}

// Open custom exercise wizard
function openCustomExerciseWizard() {
    openExerciseWizard({
        onComplete: async (name, metadata) => {
            appData = await addCustomExercise(appData, name, metadata);
            renderLibraryView();
        },
        onCancel: () => {
            // Nothing to do
        }
    });
}

// Render history view
function renderHistoryView() {
    const calendarContainer = document.getElementById('history-calendar');
    const listContainer = document.getElementById('history-list');

    if (historyViewMode === 'calendar') {
        calendarContainer.style.display = 'block';
        listContainer.style.display = 'none';

        if (!historyCalendar) {
            historyCalendar = renderCalendar(calendarContainer, appData.workouts);
        } else {
            historyCalendar.updateWorkouts(appData.workouts);
        }
    } else {
        calendarContainer.style.display = 'none';
        listContainer.style.display = 'block';
        renderHistoryList();
    }
}

function renderHistoryList() {
    const historyListEl = document.getElementById('history-list');
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
    // Initialize filter drawer if not already initialized
    const filterDrawerInstance = getFilterDrawer();
    if (!filterDrawerInstance) {
        initFilterDrawer({
            onApply: (filters) => {
                libraryFilters = filters;
                renderLibraryExercises();
                updateFilterButtonBadge();
            },
            onClear: () => {
                libraryFilters = { muscleGroups: [], equipment: [] };
                renderLibraryExercises();
                updateFilterButtonBadge();
            }
        });
    }

    // Render recent exercises
    const recentExercises = getRecentExercises(appData.workouts, 5);
    const recentContainer = document.getElementById('recent-exercises');
    if (recentExercises.length > 0) {
        recentContainer.innerHTML = renderRecentExercises(recentExercises, (name) => {
            selectLibraryExercise(name);
        });
    } else {
        recentContainer.innerHTML = '';
    }

    // Render library exercises
    renderLibraryExercises();
    updateFilterButtonBadge();
}

// Render library exercises (with search and filters applied)
function renderLibraryExercises() {
    const favorites = appData.favorites || [];
    const customExercises = appData.customExercises || {};

    // Start with all exercises
    let exercises = [...appData.exerciseLibrary];

    // Apply search filter
    if (librarySearchQuery) {
        exercises = searchExercises(exercises, librarySearchQuery);
    }

    // Apply filters (muscle groups and equipment)
    if (libraryFilters.muscleGroups.length > 0 || libraryFilters.equipment.length > 0) {
        exercises = filterExercises(exercises, libraryFilters, customExercises);
    }

    // Render based on view mode
    if (libraryViewMode === 'list') {
        exerciseLibraryListEl.innerHTML = renderExerciseList(
            exercises,
            favorites,
            customExercises,
            (name) => selectLibraryExercise(name)
        );
    } else {
        exerciseLibraryListEl.innerHTML = renderExerciseGrid(
            exercises,
            favorites,
            customExercises,
            (name) => selectLibraryExercise(name)
        );
    }
}

// Handle exercise selection from library
function selectLibraryExercise(name) {
    // Switch to Today view and open modal with selected exercise
    switchView('today');

    // Small delay to allow view switch
    setTimeout(() => {
        editingExerciseIndex = null;
        openExerciseModal();

        // Set the selected exercise
        const exerciseNameSelect = document.getElementById('exercise-name');
        if (exerciseNameSelect) {
            exerciseNameSelect.value = name;
            // Trigger auto-fill
            handleExerciseSelection({ target: exerciseNameSelect });
        }
    }, 100);
}

// Handle favorite toggle
window.handleFavoriteToggle = async function(name) {
    appData = await toggleFavoriteExercise(appData, name);
    renderLibraryExercises();
};

// Update filter button badge to show active filter count
function updateFilterButtonBadge() {
    const filterBtn = document.getElementById('open-filter-btn');
    if (!filterBtn) return;

    const totalFilters = (libraryFilters.muscleGroups?.length || 0) + (libraryFilters.equipment?.length || 0);

    // Remove existing badge
    const existingBadge = filterBtn.querySelector('.filter-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    // Add badge if filters active
    if (totalFilters > 0) {
        filterBtn.classList.add('has-filters');
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.textContent = totalFilters;
        filterBtn.appendChild(badge);
    } else {
        filterBtn.classList.remove('has-filters');
    }
}

// Handle set completion (checkbox animation)
function handleSetComplete(checkbox, setRow) {
    if (checkbox.classList.contains('checked')) {
        // Unchecking
        checkbox.classList.remove('checked');
        setRow.classList.remove('completed');
        return;
    }

    // Checking
    checkbox.classList.add('checked');
    animateCheckmark(checkbox);
    burstConfetti(checkbox);
    setRow.classList.add('completed');

    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Make handleSetComplete globally accessible for onclick handlers
window.handleSetComplete = handleSetComplete;

// Handle exercise selection (between-sessions auto-fill)
function handleExerciseSelection(event) {
    const exerciseName = event.target.value;
    const setsList = document.getElementById('sets-list');

    // Only update first set if exactly one set exists
    if (setsList.children.length !== 1) return;

    // Get most recent session data
    const recentData = getMostRecentExerciseFirstSet(appData, exerciseName);

    if (recentData) {
        // Update the existing first set's values
        const firstSet = setsList.children[0];
        firstSet.querySelector('.set-reps').value = recentData.reps;
        firstSet.querySelector('.set-weight').value = recentData.weight;
    }
}

// Open exercise modal
function openExerciseModal() {
    // Populate exercise dropdown
    const exerciseNameSelect = document.getElementById('exercise-name');
    exerciseNameSelect.innerHTML = appData.exerciseLibrary.map(ex =>
        `<option value="${ex}">${ex}</option>`
    ).join('');

    // Reset sets
    const setsList = document.getElementById('sets-list');
    setsList.innerHTML = '';

    // Add initial set row
    addSetRow();

    // Add event listener for exercise selection (auto-fill from history)
    // Clone and replace to prevent duplicate listeners
    const newSelect = exerciseNameSelect.cloneNode(true);
    exerciseNameSelect.parentNode.replaceChild(newSelect, exerciseNameSelect);
    newSelect.addEventListener('change', handleExerciseSelection);

    // Trigger auto-fill for the default selected exercise
    handleExerciseSelection({ target: newSelect });

    exerciseModal.classList.add('active');
}

// Close exercise modal
function closeExerciseModal() {
    exerciseModal.classList.remove('active');
    editingExerciseIndex = null;
}

// Add set row to modal
function addSetRow(reps = '', weight = '', options = {}) {
    // Get placeholder hints from previous workout if available
    let repsPlaceholder = '';
    let weightPlaceholder = '';

    if (options.showPlaceholders && !reps && !weight) {
        const exerciseName = document.getElementById('exercise-name')?.value;
        if (exerciseName) {
            const recentData = getMostRecentExerciseFirstSet(appData, exerciseName);
            if (recentData) {
                repsPlaceholder = recentData.reps;
                weightPlaceholder = recentData.weight;
            }
        }
    }

    // Use default values if not provided and no placeholders
    const repsValue = reps || (repsPlaceholder ? '' : 10);
    const weightValue = weight || (weightPlaceholder ? '' : 20);














    const setsList = document.getElementById('sets-list');
    const setNumber = setsList.children.length + 1;

    const setRow = document.createElement('div');
    setRow.className = 'set-row';
    setRow.innerHTML = `
        <div class="set-checkbox" onclick="handleSetComplete(this, this.parentElement)" title="Mark as complete"></div>
        <span>Set ${setNumber}</span>
        <label>Reps</label>
        <input type="number" class="number-input set-reps"
               value="${repsValue}"
               ${repsPlaceholder ? `placeholder="${repsPlaceholder}"` : ''}
               min="1" max="100" step="1">
        <label>kg</label>
        <input type="number" class="number-input set-weight"
               value="${weightValue}"
               ${weightPlaceholder ? `placeholder="${weightPlaceholder}"` : ''}
               min="0" max="1000" step="2.5">
        <button class="btn-icon remove-set-btn" onclick="removeSetRow(this)" title="Remove">✕</button>
    `;

    setsList.appendChild(setRow);
}

// Handle adding a new set (within-session auto-fill)
function handleAddSet() {
    const setsList = document.getElementById('sets-list');
    const existingSets = setsList.children;

    if (existingSets.length === 0) {
        addSetRow();
        return;
    }

    // Get values from the last set
    const lastSet = existingSets[existingSets.length - 1];
    const lastReps = parseInt(lastSet.querySelector('.set-reps').value) || 10;
    const lastWeight = parseFloat(lastSet.querySelector('.set-weight').value) || 20;

    // Add new set with previous set's values
    addSetRow(lastReps, lastWeight);
}

// Remove set row
window.removeSetRow = function(btn) {
    const setRow = btn.closest('.set-row');
    setRow.remove();

    // Renumber remaining sets
    const setsList = document.getElementById('sets-list');
    Array.from(setsList.children).forEach((row, index) => {
        row.querySelector('span').textContent = `Set ${index + 1}`;
    });
};

// Save exercise from modal
async function saveExercise() {
    const exerciseName = document.getElementById('exercise-name').value;
    const setsList = document.getElementById('sets-list');
    const setRows = setsList.querySelectorAll('.set-row');

    const sets = Array.from(setRows).map(row => ({
        reps: parseInt(row.querySelector('.set-reps').value) || 0,
        weight: parseFloat(row.querySelector('.set-weight').value) || 0
    })).filter(set => set.reps > 0);

    if (sets.length === 0) {
        alert('Please add at least one set with reps.');
        return;
    }

    const exercise = {
        name: exerciseName,
        sets
    };

    if (editingExerciseIndex !== null) {
        // Update existing exercise
        const workout = getWorkoutByDate(appData, currentDate);
        if (workout) {
            workout.exercises[editingExerciseIndex] = exercise;
            appData = { ...appData };
            await saveData(appData);
        }
    } else {
        // Add new exercise
        appData = await addExerciseToWorkout(appData, currentDate, exercise);
    }

    closeExerciseModal();
    renderTodayView();
}

// Edit exercise
window.editExercise = async function(index) {
    const workout = getWorkoutByDate(appData, currentDate);
    if (!workout) return;

    const exercise = workout.exercises[index];
    editingExerciseIndex = index;

    // Populate modal with exercise data
    const exerciseNameSelect = document.getElementById('exercise-name');
    exerciseNameSelect.innerHTML = appData.exerciseLibrary.map(ex =>
        `<option value="${ex}" ${ex === exercise.name ? 'selected' : ''}>${ex}</option>`
    ).join('');

    // Populate sets
    const setsList = document.getElementById('sets-list');
    setsList.innerHTML = '';

    exercise.sets.forEach((set, setIndex) => {
        const setRow = document.createElement('div');
        setRow.className = 'set-row';
        setRow.innerHTML = `
            <span>Set ${setIndex + 1}</span>
            <label>Reps</label>
            <input type="number" class="number-input set-reps" value="${set.reps}" min="1" max="100">
            <label>kg</label>
            <input type="number" class="number-input set-weight" value="${set.weight}" min="0" max="1000" step="0.5">
            <button class="btn-icon remove-set-btn" onclick="removeSetRow(this)" title="Remove">✕</button>
        `;
        setsList.appendChild(setRow);
    });

    exerciseModal.classList.add('active');
};

// Delete exercise
window.deleteExercise = async function(index) {
    if (confirm('Delete this exercise?')) {
        appData = await removeExerciseFromWorkout(appData, currentDate, index);
        renderTodayView();
    }
};

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
async function saveCustomExercise() {
    const name = document.getElementById('custom-exercise-name').value.trim();

    if (!name) {
        alert('Please enter an exercise name.');
        return;
    }

    appData = await addCustomExercise(appData, name);
    closeCustomExerciseModal();
    renderLibraryView();
}

// Delete from library
window.deleteFromLibrary = async function(exerciseName) {
    if (confirm(`Remove "${exerciseName}" from library?`)) {
        appData = await removeExerciseFromLibrary(appData, exerciseName);
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
async function saveTemplate() {
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

    appData = await addWorkoutTemplate(appData, { name, exercises });
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
async function startTemplateWorkout() {
    if (!viewingTemplateId) return;

    appData = await applyWorkoutTemplate(appData, currentDate, viewingTemplateId);
    closeViewTemplateModal();
    switchView('today');
}

// Delete template
async function deleteTemplate(templateId) {
    if (confirm('Delete this workout template?')) {
        appData = await deleteWorkoutTemplate(appData, templateId);
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
async function confirmSaveAsTemplate() {
    const name = document.getElementById('save-template-name').value.trim();
    if (!name) {
        alert('Please enter a template name.');
        return;
    }

    appData = await saveWorkoutAsTemplate(appData, currentDate, name);
    closeSaveTemplateModal();
    alert('Workout saved as template!');
}

// ========== NEW WORKOUT FLOW ==========

// Get next workout number for auto-naming
function getNextWorkoutNumber() {
    const existingNames = appData.workouts
        .map(w => w.name)
        .filter(name => name && name.startsWith('My Workout #'));

    if (existingNames.length === 0) return 1;

    const numbers = existingNames.map(name => {
        const match = name.match(/My Workout #(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    });

    return Math.max(...numbers) + 1;
}

// Start a new workout
async function startNewWorkout() {
    const workoutNumber = getNextWorkoutNumber();
    const workoutName = `My Workout #${workoutNumber}`;

    // Create empty workout object
    const newWorkout = {
        id: Date.now().toString(),
        date: currentDate,
        name: workoutName,
        startTime: Date.now(),
        exercises: []
    };

    // Check if workout already exists for today
    const existingWorkout = getWorkoutByDate(appData, currentDate);
    if (existingWorkout) {
        // Update existing workout with timer info
        existingWorkout.name = existingWorkout.name || workoutName;
        existingWorkout.startTime = existingWorkout.startTime || Date.now();
    } else {
        // Add new workout
        appData.workouts.push(newWorkout);
    }

    await saveData(appData);

    // Set active workout state
    activeWorkout = existingWorkout || newWorkout;
    workoutStartTime = activeWorkout.startTime;

    // Show mini-player immediately
    showMiniPlayer({
        name: activeWorkout.name,
        date: currentDate,
        startTime: workoutStartTime
    });

    // Stay on dashboard and render active workout state
    renderTodayView();
}

// Check for active workout on load
function checkActiveWorkout() {
    const todayWorkout = getWorkoutByDate(appData, currentDate);
    if (todayWorkout && todayWorkout.startTime) {
        // There's an active workout from today
        activeWorkout = todayWorkout;
        workoutStartTime = todayWorkout.startTime;

        // Show mini-player if not on today view
        if (currentView !== 'today') {
            showMiniPlayer({
                name: todayWorkout.name || "Today's Workout",
                date: currentDate,
                startTime: workoutStartTime
            });
        }
    }
}

// End workout
async function endWorkout() {
    if (!activeWorkout) return;

    const workout = getWorkoutByDate(appData, currentDate);
    if (workout) {
        workout.endTime = Date.now();
        await saveData(appData);
    }

    activeWorkout = null;
    workoutStartTime = null;
    hideMiniPlayer();
    renderTodayView();
}

// Make endWorkout globally accessible
window.endWorkout = endWorkout;

// Initialize the app
init().catch(err => console.error('Failed to initialize app:', err));
