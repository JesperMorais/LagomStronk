---
phase: 03-workout-features
plan: 01
subsystem: data
tags: [training-programs, progressive-overload, coaching, structured-training]

# Dependency graph
requires:
  - phase: 02-ux-overhaul-exercise-system
    provides: workout templates, exercise metadata, loadData/saveData pattern
provides:
  - PROGRAM_TEMPLATES with 6 structured training programs
  - Program management functions (start, end, advance, skip)
  - getTodaysProgrammedWorkout for daily scheduling
  - Progressive overload suggestion engine
  - Missed muscle group detection
  - Program adherence tracking
affects: [03-02 program-ui, 03-03 rest-timer, future coaching features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Program state stored in data.activeProgram
    - Schedule cycling via modulo arithmetic
    - Trend analysis across last 3 workouts

key-files:
  created: []
  modified: [js/data.js]

key-decisions:
  - "6 programs: PPL, 5x5, Upper/Lower, Bro Split, Full Body 3x, PHUL"
  - "Program schedule cycles using modulo for indefinite repetition"
  - "Progressive overload suggests +2.5kg after consistent success"
  - "activeProgram stored as nullable object in main data structure"

patterns-established:
  - "Program template structure: id, name, description, daysPerWeek, schedule, workouts, tips"
  - "Active program state: programId, startDate, currentDay, completedDays, lastWorkoutDate, customizations"
  - "Coaching helpers analyze last N workouts for suggestions"

issues-created: []

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 3 Plan 1: Training Programs Data Model Summary

**6 training program templates (PPL, 5x5, Upper/Lower, Bro Split, Full Body 3x, PHUL) with scheduling logic, progress tracking, and intelligent coaching helpers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T13:31:51Z
- **Completed:** 2026-02-06T13:34:47Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments
- Created comprehensive PROGRAM_TEMPLATES with 6 popular training programs
- Implemented full program lifecycle management (start, advance, skip, end)
- Built progressive overload engine analyzing workout history for weight suggestions
- Added missed muscle group detection with exercise suggestions
- Implemented program adherence tracking with streak calculation

## Task Commits

Each task was committed atomically:

1. **Task 1: Define program templates and data structures** - `367a881` (feat)
2. **Task 2: Add program management functions** - `b09fa20` (feat)
3. **Task 3: Add progressive overload helpers** - `cd47fba` (feat)

## Files Created/Modified
- `js/data.js` - Added 683 lines: program templates, management functions, coaching helpers

## Decisions Made
- **6 core programs:** PPL, 5x5, Upper/Lower, Bro Split, Full Body 3x, PHUL cover beginner to advanced
- **Cyclic scheduling:** currentDay cycles through schedule using modulo arithmetic for indefinite program continuation
- **+2.5kg progression:** Standard plate increment for progressive overload suggestions
- **Nullable activeProgram:** Stored in main data object, null when no program active
- **Rest day allowance:** Adherence streak allows 1 rest day between workouts without breaking streak

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - JavaScript syntax verified, all functions export correctly.

## Next Phase Readiness
- Program data model complete, ready for UI implementation in Plan 03-02
- getTodaysProgrammedWorkout() ready to drive "Today's Workout" dashboard display
- Progressive overload suggestions ready to show in workout logging UI
- No blockers for Phase 3 continuation

---
*Phase: 03-workout-features*
*Completed: 2026-02-06*
