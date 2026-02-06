# Project Research Summary

**Project:** LagomStronk - Fitness App Enhancement
**Domain:** Progressive Web App - Fitness/Workout Tracking
**Researched:** 2026-02-05
**Confidence:** HIGH (Architecture, Stack, Pitfalls) / MEDIUM (Features)

## Executive Summary

LagomStronk is a vanilla JavaScript PWA workout tracker that has outgrown its current architecture. The app has solid fundamentals (workout logging, templates, charts) but faces critical technical constraints: localStorage approaching quota limits, no health platform integration, and a monolithic 960-line app.js that makes adding new features risky. The fitness app market in 2026 has clear expectations: automatic rest timers, PR detection, inline workout history, and gamification are table stakes. Differentiators are intelligence (adaptive workout suggestions) and social engagement, but these require foundational work first.

The research reveals a three-phase approach: **Phase 1 must address technical debt** (storage migration to IndexedDB, architecture refactoring) before adding features. **Phase 2 fills table stakes gaps** (rest timer, PR detection, enhanced UX) to achieve parity with Strong/Hevy. **Phase 3+ adds differentiation** (gamification, health integration, intelligence layer) once foundations are solid. The critical pitfall to avoid is localStorage quota exhaustion, which will break the app suddenly—this must be addressed immediately, before any photo or measurement features.

The recommended stack maintains vanilla JS while adding lightweight modern tools: IndexedDB via `idb` (1.2kB), Motion for animations (2.3kB modular), Health Connect (@capgo/capacitor-health) for Android/iOS integration. Avoid deprecated Google Fit APIs and heavy ML libraries like TensorFlow.js initially. The architecture should migrate from monolithic files to a modular structure with clear separation: core (storage, events), data (workouts, exercises), services (health, photos, intelligence), and UI (views, components).

## Key Findings

### Recommended Stack

**Core findings:** Maintain vanilla JavaScript architecture while adding modern capabilities through lightweight libraries and Capacitor plugins. All recommendations avoid framework lock-in and keep bundle size minimal.

**Core technologies:**
- **Capacitor 8.x**: Native bridge for health integration and photo features (already in use)
- **IndexedDB via idb (1.2kB)**: Replace localStorage for photos and handle quota limits; supports 60% of disk vs localStorage's 5-10MB
- **@capgo/capacitor-health**: Unified API for Health Connect (Android) + HealthKit (iOS); Google Fit deprecated in 2026
- **Motion (2.3kB core)**: Modular animation library for modern UX polish; replaces GSAP's 34kB footprint
- **Dexie.js or idb-keyval**: IndexedDB abstraction layer with schema versioning for easier migrations
- **ExerciseDB API**: 11,000+ exercises with images/videos/GIFs; ship 200 core exercises bundled, fetch rest on-demand

**Critical constraint:** Health platform integration only works through native apps (Android/iOS builds), not PWA-only. Must use Capacitor for Health Connect and HealthKit access.

**Bundle size budget:** Target <200KB total JS. Current ~70KB + recommended libraries = ~150-170KB with all features.

### Expected Features

**Must have (table stakes):**
- **Automatic rest timer**: Universal in all major apps (Strong, Hevy, JEFIT); must work from lock screen with media controls
- **Exercise history inline**: Shows "Last: 225 x 8" when logging new set; eliminates guesswork during workouts
- **PR detection & celebration**: Automatic detection of heaviest weight, most reps, best volume, 1RM improvement with immediate feedback
- **Progress charts per exercise**: Weight over time, volume trends, rep PRs with 30d/3m/1y/all filters
- **Body weight tracking**: Simple line chart with weekly/monthly views; expected in all fitness apps
- **Enhanced exercise search/filter**: By muscle group, equipment, exercise type with autocomplete

**Should have (competitive edge):**
- **Workout streak tracker**: Simple but effective motivation; 5 workouts per week format vs daily to allow rest
- **Badge/achievement system**: Personal progress milestones (10 workouts, 50 workouts, 1 year) with confetti celebrations
- **Workout insights/analytics**: Surface hidden wins like "10% faster recovery than last month"
- **Smart rest timer**: Adapts rest based on exercise type (30-90s hypertrophy, 2-5min strength)
- **Muscle group visualization**: Heatmap showing which muscles worked this week; flag undertrained areas

