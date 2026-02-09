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
        workoutTemplates: [...DEFAULT_WORKOUT_TEMPLATES],
        activeProgram: DEFAULT_ACTIVE_PROGRAM,
        bodyTracking: {
            weight: [],        // [{date: "2026-02-06", value: 85.5, unit: "kg"}]
            measurements: [],  // [{date: "2026-02-06", bicep: 38, chest: 105, waist: 82, thigh: 60, unit: "cm"}]
            bodyFat: []        // [{date: "2026-02-06", value: 15.2}]
        },
        userProfile: {
            goals: [],           // ['strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness']
            experience: null,    // 'beginner' | 'intermediate' | 'advanced'
            trainingDays: 3,     // target days per week (1-7)
            equipment: [],       // ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell']
            onboardingComplete: false,
            createdAt: null      // ISO date string when profile was created
        },
        achievements: {
            earned: []           // [{id: 'workout_10', earnedAt: '2026-02-09', seen: false}]
        }
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
            // Ensure activeProgram exists (defaults to null if missing)
            if (data.activeProgram === undefined) {
                data.activeProgram = null;
            }
            // Ensure bodyTracking exists (migration for pre-Phase 4 data)
            if (!data.bodyTracking) {
                data.bodyTracking = { weight: [], measurements: [], bodyFat: [] };
            }
            // Ensure userProfile exists (migration for pre-Phase 6 data)
            if (!data.userProfile) {
                data.userProfile = {
                    goals: [],
                    experience: null,
                    trainingDays: 3,
                    equipment: [],
                    onboardingComplete: false,
                    createdAt: null
                };
            }
            // Ensure achievements exists (migration for pre-Phase 6-02 data)
            if (!data.achievements) {
                data.achievements = { earned: [] };
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
        const userProfile = getUserProfile(data);
        return {
            thisWeek: 0,
            thisMonth: 0,
            avgPerWeek: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyStreak: 0,
            weeklyTarget: userProfile.trainingDays
        };
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

    // Calculate streaks (daily for backward compatibility)
    const { currentStreak, longestStreak } = calculateStreaks(data.workouts);

    // Calculate weekly streak (rest-day-aware)
    const userProfile = getUserProfile(data);
    const weeklyTarget = userProfile.trainingDays || 3;
    const weeklyStreak = calculateWeeklyStreak(data.workouts, weeklyTarget);

    return {
        thisWeek,
        thisMonth,
        avgPerWeek,
        currentStreak,
        longestStreak,
        weeklyStreak,
        weeklyTarget
    };
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

// Calculate weekly streak (rest-day-aware)
// A streak is maintained if user trains at least 'weeklyTarget' times per week
function calculateWeeklyStreak(workouts, weeklyTarget) {
    if (workouts.length === 0) return 0;

    const today = new Date();
    const dates = workouts.map(w => w.date).sort();
    const uniqueDates = [...new Set(dates)];

    // Group workouts by week (ISO week starting Monday)
    const getWeekKey = (dateStr) => {
        const date = new Date(dateStr);
        // Adjust to Monday-based week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString().split('T')[0];
    };

    // Count workouts per week
    const weekCounts = new Map();
    for (const date of uniqueDates) {
        const weekKey = getWeekKey(date);
        weekCounts.set(weekKey, (weekCounts.get(weekKey) || 0) + 1);
    }

    // Get current week key
    const currentWeekKey = getWeekKey(today.toISOString().split('T')[0]);

    // Sort week keys in reverse (newest first)
    const sortedWeeks = Array.from(weekCounts.keys()).sort().reverse();

    // Check if current week or last week is active
    let streak = 0;
    for (const weekKey of sortedWeeks) {
        const count = weekCounts.get(weekKey);
        if (count >= weeklyTarget) {
            streak++;
        } else {
            // If this is the current week and we haven't broken yet, allow partial progress
            if (weekKey === currentWeekKey && streak === 0) {
                // Current week in progress - don't break streak yet
                continue;
            }
            // Otherwise, streak is broken
            break;
        }
    }

    return streak;
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

// ========== TRAINING PROGRAM TEMPLATES ==========

// Program templates for multi-week structured training
const PROGRAM_TEMPLATES = [
    {
        id: 'ppl',
        name: 'Push Pull Legs',
        description: 'Classic 6-day hypertrophy split targeting each muscle group twice per week',
        daysPerWeek: 6,
        schedule: [
            { day: 1, workout: 'push-day', label: 'Push' },
            { day: 2, workout: 'pull-day', label: 'Pull' },
            { day: 3, workout: 'leg-day', label: 'Legs' },
            { day: 4, workout: 'push-day', label: 'Push' },
            { day: 5, workout: 'pull-day', label: 'Pull' },
            { day: 6, workout: 'leg-day', label: 'Legs' }
        ],
        workouts: {
            'push-day': {
                name: 'Push',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8 },
                    { name: 'Overhead Press', sets: 3, reps: 10 },
                    { name: 'Incline Bench Press', sets: 3, reps: 10 },
                    { name: 'Lateral Raises', sets: 3, reps: 15 },
                    { name: 'Tricep Pushdown', sets: 3, reps: 12 }
                ]
            },
            'pull-day': {
                name: 'Pull',
                exercises: [
                    { name: 'Deadlift', sets: 4, reps: 5 },
                    { name: 'Barbell Row', sets: 4, reps: 8 },
                    { name: 'Lat Pulldown', sets: 3, reps: 10 },
                    { name: 'Face Pulls', sets: 3, reps: 15 },
                    { name: 'Bicep Curls', sets: 3, reps: 12 }
                ]
            },
            'leg-day': {
                name: 'Legs',
                exercises: [
                    { name: 'Squat', sets: 4, reps: 6 },
                    { name: 'Romanian Deadlift', sets: 3, reps: 10 },
                    { name: 'Leg Press', sets: 3, reps: 12 },
                    { name: 'Leg Curl', sets: 3, reps: 12 },
                    { name: 'Calf Raises', sets: 4, reps: 15 }
                ]
            }
        },
        tips: 'Rest on day 7, then repeat cycle. Great for intermediate to advanced lifters.'
    },
    {
        id: '5x5',
        name: 'StrongLifts 5x5',
        description: 'Simple A/B alternating program focused on progressive overload with compound lifts',
        daysPerWeek: 3,
        schedule: [
            { day: 1, workout: 'workout-a', label: 'Workout A' },
            { day: 2, workout: 'workout-b', label: 'Workout B' },
            { day: 3, workout: 'workout-a', label: 'Workout A' }
        ],
        workouts: {
            'workout-a': {
                name: 'Workout A',
                exercises: [
                    { name: 'Squat', sets: 5, reps: 5 },
                    { name: 'Bench Press', sets: 5, reps: 5 },
                    { name: 'Barbell Row', sets: 5, reps: 5 }
                ]
            },
            'workout-b': {
                name: 'Workout B',
                exercises: [
                    { name: 'Squat', sets: 5, reps: 5 },
                    { name: 'Overhead Press', sets: 5, reps: 5 },
                    { name: 'Deadlift', sets: 1, reps: 5 }
                ]
            }
        },
        tips: 'Train 3x/week with rest days between. Add 2.5kg each workout. Best for beginners.'
    },
    {
        id: 'upper-lower',
        name: 'Upper/Lower Split',
        description: '4-day split alternating upper and lower body for balanced development',
        daysPerWeek: 4,
        schedule: [
            { day: 1, workout: 'upper-day', label: 'Upper' },
            { day: 2, workout: 'lower-day', label: 'Lower' },
            { day: 3, workout: 'upper-day', label: 'Upper' },
            { day: 4, workout: 'lower-day', label: 'Lower' }
        ],
        workouts: {
            'upper-day': {
                name: 'Upper Body',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8 },
                    { name: 'Barbell Row', sets: 4, reps: 8 },
                    { name: 'Overhead Press', sets: 3, reps: 10 },
                    { name: 'Lat Pulldown', sets: 3, reps: 10 },
                    { name: 'Bicep Curls', sets: 2, reps: 12 },
                    { name: 'Tricep Extensions', sets: 2, reps: 12 }
                ]
            },
            'lower-day': {
                name: 'Lower Body',
                exercises: [
                    { name: 'Squat', sets: 4, reps: 6 },
                    { name: 'Romanian Deadlift', sets: 3, reps: 10 },
                    { name: 'Leg Press', sets: 3, reps: 12 },
                    { name: 'Leg Curl', sets: 3, reps: 12 },
                    { name: 'Calf Raises', sets: 4, reps: 15 }
                ]
            }
        },
        tips: 'Rest 1-2 days between sessions. Versatile for all levels.'
    },
    {
        id: 'bro-split',
        name: 'Bro Split',
        description: '5-day bodybuilding split with one muscle group per day',
        daysPerWeek: 5,
        schedule: [
            { day: 1, workout: 'chest-day', label: 'Chest' },
            { day: 2, workout: 'back-day', label: 'Back' },
            { day: 3, workout: 'shoulders-day', label: 'Shoulders' },
            { day: 4, workout: 'arms-day', label: 'Arms' },
            { day: 5, workout: 'legs-day', label: 'Legs' }
        ],
        workouts: {
            'chest-day': {
                name: 'Chest',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8 },
                    { name: 'Incline Bench Press', sets: 4, reps: 10 },
                    { name: 'Dumbbell Bench Press', sets: 3, reps: 12 }
                ]
            },
            'back-day': {
                name: 'Back',
                exercises: [
                    { name: 'Deadlift', sets: 4, reps: 5 },
                    { name: 'Barbell Row', sets: 4, reps: 8 },
                    { name: 'Lat Pulldown', sets: 3, reps: 10 },
                    { name: 'Seated Cable Row', sets: 3, reps: 10 }
                ]
            },
            'shoulders-day': {
                name: 'Shoulders',
                exercises: [
                    { name: 'Overhead Press', sets: 4, reps: 8 },
                    { name: 'Lateral Raises', sets: 4, reps: 15 },
                    { name: 'Face Pulls', sets: 3, reps: 15 }
                ]
            },
            'arms-day': {
                name: 'Arms',
                exercises: [
                    { name: 'Bicep Curls', sets: 4, reps: 10 },
                    { name: 'Hammer Curls', sets: 3, reps: 12 },
                    { name: 'Tricep Pushdown', sets: 4, reps: 10 },
                    { name: 'Skull Crushers', sets: 3, reps: 12 }
                ]
            },
            'legs-day': {
                name: 'Legs',
                exercises: [
                    { name: 'Squat', sets: 4, reps: 8 },
                    { name: 'Leg Press', sets: 4, reps: 12 },
                    { name: 'Romanian Deadlift', sets: 3, reps: 10 },
                    { name: 'Leg Extension', sets: 3, reps: 15 },
                    { name: 'Leg Curl', sets: 3, reps: 12 },
                    { name: 'Calf Raises', sets: 4, reps: 15 }
                ]
            }
        },
        tips: 'Rest weekends. High volume per muscle group for hypertrophy.'
    },
    {
        id: 'full-body-3x',
        name: 'Full Body 3x',
        description: 'Full body training 3 days per week, ideal for beginners or busy schedules',
        daysPerWeek: 3,
        schedule: [
            { day: 1, workout: 'full-body-a', label: 'Full Body A' },
            { day: 2, workout: 'full-body-b', label: 'Full Body B' },
            { day: 3, workout: 'full-body-c', label: 'Full Body C' }
        ],
        workouts: {
            'full-body-a': {
                name: 'Full Body A',
                exercises: [
                    { name: 'Squat', sets: 3, reps: 8 },
                    { name: 'Bench Press', sets: 3, reps: 8 },
                    { name: 'Barbell Row', sets: 3, reps: 8 },
                    { name: 'Overhead Press', sets: 2, reps: 10 },
                    { name: 'Bicep Curls', sets: 2, reps: 12 }
                ]
            },
            'full-body-b': {
                name: 'Full Body B',
                exercises: [
                    { name: 'Deadlift', sets: 3, reps: 5 },
                    { name: 'Incline Bench Press', sets: 3, reps: 10 },
                    { name: 'Lat Pulldown', sets: 3, reps: 10 },
                    { name: 'Lateral Raises', sets: 3, reps: 15 },
                    { name: 'Tricep Pushdown', sets: 2, reps: 12 }
                ]
            },
            'full-body-c': {
                name: 'Full Body C',
                exercises: [
                    { name: 'Front Squat', sets: 3, reps: 8 },
                    { name: 'Dumbbell Bench Press', sets: 3, reps: 10 },
                    { name: 'Seated Cable Row', sets: 3, reps: 10 },
                    { name: 'Face Pulls', sets: 3, reps: 15 },
                    { name: 'Hammer Curls', sets: 2, reps: 12 }
                ]
            }
        },
        tips: 'Train Mon/Wed/Fri or similar. Rest at least 1 day between sessions.'
    },
    {
        id: 'phul',
        name: 'PHUL',
        description: 'Power Hypertrophy Upper Lower - combines strength and size training',
        daysPerWeek: 4,
        schedule: [
            { day: 1, workout: 'upper-power', label: 'Upper Power' },
            { day: 2, workout: 'lower-power', label: 'Lower Power' },
            { day: 3, workout: 'upper-hypertrophy', label: 'Upper Hypertrophy' },
            { day: 4, workout: 'lower-hypertrophy', label: 'Lower Hypertrophy' }
        ],
        workouts: {
            'upper-power': {
                name: 'Upper Power',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 5 },
                    { name: 'Barbell Row', sets: 4, reps: 5 },
                    { name: 'Overhead Press', sets: 3, reps: 6 },
                    { name: 'Lat Pulldown', sets: 3, reps: 8 },
                    { name: 'Bicep Curls', sets: 2, reps: 8 },
                    { name: 'Skull Crushers', sets: 2, reps: 8 }
                ]
            },
            'lower-power': {
                name: 'Lower Power',
                exercises: [
                    { name: 'Squat', sets: 4, reps: 5 },
                    { name: 'Deadlift', sets: 3, reps: 5 },
                    { name: 'Leg Press', sets: 3, reps: 8 },
                    { name: 'Leg Curl', sets: 3, reps: 8 },
                    { name: 'Calf Raises', sets: 4, reps: 10 }
                ]
            },
            'upper-hypertrophy': {
                name: 'Upper Hypertrophy',
                exercises: [
                    { name: 'Incline Bench Press', sets: 4, reps: 12 },
                    { name: 'Seated Cable Row', sets: 4, reps: 12 },
                    { name: 'Lateral Raises', sets: 4, reps: 15 },
                    { name: 'Face Pulls', sets: 3, reps: 15 },
                    { name: 'Hammer Curls', sets: 3, reps: 12 },
                    { name: 'Tricep Pushdown', sets: 3, reps: 12 }
                ]
            },
            'lower-hypertrophy': {
                name: 'Lower Hypertrophy',
                exercises: [
                    { name: 'Front Squat', sets: 4, reps: 10 },
                    { name: 'Romanian Deadlift', sets: 4, reps: 10 },
                    { name: 'Leg Extension', sets: 3, reps: 15 },
                    { name: 'Leg Curl', sets: 3, reps: 15 },
                    { name: 'Calf Raises', sets: 4, reps: 15 }
                ]
            }
        },
        tips: 'Rest 1-2 days between upper/lower pairs. Combines powerlifting and bodybuilding.'
    }
];

