# UAT Issues: Phase 2 - UX Overhaul & Exercise System

**Tested:** 2026-02-06
**Source:** All Phase 2 SUMMARY.md files
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Workout should be separate screen, not embedded in Today view

**Discovered:** 2026-02-06
**Phase/Plan:** 02 (architecture)
**Severity:** Major
**Feature:** Workout flow / mini-player
**Description:** The entire workout logging experience is embedded in the Today/landing screen. User expected a dedicated workout screen that opens when starting a workout.
**Expected:**
- Dashboard/Today = Landing page with stats only
- Workout Screen = Separate dedicated screen for active workout logging
- Mini-player = Always visible when you minimize/leave the workout screen
**Actual:**
- Today view combines dashboard AND inline workout logging
- Mini-player only appears when navigating away from Today
**Impact:** Major UX deviation from user's mental model

**Confirmed Architecture (from discussion):**

1. **Start Flow:**
   - Tap FAB/Start Workout → Full-screen workout takeover (hides bottom nav)

2. **Workout Screen Layout (top to bottom):**
   - Header: Minimize button (↓) + Workout name + Finish button
   - Timer: Large elapsed time display (hero)
   - Exercise list: Exercises with inline set logging (numpad, checkmarks, confetti)
   - Action buttons: Add Set, Add Exercise, Finish Workout (scrolls with content)

3. **Minimize Flow:**
   - Tap minimize button → Collapses to floating mini-player
   - Bottom nav reappears
   - Mini-player floats above everything (Spotify-style)

4. **Mini-Player Content:**
   - Timer + Current exercise + Progress (sets) + Workout name (compact)
   - Tap to expand back to full workout screen

5. **Finish Flow:**
   - Finish button in header AND at bottom of workout content
   - Confirmation dialog before ending

### UAT-002: Numpad doesn't always appear on input tap

**Discovered:** 2026-02-06
**Phase/Plan:** 02-04
**Severity:** Major
**Feature:** Custom numpad
**Description:** When tapping weight/reps inputs, the custom numpad doesn't consistently appear.
**Expected:** Numpad should reliably appear every time an input is tapped
**Actual:** Sometimes numpad doesn't come up
**Repro:** Tap various weight/reps inputs - inconsistent behavior

### UAT-003: Numpad needs smoother slide animations

**Discovered:** 2026-02-06
**Phase/Plan:** 02-04
**Severity:** Minor
**Feature:** Custom numpad
**Description:** Numpad appear/disappear animations need to be smoother and more polished.
**Expected:** Smooth, fluid slide-up/down animation
**Actual:** Animation exists but needs polish

### UAT-004: Mini-player needs smooth animations

**Discovered:** 2026-02-06
**Phase/Plan:** 02-08
**Severity:** Minor
**Feature:** Mini-player
**Description:** Mini-player appearance/disappearance needs smoother animations.
**Expected:** Smooth slide animations when mini-player appears/hides
**Actual:** Transitions are abrupt or missing polish

### UAT-005: Exit/finish workout functionality broken

**Discovered:** 2026-02-06
**Phase/Plan:** 02-08
**Severity:** Major
**Feature:** Workout flow
**Description:** Cannot reliably finish/exit an active workout. Finish button is hard to find and doesn't work properly.
**Expected:** Clear finish button with confirmation dialog
**Actual:** Hard to find, doesn't work
**Note:** May be addressed as part of UAT-001 workout screen rework

## Resolved Issues

[None yet]

---

*Phase: 02-ux-overhaul-exercise-system*
*Tested: 2026-02-06*
