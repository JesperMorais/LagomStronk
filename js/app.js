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
    getUsedExercises
} from './data.js';

import {
    updateProgressChart,
    updateVolumeChart
} from './charts.js';

// App state
let appData = loadData();
let currentView = 'today';
let currentDate = getTodayStr();
let editingExerciseIndex = null;

// DOM Elements
const views = {
    today: document.getElementById('today-view'),
    history: document.getElementById('history-view'),
    progress: document.getElementById('progress-view'),
    library: document.getElementById('library-view')
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
    document.getElementById('add-set-btn').addEventListener('click', addSetRow);

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
    [exerciseModal, customExerciseModal, workoutModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Render today's workout
function renderTodayView() {
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

    todayExercisesEl.innerHTML = workout.exercises.map((exercise, index) => `
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
    const usedExercises = getUsedExercises(appData);

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

    exerciseModal.classList.add('active');
}

// Close exercise modal
function closeExerciseModal() {
    exerciseModal.classList.remove('active');
    editingExerciseIndex = null;
}

// Add set row to modal
function addSetRow() {
    const setsList = document.getElementById('sets-list');
    const setNumber = setsList.children.length + 1;

    const setRow = document.createElement('div');
    setRow.className = 'set-row';
    setRow.innerHTML = `
        <span>Set ${setNumber}</span>
        <label>Reps</label>
        <input type="number" class="number-input set-reps" value="10" min="1" max="100">
        <label>kg</label>
        <input type="number" class="number-input set-weight" value="20" min="0" max="1000" step="0.5">
        <button class="btn-icon remove-set-btn" onclick="removeSetRow(this)" title="Remove">✕</button>
    `;

    setsList.appendChild(setRow);
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
function saveExercise() {
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
            saveData(appData);
        }
    } else {
        // Add new exercise
        appData = addExerciseToWorkout(appData, currentDate, exercise);
    }

    closeExerciseModal();
    renderTodayView();
}

// Edit exercise
window.editExercise = function(index) {
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
window.deleteExercise = function(index) {
    if (confirm('Delete this exercise?')) {
        appData = removeExerciseFromWorkout(appData, currentDate, index);
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

// Initialize the app
init();