**Defer (v2+):**
- **AI workout adaptation**: Requires 30+ workouts per user minimum; start with rule-based heuristics first
- **Social feed**: Needs backend infrastructure for user accounts, follows, comments
- **3D body scanning**: High complexity, requires advanced device features and camera APIs
- **Conversational AI coach**: Requires LLM integration with ongoing API costs

**Anti-features (do NOT build):**
- Static workout plans that never adapt (causes 45% drop-off)
- Complex onboarding with 10+ profile questions (cognitive overload kills activation)
- Automatic social sharing to external platforms (privacy violation)
- Generic 1000+ exercise library without curation (maintenance burden, poor UX)

### Architecture Approach

**Current state:** Clean modular pattern with app.js (960 lines UI), data.js (703 lines state), charts.js (178 lines viz). Strengths: ES6 modules, clear UI/state separation. Constraints: app.js approaching 1000-line threshold, localStorage limited to 5-10MB, no abstraction for platform features.

**Recommended structure:** Migrate to feature-based modules with clear layers:

**Major components:**
1. **Core layer** (storage.js, eventBus.js, state.js) — Storage abstraction with localStorage→IndexedDB migration path; pub/sub event bus for gamification; Proxy-based reactive state management
2. **Data layer** (workouts.js, exercises.js, measurements.js) — Extract from monolithic data.js; CRUD operations with event emission for side effects
3. **Services layer** (health/healthAdapter.js, photos/photoManager.js, intelligence/recommender.js, gamification/achievements.js) — Platform-specific code isolated behind facades; health integration uses adapter pattern for iOS/Android differences
4. **UI layer** (views/*, components/*) — Extract rendering from app.js to separate view modules; reusable components for search, photo capture, badges

**Key patterns to follow:**
- **Facade pattern** for health integration (unified interface for HealthKit/Health Connect differences)
- **Proxy-based reactive state** for automatic UI updates without manual render calls
- **Event bus** for gamification triggers (workouts publish events, achievements subscribe)
- **Storage abstraction layer** for localStorage→IndexedDB migration without rewriting calling code
- **IndexedDB for photos** with metadata in localStorage (hybrid approach prevents quota issues)

**Data flow:** Unidirectional UI → State → Data modules → Storage; Event-driven side effects for achievements/notifications; Storage abstraction for persistence layer

### Critical Pitfalls

1. **localStorage Quota Exhaustion Without Migration Path** — Hard 5-10MB limit causes silent write failures; users hit this suddenly with photos/measurements; app breaks mid-workout. **Avoidance:** Monitor usage at 70% capacity, implement IndexedDB migration BEFORE adding photos, use idb-keyval or localForage for abstraction layer. **Phase:** Phase 1-2, URGENT if current data >3MB.

2. **Google Fit Integration (Deprecated 2026)** — Google Fit APIs fully deprecated Q2 2026; apps still using it will break completely. Health Connect is mandatory replacement with different data models, permissions, APIs. **Avoidance:** Never start Google Fit integrations; use Health Connect (Android) + HealthKit (iOS) from day one via @capgo/capacitor-health plugin. **Phase:** Phase 1-2 if planning health integration.

3. **Breaking Existing Users During UX Modernization** — Changing localStorage keys, data schemas, or core workflows without migration logic causes data loss. **Avoidance:** Implement data continuity as non-negotiable; test with production-like datasets (1 day, 1 month, 1+ year of data); parallel implementation during transitions; never silently discard unreadable data. **Phase:** Every phase touching data storage.

4. **Privacy/Security Naivety for Body Photos** — Body photos deeply personal; storing as base64 in localStorage or unencrypted cloud storage exposes catastrophic breach risk. 80% of fitness apps share data with third parties. **Avoidance:** Never use localStorage for photos; use IndexedDB with encryption or device-native storage; explicit granular consent; consider local-only feature (no cloud sync). **Phase:** Before implementing photos (Phase 3-4).

5. **Health Platform Data Model Mismatches** — Apple Health, Health Connect use different units, timestamp formats, permission models; naive integration causes duplicate workouts, wrong step counts, calorie errors of 16-34%. **Avoidance:** Normalize data immediately on import (store UTC timestamps, standard units); implement deduplication logic (same workout within 5-min window); let user resolve conflicts manually; add disclaimer on calorie estimates (±15-30% error). **Phase:** Phase 2-3 health integration.

## Implications for Roadmap

Based on research, suggested phase structure addresses technical foundations before feature expansion:

### Phase 1: Technical Foundation & Storage Migration
**Rationale:** URGENT—localStorage approaching limits will break app suddenly. Must fix before adding photos or measurements. Current architecture constrains feature velocity; refactoring enables parallel development.

**Delivers:**
- Storage abstraction layer (localStorage → IndexedDB migration path)
- Event bus infrastructure for decoupled features
- Core utilities (search, validation)
- Monitor storage usage (warn at 70% capacity)
- Data export functionality (JSON/CSV)

**Addresses:**
- Critical Pitfall #1 (localStorage quota exhaustion)
- Critical Pitfall #3 (data continuity for future migrations)
- Architecture constraint (enables modular feature development)

**Stack elements:** idb/idb-keyval (1.2kB), Proxy-based state management (vanilla JS)

**Research flag:** Standard patterns; well-documented. Skip dedicated research phase.

---

### Phase 2: Table Stakes UX Modernization
**Rationale:** Achieve parity with Strong/Hevy baseline. Users expect these features; missing any creates "incomplete" perception. Low-complexity, high-impact wins that establish modern UX patterns.

**Delivers:**
- Automatic rest timer (with lock screen controls)
- Exercise history inline during logging ("Last: 225 x 8")
- PR detection & celebration (with Motion animations)
- Enhanced exercise search/filter (Fuse.js for fuzzy matching)
- Body weight tracking (simple line chart)
- Progress charts per exercise (extend existing Chart.js usage)

**Addresses:**
- FEATURES.md table stakes (6 must-have features identified)
- Pitfall #11 (avoid over-tracking; keep logging flow 30-60s per exercise)
- Pitfall #12 (calorie burn disclaimer if displaying)

**Stack elements:**
- Motion (2.3kB) for PR celebration animations
- Fuse.js (3kB) for fuzzy exercise search
- Chart.js (already installed) extended usage

**Research flag:** Standard patterns for rest timers, search/filter. Skip dedicated research phase.

---

### Phase 3: Exercise System & Data Layer Refactoring
**Rationale:** Exercise database and search are foundation for recommendations and intelligence features. Refactoring data.js enables parallel feature development going forward.

**Delivers:**
- Extract data.js → workouts.js, exercises.js modules
- Exercise database with bundled core 200 exercises
- ExerciseDB API integration (11K+ exercises on-demand)
- Advanced exercise filtering (muscle group, equipment, type)
- Exercise library view modernization
- Custom exercise creation

**Addresses:**
- Pitfall #6 (exercise database completeness trap—start with user-generated + curated core)
- Architecture constraint (monolithic data.js at 703 lines)
- Feature dependency for intelligence layer

**Stack elements:**
- ExerciseDB API (AGPL-3.0, verify pricing before production)
- Fuse.js for search (from Phase 2)

**Research flag:** **NEEDS RESEARCH** — ExerciseDB API pricing, rate limits, alternative fallbacks (wger).

---

### Phase 4: Gamification & Engagement
**Rationale:** Once technical foundations solid and table stakes complete, add differentiation through motivation systems. Leverages event bus from Phase 1 for clean implementation.

**Delivers:**
- Workout streak tracker (5 per week format with rest day logic)
- Achievement/badge system (personal milestones: 10, 50, 100 workouts, 1 year, etc.)
- Level/XP progression system
- PR celebration enhancements (confetti, achievement notifications)
- Workout insights ("10% faster recovery", "undertrained muscle groups")
- Progressive onboarding flow (state machine pattern)

**Addresses:**
- FEATURES.md differentiators (streaks, badges, insights)
- Pitfall #7 (gamification burnout—build in rest days, avoid dark patterns, 48hr grace period)
- Pitfall #11 (over-tracking—make advanced metrics optional)

**Stack elements:**
- canvas-confetti (10kB) for celebration effects
- Custom JSON achievement definitions (no library needed)
- OnboardingStateMachine (vanilla JS pattern)

**Research flag:** **NEEDS RESEARCH** — User psychology, gamification patterns specific to fitness domain, A/B testing framework.

---

### Phase 5: Photo Storage & Body Measurements
**Rationale:** Requires IndexedDB from Phase 1. High privacy sensitivity demands careful implementation. Differentiator feature that complements workout tracking.

**Delivers:**
- Photo capture via Capacitor Camera plugin
- IndexedDB photo blob storage (separate from workout data)
- Body measurements with photo references
- Progress photo comparison view
- Photo privacy controls and deletion

**Addresses:**
- FEATURES.md body tracking feature
- Critical Pitfall #4 (privacy/security—IndexedDB with encryption, explicit consent, never localStorage)
- Pitfall #5 (storage quota—photos in separate IndexedDB store)

**Stack elements:**
- @capacitor/camera (official plugin)
- @capacitor/filesystem (permanent storage)
- idb for photo blob storage
- IndexedDB encryption library (research needed)

**Research flag:** **NEEDS DEEP RESEARCH** — Client-side encryption libraries, GDPR compliance specifics, photo storage architecture, CDN selection if cloud backup.

---

### Phase 6: Health Platform Integration
**Rationale:** Deferred until core features solid. High complexity with platform fragmentation. Requires native builds (Android/iOS), not PWA-only. Differentiator for users with wearables.

**Delivers:**
- Health adapter abstraction (facade pattern)
- Health Connect integration (Android 9+)
- HealthKit integration (iOS 14+)
- Permission request flow
- Workout data sync (app → health platforms)
- Step count, heart rate, calories import (health platforms → app)
- Graceful degradation for unsupported devices

**Addresses:**
- FEATURES.md health integration feature
- Critical Pitfall #2 (Google Fit deprecated—use Health Connect only)
- Critical Pitfall #5 (data model mismatches—normalize immediately, handle units/timestamps)

**Stack elements:**
- @capgo/capacitor-health (unified Android/iOS API)
- Health Connect SDK 1.2.0-alpha02 (Android)
- HealthKit iOS 14+ (via Capacitor plugin)

**Research flag:** **NEEDS DEEP RESEARCH** — Health Connect API specifics, permission models, data type mappings, deduplication strategies, unit normalization, device testing requirements.

---

### Phase 7: Intelligence Layer (Rule-Based Recommendations)
**Rationale:** Only after substantial user data collected (30+ workouts minimum). Start with simple heuristics, not ML. Differentiator that provides adaptive value without complexity.

**Delivers:**
- Recommendation engine (rule-based scoring)
- Workout suggestions based on:
  - Muscle group balance (flag undertrained areas)
  - Exercise recency (days since last performed)
  - Progressive overload (suggest weight increase when rep targets hit 2x)
  - Rest day logic (no same muscle group within 48hrs)
- "Smart workout" generator
- Muscle group heatmap visualization
- Analytics extraction from data.js

**Addresses:**
- FEATURES.md intelligence differentiators
- Pitfall #8 (recommendation without data—require 30+ workouts, use heuristics before ML)
- Anti-feature (static plans that never adapt)

**Stack elements:**
- Custom recommendation scoring algorithm (vanilla JS, ~100-200 lines)
- Chart.js for muscle heatmap
- NO TensorFlow.js (defer to v2+; saves 2.3MB bundle)

**Research flag:** **Standard patterns** — Rule-based recommendation algorithms well-documented for fitness domain. Skip dedicated research.

---

### Phase 8: Advanced Features (v2+)
**Deferred features requiring significant complexity, infrastructure, or scale:**

- **Social feed & activity sharing** — Requires backend, user accounts, moderation
- **AI workout adaptation (ML-based)** — Requires TensorFlow.js (2.3MB), 6+ months user data
- **3D body scanning** — Requires iPhone X+, complex CV models
- **Conversational AI coach** — Requires LLM API integration, ongoing costs
- **Real-time form feedback** — Requires device sensors/camera, high complexity ML

**Rationale:** High complexity or infrastructure dependencies not justified for initial launch. Revisit based on user feedback and product-market fit validation.

---

### Phase Ordering Rationale

**Why this order:**
1. **Technical debt first** — Storage migration (Phase 1) is URGENT and blocks photos/measurements. Addressing now prevents catastrophic failures.
2. **Table stakes before differentiation** — Phase 2 achieves parity with competitors before adding unique features. Missing rest timer/PR detection creates "incomplete" perception.
3. **Foundation before advanced** — Exercise database (Phase 3) required for recommendations (Phase 7). Event bus (Phase 1) enables clean gamification (Phase 4).
4. **Privacy-sensitive features isolated** — Photos (Phase 5) and health integration (Phase 6) have dedicated phases for proper research and implementation rigor.
5. **Data-dependent features last** — Intelligence layer (Phase 7) requires user workout history; defer until sufficient data collected.

**Dependency chains:**
- Phase 1 (storage) → Phase 5 (photos)
- Phase 1 (events) → Phase 4 (gamification)
- Phase 3 (exercise data) → Phase 7 (recommendations)
- Phase 1 (foundations) → ALL subsequent phases

**Risk mitigation:**
- Phase 1 addresses Critical Pitfall #1 (localStorage quota) immediately
- Phase 2 derisks UX before adding complexity
- Phases 5-6 have deep research flags for privacy/security rigor
- Phase 7+ deferred until product-market fit validated

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 3 (Exercise System):** ExerciseDB API pricing/rate limits for production; alternative fallbacks (wger); bundling strategy for core exercises
- **Phase 4 (Gamification):** User psychology research specific to fitness; gamification patterns that avoid burnout; A/B testing framework selection
- **Phase 5 (Photos):** Client-side encryption libraries; GDPR/CCPA compliance specifics; photo storage architecture deep dive; CDN selection for cloud backup
- **Phase 6 (Health Integration):** Health Connect API detailed mapping; permission model differences vs Google Fit; unit normalization strategies; device testing requirements; deduplication logic

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Storage abstraction, event bus, search utilities — well-documented PWA patterns
- **Phase 2 (Table Stakes):** Rest timer, PR detection, charts — established UX patterns in fitness apps
- **Phase 7 (Intelligence):** Rule-based recommendations — fitness domain has clear heuristics; defer ML complexity

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | All technologies verified from official sources (Capacitor docs, MDN, plugin GitHub repos). Bundle sizes confirmed. Health Connect deprecation of Google Fit verified from Android Developer docs. |
| **Features** | **MEDIUM** | Based on competitor analysis (Strong, Hevy, JEFIT, Fitbod) via WebSearch 2026 sources. Feature priorities validated across multiple fitness app comparisons. User value scoring needs validation via user research. |
| **Architecture** | **HIGH** | Patterns verified from PWA best practices (web.dev), vanilla JS state management articles, IndexedDB guides (MDN official). Migration strategies documented in multiple sources. |
| **Pitfalls** | **HIGH** | Critical pitfalls verified from official documentation (MDN localStorage limits, Android Health Connect migration guide). Privacy concerns validated from multiple credible sources. Gamification burnout research from academic sources. |

**Overall confidence:** **HIGH** for technical implementation; **MEDIUM** for feature prioritization

### Gaps to Address

**Gaps requiring validation during implementation:**

1. **ExerciseDB API production pricing**: Free tier rate limits unknown; need to verify before launch. **Mitigation:** Research in Phase 3 planning; prepare wger API fallback; bundle 200 core exercises for offline use.

2. **User feature priorities**: Research based on competitor analysis, not LagomStronk user research. **Mitigation:** Implement analytics in Phase 2 to track feature usage; A/B test feature prominence; collect user feedback via in-app surveys.

3. **Health Connect adoption lag**: Android 9+ required, but adoption on older devices unknown. **Mitigation:** Detect availability, provide manual entry fallback, communicate requirements clearly during onboarding.

4. **IndexedDB performance on low-end Android**: Quota and performance on budget devices uncertain. **Mitigation:** Device testing during Phase 1; implement pagination for large datasets; monitor performance metrics.

5. **Recommendation algorithm tuning**: Scoring weights are initial estimates. **Mitigation:** A/B test different scoring functions in Phase 7; collect feedback on recommendation relevance; iterate based on data.

6. **Photo encryption overhead**: Client-side encryption impact on photo load times unknown. **Mitigation:** Benchmark during Phase 5 research; consider optional encryption (local-only vs cloud-synced); progressive enhancement.

7. **Gamification engagement vs burnout balance**: Initial streak/badge design may need tuning. **Mitigation:** Phase 4 research includes user psychology; implement analytics to detect overtraining patterns; add "pause streak" feature.

**How to handle:**
- Phase planning should include dedicated research spikes for flagged gaps
- Implement feature flags for risky features (easy rollback)
- Build telemetry for data-dependent decisions (recommendation tuning, gamification effectiveness)
- Maintain user feedback channels (in-app, Discord, Reddit)

## Sources

### Primary (HIGH confidence)

**Architecture & Technical:**
- [PWA Offline Data - web.dev](https://web.dev/learn/pwa/offline-data) — Official PWA storage guidance
- [Storage Quotas and Eviction Criteria - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — Official localStorage limits
- [Health Connect Android Official Docs](https://developer.android.com/health-and-fitness/health-connect) — Health platform integration
- [Google Fit Migration Guide - Android Developers](https://developer.android.com/health-and-fitness/health-connect/migration/fit) — Official deprecation notice
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit) — iOS health integration
- [@capgo/capacitor-health GitHub](https://github.com/Cap-go/capacitor-health/) — Plugin verification
- [Capacitor Official Documentation](https://capacitorjs.com/) — Platform capabilities
- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — Storage specifications

**Stack Technologies:**
- [Motion Official Site](https://motion.dev/) — Animation library
- [Dexie.js Official Site](https://dexie.org/) — IndexedDB wrapper
- [idb GitHub](https://github.com/jakearchibald/idb) — IndexedDB promise wrapper
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) — Celebration effects
- [ExerciseDB API GitHub](https://github.com/ExerciseDB/exercisedb-api) — Exercise database

### Secondary (MEDIUM confidence)

**Features & UX:**
- [Strong App Review 2026](https://www.prpath.app/blog/strong-app-review-2026.html) — Competitor analysis
- [Strong vs Hevy Comparison 2026](https://gymgod.app/blog/strong-vs-hevy) — Feature comparison
- [10 Best Workout Tracker Apps 2026](https://www.jefit.com/wp/general-fitness/10-best-workout-tracker-apps-in-2026-complete-comparison-guide/) — Market analysis
- [Hevy Workout App Review 2024](https://www.hotelgyms.com/blog/hevy-workout-app-review-the-up-and-comer-taking-the-fitness-world-by-storm) — UX patterns
- [Fitness App UI/UX Design](https://stormotion.io/blog/fitness-app-ux/) — Design principles
- [Gamification in Fitness Apps](https://www.glofox.com/blog/fitness-gamification/) — Engagement patterns
- [Best AI Fitness Apps 2026](https://fitbod.me/blog/best-ai-fitness-apps-2026-the-complete-guide-to-ai-powered-muscle-building-apps/) — Intelligence features

**Pitfalls & Privacy:**
- [Fitness App Development Mistakes 2026](https://www.resourcifi.com/fitness-app-development-mistakes-avoid/) — Common errors
- [Why Fitness Apps Fail](https://apidots.com/blog/why-fitness-apps-fail-and-how-to-build-successful-fitness-apps/) — Failure patterns
- [80% of Fitness Apps Selling User Privacy](https://www.techradar.com/computing/cyber-security/beware-80-percent-of-the-most-popular-fitness-apps-are-selling-out-your-privacy) — Privacy risks
- [HIPAA and GDPR Compliance for Health Apps](https://llif.org/2025/01/31/hipaa-gdpr-compliance-health-apps/) — Regulatory guidance
- [Fitness Tracker Calorie Accuracy Issues](https://www.nbcnews.com/better/diet-fitness/your-apple-watch-or-fitbit-making-you-fat-n764066) — Measurement limitations

**Architecture Patterns:**
- [PWA with Vanilla JS - GitHub](https://github.com/ibrahima92/pwa-with-vanilla-js) — Reference implementation
- [Modern State Management in Vanilla JavaScript 2026](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5) — Proxy patterns
- [Offline File Sync Developer Guide 2024](https://daily.dev/blog/offline-file-sync-developer-guide-2024) — Sync strategies
- [TypeScript CRDT Toolkits](https://medium.com/@2nick2patel2/typescript-crdt-toolkits-for-offline-first-apps-conflict-free-sync-without-tears-df456c7a169b) — Conflict resolution

### Tertiary (LOW confidence - needs validation)

- ExerciseDB API v2 pricing for production (unverified)
- User retention statistics from blog posts (not primary research)
- Specific bundle size impacts on user engagement (correlational only)

---

**Research completed:** 2026-02-05
**Ready for roadmap:** Yes
**Next step:** Requirements definition and detailed phase planning with research spikes for Phases 3-6