// Default active program state (null = no active program)
const DEFAULT_ACTIVE_PROGRAM = null;

/*
 * Active program state structure:
 * {
 *   programId: 'ppl',              // ID of the program template
 *   startDate: '2026-02-01',       // When user started the program
 *   currentDay: 4,                  // Current day in the program cycle (1-indexed)
 *   completedDays: ['2026-02-01', '2026-02-02', '2026-02-03'],  // Dates workouts completed
 *   lastWorkoutDate: '2026-02-03', // Most recent workout date
 *   customizations: {}             // Exercise swaps, weight adjustments (future use)
 * }
 */

// ========== PROGRAM MANAGEMENT FUNCTIONS ==========

// Get all available program templates
export function getPrograms() {
    return PROGRAM_TEMPLATES;
}

// Get a specific program by ID
export function getProgramById(programId) {
    return PROGRAM_TEMPLATES.find(p => p.id === programId);
}

// Get current active program state from data
export function getActiveProgram(data) {
    return data.activeProgram || null;
}

// Start a program (sets startDate to today, currentDay to 1)
export function setActiveProgram(data, programId) {
    const program = getProgramById(programId);
    if (!program) {
        console.error(`Program not found: ${programId}`);
        return data;
    }

    data.activeProgram = {
        programId: programId,
        startDate: getTodayStr(),
        currentDay: 1,
        completedDays: [],
        lastWorkoutDate: null,
        customizations: {}
    };

    saveData(data);
    return data;
}

