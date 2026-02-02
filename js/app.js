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
    getMuscleGroupStats
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
