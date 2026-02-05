import { storageGet, storageSet, STORAGE_KEY } from './core/storage.js';
import { EXERCISES, MUSCLE_GROUPS, getExerciseMetadata } from './data/exercises.js';

// Default exercise library - derived from EXERCISES database
const DEFAULT_EXERCISES = Object.keys(EXERCISES).filter(name => EXERCISES[name].isDefault);

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

// Initialize data structure
function getDefaultData() {
    return {
        workouts: [],
        exerciseLibrary: [...DEFAULT_EXERCISES],
        workoutTemplates: [...DEFAULT_WORKOUT_TEMPLATES],
        favorites: [],
        customExercises: {}
    };
}

// Load data from storage
export async function loadData() {
    try {
        const data = await storageGet(STORAGE_KEY);
        if (data) {
            // Ensure required fields exist (backward compatibility)
            if (!data.exerciseLibrary) {
                data.exerciseLibrary = [...DEFAULT_EXERCISES];
            }
            if (!data.workouts) {
                data.workouts = [];
            }
            if (!data.workoutTemplates) {
                data.workoutTemplates = [...DEFAULT_WORKOUT_TEMPLATES];
            }
            if (!data.favorites) {
                data.favorites = [];
            }
            if (!data.customExercises) {
                data.customExercises = {};
            }
            return data;
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return getDefaultData();
}

// Save data to storage
export async function saveData(data) {
    try {
        await storageSet(STORAGE_KEY, data);
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
export async function saveWorkout(data, dateStr, exercises) {
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

    await saveData(data);
    return data;
}

// Add exercise to a workout
export async function addExerciseToWorkout(data, dateStr, exercise) {
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
    await saveData(data);
    return data;
}

// Remove exercise from workout
export async function removeExerciseFromWorkout(data, dateStr, exerciseIndex) {
    const workout = getWorkoutByDate(data, dateStr);

    if (workout && workout.exercises[exerciseIndex]) {
        workout.exercises.splice(exerciseIndex, 1);

        // Remove workout if no exercises left
        if (workout.exercises.length === 0) {
            const workoutIndex = data.workouts.findIndex(w => w.date === dateStr);
            data.workouts.splice(workoutIndex, 1);
        }

        await saveData(data);
    }

    return data;
}

// Add custom exercise to library
export async function addCustomExercise(data, exerciseName, metadata = {}) {
    const trimmed = exerciseName.trim();
    if (trimmed && !data.exerciseLibrary.includes(trimmed)) {
        data.exerciseLibrary.push(trimmed);
        data.exerciseLibrary.sort();
        // Store custom exercise metadata
        if (!data.customExercises) data.customExercises = {};
        data.customExercises[trimmed] = {
            primaryMuscles: metadata.primaryMuscles || ['Other'],
            secondaryMuscles: metadata.secondaryMuscles || [],
            equipment: metadata.equipment || 'Other',
            isCustom: true
        };
        await saveData(data);
    }
    return data;
}

// Remove exercise from library
export async function removeExerciseFromLibrary(data, exerciseName) {
    const index = data.exerciseLibrary.indexOf(exerciseName);
    if (index >= 0) {
        data.exerciseLibrary.splice(index, 1);
        await saveData(data);
    }
    return data;
}

// Toggle favorite status for an exercise
export async function toggleFavoriteExercise(data, exerciseName) {
    if (!data.favorites) data.favorites = [];
    const index = data.favorites.indexOf(exerciseName);
    if (index >= 0) {
        data.favorites.splice(index, 1);
    } else {
        data.favorites.push(exerciseName);
    }
    await saveData(data);
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
export async function addWorkoutTemplate(data, template) {
    const newTemplate = {
        id: generateId(),
        name: template.name.trim(),
        isDefault: false,
        exercises: template.exercises
    };
    data.workoutTemplates.push(newTemplate);
    await saveData(data);
    return data;
}

// Update a workout template
export async function updateWorkoutTemplate(data, templateId, updates) {
    const index = data.workoutTemplates.findIndex(t => t.id === templateId);
    if (index >= 0) {
        data.workoutTemplates[index] = {
            ...data.workoutTemplates[index],
            ...updates
        };
        await saveData(data);
    }
    return data;
}

// Delete a workout template
export async function deleteWorkoutTemplate(data, templateId) {
    const index = data.workoutTemplates.findIndex(t => t.id === templateId);
    if (index >= 0) {
        data.workoutTemplates.splice(index, 1);
        await saveData(data);
    }
    return data;
}

// Apply workout template to today's workout
export async function applyWorkoutTemplate(data, dateStr, templateId, defaultWeight = 20) {
    const template = getWorkoutTemplateById(data, templateId);
    if (!template) return data;

    // Convert template exercises to workout exercises with actual sets
    const exercises = template.exercises.map(templateEx => ({
        name: templateEx.name,
        sets: Array(templateEx.sets).fill(null).map(() => ({
            reps: templateEx.reps,
            weight: defaultWeight
        }))
    }));

    // Add each exercise to the workout
    for (const exercise of exercises) {
        data = await addExerciseToWorkout(data, dateStr, exercise);
    }

    return data;
}

// Save current workout as a template
export async function saveWorkoutAsTemplate(data, dateStr, templateName) {
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
    await saveData(data);
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
    const stats = {};
    // Initialize all primary muscle groups from MUSCLE_GROUPS
    for (const group of Object.keys(MUSCLE_GROUPS)) {
        stats[group] = { sets: 0, volume: 0 };
    }
    stats['Other'] = { sets: 0, volume: 0 };

    for (const workout of data.workouts) {
        for (const exercise of workout.exercises) {
            // Get metadata from EXERCISES or customExercises
            const metadata = EXERCISES[exercise.name] ||
                           data.customExercises?.[exercise.name] ||
                           { primaryMuscles: ['Other'] };

            const primaryGroup = metadata.primaryMuscles[0] || 'Other';
            const targetGroup = stats[primaryGroup] ? primaryGroup : 'Other';

            stats[targetGroup].sets += exercise.sets.length;
            stats[targetGroup].volume += exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
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