// End current program (clears active state)
export function endActiveProgram(data) {
    data.activeProgram = null;
    saveData(data);
    return data;
}

// Get today's scheduled workout based on active program
export function getTodaysProgrammedWorkout(data) {
    const activeProgram = getActiveProgram(data);
    if (!activeProgram) return null;

    const program = getProgramById(activeProgram.programId);
    if (!program) return null;

    // Calculate which day in schedule based on currentDay
    // Schedule is 1-indexed, so we use modulo to cycle
    const scheduleIndex = (activeProgram.currentDay - 1) % program.schedule.length;
    const scheduledDay = program.schedule[scheduleIndex];
    const workout = program.workouts[scheduledDay.workout];

    // Get next workout info
    const nextIndex = activeProgram.currentDay % program.schedule.length;
    const nextScheduledDay = program.schedule[nextIndex];
    const nextWorkout = program.workouts[nextScheduledDay.workout];

    return {
        dayNumber: activeProgram.currentDay,
        label: scheduledDay.label,
        workout: workout,
        workoutId: scheduledDay.workout,
        programName: program.name,
        nextWorkout: {
            label: nextScheduledDay.label,
            name: nextWorkout.name
        }
    };
}

// Increment currentDay after completing a workout
export function advanceProgramDay(data) {
    const activeProgram = getActiveProgram(data);
    if (!activeProgram) return data;

    const today = getTodayStr();

    // Don't advance if already completed today
    if (activeProgram.completedDays.includes(today)) {
        return data;
    }

    activeProgram.currentDay += 1;
    activeProgram.completedDays.push(today);
    activeProgram.lastWorkoutDate = today;

    saveData(data);
    return data;
}

