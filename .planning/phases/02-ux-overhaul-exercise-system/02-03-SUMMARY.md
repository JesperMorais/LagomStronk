---
phase: 02-ux-overhaul-exercise-system
plan: 03
subsystem: dashboard-visualization
tags: [chartjs, gradients, pr-tracking, data-viz, dashboard-ui]
requires:
  - phases: [02-01, 02-02]
  - reason: "Depends on hero component and exercise metadata structure"
provides:
  - capability: "Weekly volume visualization with gradient Chart.js bars"
  - capability: "Recent PR cards with horizontal scroll and snap"
  - capability: "Dashboard data insights at a glance"
affects:
  - phase: 03
    note: "Volume chart provides foundation for advanced analytics in Intelligence phase"
tech-stack:
  added:
    - name: "Chart.js"
      version: "CDN (latest)"
      purpose: "Gradient bar charts for volume visualization"
  patterns:
    - name: "Canvas gradient creation"
      where: "volumeChart.js createVolumeChart"
    - name: "Horizontal scroll with snap"
      where: "dashboard.css .pr-cards-scroll"
key-files:
  created:
    - path: "js/ui/dashboard/volumeChart.js"
      purpose: "Weekly volume chart with gradients and goal line"
      exports: ["createVolumeChart", "updateVolumeChart", "renderDashboardVolumeChart"]
    - path: "js/ui/dashboard/prCards.js"
      purpose: "PR cards with horizontal scroll"
      exports: ["renderPRCards"]
  modified:
    - path: "css/dashboard.css"
      changes: "Added volume chart and PR cards styling with scroll behavior"
    - path: "index.html"
      changes: "Added dashboard-volume and dashboard-prs containers to today view"
    - path: "js/app.js"
      changes: "Integrated dashboard components into renderTodayView"
decisions:
  - decision: "Use Chart.js gradients instead of solid colors"
    rationale: "Gradient bars (mint fading to transparent) are visually stunning and modern; matches premium feel of David Stenman AB design system"
    impact: "Enhanced visual appeal without performance cost; gradient created once per chart"
  - decision: "Goal line as separate dataset overlay"
    rationale: "Chart.js line dataset overlaid on bar chart provides clean dashed amber line; separate from bars for clear visual hierarchy"
    impact: "Users can see weekly target vs actual at a glance"
  - decision: "PR cards use horizontal scroll with snap"
    rationale: "Mobile-first design; horizontal scroll saves vertical space, snap provides tactile feel; 140px cards show 2.5 cards on mobile"
    impact: "Better mobile UX; encourages exploration of PRs without overwhelming vertical scroll"
  - decision: "PR tracking across three metrics (weight, volume, 1RM)"
    rationale: "Different PRs matter for different goals: powerlifters track 1RM, bodybuilders track volume, beginners track weight"
    impact: "Comprehensive PR detection captures all types of progress"
  - decision: "Volume chart shows current week Monday-Sunday"
    rationale: "Training weeks typically start Monday; Sunday end provides complete week view"
    impact: "Aligns with standard training split structure (Push/Pull/Legs typically Mon-Sat)"
duration: 3 minutes
completed: 2026-02-05
---

# Phase 2 Plan 3: Volume Chart & PR Cards Summary

**One-liner:** Weekly volume chart with mint gradients and horizontal scrollable PR cards for at-a-glance progress insights.

## What Was Built

**Volume Chart Module (`volumeChart.js`):**
- `getWeeklyVolume(workouts)` - Calculates Monday-Sunday volume totals for current week
- `createVolumeChart(canvasId, weekData, goalVolume)` - Creates Chart.js bar chart with:
  - Mint gradient bars (solid at top, transparent at bottom)
  - Amber dashed goal line overlay at 3000kg default
  - Rounded corners (borderRadius: 8)
  - Dark theme tooltips with mint accent
  - Y-axis k suffix for thousands (2k, 4k, etc.)
- `updateVolumeChart(chart, newData)` - Updates chart without animation for performance
- `renderDashboardVolumeChart(container, workouts)` - Creates canvas and initializes chart

**PR Cards Module (`prCards.js`):**
- `getRecentPRs(workouts, limit)` - Analyzes workout history to find PRs
  - Tracks three PR types: weight (max single lift), volume (total kg moved), 1RM (estimated)
  - Compares each workout to previous bests chronologically
  - Returns top 5 most recent PRs sorted by date
