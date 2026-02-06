# Project State

## Project Reference

See: .planning/REQUIREMENTS.md (updated 2026-02-05)

**Core value:** Make strength training feel effortless and intelligent
**Current focus:** Phase 3 - Workout Features (in progress)

## Current Position

Phase: 3 of 7 (Workout Features) - IN PROGRESS
Plan: 1 of 4 complete
Status: In progress - executing Phase 3 plans
Last activity: 2026-02-06 - Completed 03-01-PLAN.md (Training Programs Data Model)

Progress: [██████░░░░] 68% (16/~23 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 17
- Average duration: 2.8 min
- Total execution time: 0.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-technical-foundation | 4 | 8min | 2min |
| 02-ux-overhaul-exercise-system | 11 | 45min | 4.1min |
| 03-workout-features | 1 | 3min | 3min |

**Recent Trend:**
- Last 5 plans: 02-09 (8min), 02-10 (8min), 02-11 (3min), 03-01 (3min)
- Trend: Data model plans completing quickly

*Updated after each plan completion*

## Accumulated Context

### Decisions

| Phase | Plan | Decision | Rationale |
|-------|------|----------|-----------|
| 01 | 01 | Use native EventTarget for event bus | Zero bytes overhead, DevTools compatible, memory-leak resistant vs external libraries |
| 01 | 01 | Default to localStorage until migration | Existing app uses localStorage; immediate switch would break functionality |
| 01 | 01 | Use idb-keyval over full IndexedDB wrappers | Only need key-value storage; 295 bytes vs 1.19KB (idb) or 20KB (Dexie) |
| 01 | 02 | Keep localStorage backup after migration | Provides user safety net; localStorage not cleared to preserve data |
| 01 | 02 | All data operations async | Future-proof for additional storage backends; consistent API surface |
| 01 | 03 | Critical toasts stay until dismissed | Critical errors require user acknowledgment; warnings auto-dismiss after 8s |
| 01 | 03 | Storage events fire once per session | Prevents notification spam during repeated capacity checks |
| 01 | 04 | Continue app load even if migration fails | localStorage fallback ensures app works; retry via toast allows recovery |
| 02 | 01 | Exercise metadata structure | Store as {primaryMuscles, secondaryMuscles, equipment}; flexible for filtering, accurate tracking |
| 02 | 01 | Muscle group taxonomy | Use broad categories matching training splits; detailed enough without overwhelming |
| 02 | 01 | Custom exercise metadata storage | Separate customExercises object; keeps EXERCISES pure, enables runtime metadata |
| 02 | 02 | Streak calculation in hero module | Hero owns streak display, should own calculation; makes calculateStreak reusable |
| 02 | 02 | FAB singleton pattern | Only one FAB needed app-wide; provides clean API without prop drilling |
| 02 | 02 | Suggested workout intelligence | Analyzes last 3 workouts, rotates muscle groups (Push/Pull/Legs) based on history |
| 02 | 02 | Empty state for new users | Hero shows encouraging message when no workouts; guides users to start first workout |
| 02 | 04 | Use readonly attribute to prevent system keyboard | Mobile browsers show system keyboard on input focus; readonly prevents this while maintaining focus |
| 02 | 04 | NEXT button navigates through sets logically | First reps → weight in same set, then next set's reps; natural flow through workout logging |
| 02 | 04 | Step size adjustable based on input type | Weight inputs use 2.5kg (common plate increment), reps use 1; read from input step attribute |
| 02 | 04 | Keyboard toggle allows fallback to system keyboard | User can explicitly switch to system keyboard when custom numpad doesn't meet needs |
| 02 | 03 | Use Chart.js gradients instead of solid colors | Gradient bars (mint fading to transparent) are visually stunning and modern; matches premium feel of design system |
| 02 | 03 | Goal line as separate dataset overlay | Chart.js line dataset overlaid on bar chart provides clean dashed amber line; separate from bars for clear visual hierarchy |
| 02 | 03 | PR cards use horizontal scroll with snap | Mobile-first design; horizontal scroll saves vertical space, snap provides tactile feel; 140px cards show 2.5 cards on mobile |
| 02 | 03 | PR tracking across three metrics | Different PRs matter for different goals: powerlifters track 1RM, bodybuilders track volume, beginners track weight |
| 02 | 03 | Volume chart shows current week Monday-Sunday | Training weeks typically start Monday; Sunday end provides complete week view; aligns with standard training splits |
| 02 | 06 | Intensity based on total volume | Sum (reps × weight) represents overall training load; normalize by monthly max for 0-1 range gradient |
| 02 | 06 | Cache intensity calculations | Map keyed by year-month prevents recalculation on re-render; cleared when workout data updates |
| 02 | 06 | Calendar default view | Visual overview provides better pattern recognition than chronological list; toggle preserves list option |
| 02 | 06 | Popup above bottom navigation | Mobile-first: fixed position above nav bar ensures popup always visible on tap |
| 02 | 05 | Checkmark animation via CSS stroke-dasharray | 60fps animation with minimal CPU; cubic-bezier spring creates bounce feel |
| 02 | 05 | canvas-confetti from CDN | Zero build overhead; 20 mint particles on set completion |
| 02 | 05 | Mini-player custom events | Dispatches 'mini-player:expand' for loose coupling; app.js listens and navigates |
| 02 | 05 | Previous set hints as placeholders | HTML placeholder attribute shows greyed hints without forcing input; non-intrusive UX |
| 02 | 05 | Set checkbox first in row | Creates visual checklist feeling; onclick calls handleSetComplete for animations |
| 02 | 07 | Filter drawer uses chip-based selection | More modern, mobile-friendly interface; chips provide clear visual feedback and easier to tap on mobile |
| 02 | 07 | Recent exercises placement at top | Displayed above filtered results to provide muscle memory shortcuts for quick access |
| 02 | 07 | Filter button badge shows active count | Users know when filters are applied without opening drawer |
| 02 | 07 | Global favorite handler | Made handleFavoriteToggle a window function to allow onclick binding from rendered card HTML strings |
| 02 | 09 | Workout auto-naming pattern | "My Workout #X" increments based on existing names; provides unique default names |
| 02 | 09 | Mini-player shows on ALL views | Spotify-style always-visible when workout active, not just when navigating away |
| 02 | 09 | Compact side-by-side dashboard stats | Removed large hero section; compact This Week + Recent PRs cards side by side |
| 02 | 09 | Numpad plate calculator replaces settings | Settings functionality minimal; plate calculator more useful during workouts |
| 02 | 09 | Three entry points for Add Custom Exercise | Header +, FAB, empty state CTA for maximum discoverability |
| 02 | 10 | Browser confirm() for finish workout | Simple yes/no question; no need for custom modal |
| 02 | 10 | Checkmark icon for finish button | Semantically "complete" rather than X for "close/cancel" |
| 02 | 10 | "Last: X" format for placeholder hints | Clearer than just showing a number |
| 02 | 05 | Filter drawer uses chip-based selection | More modern, mobile-friendly interface; chips provide clear visual feedback |
| 02 | 05 | Recent exercises at top | Muscle memory shortcuts for quick access |
| 02 | 05 | Filter badge shows active count | Users know when filters are applied without opening drawer |
| 02 | 05 | Favorites stored separately | Using lagomstronk_favorites key, separate from main app data |
| 02 | 06 | Confetti particles: 20 mint-colored | Zero build overhead with CDN; particles fire from button position |
| 02 | 06 | Animation timing 0.3s ease-out | Snappy but visible pop animation for checkmark |
| 02 | 06 | In-place DOM updates for animations | toggleSetCompletion updates classes directly without re-render to preserve animation state |
| 02 | 06 | Haptic feedback via navigator.vibrate | 30ms pulse if supported for tactile confirmation |
| 02 | 08 | Mini-player shows only when navigating away | Spotify-style: visible on History/Stats/Library, hidden on Today |
| 02 | 08 | Auto-start workout on first exercise | Seamless UX without explicit "Start Workout" button |
| 02 | 08 | Timer format MM:SS or HH:MM:SS | Adapts based on duration; HH only when workout exceeds 1 hour |
| 02 | 08 | FAB hidden during active workout | Prevents confusion; FAB only shows when no workout in progress |
| 02 | 09 | Wizard uses chip-based selection | More modern, mobile-friendly interface for muscle groups and equipment |
| 02 | 09 | Custom metadata in separate localStorage key | lagomstronk_custom_exercises keeps main data clean |
| 02 | 09 | Multiple wizard entry points | Library button + search results CTA for maximum discoverability |
| 02 | 11 | Focus event listeners for numpad reliability | Added alongside click handlers with capture phase; prevents mobile touch issues |
| 02 | 11 | CSS transitions with visibility pattern | Changed from display: none to visibility/pointer-events for smooth animations |
| 02 | 11 | GPU acceleration for mobile animations | will-change: transform promotes to GPU layer for 60fps on mobile |
| 02 | 11 | Defensive DOM element validation | showNumpad() checks element existence before operations to prevent errors |
| 03 | 01 | 6 core training programs | PPL, 5x5, Upper/Lower, Bro Split, Full Body 3x, PHUL cover beginner to advanced |
| 03 | 01 | Cyclic scheduling | currentDay cycles through schedule using modulo arithmetic for indefinite program continuation |
| 03 | 01 | +2.5kg progression | Standard plate increment for progressive overload suggestions |
| 03 | 01 | Nullable activeProgram | Stored in main data object, null when no program active |
| 03 | 01 | Rest day allowance in adherence | Adherence streak allows 1 rest day between workouts without breaking streak |

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1 - RESOLVED:**
- ~~localStorage approaching quota limits~~ — Phase 1 complete, now using IndexedDB

**Phase 2 - RESOLVED:**
- ~~UX issues from verification feedback~~ — Fixed in 02-09, 02-10, 02-11
- ~~UAT-002: Numpad reliability~~ — Fixed in 02-11 with focus event listeners
- ~~UAT-003: Numpad animations~~ — Fixed in 02-11 with CSS transitions
- ~~UAT-004: Mini-player animations~~ — Fixed in 02-11 with GPU acceleration

**Phase 3 - Research Needed:**
- ExerciseDB API pricing and rate limits need verification before production use

**Phase 4 - Privacy Sensitive:**
- Photo storage requires encryption strategy and GDPR compliance research

**Phase 5 - Platform Complexity:**
- Health Connect and HealthKit have different data models requiring normalization strategy
- Deduplication logic needed to prevent duplicate workout imports

**Phase 6 - Data Dependency:**
- Intelligence features require minimum 30+ workouts per user for meaningful recommendations

## Session Continuity

Last session: 2026-02-06 (Phase 3 execution)
Stopped at: Completed 03-01-PLAN.md (Training Programs Data Model)
Resume file: None
Next: Continue Phase 3 with 03-02-PLAN.md (Program UI)
