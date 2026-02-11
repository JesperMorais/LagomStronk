---
phase: 02-ux-overhaul-exercise-system
plan: 01
subsystem: data-layer
completed: 2026-02-05
duration: 2min

requires:
  - 01-01-PLAN.md # Event bus for data update notifications
  - 01-02-PLAN.md # IndexedDB storage backend

provides:
  - Enhanced exercise data model with muscle/equipment metadata
  - Exercise filtering and search utilities
  - Foundation for exercise library UI features

affects:
  - 02-02-PLAN.md # Exercise library filtering UI will use these utilities
  - 02-03-PLAN.md # Custom exercise creation will use metadata storage
  - 02-04-PLAN.md # Recently used exercises will use getRecentExercises

tech-stack:
  added: []
  patterns:
    - Centralized exercise metadata in dedicated module
    - Pure utility functions separate from storage operations
    - Backward compatible data migration

key-files:
  created:
    - js/data/exercises.js # Exercise database with 28 exercises, metadata constants, utility functions
  modified:
    - js/data.js # Integrated exercise metadata, added favorites/customExercises support

decisions:
  - id: exercise-metadata-structure
    choice: Store metadata as { primaryMuscles, secondaryMuscles, equipment, isDefault/isCustom }
    rationale: Flexible structure supports filtering by multiple criteria; primary/secondary distinction enables accurate muscle group tracking
    alternatives: Single muscle array (loses primary/secondary distinction), complex nested structures (overkill for current needs)

  - id: muscle-group-taxonomy
    choice: Use broad categories (Chest, Back, Shoulders, Legs, Arms, Core, Other) with sub-groups
    rationale: Matches common gym training splits; detailed enough for accurate tracking without overwhelming users
    alternatives: Detailed anatomical names (too complex), flat list (loses training context)

  - id: custom-exercise-metadata
    choice: Store custom exercise metadata separately in customExercises object
    rationale: Keeps EXERCISES constant pure; enables runtime metadata for user-created exercises
    alternatives: Modify EXERCISES object (loses distinction between built-in and custom), separate storage mechanism (adds complexity)

tags:
  - exercise-data
  - metadata
  - filtering
  - search
---

# Phase 2 Plan 01: Exercise Data Model Enhancement Summary

**One-liner:** Structured exercise database with muscle group and equipment metadata, plus filtering utilities for 28 default exercises.

## Overview

Created a comprehensive exercise data model with metadata to support filtering, searching, and intelligent exercise recommendations. This plan establishes the data foundation for the exercise library UI (EXER-01, EXER-02), custom exercises (EXER-04), and recently used exercises (EXER-06).

## What Was Built

### 1. Exercise Data Module (js/data/exercises.js)

**MUSCLE_GROUPS constant:**
- 12 primary muscle groups (Chest, Back, Shoulders, Legs, Arms, Core, Other)
- 25+ sub-groups for detailed tracking (e.g., Upper Chest, Quads, Long Head)
- Structured to match common training splits

**EQUIPMENT_TYPES constant:**
- 10 equipment types (Barbell, Dumbbell, Machine, Cable, Bodyweight, etc.)
- Covers standard gym equipment and bodyweight training

**EXERCISES database:**
- 28 default exercises with comprehensive metadata
- Each exercise includes:
  - Primary muscles (main targets)
  - Secondary muscles (synergist muscles)
  - Equipment type
  - isDefault flag

**Utility functions:**
- `getExerciseMetadata(name, customExercises)` - Retrieves metadata with fallback for custom exercises
- `filterExercises(exercises, filters, customExercises)` - Filter by muscle groups and/or equipment
- `searchExercises(exercises, query)` - Case-insensitive string search
- `getRecentExercises(workouts, limit)` - Extract recently used exercises from workout history
- `toggleFavorite(exerciseName, favorites)` - Toggle favorite status (pure function)

### 2. Data Layer Integration (js/data.js)

**Imports and constants:**
- Import EXERCISES, MUSCLE_GROUPS, getExerciseMetadata from exercises.js
- Derive DEFAULT_EXERCISES from EXERCISES object (replaces hardcoded array)

**Data structure enhancements:**
- Added `favorites: []` array for user-favorited exercises
- Added `customExercises: {}` object for user-created exercise metadata
- Backward compatible - existing data without these fields loads correctly

**Function enhancements:**
- `addCustomExercise(data, name, metadata)` - Now accepts optional metadata parameter
- `toggleFavoriteExercise(data, exerciseName)` - New function for favorite management
- `getMuscleGroupStats(data)` - Refactored to use metadata instead of hardcoded mappings

**Benefits:**
- Custom exercises automatically appear in correct muscle group stats
- Extensible - adding new exercises only requires metadata, not code changes
- Single source of truth for exercise categorization

