# Phase 2: UX Overhaul & Exercise System - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Modernize the app interface with a hero-based dashboard showing streak, volume charts, and PRs. Improve workout logging UX with previous set hints, completion animations, floating mini-player, and calendar history. Build comprehensive exercise library with filtering, search, favorites, and custom exercise creation.

</domain>

<decisions>
## Implementation Decisions

### Landing Screen Layout
- Hero + sections layout: large featured area with smaller sections below
- Hero content: customizable, default shows suggested workout + streak
- Suggested workout: based on active program, falls back to smart muscle group suggestions
- Streak display: flame icon + number combined with 7-day calendar mini-view
- Volume chart: bar chart with multiple stunning options - this week's daily volume OR last 5 weeks with goal line overlay
- Recent PRs: horizontal scrollable cards showing exercise + value
- Start Workout button: fixed floating FAB with glow effect, uses app's dumbbell logo
- Empty states: encouraging prompts with clear CTAs ("Start your first workout to build your streak!")
- Color scheme: follow color-palette.md (mint primary, dark backgrounds), clearly document any additions

### Workout Logging UX
- Previous set hints: greyed placeholder text inside input fields
- Set completion: checkmark pop animation + row highlight + small confetti burst; row stays highlighted after completion
- 1-rep sets: special treatment with option to mark as failed attempt
- Exit/cancel: user can navigate anywhere while workout is active; floating mini-player (Spotify-style) shows workout name + timer; actual cancel requires confirmation dialog (intentionally not easily accessible)
- Mini-player timer: shows rest countdown when resting, total workout duration otherwise (toggle behavior)
- Adding sets: manual + button only; settings controls default number of working sets and warmup sets
- Warmup sets: different row background color + "Warmup" label badge; set numbering restarts from 1 after warmups
- Supersets/circuits: grouped card display with exercises visually linked
- Number input: custom app numpad matching inspiration/numpad.jpg (0-9, decimal, backspace, +/- steppers, settings, keyboard toggle, NEXT button)

### Workout History Calendar
- View style: hybrid - month overview with expandable weeks for detail
- Day markers: intensity gradient (lighter to darker based on workout volume)
- Day tap behavior: Claude's discretion (recommend quick summary popup)

### Exercise Library
- Card layout: switchable between list view and 2-column grid
- Card content: name + muscle highlight image
- Filtering: filter drawer/modal (tap filter icon to open full filter panel)
- Favorites: long-press menu to add; periodic tooltip hint about how to favorite (once every few sessions)
- Search: dedicated search in library view

### Exercise Metadata
- Muscle groups: detailed (12+ groups) with sub-group tracking (e.g., tricep heads grouped under triceps but individually tracked for recommendations)
- Primary + secondary muscle targets for each exercise
- Equipment types: detailed (10+ types) - Barbell, Dumbbell, EZ Bar, Machine, Cable, Smith Machine, Kettlebell, Resistance Band, Bodyweight, Other
- Custom exercise creation: guided wizard flow (name -> muscle groups -> equipment -> confirm)
- Custom exercise indicator: subtle user icon, no text badge

### Claude's Discretion
- Loading skeleton design
- Exact spacing and typography
- Error state handling
- Calendar day tap detail implementation
- Volume chart visual design within "stunning" requirement
- Animation timing and easing curves

</decisions>

<specifics>
## Specific Ideas

- Numpad design should match inspiration/numpad.jpg - dark theme, clean layout with +/- steppers, settings button, NEXT to advance fields
- FAB should have the mint glow effect from color palette (shadow-mint)
- Color palette at /home/david/Dev/personal/color-palette.md - use this, document any deviations clearly
- Floating mini-player like Spotify's - small bar showing workout, tap to return
- Volume visualizations should be "stunning" - explore creative chart options

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-ux-overhaul-exercise-system*
*Context gathered: 2026-02-05*
