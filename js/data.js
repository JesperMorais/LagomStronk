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

const STORAGE_KEY = 'lagomstronk_data';

// Initialize data structure
function getDefaultData() {
    return {
        workouts: [],
        exerciseLibrary: [...DEFAULT_EXERCISES]
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
