// ========== MUSCLE GROUPS ==========
const MUSCLE_GROUPS = {
    chest: { id: 'chest', displayName: 'Chest' },
    back: { id: 'back', displayName: 'Back' },
    shoulders: { id: 'shoulders', displayName: 'Shoulders' },
    biceps: { id: 'biceps', displayName: 'Biceps' },
    triceps: { id: 'triceps', displayName: 'Triceps' },
    forearms: { id: 'forearms', displayName: 'Forearms' },
    quads: { id: 'quads', displayName: 'Quadriceps' },
    hamstrings: { id: 'hamstrings', displayName: 'Hamstrings' },
    glutes: { id: 'glutes', displayName: 'Glutes' },
    calves: { id: 'calves', displayName: 'Calves' },
    abs: { id: 'abs', displayName: 'Abs' },
    obliques: { id: 'obliques', displayName: 'Obliques' }
};

// ========== EQUIPMENT TYPES ==========
const EQUIPMENT_TYPES = {
    barbell: { id: 'barbell', displayName: 'Barbell' },
    dumbbell: { id: 'dumbbell', displayName: 'Dumbbell' },
    ezbar: { id: 'ezbar', displayName: 'EZ Bar' },
    machine: { id: 'machine', displayName: 'Machine' },
    cable: { id: 'cable', displayName: 'Cable' },
    smithMachine: { id: 'smithMachine', displayName: 'Smith Machine' },
    kettlebell: { id: 'kettlebell', displayName: 'Kettlebell' },
    resistanceBand: { id: 'resistanceBand', displayName: 'Resistance Band' },
    bodyweight: { id: 'bodyweight', displayName: 'Bodyweight' },
    other: { id: 'other', displayName: 'Other' }
};

// ========== EXERCISE METADATA ==========
// Maps exercise names to primary/secondary muscles and equipment
const EXERCISE_METADATA = {
    'Bench Press': {
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        equipment: 'barbell'
    },
    'Incline Bench Press': {
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        equipment: 'barbell'
    },
    'Dumbbell Bench Press': {
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        equipment: 'dumbbell'
    },
    'Squat': {
        primaryMuscles: ['quads', 'glutes'],
        secondaryMuscles: ['hamstrings', 'abs'],
        equipment: 'barbell'
    },
    'Front Squat': {
        primaryMuscles: ['quads'],
        secondaryMuscles: ['glutes', 'abs'],
        equipment: 'barbell'
    },
    'Deadlift': {
        primaryMuscles: ['back', 'glutes', 'hamstrings'],
        secondaryMuscles: ['quads', 'forearms', 'abs'],
        equipment: 'barbell'
    },
    'Romanian Deadlift': {
        primaryMuscles: ['hamstrings', 'glutes'],
        secondaryMuscles: ['back', 'forearms'],
        equipment: 'barbell'
    },
    'Overhead Press': {
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['triceps', 'abs'],
        equipment: 'barbell'
    },
    'Barbell Row': {
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps', 'forearms'],
        equipment: 'barbell'
    },
    'Pull-ups': {
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps', 'forearms'],
        equipment: 'bodyweight'
    },
    'Chin-ups': {
        primaryMuscles: ['back', 'biceps'],
        secondaryMuscles: ['forearms'],
        equipment: 'bodyweight'
    },
    'Lat Pulldown': {
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps', 'forearms'],
        equipment: 'cable'
    },
    'Seated Cable Row': {
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps', 'forearms'],
        equipment: 'cable'
    },
    'Leg Press': {
        primaryMuscles: ['quads', 'glutes'],
        secondaryMuscles: ['hamstrings'],
        equipment: 'machine'
    },
    'Leg Extension': {
        primaryMuscles: ['quads'],
        secondaryMuscles: [],
        equipment: 'machine'
    },
    'Leg Curl': {
        primaryMuscles: ['hamstrings'],
        secondaryMuscles: [],
        equipment: 'machine'
    },
    'Lunges': {
        primaryMuscles: ['quads', 'glutes'],
        secondaryMuscles: ['hamstrings', 'calves'],
        equipment: 'bodyweight'
    },
    'Bulgarian Split Squat': {
        primaryMuscles: ['quads', 'glutes'],
        secondaryMuscles: ['hamstrings'],
        equipment: 'bodyweight'
    },
    'Bicep Curls': {
        primaryMuscles: ['biceps'],
        secondaryMuscles: ['forearms'],
        equipment: 'dumbbell'
    },
    'Hammer Curls': {
        primaryMuscles: ['biceps'],
        secondaryMuscles: ['forearms'],
        equipment: 'dumbbell'
    },
    'Tricep Extensions': {
        primaryMuscles: ['triceps'],
        secondaryMuscles: [],
        equipment: 'dumbbell'
    },
    'Tricep Pushdown': {
        primaryMuscles: ['triceps'],
        secondaryMuscles: [],
        equipment: 'cable'
    },
    'Skull Crushers': {
        primaryMuscles: ['triceps'],
        secondaryMuscles: [],
        equipment: 'ezbar'
    },
    'Lateral Raises': {
        primaryMuscles: ['shoulders'],
        secondaryMuscles: [],
        equipment: 'dumbbell'
    },
    'Face Pulls': {
        primaryMuscles: ['shoulders', 'back'],
        secondaryMuscles: [],
        equipment: 'cable'
    },
    'Calf Raises': {
        primaryMuscles: ['calves'],
        secondaryMuscles: [],
        equipment: 'machine'
    },
    'Plank': {
        primaryMuscles: ['abs'],
        secondaryMuscles: ['obliques', 'shoulders'],
        equipment: 'bodyweight'
    },
    'Ab Wheel Rollout': {
        primaryMuscles: ['abs'],
        secondaryMuscles: ['obliques', 'shoulders'],
        equipment: 'other'
    }
};

