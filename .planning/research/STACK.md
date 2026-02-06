# Technology Stack

**Project:** LagomStronk - Fitness App Enhancement
**Researched:** 2026-02-05
**Confidence:** MEDIUM-HIGH

## Executive Summary

This stack maintains vanilla JavaScript architecture while adding modern fitness capabilities through Capacitor plugins, lightweight libraries, and APIs. Health platform integration requires Capacitor native bridge (no direct web API access exists). All recommendations are vanilla JS compatible - no framework dependencies.

## Recommended Stack

### Core Platform (Existing)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JavaScript | ES2022+ | Core application logic | Already in use. Modern features (async/await, modules, optional chaining) work without transpilation in 2026 browsers |
| Capacitor | 8.x | Native bridge for mobile features | **UPGRADE NEEDED** - Current v8.0.2 is latest. Required for Health Connect integration. Requires Node.js 22+ |
| IndexedDB | Native API | Primary data storage | Browser native, no dependencies, handles structured data + blobs for images |
| Chart.js | 4.5.1 | Data visualization | Already in use. Latest stable version. ESM + UMD bundles available |

**Confidence:** HIGH (all verified from official sources)

### Health Platform Integration
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @capgo/capacitor-health | 8.x | Health Connect + HealthKit bridge | Unified API for Android/iOS. Actively maintained. Supports Health Connect (replaces deprecated Google Fit). Requires Capacitor 8+ |
| Health Connect SDK | 1.2.0-alpha02 | Android health data (via Capacitor) | Google's official replacement for Fit API (deprecated 2026). Framework module in Android 14+, backward compatible to Android 8 |
| Apple HealthKit | iOS 14+ | iOS health data (via Capacitor) | iOS-only. Requires native bridge. NO web API exists |

**Why @capgo/capacitor-health:**
- Unified TypeScript API across platforms (same units, same data types)
- Supports 10 core metrics: steps, distance, calories, heart rate, weight, sleep, respiratory rate, O2 saturation, resting HR, HRV
- Read + write capabilities (workouts read-only)
- Actively maintained for Capacitor 8
- Alternative (capacitor-health-extended) requires Node.js 22+ and less mature

**Critical constraint:** Health platform integration ONLY works through native apps (Android/iOS). PWA web-only cannot access HealthKit or Health Connect. Must use Capacitor build.

**Confidence:** HIGH (verified from official Android/iOS docs and GitHub repositories)

### Exercise Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ExerciseDB API | v2 | Exercise library with images/videos | 11,000+ exercises, 20,000+ images, 15,000+ videos, 5,000+ GIFs. Includes muscle groups, equipment, instructions, male/female demos. AGPL-3.0 license |
| Local JSON fallback | - | Offline exercise database | Core exercises cached locally. ExerciseDB for extended library |

**Why ExerciseDB over wger:**
- ExerciseDB: Rich media (videos, GIFs, images), structured JSON, 11K+ exercises, commercial-friendly API plans
- wger: Open source, good for self-hosted, but requires API key + rate limiting for public endpoints, less rich media

**Alternative considered:** wger (AGPLv3, free API, 2M+ foods) - better for nutrition tracking, less for exercise imagery.

**Confidence:** MEDIUM-HIGH (ExerciseDB verified from GitHub, WebSearch confirmed features. Need to verify v2 pricing for production)

### Animation Libraries
| Library | Version | Bundle Size | Purpose | When to Use |
|---------|---------|-------------|---------|-------------|
| Motion | 12.27.5 | 2.3kb-34kb (modular) | Core animations, gestures, scroll effects | Primary animation library. Hybrid engine (120fps). Import only what you need: `animate()` mini = 2.3kb, domAnimation = +15kb, domMax = +25kb |
| canvas-confetti | 1.9.4 | ~10kb min | Celebration effects | Achievement unlocks, PR celebrations. ISC license. Zero dependencies. CDN available |
| CSS Animations | Native | 0kb | Simple transitions | Button hovers, loading states. Use first before JS |

**Why Motion over GSAP/Anime.js:**
- Motion: Modular (start at 2.3kb), vanilla JS support, MIT-like license (free for all since Webflow sponsorship), modern API
- GSAP: Now free (Webflow backed), robust, 34kb+, more complex API
- Anime.js: 24.5kb, older API patterns, less active development

