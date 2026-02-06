---
phase: 02-ux-overhaul-exercise-system
plan: 06
subsystem: ui
tags: [calendar, history, intensity-gradient, workout-tracking, visualization]

# Dependency graph
requires:
  - phase: 01-technical-foundation
    provides: IndexedDB storage for workout data persistence
  - phase: 02-01
    provides: Exercise metadata and workout data structure
provides:
  - Calendar component for workout history visualization
  - Intensity gradient markers based on workout volume
  - Hybrid month/week calendar view with navigation
  - Day selection popup with workout summary
  - Toggle between calendar and list history views

affects: [02-08-rest-timer, 03-advanced-exercise-database]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Intensity normalization: Calculate max volume per month, normalize to 0-1 range"
    - "CSS variable intensity control: Use --intensity custom property for gradient opacity"
    - "Caching pattern: Cache month intensity calculations to prevent recalculation"
    - "Component singleton: Single calendar instance reused when data updates"

key-files:
  created:
    - js/ui/components/calendar.js
    - css/calendar.css
  modified:
    - index.html
    - js/app.js

key-decisions:
  - "Intensity based on total volume: Sum (reps × weight) for each workout, normalize by monthly max"
  - "Cache intensity calculations: Map keyed by year-month prevents recalculation on re-render"
  - "Popup positioned above nav: Fixed position above bottom navigation for mobile-first design"
  - "Calendar default view: History view defaults to calendar, toggle allows switching to list"

patterns-established:
  - "Volume calculation pattern: Iterate exercises → sets, sum (reps × weight)"
  - "Date string format: YYYY-MM-DD via toISOString().split('T')[0]"
  - "Month intensity normalization: (day volume / month max) for 0-1 range"

# Metrics
duration: 4min
completed: 2026-02-05
---

# Phase 2 Plan 6: Workout History Calendar Summary

**Interactive calendar view with intensity gradient markers showing workout volume, day selection popups, and month navigation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-05T14:14:31Z
- **Completed:** 2026-02-05T14:18:30Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Calendar grid displays month view with workout days marked by intensity
- Intensity gradient calculated from workout volume (darker = higher volume)
- Day tap shows popup with exercise count, sets, volume, and exercise chips
- View Details button opens existing workout modal for full workout display
- Toggle between calendar and list views in history
- Month navigation with prev/next buttons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create calendar component** - `c34101c` (feat)
2. **Task 2: Create calendar CSS** - `90b25a3` (feat)
3. **Task 3: Integrate calendar into history view** - `604b57c` (feat)

## Files Created/Modified
- `js/ui/components/calendar.js` - WorkoutCalendar class with month rendering, intensity calculation, day selection, popup display
- `css/calendar.css` - Calendar grid styling, intensity markers, day states (today/selected/has-workout), popup styling, toggle buttons
- `index.html` - Added calendar.css link, history view toggle buttons with calendar/list SVG icons
- `js/app.js` - Import renderCalendar, add history state (historyCalendar, historyViewMode), update renderHistoryView to switch modes, add toggle event listeners

## Decisions Made

**1. Intensity calculation based on total volume**
- Rationale: Volume (reps × weight) represents overall training load better than set count or exercise count
- Implementation: Sum all (reps × weight) across all exercises/sets for each workout
- Normalization: Divide by monthly max to get 0-1 range for CSS variable

**2. Cache intensity calculations per month**
- Rationale: Prevent expensive recalculation when re-rendering same month
- Implementation: Map keyed by `${year}-${month}` stores normalized intensity objects
- Cache cleared when workout data updates

**3. Calendar as default history view**
- Rationale: Visual overview provides better pattern recognition than chronological list
- Implementation: historyViewMode defaults to 'calendar', toggle buttons switch between modes
- List view preserved for users who prefer chronological detail

**4. Popup above bottom navigation**
- Rationale: Mobile-first design needs popup visible without being covered by nav
- Implementation: Fixed position `bottom: calc(var(--nav-height) + var(--spacing-md))`
- Slide-in animation for smooth appearance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Calendar visualization complete, ready for rest timer implementation (02-08)
- Intensity gradient provides visual feedback on training consistency
- Day popup enables quick workout review without full modal
- Toggle pattern established for future view mode switches (library grid/list in 02-07)

---
*Phase: 02-ux-overhaul-exercise-system*
*Completed: 2026-02-05*