// Default metadata for unknown exercises
const DEFAULT_EXERCISE_METADATA = {
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: 'other'
};

// Default exercise library
const DEFAULT_EXERCISES = [
    'Bench Press',
    'Incline Bench Press',
    'Dumbbell Bench Press',
    'Squat',
    'Front Squat',
    'Deadlift',
    'Romanian Deadlift',
    'Overhead Press',
    'Barbell Row',
    'Pull-ups',
    'Chin-ups',
    'Lat Pulldown',
    'Seated Cable Row',
    'Leg Press',
    'Leg Extension',
    'Leg Curl',
    'Lunges',
    'Bulgarian Split Squat',
    'Bicep Curls',
    'Hammer Curls',
    'Tricep Extensions',
    'Tricep Pushdown',
    'Skull Crushers',
    'Lateral Raises',
    'Face Pulls',
    'Calf Raises',
    'Plank',
    'Ab Wheel Rollout'
];

// Default workout templates
const DEFAULT_WORKOUT_TEMPLATES = [
    {
        id: 'push-day',
        name: 'Push Day',
        isDefault: true,
        exercises: [
            { name: 'Bench Press', sets: 4, reps: 8 },
            { name: 'Overhead Press', sets: 3, reps: 10 },
            { name: 'Incline Bench Press', sets: 3, reps: 10 },
            { name: 'Lateral Raises', sets: 3, reps: 15 },
            { name: 'Tricep Pushdown', sets: 3, reps: 12 }
        ]
    },
    {
        id: 'pull-day',
        name: 'Pull Day',
        isDefault: true,
        exercises: [
            { name: 'Deadlift', sets: 4, reps: 5 },
            { name: 'Barbell Row', sets: 4, reps: 8 },
            { name: 'Lat Pulldown', sets: 3, reps: 10 },
            { name: 'Face Pulls', sets: 3, reps: 15 },
            { name: 'Bicep Curls', sets: 3, reps: 12 }
        ]
    },
    {
        id: 'leg-day',
        name: 'Leg Day',
        isDefault: true,
        exercises: [
            { name: 'Squat', sets: 4, reps: 6 },
            { name: 'Romanian Deadlift', sets: 3, reps: 10 },
            { name: 'Leg Press', sets: 3, reps: 12 },
            { name: 'Leg Curl', sets: 3, reps: 12 },
            { name: 'Calf Raises', sets: 4, reps: 15 }
        ]
    },
    {
        id: 'upper-body',
        name: 'Upper Body',
        isDefault: true,
        exercises: [
            { name: 'Bench Press', sets: 4, reps: 8 },
            { name: 'Barbell Row', sets: 4, reps: 8 },
            { name: 'Overhead Press', sets: 3, reps: 10 },
            { name: 'Lat Pulldown', sets: 3, reps: 10 },
            { name: 'Bicep Curls', sets: 2, reps: 12 },
            { name: 'Tricep Extensions', sets: 2, reps: 12 }
        ]
    },
    {
        id: 'full-body',
        name: 'Full Body',
        isDefault: true,
        exercises: [
            { name: 'Squat', sets: 3, reps: 8 },
            { name: 'Bench Press', sets: 3, reps: 8 },
            { name: 'Barbell Row', sets: 3, reps: 8 },
            { name: 'Overhead Press', sets: 3, reps: 10 },
            { name: 'Romanian Deadlift', sets: 3, reps: 10 }
        ]
    }
];

