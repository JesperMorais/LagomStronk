# Project: LagomStronk

## What This Is

A feature-complete strength training PWA that combines modern workout logging with intelligent coaching, gamification, and body tracking. Built as a vanilla JavaScript single-page app with IndexedDB storage, Chart.js visualizations, and a mint-themed dark UI optimized for mobile.

## Core Value

Make strength training feel effortless and intelligent.

## Requirements

### Validated

- ✓ Storage abstraction layer with IndexedDB migration — v1.0
- ✓ Storage usage monitoring with 70% warning — v1.0
- ✓ Event bus for decoupled features — v1.0
- ✓ Modern dashboard with streak, volume chart, suggested workout — v1.0
- ✓ Custom numpad matching design inspiration — v1.0
- ✓ Workout history calendar — v1.0
- ✓ Exercise library with filtering, search, favorites — v1.0
- ✓ Custom exercise creation — v1.0
- ✓ Previous set hints and completion animations — v1.0
- ✓ Configurable rest timer with lock screen controls — v1.0
- ✓ Automatic PR detection with celebrations — v1.0
- ✓ 6 training programs with progressive overload coaching — v1.0
- ✓ Body weight, measurements, and body fat tracking with charts — v1.0
- ✓ Onboarding wizard with goal/experience/equipment capture — v1.0
- ✓ Achievement badges and streak milestones — v1.0
- ✓ PR feed timeline — v1.0
- ✓ Intelligence engine (recommendations, splits, recovery, fatigue) — v1.0
- ✓ Insights dashboard (quality scores, trends, muscle heatmap) — v1.0
- ✓ Polished README with screenshots — v1.0

### Active

- [ ] Progress photos with timeline view (BODY-04)
- [ ] Photo comparison view — side-by-side, overlay (BODY-05)
- [ ] User guide documentation (DOCS-02)
- [ ] Architecture documentation for contributors (DOCS-03)

### Out of Scope

| Feature | Reason |
|---------|--------|
| Health Connect / HealthKit integration | Requires Capacitor/native wrapper — deferred to post-v1 |
| Google Fit integration | Deprecated 2026, use Health Connect instead |
| GPS tracking | Pointless for strength training |
| Nutrition tracking | Different domain, would dilute focus |
| Wearable device sync | Complex integration, defer to v2+ |
| Automatic social sharing | Privacy violation, users dislike |
| 1000+ exercise library | Maintenance burden, curate core exercises instead |
| Video tutorials in-app | Content management burden, link to external resources |
| ML-based workout adaptation | Requires TensorFlow.js, overkill for current scope |

## Context

Shipped v1.0 with ~10,600 LOC (JavaScript + HTML).
Tech stack: Vanilla JS, IndexedDB (idb-keyval), Chart.js, Media Session API.
Architecture: Single `index.html` SPA with event-driven modules.
Storage: Dual-mode (localStorage fallback + IndexedDB primary).
Mobile-first with 6-tab bottom navigation on 375px+ screens.
All intelligence features are rule-based (no AI/ML dependencies).

## Key Decisions

| Phase | Decision | Rationale | Outcome |
|-------|----------|-----------|---------|
| 01 | Native EventTarget over custom event bus | Zero dependencies, browser-native API | ✓ Good |
| 01 | idb-keyval for IndexedDB | Minimal wrapper, async-first | ✓ Good |
| 02 | Custom numpad overlay | Matches design spec, better mobile UX than native keyboard | ✓ Good |
| 02 | Spotify-style mini-player | Shows workout context on any screen | ✓ Good |
| 02 | 6-tab bottom nav at 0.55rem labels | Fits 375px screens without overflow | ✓ Good |
| 03 | 6 built-in training programs | Covers major training philosophies | ✓ Good |
| 03 | Media Session API for rest timer | Lock screen controls without native wrapper | ✓ Good |
| 04 | Non-zero Y-axis for weight charts | Makes small changes visible | ✓ Good |
| 04 | Individual charts per measurement | Per CONTEXT requirement, not combined | ✓ Good |
| 06 | Settings via gear icon in Today header | Keeps nav clean, no settings tab | ✓ Good |
| 06 | Monday-based ISO weeks for streaks | Standard week boundaries | ✓ Good |
| 06 | All intelligence rule-based, no AI | Deterministic, explainable, lightweight | ✓ Good |
| 06 | Min 5 workouts for insights | Prevents misleading insufficient data | ✓ Good |
| 06 | Heatmap as colored blocks | Simple implementation, no SVG assets | ✓ Good |

## Constraints

- PWA only — no native app wrapper (Capacitor considered for v2+)
- Vanilla JavaScript — no framework (intentional simplicity)
- Local-only data — no backend/server (privacy-first)
- Mobile-first — optimized for 375px+ screens

---
*Last updated: 2026-02-10 after v1.0 milestone*