- `formatPRValue(value, type)` - Displays with appropriate units (kg, k kg)
- `formatRelativeDate(date)` - Friendly dates (Today, Yesterday, 3d ago, 2w ago)
- `renderPRCards(container, workouts)` - Creates horizontal scroll section
  - Each card shows: icon, exercise name, PR type, value, date
  - Empty state with encouraging message
  - Scroll snap for tactile mobile feel

**Dashboard Integration:**
- Updated `index.html` to add `dashboard-volume` and `dashboard-prs` containers between hero and exercises
- Updated `css/dashboard.css` with:
  - Volume chart section styling (gradient background, 200px fixed height)
  - PR cards horizontal scroll with snap points
  - PR card styling (140px width, mint hover borders, lift animation)
  - Thin scrollbar with mint color (hidden on desktop)
  - Empty states for both components
- Updated `js/app.js` to import and render dashboard components in `renderTodayView()`

## How It Works

**Volume Chart Flow:**
1. `renderTodayView()` calls `renderDashboardVolumeChart(container, workouts)`
2. `getWeeklyVolume()` calculates total volume for each day (Mon-Sun) in current week
3. `createVolumeChart()` creates canvas gradient and Chart.js instance
4. Chart renders with gradient bars and goal line overlay
5. Tooltips show on hover with k suffix for readability

**PR Cards Flow:**
1. `renderTodayView()` calls `renderPRCards(container, workouts)`
2. `getRecentPRs()` iterates through workouts chronologically
3. For each exercise, tracks max weight, total volume, estimated 1RM
4. When new best is found, creates PR object with date
5. Returns top 5 most recent PRs
6. Renders as horizontal scrollable cards with snap points

**Data Calculation:**
- **Volume**: `sum(reps × weight)` for all sets in a workout
- **Weight PR**: Highest single set weight for an exercise
- **Volume PR**: Highest total volume for an exercise in one workout
- **1RM PR**: Brzycki formula: `weight × (36 / (37 - reps))`

## Deviations from Plan

None - plan executed exactly as written. All features implemented as specified with no blocking issues or architectural decisions needed.

## Verification

**Volume Chart:**
- ✅ Chart renders with mint gradient bars (solid to transparent)
- ✅ Goal line shows as amber dashed line at 3000kg
- ✅ Bar corners rounded with borderRadius: 8
- ✅ Tooltips styled with dark theme and mint accent
- ✅ Y-axis shows k suffix for thousands (2k, 4k)
- ✅ Integrated into today view above exercises

**PR Cards:**
- ✅ Cards render horizontally with scroll
- ✅ Snap points work on scroll
- ✅ Each card shows icon, exercise, type, value, date
- ✅ Hover effects (border color change, lift animation)
- ✅ Empty state shows encouraging message
- ✅ Relative dates display correctly (Today, 3d ago, etc.)

## Success Criteria Met

- ✅ Volume chart uses Chart.js with gradient fill
- ✅ Goal line is amber dashed at configurable value (default 3000kg)
- ✅ PR cards display exercise, value, relative date
- ✅ Horizontal scroll works with snap points
- ✅ Empty states show for no data
- ✅ Colors match design system (mint, amber, dark backgrounds)
- ✅ Tooltip styling matches app theme

## Files Modified

**Created:**
- `js/ui/dashboard/volumeChart.js` (210 lines)
- `js/ui/dashboard/prCards.js` (227 lines)

**Modified:**
- `css/dashboard.css` (+160 lines) - Volume chart and PR cards styling
- `index.html` (+9 lines) - Dashboard containers
- `js/app.js` (+18 lines) - Import and render dashboard components

## Commits

1. `75e8302` - feat(02-03): create volume chart with gradient bars and goal line
2. `100e66f` - feat(02-03): create horizontal scrollable PR cards component
3. `6ae6bd5` - feat(02-03): integrate volume chart and PR cards into dashboard

## Next Phase Readiness

**Blockers:** None

**Enables:**
- Phase 03 (Intelligence): Volume chart provides foundation for advanced analytics and trend detection
- Phase 06 (Intelligence): PR tracking enables intelligent coaching recommendations

**Notes:**
- Chart.js is loaded via CDN; all gradient calculations happen client-side
- PR detection algorithm iterates chronologically to ensure accurate historical comparison
- Volume chart shows current week only; Phase 03 can extend to historical trends
- 1RM estimation uses Brzycki formula (most accurate for 1-10 rep range)
