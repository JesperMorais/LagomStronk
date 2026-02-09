# Requirements: LagomStronk

**Defined:** 2026-02-05
**Core Value:** Make strength training feel effortless and intelligent

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation (FNDN)

- [x] **FNDN-01**: Storage abstraction layer with IndexedDB migration path
- [x] **FNDN-02**: Storage usage monitoring with warning at 70% capacity
- [x] **FNDN-03**: Event bus infrastructure for decoupled features

### UX Overhaul (UX)

- [x] **UX-01**: Modern landing screen with customizable workout visualization
- [x] **UX-02**: Workout streak prominently displayed on dashboard
- [x] **UX-03**: Weekly volume chart (this week vs last)
- [x] **UX-04**: Upcoming/suggested workout on dashboard
- [x] **UX-05**: Recent PRs displayed on dashboard
- [x] **UX-06**: Fix inability to exit/cancel active workout
- [x] **UX-07**: Previous set values displayed as greyed-out hints
- [x] **UX-08**: Satisfying checkmark and completion animations
- [x] **UX-09**: Calendar view of workout history

### Exercise System (EXER)

- [x] **EXER-01**: Filter exercises by muscle group
- [x] **EXER-02**: Filter exercises by equipment type (barbell, dumbbell, machine, bodyweight, cable)
- [x] **EXER-03**: Exercise cards with placeholder for muscle highlight images
- [x] **EXER-04**: Custom exercise creation with muscle group and equipment metadata
- [x] **EXER-05**: Dedicated exercise library view/screen
- [x] **EXER-06**: Recently used exercises quick access
- [x] **EXER-07**: Favorite exercises with star/bookmark

### Workout Features (WORK)

- [x] **WORK-01**: Configurable rest timer with lock screen controls
- [x] **WORK-02**: Inline exercise history showing previous workout values ("Last: 225 x 8")
- [x] **WORK-03**: Automatic PR detection (weight, reps, volume, 1RM)
- [x] **WORK-04**: PR celebration with animations
- [x] **WORK-05**: Plate calculator showing which plates to load
- [x] **WORK-06**: Multi-week training programs (PPL, 5x5, custom)

### Body Tracking (BODY)

- [x] **BODY-01**: Body weight tracking with chart
- [x] **BODY-02**: Muscle measurements (bicep, chest, waist, thigh, etc.) with history
- [x] **BODY-03**: Measurement trend charts
- [ ] **BODY-04**: Progress photos with timeline view *(deferred - out of scope per CONTEXT)*
- [ ] **BODY-05**: Photo comparison view (side-by-side, overlay) *(deferred - out of scope per CONTEXT)*
- [x] **BODY-06**: Body composition tracking (body fat %, muscle mass - manual entry)

### Health Integration (HLTH)

- [ ] **HLTH-01**: Health Connect integration (Android)
- [ ] **HLTH-02**: Apple HealthKit integration (iOS)
- [ ] **HLTH-03**: Import body weight from health platforms
- [ ] **HLTH-04**: Import past workouts from health platforms
- [ ] **HLTH-05**: Export LagomStronk workouts to health platforms
- [ ] **HLTH-06**: Import steps and daily activity data
- [ ] **HLTH-07**: Import heart rate data from workouts
- [ ] **HLTH-08**: Import sleep data for recovery insights
- [ ] **HLTH-09**: Sync body measurements with health platforms
- [ ] **HLTH-10**: Import/export calories burned

### Gamification (GAME)

- [x] **GAME-01**: Workout streak tracker with rest day logic (5/week target)
- [x] **GAME-02**: PR feed - dedicated view celebrating personal records
- [x] **GAME-03**: Badge/achievement system (10, 50, 100 workouts, streaks, etc.)
- [x] **GAME-04**: Streak milestones with celebrations

### Intelligence (INTL)

- [x] **INTL-01**: Onboarding flow capturing goals, experience, preferences, equipment
- [x] **INTL-02**: Exercise recommendations based on history and goals
- [x] **INTL-03**: Training split suggestions based on user profile
- [x] **INTL-04**: Balance alerts ("You haven't trained legs in 8 days")
- [x] **INTL-05**: Progressive overload hints (suggest weight increase)
- [x] **INTL-06**: Recovery insights showing muscle recovery status
- [x] **INTL-07**: Workout quality score based on completion and PRs
- [x] **INTL-08**: Trend analysis ("Your bench is up 15% this month")
- [x] **INTL-09**: Muscle heatmap showing which muscles trained this week
- [x] **INTL-10**: Fatigue/overtraining detection with warnings

