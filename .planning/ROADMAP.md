# Roadmap: LagomStronk

## Overview

This roadmap transforms LagomStronk from a functional workout tracker into an intelligent fitness companion. The journey addresses critical technical foundations first (storage migration, architecture refactoring), then fills table stakes gaps (rest timer, PR detection, exercise system), and finally adds differentiation through body tracking, health platform integration, and intelligence features. Each phase delivers complete, verifiable user value while building toward a feature set that makes strength training feel effortless.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Technical Foundation** - Storage abstraction and event infrastructure
- [x] **Phase 2: UX Overhaul & Exercise System** - Modern interface and enhanced exercise management
- [x] **Phase 3: Workout Features** - Rest timer, PR tracking, and training programs
- [x] **Phase 4: Body Tracking** - Measurements and progress photos
- [ ] ~~**Phase 5: Health Integration**~~ - DEFERRED (requires Capacitor/native wrapper)
- [x] **Phase 6: Gamification & Intelligence** - Engagement systems and adaptive recommendations
- [ ] **Phase 7: Documentation** - Polish and release preparation

## Phase Details

### Phase 1: Technical Foundation
**Goal**: Establish robust storage infrastructure and decoupled architecture that enables future features without technical debt
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03
**Success Criteria** (what must be TRUE):
  1. Storage abstraction layer exists that supports both localStorage and IndexedDB
  2. Current workout data migrates to new storage layer without data loss
  3. Storage monitoring warns users at 70% capacity with actionable guidance
  4. Event bus enables features to communicate without direct coupling
  5. Developer can add new features using event subscriptions without modifying core modules
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Core infrastructure (event bus + storage abstraction)
- [x] 01-02-PLAN.md — Migration system (localStorage to IndexedDB)
- [x] 01-03-PLAN.md — Storage monitoring and toast notifications
- [x] 01-04-PLAN.md — Integration and app initialization

### Phase 2: UX Overhaul & Exercise System
**Goal**: Achieve parity with modern fitness apps and provide comprehensive exercise management
**Depends on**: Phase 1
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09, EXER-01, EXER-02, EXER-03, EXER-04, EXER-05, EXER-06, EXER-07
**Success Criteria** (what must be TRUE):
  1. User sees modern landing screen with workout streak, weekly volume chart, and upcoming workout suggestion
  2. User sees recent PRs displayed prominently on dashboard
  3. User can exit or cancel active workout from any screen
  4. User sees previous set values as greyed-out hints during workout logging
  5. User experiences satisfying checkmark animations when completing sets
  6. User can view workout history in calendar format
  7. User can filter exercises by muscle group and equipment type
  8. User sees exercise cards with placeholder for muscle highlight images
  9. User can create custom exercises with muscle group and equipment metadata
  10. User accesses dedicated exercise library view with search and favorites
  11. User sees recently used exercises for quick access
**Plans**: 11 plans

Plans:
- [x] 02-01-PLAN.md — Dashboard hero section (streak, calendar, stat cards)
- [x] 02-02-PLAN.md — Exercise metadata model (muscle groups, equipment, filtering)
- [x] 02-03-PLAN.md — Volume chart with gradient
- [x] 02-04-PLAN.md — Custom numpad component
- [x] 02-05-PLAN.md — Exercise library UI (filter, search, favorites)
- [x] 02-06-PLAN.md — Workout logging UX (hints, animations, confetti)
- [x] 02-07-PLAN.md — Workout history calendar
- [x] 02-08-PLAN.md — Mini-player and workout flow
- [x] 02-09-PLAN.md — Custom exercise wizard
- [x] 02-10-PLAN.md — Gap closure: Workout screen architecture (UAT-001, UAT-005)
- [x] 02-11-PLAN.md — Gap closure: Numpad fixes and animation polish (UAT-002, UAT-003, UAT-004)

### Phase 3: Workout Features
**Goal**: Add table stakes workout capabilities that competitive apps provide
**Depends on**: Phase 2
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06
**Success Criteria** (what must be TRUE):
  1. User can start configurable rest timer that works from lock screen with media controls
  2. User sees inline exercise history showing previous workout values during set logging
  3. System automatically detects PRs for weight, reps, volume, and 1RM
  4. User experiences celebration animations when achieving new PRs
  5. User sees plate calculator showing which plates to load for target weight
  6. User can follow multi-week training programs including PPL, 5x5, and custom programs
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Training programs data model
- [x] 03-02-PLAN.md — Program selection UI and dashboard integration
- [x] 03-03-PLAN.md — Coach intelligence (progressive overload hints)
- [x] 03-04-PLAN.md — PR detection with celebration animations
- [x] 03-05-PLAN.md — Rest timer with media session controls