const STORAGE_KEY = 'lagomstronk_data';

// Initialize data structure
function getDefaultData() {
    return {
        workouts: [],
        exerciseLibrary: [...DEFAULT_EXERCISES],
        workoutTemplates: [...DEFAULT_WORKOUT_TEMPLATES]
    };
}

// Load data from localStorage
export function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Ensure exerciseLibrary exists
            if (!data.exerciseLibrary) {
                data.exerciseLibrary = [...DEFAULT_EXERCISES];
            }
            // Ensure workouts array exists
            if (!data.workouts) {
                data.workouts = [];
            }
            // Ensure workoutTemplates exists
            if (!data.workoutTemplates) {
                data.workoutTemplates = [...DEFAULT_WORKOUT_TEMPLATES];
            }
            return data;
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return getDefaultData();
}

// Save data to localStorage
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

// Generate UUID
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Get workout by date
export function getWorkoutByDate(data, dateStr) {
    return data.workouts.find(w => w.date === dateStr);
}

// Create or update workout for a date
export function saveWorkout(data, dateStr, exercises) {
    const existingIndex = data.workouts.findIndex(w => w.date === dateStr);

    if (existingIndex >= 0) {
        data.workouts[existingIndex].exercises = exercises;
    } else {
        data.workouts.push({
            id: generateId(),
            date: dateStr,
            exercises: exercises
        });
    }

    // Sort workouts by date (newest first)
    data.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveData(data);
    return data;
}

// Add exercise to a workout
export function addExerciseToWorkout(data, dateStr, exercise) {
    const workout = getWorkoutByDate(data, dateStr);

    if (workout) {
        workout.exercises.push(exercise);
    } else {
        data.workouts.push({
            id: generateId(),
            date: dateStr,
            exercises: [exercise]
        });
    }

    data.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveData(data);
    return data;
}

// Remove exercise from workout
export function removeExerciseFromWorkout(data, dateStr, exerciseIndex) {
    const workout = getWorkoutByDate(data, dateStr);

    if (workout && workout.exercises[exerciseIndex]) {
        workout.exercises.splice(exerciseIndex, 1);

        // Remove workout if no exercises left
        if (workout.exercises.length === 0) {
            const workoutIndex = data.workouts.findIndex(w => w.date === dateStr);
            data.workouts.splice(workoutIndex, 1);
        }

        saveData(data);
    }

    return data;
}

// Add custom exercise to library
export function addCustomExercise(data, exerciseName) {
    const trimmed = exerciseName.trim();
    if (trimmed && !data.exerciseLibrary.includes(trimmed)) {
        data.exerciseLibrary.push(trimmed);
        data.exerciseLibrary.sort();
        saveData(data);
    }
    return data;
}

// Remove exercise from library
export function removeExerciseFromLibrary(data, exerciseName) {
    const index = data.exerciseLibrary.indexOf(exerciseName);
    if (index >= 0) {
        data.exerciseLibrary.splice(index, 1);
        saveData(data);
    }
    return data;
}