**Recommendation:** Use Motion for 90% of animations. Add canvas-confetti for gamification moments. Reserve GSAP only if Motion can't handle complex SVG morphing.

**Confidence:** HIGH (all versions verified, bundle sizes from official sources)

### Photo Storage & Comparison
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @capacitor/camera | 6.x | Photo capture + gallery access | Official Capacitor plugin. Uses Android Photo Picker on Android 11+. Returns URI, Base64, or DataUrl |
| @capacitor/filesystem | 6.x | Permanent photo storage | Convert camera URI to base64, save to filesystem. Required for offline access |
| Dexie.js | 4.x | IndexedDB wrapper for image metadata | 4.3.0 stable. Simpler API than raw IndexedDB. Stores image metadata + file paths. Blob support built-in. Apache 2.0 license |

**Photo storage strategy:**
1. Camera API captures photo (returns URI)
2. Filesystem API saves to app directory (permanent storage)
3. Dexie stores metadata (date, exercise, measurements) + file path reference
4. IndexedDB can store thumbnail blobs (small) for fast loading

**Why Dexie over raw IndexedDB:**
- Cleaner async/await API (no callback hell)
- Automatic schema versioning
- Query performance optimizations
- Battle-tested (100K+ sites use it)
- 0 dependencies for core

**Alternative:** Store images as base64 in IndexedDB directly. Simpler but less performant for large images.

**Confidence:** HIGH (Capacitor official docs, Dexie verified from official site)

### Recommendation Algorithms (Local)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| Custom implementation | - | Workout recommendations | Simple heuristics: rest time, muscle group rotation, progressive overload. No ML needed initially |
| likely.js | 2.x | Collaborative filtering (future) | If adding social features. Last updated 3 years ago - verify maintenance before use |
| TensorFlow.js | 4.x | ML-based recommendations (future) | For advanced personalization. 2.3MB+ library. Defer to v2+ |

**Recommendation approach for MVP:**
1. **Rule-based (do this first):**
   - Suggest exercises targeting undertrained muscle groups (track volume per group)
   - Progressive overload: suggest weight +2.5% when user hits rep target 2 weeks in row
   - Rest day recommendations: no same muscle group 48hrs
   - Exercise variety: rotate exercises every 4-6 weeks

2. **Statistical (v2):**
   - Analyze user's workout patterns (frequency, volume, progression rate)
   - Identify correlations (e.g., "users who do X also do Y")
   - Detect plateaus (no progression in 4 weeks = recommend deload or variation)

3. **ML-based (v3, defer):**
   - TensorFlow.js for browser-based training
   - Requires significant data (6+ months of workouts)
   - 2MB+ bundle size impact

**Why NOT TensorFlow.js in MVP:**
- 2.3MB minimum bundle size
- Requires 6+ months of user data to train effectively
- Rule-based recommendations work well for fitness (proven by Strong, Fitbod)
- Can add later without architecture changes

**Confidence:** MEDIUM (likely.js last updated 2023, may be unmaintained. Rule-based approach HIGH confidence from fitness domain knowledge)

### Gamification
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| Custom badge system | - | Achievements, streaks, milestones | Simple localStorage/Dexie JSON. Full control over design |
| canvas-confetti | 1.9.4 | Visual celebrations | Already listed in animations. Trigger on achievements |

**Gamification elements to build:**
- **Achievements:** Stored as JSON in Dexie (name, description, icon, unlockDate, progress)
- **Streaks:** Calculate from workout history (consecutive days/weeks)
- **Leaderboards:** Personal PRs only (no social features in v1)
- **Progress badges:** Auto-unlock based on milestones (first workout, 10kg PR, 100 workouts, etc.)

**Why custom over library:**
- Most gamification libraries are server-based (not suited for local-first PWA)
- Simple JSON structure + confetti animation = 99% of the UX value
- Badge UI is just CSS + SVG icons

**External badges considered:**
- gamify.js: Last updated 2018, unmaintained
- BadgeUp: Cloud service, requires backend
- Open Badge standard: Over-engineered for fitness app

**Confidence:** HIGH (gamification patterns are well-established, no complex library needed)