### Documentation (DOCS)

- [ ] **DOCS-01**: Polished README with screenshots and feature overview
- [ ] **DOCS-02**: User guide documentation
- [ ] **DOCS-03**: Architecture docs for contributors

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social

- **SOCL-01**: Activity feed showing friends' workouts
- **SOCL-02**: Like/comment on PRs
- **SOCL-03**: Follow friends
- **SOCL-04**: Leaderboards

### Advanced Intelligence

- **AINT-01**: Smart workout generator (auto-generate balanced workout)
- **AINT-02**: Voice-to-text workout notes with AI structuring
- **AINT-03**: Conversational AI coach
- **AINT-04**: ML-based workout adaptation (requires TensorFlow.js)

### Advanced Features

- **ADVF-01**: 3D body scanning
- **ADVF-02**: Real-time form feedback
- **ADVF-03**: Superset/circuit grouping with shared rest timer
- **ADVF-04**: Data export/import (JSON backup)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Google Fit integration | Deprecated 2026, use Health Connect instead |
| GPS tracking | Pointless for strength training |
| Nutrition tracking | Different domain, would dilute focus |
| Wearable device sync | Complex integration, defer to v2+ |
| Automatic social sharing | Privacy violation, users dislike |
| 1000+ exercise library | Maintenance burden, curate 200-300 core exercises instead |
| Video tutorials in-app | Content management burden, link to external resources |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Complete |
| FNDN-02 | Phase 1 | Complete |
| FNDN-03 | Phase 1 | Complete |
| UX-01 | Phase 2 | Complete |
| UX-02 | Phase 2 | Complete |
| UX-03 | Phase 2 | Complete |
| UX-04 | Phase 2 | Complete |
| UX-05 | Phase 2 | Complete |
| UX-06 | Phase 2 | Complete |
| UX-07 | Phase 2 | Complete |
| UX-08 | Phase 2 | Complete |
| UX-09 | Phase 2 | Complete |
| EXER-01 | Phase 2 | Complete |
| EXER-02 | Phase 2 | Complete |
| EXER-03 | Phase 2 | Complete |
| EXER-04 | Phase 2 | Complete |
| EXER-05 | Phase 2 | Complete |
| EXER-06 | Phase 2 | Complete |
| EXER-07 | Phase 2 | Complete |
| WORK-01 | Phase 3 | Complete |
| WORK-02 | Phase 3 | Complete |
| WORK-03 | Phase 3 | Complete |
| WORK-04 | Phase 3 | Complete |
| WORK-05 | Phase 3 | Complete |
| WORK-06 | Phase 3 | Complete |
| BODY-01 | Phase 4 | Complete |
| BODY-02 | Phase 4 | Complete |
| BODY-03 | Phase 4 | Complete |
| BODY-04 | Phase 4 | Deferred |
| BODY-05 | Phase 4 | Deferred |
| BODY-06 | Phase 4 | Complete |
| HLTH-01 | Phase 5 | Pending |
| HLTH-02 | Phase 5 | Pending |
| HLTH-03 | Phase 5 | Pending |
| HLTH-04 | Phase 5 | Pending |
| HLTH-05 | Phase 5 | Pending |
| HLTH-06 | Phase 5 | Pending |
| HLTH-07 | Phase 5 | Pending |
| HLTH-08 | Phase 5 | Pending |
| HLTH-09 | Phase 5 | Pending |
| HLTH-10 | Phase 5 | Pending |
| GAME-01 | Phase 6 | Pending |
| GAME-02 | Phase 6 | Pending |
| GAME-03 | Phase 6 | Pending |
| GAME-04 | Phase 6 | Pending |
| INTL-01 | Phase 6 | Pending |
| INTL-02 | Phase 6 | Pending |
| INTL-03 | Phase 6 | Pending |
| INTL-04 | Phase 6 | Pending |
| INTL-05 | Phase 6 | Pending |
| INTL-06 | Phase 6 | Pending |
| INTL-07 | Phase 6 | Pending |
| INTL-08 | Phase 6 | Pending |
| INTL-09 | Phase 6 | Pending |
| INTL-10 | Phase 6 | Pending |
| DOCS-01 | Phase 7 | Pending |
| DOCS-02 | Phase 7 | Pending |
| DOCS-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after roadmap creation with 7-phase structure*