// Get all workouts sorted by date
export function getWorkoutsSorted(data) {
    return [...data.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get exercise history (for charts)
export function getExerciseHistory(data, exerciseName) {
    const history = [];

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            if (exercise.name === exerciseName) {
                // Find max weight for this exercise on this day
                const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
                const totalVolume = exercise.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0);

                history.push({
                    date: workout.date,
                    maxWeight,
                    totalVolume,
                    sets: exercise.sets
                });
            }
        }
    }

    // Sort by date (oldest first for charts)
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Get total volume per workout (for charts)
export function getVolumeHistory(data) {
    const history = [];

    for (const workout of data.workouts) {
        let totalVolume = 0;

        for (const exercise of workout.exercises) {
            for (const set of exercise.sets) {
                totalVolume += set.reps * set.weight;
            }
        }

        history.push({
            date: workout.date,
            totalVolume
        });
    }

    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Get all exercises used in workouts
export function getUsedExercises(data) {
    const exercises = new Set();

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            exercises.add(exercise.name);
        }
    }

    return Array.from(exercises).sort();
}

// Format date for display
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get today's date as YYYY-MM-DD
export function getTodayStr() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get all workout templates
export function getWorkoutTemplates(data) {
    return data.workoutTemplates || [];
}

// Get workout template by ID
export function getWorkoutTemplateById(data, templateId) {
    return data.workoutTemplates.find(t => t.id === templateId);
}

// Add a custom workout template
export function addWorkoutTemplate(data, template) {
    const newTemplate = {
        id: generateId(),
        name: template.name.trim(),
        isDefault: false,
        exercises: template.exercises
    };
    data.workoutTemplates.push(newTemplate);
    saveData(data);
    return data;
}

// Update a workout template
export function updateWorkoutTemplate(data, templateId, updates) {
    const index = data.workoutTemplates.findIndex(t => t.id === templateId);
    if (index >= 0) {
        data.workoutTemplates[index] = {
            ...data.workoutTemplates[index],
            ...updates
        };
        saveData(data);
    }
    return data;
}

// Delete a workout template
export function deleteWorkoutTemplate(data, templateId) {
    const index = data.workoutTemplates.findIndex(t => t.id === templateId);
    if (index >= 0) {
        data.workoutTemplates.splice(index, 1);
        saveData(data);
    }
    return data;
}

// Apply workout template to today's workout
export function applyWorkoutTemplate(data, dateStr, templateId, defaultWeight = 20) {
    const template = getWorkoutTemplateById(data, templateId);
    if (!template) return data;

    // Convert template exercises to workout exercises with actual sets
    const exercises = template.exercises.map(templateEx => ({
        name: templateEx.name,
        sets: Array(templateEx.sets).fill(null).map(() => ({
            reps: templateEx.reps,
            weight: defaultWeight,
            completed: false
        }))
    }));

    // Add each exercise to the workout
    for (const exercise of exercises) {
        data = addExerciseToWorkout(data, dateStr, exercise);
    }

    return data;
}

// Save current workout as a template
export function saveWorkoutAsTemplate(data, dateStr, templateName) {
    const workout = getWorkoutByDate(data, dateStr);
    if (!workout || workout.exercises.length === 0) return data;

    // Convert workout exercises to template format
    const templateExercises = workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.length,
        reps: ex.sets.length > 0 ? ex.sets[0].reps : 10
    }));

    const newTemplate = {
        id: generateId(),
        name: templateName.trim(),
        isDefault: false,
        exercises: templateExercises
    };

    data.workoutTemplates.push(newTemplate);
    saveData(data);
    return data;
}

// ========== STATS & ANALYTICS ==========

// Get all personal records (PRs) for each exercise
export function getPersonalRecords(data) {
    const prs = {};

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
            const maxVolume = exercise.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0);
            const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);

            if (!prs[exercise.name]) {
                prs[exercise.name] = {
                    maxWeight: { value: maxWeight, date: workout.date },
                    maxVolume: { value: maxVolume, date: workout.date },
                    maxReps: { value: totalReps, date: workout.date }
                };
            } else {
                if (maxWeight > prs[exercise.name].maxWeight.value) {
                    prs[exercise.name].maxWeight = { value: maxWeight, date: workout.date };
                }
                if (maxVolume > prs[exercise.name].maxVolume.value) {
                    prs[exercise.name].maxVolume = { value: maxVolume, date: workout.date };
                }
                if (totalReps > prs[exercise.name].maxReps.value) {
                    prs[exercise.name].maxReps = { value: totalReps, date: workout.date };
                }
            }
        }
    }

    return prs;
}