### Calculation Utilities
| Purpose | Implementation | Why |
|---------|---------------|-----|
| 1RM estimation | Custom functions (Epley, Brzycki) | Simple formulas: Epley = `weight * (1 + 0.0333 * reps)`, Brzycki = `weight / (1.0278 - 0.0278 * reps)`. 5 lines of code each |
| Volume calculations | Custom functions | Total volume = sets * reps * weight. Relative volume = volume / bodyweight |
| Muscle group mapping | Static JSON | Map exercises to primary/secondary muscles. ~200 exercises = ~10kb JSON |

**No library needed.** These are standard fitness formulas (public domain). Implement directly.

**Confidence:** HIGH (formulas verified from multiple fitness calculator sources)

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Health Integration | @capgo/capacitor-health | capacitor-health-extended | Requires Node.js 22+, less mature, similar features |
| Health Integration | Health Connect | Google Fit API | Google Fit deprecated May 2024, shut down 2026 |
| Health Integration | HealthKit (iOS) | Web Health API | No web API exists for HealthKit. Must use native bridge |
| Exercise Database | ExerciseDB API | wger API | wger better for nutrition, ExerciseDB better for exercise media |
| Exercise Database | ExerciseDB API | API Ninjas | Only 3000 exercises, no videos/GIFs |
| Animation | Motion | GSAP | Both are now free. Motion is lighter (2.3kb vs 34kb+) and more modern |
| Animation | Motion | Anime.js | Anime.js 24kb, less active, older patterns |
| IndexedDB Wrapper | Dexie.js | localForage | Dexie has better query API, schema versioning, same bundle size |
| IndexedDB Wrapper | Dexie.js | idb (Google) | idb is lower-level. Dexie provides better DX for complex queries |
| Photo Storage | Filesystem + Dexie | Base64 in IndexedDB | Base64 works but 33% size overhead, slower for large images |
| Recommendations | Rule-based | TensorFlow.js | TF.js is 2.3MB+, overkill for MVP. Rules work well for fitness |
| Recommendations | Custom | likely.js | likely.js unmaintained (last update 2023), simple to build custom |
| Gamification | Custom JSON | gamify.js | gamify.js unmaintained (2018), over-engineered |
| Confetti | canvas-confetti | js-confetti | Both good. canvas-confetti has broader adoption, ISC license |

## Installation

### Core Dependencies (add to package.json)
```bash
# Health integration
npm install @capgo/capacitor-health

# IndexedDB wrapper
npm install dexie

# Animation
npm install motion

# Photo handling (Capacitor official plugins)
npm install @capacitor/camera @capacitor/filesystem

# Celebrations
npm install canvas-confetti

# Visualization (already installed, verify version)
npm install chart.js@^4.5.0
```

### Capacitor Upgrade (if needed)
```bash
# Upgrade Capacitor 7/8 to 8.0.1
npm install @capacitor/core@^8.0.0 @capacitor/cli@^8.0.0 @capacitor/android@^8.0.0

# Sync after upgrade
npx cap sync
```

### CDN Options (for quick prototyping)
```html
<!-- Motion (vanilla JS) -->
<script type="module">
  import { animate } from 'https://esm.sh/motion@12.27.5'
</script>

<!-- canvas-confetti -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>

<!-- Chart.js (already using) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.1"></script>
```

## Implementation Notes

### Health Connect Setup (Android)
1. Add `@capgo/capacitor-health` plugin
2. Request permissions in manifest: `android.permission.health.READ_STEPS`, etc.
3. Check `isAvailable()` (Health Connect may not be on all devices)
4. Call `requestAuthorization([...dataTypes])` before reading
5. Use `queryAggregated()` for summaries, `readSamples()` for individual data points

**Critical:** Users need Android 9+ with Health Connect app installed. Provide fallback UI for unsupported devices.

### HealthKit Setup (iOS)
1. Same plugin (@capgo/capacitor-health handles both platforms)
2. Add HealthKit capability in Xcode
3. Update Info.plist with usage descriptions
4. API is identical to Android (plugin abstracts differences)

**Critical:** HealthKit data never leaves device. All processing must be local.