// Skip today and advance (for missed days)
export function skipProgramDay(data) {
    const activeProgram = getActiveProgram(data);
    if (!activeProgram) return data;

    activeProgram.currentDay += 1;
    // Don't add to completedDays since it was skipped

    saveData(data);
    return data;
}

// Get program progress statistics
export function getProgramProgress(data) {
    const activeProgram = getActiveProgram(data);
    if (!activeProgram) {
        return {
            currentDay: 0,
            totalDays: 0,
            percentComplete: 0,
            daysCompleted: 0,
            isActive: false
        };
    }

    const program = getProgramById(activeProgram.programId);
    if (!program) {
        return {
            currentDay: 0,
            totalDays: 0,
            percentComplete: 0,
            daysCompleted: 0,
            isActive: false
        };
    }

    // Calculate completion based on cycle
    const totalDaysInCycle = program.schedule.length;
    const cyclePosition = ((activeProgram.currentDay - 1) % totalDaysInCycle) + 1;
    const cycleNumber = Math.floor((activeProgram.currentDay - 1) / totalDaysInCycle) + 1;
    const percentComplete = Math.round((cyclePosition / totalDaysInCycle) * 100);

    return {
        currentDay: activeProgram.currentDay,
        totalDays: totalDaysInCycle,
        percentComplete: percentComplete,
        daysCompleted: activeProgram.completedDays.length,
        cycleNumber: cycleNumber,
        cyclePosition: cyclePosition,
        isActive: true,
        programName: program.name,
        startDate: activeProgram.startDate
    };
}