// Get overall training stats
export function getOverallStats(data) {
    let totalWorkouts = data.workouts.length;
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let totalExercises = 0;

    for (const workout of data.workouts) {
        totalExercises += workout.exercises.length;
        for (const exercise of workout.exercises) {
            totalSets += exercise.sets.length;
            for (const set of exercise.sets) {
                totalReps += set.reps;
                totalVolume += set.reps * set.weight;
            }
        }
    }

    return {
        totalWorkouts,
        totalSets,
        totalReps,
        totalVolume: Math.round(totalVolume),
        totalExercises,
        avgSetsPerWorkout: totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0,
        avgExercisesPerWorkout: totalWorkouts > 0 ? Math.round(totalExercises / totalWorkouts * 10) / 10 : 0
    };
}

// Get workout frequency stats
export function getFrequencyStats(data) {
    if (data.workouts.length === 0) {
        return { thisWeek: 0, thisMonth: 0, avgPerWeek: 0, currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let thisWeek = 0;
    let thisMonth = 0;

    for (const workout of data.workouts) {
        const workoutDate = new Date(workout.date);
        if (workoutDate >= startOfWeek) thisWeek++;
        if (workoutDate >= startOfMonth) thisMonth++;
    }

    // Calculate average per week
    const sortedWorkouts = [...data.workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstWorkout = new Date(sortedWorkouts[0].date);
    const daysSinceFirst = Math.max(1, Math.ceil((today - firstWorkout) / (1000 * 60 * 60 * 24)));
    const weeksSinceFirst = Math.max(1, daysSinceFirst / 7);
    const avgPerWeek = Math.round(data.workouts.length / weeksSinceFirst * 10) / 10;

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(data.workouts);

    return { thisWeek, thisMonth, avgPerWeek, currentStreak, longestStreak };
}

// Calculate workout streaks
function calculateStreaks(workouts) {
    if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = workouts.map(w => w.date).sort();
    const uniqueDates = [...new Set(dates)];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = getTodayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if last workout was today or yesterday for current streak
    const lastWorkoutDate = uniqueDates[uniqueDates.length - 1];
    const isActive = lastWorkoutDate === today || lastWorkoutDate === yesterdayStr;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    if (isActive) {
        // Count back from last workout to find current streak
        currentStreak = 1;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
            const prevDate = new Date(uniqueDates[i]);
            const currDate = new Date(uniqueDates[i + 1]);
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    return { currentStreak, longestStreak };
}

// Get weekly summary (last 4 weeks)
export function getWeeklySummary(data) {
    const weeks = [];
    const today = new Date();

    for (let i = 0; i < 4; i++) {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const weekWorkouts = data.workouts.filter(w => {
            const d = new Date(w.date);
            return d >= weekStart && d <= weekEnd;
        });

        let volume = 0;
        let sets = 0;
        for (const workout of weekWorkouts) {
            for (const exercise of workout.exercises) {
                sets += exercise.sets.length;
                for (const set of exercise.sets) {
                    volume += set.reps * set.weight;
                }
            }
        }

        weeks.push({
            label: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} Weeks Ago`,
            workouts: weekWorkouts.length,
            volume: Math.round(volume),
            sets
        });
    }

    return weeks;
}

// Calculate estimated 1RM using a hybrid approach:
// - Brzycki formula for reps < 10 (more accurate at low rep ranges)
//   Brzycki: weight * 36 / (37 - reps)
// - Epley formula for reps >= 10 (more accurate at higher rep ranges)
//   Epley: weight * (1 + reps / 30)
export function calculateEstimated1RM(weight, reps) {
    if (reps === 1) return weight;
    if (reps === 0 || weight === 0) return 0;

    if (reps < 10) {
        // Brzycki
        return Math.round(weight * (36 / (37 - reps)));
    }
    // Epley
    return Math.round(weight * (1 + reps / 30));
}

// Get estimated 1RMs for all exercises
export function getEstimated1RMs(data) {
    const e1rms = {};

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            for (const set of exercise.sets) {
                const e1rm = calculateEstimated1RM(set.weight, set.reps);

                if (!e1rms[exercise.name] || e1rm > e1rms[exercise.name].value) {
                    e1rms[exercise.name] = {
                        value: e1rm,
                        date: workout.date,
                        basedOn: { weight: set.weight, reps: set.reps }
                    };
                }
            }
        }
    }

    return e1rms;
}

// Get muscle group distribution
export function getMuscleGroupStats(data) {
    const muscleGroups = {
        'Chest': ['Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press'],
        'Back': ['Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Pull-ups', 'Chin-ups', 'Face Pulls'],
        'Shoulders': ['Overhead Press', 'Lateral Raises'],
        'Legs': ['Squat', 'Front Squat', 'Deadlift', 'Romanian Deadlift', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Lunges', 'Bulgarian Split Squat', 'Calf Raises'],
        'Arms': ['Bicep Curls', 'Hammer Curls', 'Tricep Extensions', 'Tricep Pushdown', 'Skull Crushers'],
        'Core': ['Plank', 'Ab Wheel Rollout']
    };

    const stats = {};
    for (const group of Object.keys(muscleGroups)) {
        stats[group] = { sets: 0, volume: 0 };
    }
    stats['Other'] = { sets: 0, volume: 0 };

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            let found = false;
            for (const [group, exercises] of Object.entries(muscleGroups)) {
                if (exercises.includes(exercise.name)) {
                    stats[group].sets += exercise.sets.length;
                    stats[group].volume += exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
                    found = true;
                    break;
                }
            }
            if (!found) {
                stats['Other'].sets += exercise.sets.length;
                stats['Other'].volume += exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
            }
        }
    }

    return stats;
}

// Get most recent first set for an exercise (for auto-fill)
export function getMostRecentExerciseFirstSet(data, exerciseName) {
    const history = getExerciseHistory(data, exerciseName);
    if (history.length === 0) return null;

    const mostRecent = history[history.length - 1]; // Last item = most recent
    if (!mostRecent.sets || mostRecent.sets.length === 0) return null;

    return {
        reps: mostRecent.sets[0].reps,
        weight: mostRecent.sets[0].weight
    };
}

// Get all sets from the most recent workout for an exercise (excluding a specific date)
export function getMostRecentExerciseSets(data, exerciseName, excludeDate) {
    const workouts = [...data.workouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const workout of workouts) {
        if (workout.date === excludeDate) continue;
        const exercise = workout.exercises.find(e => e.name === exerciseName);
        if (exercise) return exercise.sets;
    }
    return [];
}

// ========== EXERCISE METADATA HELPERS ==========

// Get metadata for an exercise (returns default if unknown)
export function getExerciseMetadata(exerciseName) {
    return EXERCISE_METADATA[exerciseName] || DEFAULT_EXERCISE_METADATA;
}

// Get all muscle groups
export function getMuscleGroups() {
    return MUSCLE_GROUPS;
}

// Get all equipment types
export function getEquipmentTypes() {
    return EQUIPMENT_TYPES;
}

// Filter exercises by muscle group (checks primary and secondary)
export function filterExercisesByMuscle(muscleGroup, exerciseList = DEFAULT_EXERCISES) {
    return exerciseList.filter(name => {
        const meta = getExerciseMetadata(name);
        return meta.primaryMuscles.includes(muscleGroup) ||
               meta.secondaryMuscles.includes(muscleGroup);
    });
}

// Filter exercises by primary muscle group only
export function filterExercisesByPrimaryMuscle(muscleGroup, exerciseList = DEFAULT_EXERCISES) {
    return exerciseList.filter(name => {
        const meta = getExerciseMetadata(name);
        return meta.primaryMuscles.includes(muscleGroup);
    });
}

// Filter exercises by equipment type
export function filterExercisesByEquipment(equipment, exerciseList = DEFAULT_EXERCISES) {
    return exerciseList.filter(name => {
        const meta = getExerciseMetadata(name);
        return meta.equipment === equipment;
    });
}

// Get all exercises for a specific muscle group with their metadata
export function getExercisesForMuscle(muscleGroup) {
    const exercises = filterExercisesByMuscle(muscleGroup);
    return exercises.map(name => ({
        name,
        ...getExerciseMetadata(name)
    }));
}