### ExerciseDB Integration
1. Sign up for API key (v2 playground has rate limits)
2. Fetch exercise list on first load: `GET /exercises`
3. Cache locally in Dexie (exercises table)
4. Update cache weekly (check-update mechanism)
5. Images/videos load on-demand (lazy loading)

**Offline strategy:** Ship 200 core exercises as bundled JSON. Use API for extended library.

### Photo Storage Pattern
```javascript
// 1. Capture photo
const image = await Camera.getPhoto({
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
  quality: 90
});

// 2. Read file data
const fileData = await Filesystem.readFile({
  path: image.path
});

// 3. Save permanently
const savedFile = await Filesystem.writeFile({
  path: `progress-photos/${Date.now()}.jpg`,
  data: fileData.data,
  directory: Directory.Data
});

// 4. Store metadata in Dexie
await db.progressPhotos.add({
  filePath: savedFile.uri,
  date: new Date(),
  exercise: 'squat',
  weight: 100,
  thumbnailBlob: await createThumbnail(fileData.data)
});
```

### Animation Best Practices
```javascript
// Motion - micro bundle (2.3kb)
import { animate } from 'motion';

// Animate element
animate('#workout-card', {
  y: [0, -10, 0],
  scale: [1, 1.05, 1]
}, {
  duration: 0.5,
  easing: 'ease-out'
});

// Scroll-based
import { scroll } from 'motion';
scroll(
  animate('#stats', { opacity: [0, 1] }),
  { target: document.querySelector('#stats') }
);

// Confetti on PR
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

### Dexie Schema Example
```javascript
import Dexie from 'dexie';

const db = new Dexie('LagomStronkDB');