// ========== PROGRESSIVE OVERLOAD & COACHING HELPERS ==========

// Get progressive overload suggestion for an exercise based on history
export function getProgressiveOverloadSuggestion(data, exerciseName) {
    const history = getExerciseHistory(data, exerciseName);

    if (history.length === 0) {
        return {
            suggestedWeight: null,
            reason: 'No workout history for this exercise',
            lastWeight: null,
            trend: 'unknown'
        };
    }

    // Look at last 3 workouts for this exercise
    const recentWorkouts = history.slice(-3);
    const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
    const lastWeight = lastWorkout.maxWeight;

    // Check if user completed all sets successfully in last workout
    // "Success" = completed sets with target reps (no failed reps)
    const lastSets = lastWorkout.sets;
    const completedSetsSuccessfully = lastSets.every(s =>
        s.completed !== false && s.reps >= (s.targetReps || s.reps)
    );

    // Analyze trend across recent workouts
    let trend = 'maintain';
    if (recentWorkouts.length >= 2) {
        const weights = recentWorkouts.map(w => w.maxWeight);
        const firstWeight = weights[0];
        const latestWeight = weights[weights.length - 1];

        if (latestWeight > firstWeight) {
            trend = 'increase';
        } else if (latestWeight < firstWeight) {
            trend = 'decrease';
        }
    }

    // Check consistency - did user hit all reps in last 2+ workouts?
    const consistentSuccess = recentWorkouts.length >= 2 &&
        recentWorkouts.slice(-2).every(w =>
            w.sets.every(s => s.completed !== false)
        );

    let suggestedWeight = lastWeight;
    let reason = '';

    if (consistentSuccess && completedSetsSuccessfully) {
        // Progressive overload: increase by 2.5kg
        suggestedWeight = lastWeight + 2.5;
        reason = 'You completed all sets successfully in your last workouts. Time to increase!';
        trend = 'increase';
    } else if (!completedSetsSuccessfully) {
        // Stay at same weight
        reason = 'Some sets were challenging last time. Stay at this weight to build strength.';
        trend = 'maintain';
    } else {
        // Need more data
        reason = 'Building consistency at this weight. Keep it up!';
        trend = 'maintain';
    }

    return {
        suggestedWeight: Math.round(suggestedWeight * 2) / 2, // Round to nearest 0.5kg
        reason: reason,
        lastWeight: lastWeight,
        trend: trend,
        recentWorkouts: recentWorkouts.length
    };
}

// Check if a set represents a new personal record
// Returns array of PR types achieved: ['weight', 'e1rm']
export function checkForPR(data, exerciseName, newSet, todayDate) {
    const prTypes = [];

    // Validate set has weight and reps
    if (!newSet.weight || newSet.weight <= 0 || !newSet.reps || newSet.reps <= 0) {
        return prTypes;
    }

    // Get PRs EXCLUDING today's workout (so we compare against historical data only)
    const historicalPRs = getHistoricalPRs(data, exerciseName, todayDate);

    // Calculate new set's estimated 1RM
    const newE1RM = calculateEstimated1RM(newSet.weight, newSet.reps);

    // Check weight PR (heaviest ever for this exercise, excluding today)
    if (historicalPRs.maxWeight === 0 || newSet.weight > historicalPRs.maxWeight) {
        prTypes.push('weight');
    }

    // Check e1RM PR (highest estimated 1RM, excluding today)
    if (historicalPRs.maxE1RM === 0 || newE1RM > historicalPRs.maxE1RM) {
        prTypes.push('e1rm');
    }

    return prTypes;
}

// Get historical PRs for an exercise, excluding a specific date (usually today)
function getHistoricalPRs(data, exerciseName, excludeDate) {
    let maxWeight = 0;
    let maxE1RM = 0;

    for (const workout of data.workouts) {
        // Skip the excluded date (today's workout)
        if (workout.date === excludeDate) continue;

        for (const exercise of workout.exercises) {
            if (exercise.name !== exerciseName) continue;

            for (const set of exercise.sets) {
                // Only count completed sets for historical PRs
                if (set.completed === false) continue;
                if (!set.weight || !set.reps) continue;

                if (set.weight > maxWeight) {
                    maxWeight = set.weight;
                }

                const e1rm = calculateEstimated1RM(set.weight, set.reps);
                if (e1rm > maxE1RM) {
                    maxE1RM = e1rm;
                }
            }
        }
    }

    return { maxWeight, maxE1RM };
}

