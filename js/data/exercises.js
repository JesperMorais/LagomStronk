// ========== MUSCLE GROUP CONSTANTS ==========

export const MUSCLE_GROUPS = {
  'Chest': ['Upper Chest', 'Middle Chest', 'Lower Chest'],
  'Back': ['Lats', 'Upper Back', 'Lower Back', 'Rhomboids'],
  'Shoulders': ['Front Delts', 'Side Delts', 'Rear Delts'],
  'Legs': ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors'],
  'Arms': ['Biceps (Long Head)', 'Biceps (Short Head)', 'Triceps (Long Head)', 'Triceps (Lateral Head)', 'Triceps (Medial Head)', 'Forearms'],
  'Core': ['Abs', 'Obliques', 'Lower Back'],
  'Other': ['Neck', 'Traps']
};

// ========== EQUIPMENT TYPE CONSTANTS ==========

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'EZ Bar',
  'Machine',
  'Cable',
  'Smith Machine',
  'Kettlebell',
  'Resistance Band',
  'Bodyweight',
  'Other'
];

// ========== EXERCISE DATABASE ==========

export const EXERCISES = {
  'Bench Press': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Incline Bench Press': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Dumbbell Bench Press': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Dumbbell',
    isDefault: true
  },
  'Squat': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: ['Core'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Front Squat': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: ['Core'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Deadlift': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Legs', 'Core'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Romanian Deadlift': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: ['Back', 'Core'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Overhead Press': {
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Barbell Row': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    equipment: 'Barbell',
    isDefault: true
  },
  'Pull-ups': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    equipment: 'Bodyweight',
    isDefault: true
  },
  'Chin-ups': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    equipment: 'Bodyweight',
    isDefault: true
  },
  'Lat Pulldown': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    equipment: 'Cable',
    isDefault: true
  },
  'Seated Cable Row': {
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    equipment: 'Cable',
    isDefault: true
  },
  'Leg Press': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: [],
    equipment: 'Machine',
    isDefault: true
  },
  'Leg Extension': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: [],
    equipment: 'Machine',
    isDefault: true
  },
  'Leg Curl': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: [],
    equipment: 'Machine',
    isDefault: true
  },
  'Lunges': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: ['Core'],
    equipment: 'Bodyweight',
    isDefault: true
  },
  'Bulgarian Split Squat': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: ['Core'],
    equipment: 'Bodyweight',
    isDefault: true
  },
  'Bicep Curls': {
    primaryMuscles: ['Arms'],
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isDefault: true
  },
  'Hammer Curls': {
    primaryMuscles: ['Arms'],
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isDefault: true
  },
  'Tricep Extensions': {
    primaryMuscles: ['Arms'],
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isDefault: true
  },
  'Tricep Pushdown': {
    primaryMuscles: ['Arms'],
    secondaryMuscles: [],
    equipment: 'Cable',
    isDefault: true
  },
  'Skull Crushers': {
    primaryMuscles: ['Arms'],
    secondaryMuscles: [],
    equipment: 'Barbell',
    isDefault: true
  },
  'Lateral Raises': {
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    isDefault: true
  },
  'Face Pulls': {
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Back'],
    equipment: 'Cable',
    isDefault: true
  },
  'Calf Raises': {
    primaryMuscles: ['Legs'],
    secondaryMuscles: [],
    equipment: 'Machine',
    isDefault: true
  },
  'Plank': {
    primaryMuscles: ['Core'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    isDefault: true
  },
  'Ab Wheel Rollout': {
    primaryMuscles: ['Core'],
    secondaryMuscles: [],
    equipment: 'Other',
    isDefault: true
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Get metadata for an exercise by name
 * @param {string} name - Exercise name
 * @param {Object} customExercises - Custom exercises object from data
 * @returns {Object} Exercise metadata or default for unknown exercises
 */
export function getExerciseMetadata(name, customExercises = {}) {
  return EXERCISES[name] || customExercises[name] || {
    primaryMuscles: ['Other'],
    secondaryMuscles: [],
    equipment: 'Other',
    isCustom: true
  };
}

/**
 * Filter exercises by muscle groups and/or equipment
 * @param {Array<string>} exercises - Array of exercise names
 * @param {Object} filters - Filter criteria
 * @param {Array<string>} filters.muscleGroups - Muscle groups to filter by
 * @param {Array<string>} filters.equipment - Equipment types to filter by
 * @param {Object} customExercises - Custom exercises object from data
 * @returns {Array<string>} Filtered exercise names
 */
export function filterExercises(exercises, filters = {}, customExercises = {}) {
  const { muscleGroups, equipment } = filters;

  if (!muscleGroups && !equipment) {
    return exercises;
  }

  return exercises.filter(name => {
    const metadata = getExerciseMetadata(name, customExercises);

    let matchesMuscle = true;
    let matchesEquipment = true;

    if (muscleGroups && muscleGroups.length > 0) {
      matchesMuscle = muscleGroups.some(group =>
        metadata.primaryMuscles.includes(group) ||
        metadata.secondaryMuscles.includes(group)
      );
    }

    if (equipment && equipment.length > 0) {
      matchesEquipment = equipment.includes(metadata.equipment);
    }

    return matchesMuscle && matchesEquipment;
  });
}

/**
 * Search exercises by query string
 * @param {Array<string>} exercises - Array of exercise names
 * @param {string} query - Search query (case-insensitive)
 * @returns {Array<string>} Matching exercise names
 */
export function searchExercises(exercises, query) {
  if (!query || query.trim() === '') {
    return exercises;
  }

  const lowerQuery = query.toLowerCase().trim();
  return exercises.filter(name =>
    name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get recently used exercises from workout history
 * @param {Array<Object>} workouts - Workout array from data
 * @param {number} limit - Maximum number of exercises to return
 * @returns {Array<string>} Recently used exercise names (most recent first)
 */
export function getRecentExercises(workouts, limit = 5) {
  const seen = new Set();
  const recent = [];

  // Workouts are already sorted newest first
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (!seen.has(exercise.name)) {
        seen.add(exercise.name);
        recent.push(exercise.name);

        if (recent.length >= limit) {
          return recent;
        }
      }
    }
  }

  return recent;
}

/**
 * Toggle favorite status for an exercise
 * @param {string} exerciseName - Exercise name to toggle
 * @param {Array<string>} favorites - Current favorites array
 * @returns {Array<string>} Updated favorites array
 */
export function toggleFavorite(exerciseName, favorites = []) {
  const newFavorites = [...favorites];
  const index = newFavorites.indexOf(exerciseName);

  if (index >= 0) {
    newFavorites.splice(index, 1);
  } else {
    newFavorites.push(exerciseName);
  }

  return newFavorites;
}