db.version(2).stores({
  workouts: '++id, date, exercises',
  exercises: '++id, name, muscleGroup, equipment',
  progressPhotos: '++id, date, exercise, filePath',
  achievements: '++id, type, unlockedAt',
  healthData: '++id, date, dataType, value'
});
```

## Bundle Size Budget

Target: Keep total JS under 500kb (compressed)

| Category | Library | Size | Priority |
|----------|---------|------|----------|
| Existing | Chart.js | ~70kb | Critical |
| Core | Dexie.js | ~20kb | Critical |
| Animation | Motion (mini) | 2.3kb | High |
| Animation | Motion (domAnimation) | +15kb | Medium |
| Celebration | canvas-confetti | ~10kb | Low |
| Health | @capgo/capacitor-health | ~30kb | High |
| Camera | @capacitor/camera | ~25kb | High |
| Total (all) | | ~172kb | |
| Total (MVP) | | ~147kb | |

**Note:** ExerciseDB images/videos load on-demand (not bundled). TensorFlow.js deferred to v2 (saves 2.3MB).

**Current bundle:** Unknown (no webpack/rollup). Recommend measuring with `import-cost` VSCode extension or Bundlephobia.

## Licensing Summary

All recommended libraries are commercially permissive:

| Library | License | Commercial Use | Attribution Required |
|---------|---------|----------------|---------------------|
| Capacitor | MIT | Yes | No |
| @capgo/capacitor-health | MIT | Yes | No |
| Dexie.js | Apache 2.0 | Yes | No |
| Motion | MIT | Yes | No |
| canvas-confetti | ISC | Yes | No |
| Chart.js | MIT | Yes | No |
| ExerciseDB API | AGPL-3.0 (data) | Check pricing | API terms apply |

**Note:** ExerciseDB has AGPL-3.0 on their open-source code but offers commercial API plans. Verify terms before production.

## Platform Compatibility

| Feature | Web (PWA) | Android | iOS | Notes |
|---------|-----------|---------|-----|-------|
| Core workout tracking | ✅ | ✅ | ✅ | Works everywhere |
| Chart.js visualizations | ✅ | ✅ | ✅ | Works everywhere |
| Animations (Motion) | ✅ | ✅ | ✅ | Works everywhere |
| IndexedDB/Dexie | ✅ | ✅ | ✅ | Works everywhere |
| Health Connect | ❌ | ✅ | ❌ | Android 9+ only |
| HealthKit | ❌ | ❌ | ✅ | iOS 14+ only |
| Camera | ⚠️ | ✅ | ✅ | Web has `getUserMedia()` but limited |
| Photo storage | ⚠️ | ✅ | ✅ | Web has File API but less permanent |

**Recommendation:** Continue supporting PWA for core features. Health integration + reliable photo storage require native builds.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Health Connect adoption lag | Users on older Android may not have it | Detect availability, provide manual entry fallback |
| ExerciseDB API rate limits | Free tier may be insufficient | Cache aggressively, ship core exercises bundled |
| ExerciseDB API pricing | Unknown v2 production costs | Verify pricing before launch. Fallback: wger (free) |
| Motion bundle size creep | Loading all features = 34kb | Use modular imports: start with `animate()` (2.3kb) |
| @capgo/capacitor-health maintenance | Plugin could be abandoned | Monitor GitHub activity. Fallback: fork or use capacitor-health-extended |
| Capacitor 8 adoption issues | Breaking changes from v7 | Test thoroughly. Migration guide exists. Community active |
| Photo storage fills device | Progress photos accumulate | Implement auto-cleanup (delete photos older than 1 year) |
| IndexedDB quota limits | Chrome: 60% of disk, but can be cleared | Warn user at 80% capacity, offer export/cleanup |

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial JS load | <500kb | Modular imports, defer TF.js |
| Time to Interactive | <2s | Lazy load exercise images, cache aggressively |
| Animation frame rate | 60fps | Use Motion's hybrid engine, GPU-accelerated transforms |
| IndexedDB query time | <100ms | Dexie's indexed queries, pagination for large datasets |
| Image load time | <500ms | WebP format, progressive JPEGs, thumbnail previews |
| Health data sync | <2s | Batch queries, cache last 30 days locally |

## Sources

**Health Integration:**
- [Health Connect Android Official Docs](https://developer.android.com/health-and-fitness/health-connect)
- [Health Connect Get Started Guide](https://developer.android.com/health-and-fitness/health-connect/get-started)
- [@capgo/capacitor-health GitHub](https://github.com/Cap-go/capacitor-health/)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [HealthKit Web App Limitations](https://developer.apple.com/forums/thread/668521)

**Exercise Databases:**
- [ExerciseDB API GitHub](https://github.com/ExerciseDB/exercisedb-api)
- [ExerciseDB Official Docs](https://www.exercisedb.dev/docs)
- [wger REST API](https://wger.de/en/software/api)

**Animation Libraries:**
- [Motion Official Site](https://motion.dev/)
- [Motion GitHub](https://github.com/motiondivision/motion)
- [Motion Bundle Size Guide](https://motion.dev/docs/react-reduce-bundle-size)
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti)
- [GSAP Official Site](https://gsap.com/)
- [Anime.js Official Site](https://animejs.com/)

**Data Storage:**
- [Dexie.js Official Site](https://dexie.org/)
- [Dexie.js GitHub](https://github.com/dexie/Dexie.js)
- [IndexedDB PWA Best Practices](https://web.dev/learn/pwa/offline-data)
- [Storing Photos in IndexedDB](https://www.raymondcamden.com/2018/10/05/storing-retrieving-photos-in-indexeddb)

**Capacitor:**
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8)
- [Capacitor Camera Plugin Docs](https://capacitorjs.com/docs/apis/camera)
- [Capacitor Filesystem API](https://www.joshmorony.com/using-the-capacitor-filesystem-api-to-store-photos/)

**Machine Learning & Recommendations:**
- [TensorFlow.js Official Site](https://www.tensorflow.org/js)
- [TensorFlow.js PWA Example](https://github.com/IBM/tfjs-web-app)
- [likely.js npm](https://www.npmjs.com/package/likely)
- [JavaScript Recommendation Systems Guide](https://dev.to/jimatjibba/build-a-content-based-recommendation-engine-in-js-2lpi)

**Fitness Calculations:**
- [One Rep Max Formulas](https://exrx.net/Calculators/OneRepMax)
- [1RM Calculator Comparison](https://www.strengthlog.com/1rm-calculator/)

**Confidence Levels:**
- HIGH: Capacitor, Dexie, Motion, canvas-confetti, Health Connect, Chart.js (all verified from official sources)
- MEDIUM-HIGH: ExerciseDB (GitHub verified, need to confirm v2 pricing)
- MEDIUM: Recommendation libraries (likely.js may be unmaintained, prefer custom implementation)