### Phase 4: Body Tracking
**Goal**: Enable comprehensive body progress tracking with measurements and photos
**Depends on**: Phase 1 (storage infrastructure required)
**Requirements**: BODY-01, BODY-02, BODY-03, BODY-04, BODY-05, BODY-06
**Success Criteria** (what must be TRUE):
  1. User can log body weight with chart visualization over time
  2. User can record muscle measurements for bicep, chest, waist, thigh with history
  3. User sees trend charts for all measurements showing progress over time
  4. User can capture progress photos stored securely in IndexedDB
  5. User can view progress photos in timeline format
  6. User can compare photos side-by-side or with overlay view
  7. User can manually track body composition data including body fat percentage and muscle mass
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Body tracking data model + weight tracking UI (hero)
- [x] 04-02-PLAN.md — Muscle measurements + body fat % tracking

### Phase 5: Health Integration — DEFERRED
**Goal**: Sync workout and body data with native health platforms on Android and iOS
**Status**: DEFERRED — Requires Capacitor/native wrapper for Health Connect and HealthKit API access. Will be revisited when project moves to native app distribution.
**Depends on**: Phase 1 (event infrastructure), Phase 4 (body data to sync), Capacitor integration
**Requirements**: HLTH-01, HLTH-02, HLTH-03, HLTH-04, HLTH-05, HLTH-06, HLTH-07, HLTH-08, HLTH-09, HLTH-10

### Phase 6: Gamification & Intelligence
**Goal**: Add engagement systems and adaptive intelligence that makes training effortless
**Depends on**: Phase 2 (exercise system), Phase 3 (workout data for recommendations)
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, INTL-01, INTL-02, INTL-03, INTL-04, INTL-05, INTL-06, INTL-07, INTL-08, INTL-09, INTL-10
**Success Criteria** (what must be TRUE):
  1. User sees workout streak tracker with 5 per week target and rest day logic
  2. User accesses dedicated PR feed celebrating all personal records
  3. User earns badges for milestones including 10, 50, 100 workouts and streak achievements
  4. User experiences streak milestone celebrations with confetti animations
  5. User completes onboarding flow that captures goals, experience, preferences, and equipment
  6. User receives exercise recommendations based on workout history and goals
  7. User sees training split suggestions tailored to their profile
  8. User gets balance alerts when muscle groups are undertrained
  9. User receives progressive overload hints suggesting weight increases
  10. User sees recovery insights showing muscle recovery status
  11. User sees workout quality score based on completion rate and PRs
  12. User receives trend analysis showing progress over time
  13. User sees muscle heatmap visualization showing weekly training distribution
  14. User gets fatigue detection warnings to prevent overtraining
**Plans**: 5 plans

Plans:
- [x] 06-01-PLAN.md — Onboarding & user profile wizard
- [x] 06-02-PLAN.md — Gamification (streaks with rest day logic, badges, celebrations)
- [x] 06-03-PLAN.md — PR feed timeline in Progress view
- [x] 06-04-PLAN.md — Intelligence engine (recommendations, splits, recovery, fatigue)
- [x] 06-05-PLAN.md — Insights dashboard (quality scores, trends, muscle heatmap)

### Phase 7: Documentation
**Goal**: Prepare polished documentation for public release and contributors
**Depends on**: Phase 6 (all features complete)
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. README includes screenshots and comprehensive feature overview
  2. User guide documentation exists covering all major features
  3. Architecture documentation exists for potential contributors
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → ~~5~~ → 6 → 7 (Phase 5 deferred)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Technical Foundation | 4/4 | Complete | 2026-02-05 |
| 2. UX Overhaul & Exercise System | 11/11 | Complete | 2026-02-06 |
| 3. Workout Features | 5/5 | Complete | 2026-02-06 |
| 4. Body Tracking | 2/2 | Complete | 2026-02-06 |
| 5. Health Integration | - | DEFERRED | - |
| 6. Gamification & Intelligence | 5/5 | Complete | 2026-02-09 |
| 7. Documentation | 0/TBD | Not started | - |