// Get muscle groups not trained recently
export function getMissedMuscleGroups(data, daysBack = 7) {
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - daysBack);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Track when each muscle group was last trained
    const muscleLastTrained = {};

    // Initialize all muscle groups
    for (const muscleId of Object.keys(MUSCLE_GROUPS)) {
        muscleLastTrained[muscleId] = null;
    }

    // Scan workout history
    for (const workout of data.workouts) {
        const workoutDate = workout.date;

        for (const exercise of workout.exercises) {
            const metadata = getExerciseMetadata(exercise.name);

            // Mark primary muscles as trained
            for (const muscle of metadata.primaryMuscles) {
                if (!muscleLastTrained[muscle] || workoutDate > muscleLastTrained[muscle]) {
                    muscleLastTrained[muscle] = workoutDate;
                }
            }
        }
    }

    // Find muscle groups not trained recently
    const missed = [];
    for (const [muscleId, lastDate] of Object.entries(muscleLastTrained)) {
        if (!lastDate || lastDate < cutoffStr) {
            const muscle = MUSCLE_GROUPS[muscleId];
            if (!muscle) continue;

            const daysSinceTrained = lastDate
                ? Math.floor((today - new Date(lastDate)) / (1000 * 60 * 60 * 24))
                : null;

            // Generate suggestion based on muscle group
            let suggestion = `Consider adding ${muscle.displayName.toLowerCase()} exercises`;
            const muscleExercises = filterExercisesByPrimaryMuscle(muscleId);
            if (muscleExercises.length > 0) {
                suggestion = `Try: ${muscleExercises.slice(0, 2).join(', ')}`;
            }

            missed.push({
                muscleGroup: muscleId,
                displayName: muscle.displayName,
                daysSinceTrained: daysSinceTrained,
                lastTrainedDate: lastDate,
                suggestion: suggestion
            });
        }
    }

    // Sort by days since trained (null/never first, then longest)
    missed.sort((a, b) => {
        if (a.daysSinceTrained === null && b.daysSinceTrained === null) return 0;
        if (a.daysSinceTrained === null) return -1;
        if (b.daysSinceTrained === null) return 1;
        return b.daysSinceTrained - a.daysSinceTrained;
    });

    return missed;
}