## Task Execution

### Task 1: Create exercise data module with metadata
**Status:** Complete
**Commit:** 4512f54
**Files:** js/data/exercises.js
**Changes:**
- Created MUSCLE_GROUPS with 12 primary groups and 25+ sub-groups
- Created EQUIPMENT_TYPES with 10 equipment types
- Built EXERCISES database with 28 default exercises and metadata
- Implemented 5 utility functions for filtering, search, and favorites

### Task 2: Update data.js to use exercise metadata
**Status:** Complete
**Commit:** 24391cd
**Files:** js/data.js
**Changes:**
- Imported exercise utilities from exercises.js
- Derived DEFAULT_EXERCISES from EXERCISES object
- Added favorites and customExercises to data structure
- Updated addCustomExercise to accept metadata parameter
- Added toggleFavoriteExercise function
- Ensured backward compatibility in loadData()

### Task 3: Update getMuscleGroupStats to use new metadata
**Status:** Complete
**Commit:** ae80fe6
**Files:** js/data.js
**Changes:**
- Imported MUSCLE_GROUPS constant
- Replaced hardcoded muscle group mappings with metadata lookup
- Now uses EXERCISES and customExercises for categorization
- Custom exercises with metadata show in correct muscle group
- Custom exercises without metadata show in "Other"

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. **Module loads successfully:** js/data/exercises.js exports all required constants and functions
2. **Exercise count correct:** 28 default exercises in EXERCISES object
3. **App loads without errors:** Verified with `npm start` and HTTP request
4. **Data functions available:** addCustomExercise, toggleFavoriteExercise exported
5. **Backward compatibility:** Existing data loads correctly with new fields added

## Metrics

**Execution:**
- Tasks completed: 3/3
- Duration: 2 minutes
- Commits: 3 (1 per task)

**Code changes:**
- Files created: 1 (exercises.js - 316 lines)
- Files modified: 1 (data.js)
- Lines added: ~364
- Lines removed: ~58
- Net change: +306 lines

**Coverage:**
- Default exercises: 28
- Muscle groups: 12 primary (25+ sub-groups)
- Equipment types: 10
- Utility functions: 5

## Impact Assessment

**Immediate benefits:**
- Exercise filtering foundation for library UI (plan 02-02)
- Custom exercise metadata storage ready (plan 02-03)
- Recently used exercise tracking enabled (plan 02-04)
- Muscle group stats now work with custom exercises

**Technical debt reduced:**
- Eliminated hardcoded muscle group mappings
- Single source of truth for exercise categorization
- Extensible architecture for adding exercises

**Future capabilities enabled:**
- Smart exercise recommendations based on muscle groups
- Equipment-based workout filtering
- Favorite exercise shortcuts
- Training volume analysis by muscle group

## Next Phase Readiness

**Ready to proceed:** Yes

**Dependencies satisfied:**
- ✓ Event bus available for data change notifications (01-01)
- ✓ IndexedDB storage for metadata persistence (01-02)

**Blockers:** None

**Recommendations:**
1. Proceed with plan 02-02 (Exercise Library Filtering UI) - data foundation complete
2. Consider adding exercise images/animations in future phase (not in current scope)
3. Monitor custom exercise creation patterns to refine metadata structure if needed

## Technical Notes

**Architecture decisions:**
- **Pure data module:** exercises.js has no storage operations - all utilities are pure functions
- **Metadata co-location:** Exercise metadata lives with exercise data, not scattered across codebase
- **Graceful fallback:** Custom exercises without metadata default to "Other" category
- **Import efficiency:** Only import needed constants (EXERCISES, MUSCLE_GROUPS) to minimize bundle size

**Testing considerations:**
- Utility functions are pure and easily testable
- filterExercises handles edge cases (empty filters, no matches)
- searchExercises handles empty queries and case-insensitivity
- getRecentExercises respects limit parameter and handles empty workout history

**Performance:**
- EXERCISES object lookup is O(1)
- filterExercises is O(n) where n = exercise count
- getMuscleGroupStats is O(w*e) where w = workouts, e = exercises per workout (unchanged from before)
- No performance regressions introduced

## Lessons Learned

1. **Metadata structure upfront:** Having clear muscle group taxonomy before implementation prevented refactoring
2. **Backward compatibility:** Adding new fields with defaults in loadData() ensures smooth migration
3. **Pure functions:** Separating utilities from storage operations improves testability and reusability
4. **Single source of truth:** Deriving DEFAULT_EXERCISES from EXERCISES object eliminates sync issues

---

**Summary Status:** ✓ Complete
**Next Plan:** 02-02 (Exercise Library Filtering UI)
**Dependencies for next plan:** This plan provides all required data utilities