// Calculate program adherence - how well user is following program
export function getProgramAdherence(data) {
    const activeProgram = getActiveProgram(data);

    if (!activeProgram) {
        return {
            adherencePercent: 0,
            missedDays: 0,
            extraWorkouts: 0,
            streak: 0,
            isActive: false
        };
    }

    const program = getProgramById(activeProgram.programId);
    if (!program) {
        return {
            adherencePercent: 0,
            missedDays: 0,
            extraWorkouts: 0,
            streak: 0,
            isActive: false
        };
    }

    const startDate = new Date(activeProgram.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate expected workouts based on days per week
    const weeksActive = Math.max(1, daysSinceStart / 7);
    const expectedWorkouts = Math.floor(weeksActive * program.daysPerWeek);

    // Actual completed workouts
    const completedWorkouts = activeProgram.completedDays.length;

    // Calculate adherence percentage
    const adherencePercent = expectedWorkouts > 0
        ? Math.min(100, Math.round((completedWorkouts / expectedWorkouts) * 100))
        : 100;

    // Calculate missed days (expected - actual, clamped to 0)
    const missedDays = Math.max(0, expectedWorkouts - completedWorkouts);

    // Extra workouts (if user did more than expected)
    const extraWorkouts = Math.max(0, completedWorkouts - expectedWorkouts);

    // Calculate current streak
    let streak = 0;
    if (activeProgram.completedDays.length > 0) {
        const sortedDays = [...activeProgram.completedDays].sort().reverse();
        const todayStr = getTodayStr();
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(today.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        // Check if user worked out today or yesterday (streak is active)
        if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
            streak = 1;
            for (let i = 1; i < sortedDays.length; i++) {
                const current = new Date(sortedDays[i - 1]);
                const prev = new Date(sortedDays[i]);
                const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24));

                if (diffDays <= 2) { // Allow 1 rest day between workouts
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    return {
        adherencePercent: adherencePercent,
        missedDays: missedDays,
        extraWorkouts: extraWorkouts,
        streak: streak,
        isActive: true,
        completedWorkouts: completedWorkouts,
        expectedWorkouts: expectedWorkouts,
        daysSinceStart: daysSinceStart
    };
}

// ========== BODY TRACKING HELPERS ==========

// Add or update a weight entry for a given date
export function addWeightEntry(data, date, value, unit) {
    if (!data.bodyTracking) {
        data.bodyTracking = { weight: [], measurements: [], bodyFat: [] };
    }
    const existing = data.bodyTracking.weight.findIndex(e => e.date === date);
    if (existing >= 0) {
        data.bodyTracking.weight[existing].value = value;
        data.bodyTracking.weight[existing].unit = unit;
    } else {
        data.bodyTracking.weight.push({ date, value, unit });
    }
    // Sort descending by date (newest first)
    data.bodyTracking.weight.sort((a, b) => b.date.localeCompare(a.date));
    return data;
}

// Get weight history sorted ascending by date (for charts). Optional limit.
export function getWeightHistory(data, limit) {
    if (!data.bodyTracking || !data.bodyTracking.weight) return [];
    const sorted = [...data.bodyTracking.weight].sort((a, b) => a.date.localeCompare(b.date));
    if (limit && limit > 0) {
        return sorted.slice(-limit);
    }
    return sorted;
}

// Get the most recent weight entry or null
export function getLatestWeight(data) {
    if (!data.bodyTracking || !data.bodyTracking.weight || data.bodyTracking.weight.length === 0) return null;
    // Weight is stored descending, so first element is most recent
    return data.bodyTracking.weight[0];
}

// Add or update a measurement entry for a given date
export function addMeasurementEntry(data, date, measurements, unit) {
    if (!data.bodyTracking) {
        data.bodyTracking = { weight: [], measurements: [], bodyFat: [] };
    }
    const entry = {
        date,
        bicep: measurements.bicep != null ? measurements.bicep : null,
        chest: measurements.chest != null ? measurements.chest : null,
        waist: measurements.waist != null ? measurements.waist : null,
        thigh: measurements.thigh != null ? measurements.thigh : null,
        unit
    };
    const existing = data.bodyTracking.measurements.findIndex(e => e.date === date);
    if (existing >= 0) {
        data.bodyTracking.measurements[existing] = entry;
    } else {
        data.bodyTracking.measurements.push(entry);
    }
    data.bodyTracking.measurements.sort((a, b) => b.date.localeCompare(a.date));
    return data;
}

// Get measurement history for a specific type (e.g. 'bicep'), filtered to non-null, sorted ascending
export function getMeasurementHistory(data, type) {
    if (!data.bodyTracking || !data.bodyTracking.measurements) return [];
    return data.bodyTracking.measurements
        .filter(e => e[type] != null)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(e => ({ date: e.date, value: e[type], unit: e.unit }));
}

// Add or update a body fat entry for a given date
export function addBodyFatEntry(data, date, value) {
    if (!data.bodyTracking) {
        data.bodyTracking = { weight: [], measurements: [], bodyFat: [] };
    }
    const existing = data.bodyTracking.bodyFat.findIndex(e => e.date === date);
    if (existing >= 0) {
        data.bodyTracking.bodyFat[existing].value = value;
    } else {
        data.bodyTracking.bodyFat.push({ date, value });
    }
    data.bodyTracking.bodyFat.sort((a, b) => b.date.localeCompare(a.date));
    return data;
}

// Get body fat history sorted ascending by date
export function getBodyFatHistory(data) {
    if (!data.bodyTracking || !data.bodyTracking.bodyFat) return [];
    return [...data.bodyTracking.bodyFat].sort((a, b) => a.date.localeCompare(b.date));
}

// ========== ACHIEVEMENTS & BADGES ==========

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
    {
        id: 'workout_10',
        name: 'Getting Started',
        desc: '10 workouts completed',
        icon: '💪',
        check: (data) => data.workouts.length >= 10
    },
    {
        id: 'workout_50',
        name: 'Committed',
        desc: '50 workouts completed',
        icon: '🔥',
        check: (data) => data.workouts.length >= 50
    },
    {
        id: 'workout_100',
        name: 'Century',
        desc: '100 workouts completed',
        icon: '🏆',
        check: (data) => data.workouts.length >= 100
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        desc: '7-day streak',
        icon: '⚡',
        check: (data) => {
            const freq = getFrequencyStats(data);
            return freq.currentStreak >= 7;
        }
    },
    {
        id: 'streak_30',
        name: 'Iron Will',
        desc: '30-day streak',
        icon: '🌟',
        check: (data) => {
            const freq = getFrequencyStats(data);
            return freq.currentStreak >= 30;
        }
    },
    {
        id: 'streak_weeks_4',
        name: 'Monthly Consistency',
        desc: '4-week streak hitting target',
        icon: '📅',
        check: (data) => {
            const freq = getFrequencyStats(data);
            return freq.weeklyStreak >= 4;
        }
    },
    {
        id: 'pr_first',
        name: 'New Record',
        desc: 'First personal record',
        icon: '🎯',
        check: (data) => {
            const prs = getPersonalRecords(data);
            return Object.keys(prs).length > 0;
        }
    },
    {
        id: 'pr_10',
        name: 'Record Breaker',
        desc: '10 personal records',
        icon: '🏅',
        check: (data) => {
            // Count total PRs across all exercises
            let totalPRs = 0;
            for (const workout of data.workouts) {
                for (const exercise of workout.exercises) {
                    for (const set of exercise.sets) {
                        const prTypes = checkForPR(data, exercise.name, set, workout.date);
                        totalPRs += prTypes.length;
                    }
                }
            }
            return totalPRs >= 10;
        }
    },
    {
        id: 'exercises_10',
        name: 'Explorer',
        desc: '10 unique exercises used',
        icon: '🧭',
        check: (data) => {
            const exercises = new Set();
            for (const workout of data.workouts) {
                for (const exercise of workout.exercises) {
                    exercises.add(exercise.name);
                }
            }
            return exercises.size >= 10;
        }
    },
    {
        id: 'volume_10k',
        name: 'Heavy Lifter',
        desc: '10,000 kg total volume',
        icon: '🪨',
        check: (data) => {
            const stats = getOverallStats(data);
            return stats.totalVolume >= 10000;
        }
    },
    {
        id: 'volume_100k',
        name: 'Monster',
        desc: '100,000 kg total volume',
        icon: '👹',
        check: (data) => {
            const stats = getOverallStats(data);
            return stats.totalVolume >= 100000;
        }
    }
];

// Check for newly earned achievements (not already in earned list)
export function checkNewAchievements(data) {
    if (!data.achievements) {
        data.achievements = { earned: [] };
    }

    const earnedIds = new Set(data.achievements.earned.map(a => a.id));
    const newAchievements = [];

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
        // Skip if already earned
        if (earnedIds.has(definition.id)) continue;

        // Check if condition is met
        if (definition.check(data)) {
            const achievement = {
                id: definition.id,
                earnedAt: getTodayStr(),
                seen: false
            };
            data.achievements.earned.push(achievement);
            newAchievements.push({
                ...achievement,
                ...definition
            });
        }
    }

    if (newAchievements.length > 0) {
        saveData(data);
    }

    return newAchievements;
}

// Mark achievement as seen
export function markAchievementSeen(data, achievementId) {
    if (!data.achievements) return data;

    const achievement = data.achievements.earned.find(a => a.id === achievementId);
    if (achievement) {
        achievement.seen = true;
        saveData(data);
    }

    return data;
}

// Get earned achievements with definition details
export function getEarnedAchievements(data) {
    if (!data.achievements) {
        return [];
    }

    return data.achievements.earned.map(earned => {
        const definition = ACHIEVEMENT_DEFINITIONS.find(d => d.id === earned.id);
        return {
            ...earned,
            ...definition
        };
    });
}

// Get all achievements (earned and unearned)
export function getAllAchievements(data) {
    const earnedIds = new Set(data.achievements?.earned.map(a => a.id) || []);

    return ACHIEVEMENT_DEFINITIONS.map(definition => {
        const earned = data.achievements?.earned.find(a => a.id === definition.id);
        return {
            ...definition,
            earned: earnedIds.has(definition.id),
            earnedAt: earned?.earnedAt || null,
            seen: earned?.seen || false
        };
    });
}

// ========== USER PROFILE HELPERS ==========

// Get user profile or default
export function getUserProfile(data) {
    if (!data.userProfile) {
        return {
            goals: [],
            experience: null,
            trainingDays: 3,
            equipment: [],
            onboardingComplete: false,
            createdAt: null
        };
    }
    return data.userProfile;
}

// Save user profile (validates and updates)
export function saveUserProfile(data, profile) {
    // Validate goals array
    const validGoals = ['strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness'];
    const goals = Array.isArray(profile.goals)
        ? profile.goals.filter(g => validGoals.includes(g))
        : [];

    // Validate experience
    const validExperience = ['beginner', 'intermediate', 'advanced'];
    const experience = validExperience.includes(profile.experience) ? profile.experience : null;

    // Validate training days (1-7)
    const trainingDays = Math.max(1, Math.min(7, parseInt(profile.trainingDays) || 3));

    // Validate equipment array
    const validEquipment = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell'];
    const equipment = Array.isArray(profile.equipment)
        ? profile.equipment.filter(e => validEquipment.includes(e))
        : [];

    // Create timestamp if first time completing onboarding
    const createdAt = data.userProfile?.createdAt || new Date().toISOString();

    data.userProfile = {
        goals,
        experience,
        trainingDays,
        equipment,
        onboardingComplete: profile.onboardingComplete === true,
        createdAt
    };

    saveData(data);
    return data;
}

// Check if user completed onboarding
export function isOnboardingComplete(data) {
    const profile = getUserProfile(data);
    return profile.onboardingComplete === true;
}
