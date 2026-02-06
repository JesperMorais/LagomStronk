# Architecture Patterns for Vanilla JS PWA Feature Extensions

**Project:** LagomStronk
**Domain:** Fitness/Workout Tracking PWA
**Researched:** 2026-02-05
**Confidence:** HIGH

## Current Architecture Analysis

The existing codebase follows a clean, modular pattern:

```
js/
├── app.js (960 lines)     - UI orchestration, view rendering, event handling
├── data.js (703 lines)    - State management, CRUD operations, analytics
├── charts.js (178 lines)  - Chart.js visualizations
└── sw-register.js         - Service worker registration

Storage: localStorage
Platform: Capacitor 8.x for Android
Pattern: Module-based with ES6 imports/exports
```

**Strengths of current architecture:**
- Clear separation between UI (app.js) and state (data.js)
- Centralized data access through exported functions
- View-based rendering with modal components
- ES6 module system for clean imports

**Growth constraints:**
- app.js approaching 1000 lines (readability threshold)
- localStorage limited to 5-10MB (photos will exceed this)
- No abstraction layer for platform-specific features
- Analytics/stats code mixed with core CRUD operations

## Recommended Architecture for New Features

### High-Level Component Structure

```
js/
├── core/
│   ├── storage.js           - Storage abstraction (localStorage → IndexedDB migration)
│   ├── state.js             - Reactive state management with Proxy pattern
│   └── eventBus.js          - Pub/sub for cross-module communication
├── data/
│   ├── workouts.js          - Workout CRUD (extract from data.js)
│   ├── exercises.js         - Exercise database operations
│   ├── measurements.js      - Body measurements with photo references
│   └── preferences.js       - User settings and onboarding state
├── services/
│   ├── health/
│   │   ├── healthAdapter.js - Health integration abstraction
│   │   ├── healthKit.js     - iOS HealthKit implementation
│   │   └── healthConnect.js - Android Health Connect implementation
│   ├── photos/
│   │   ├── photoManager.js  - Photo capture, storage, retrieval
│   │   └── photoStorage.js  - IndexedDB photo blob management
│   ├── intelligence/
│   │   ├── recommender.js   - Workout recommendation engine
│   │   └── analytics.js     - Stats calculations (move from data.js)
│   └── gamification/
│       ├── achievements.js  - Achievement tracking and unlocks
│       ├── streaks.js       - Streak calculation
│       └── levels.js        - Level progression system
├── ui/
│   ├── app.js              - Main UI orchestrator (slimmed down)
│   ├── views/
│   │   ├── todayView.js    - Today view rendering
│   │   ├── historyView.js  - History view rendering
│   │   ├── progressView.js - Progress charts
│   │   └── onboardingView.js - First-run onboarding flow
│   ├── components/
│   │   ├── exerciseSearch.js - Exercise filtering/search component
│   │   ├── photoCapture.js   - Photo capture UI
│   │   └── achievementBadge.js - Gamification UI elements
│   └── charts.js           - Chart rendering (existing)
└── utils/
    ├── search.js           - Search/filter utilities
    └── validators.js       - Input validation
```

### Component Boundaries

| Component | Responsibility | Communicates With | Data Flow |
|-----------|---------------|-------------------|-----------|
| **storage.js** | Abstract storage layer (localStorage/IndexedDB) | All data/* modules | Bidirectional: read/write |
| **state.js** | Reactive state management using Proxy | app.js, all ui/* modules | Unidirectional: state → UI |
| **eventBus.js** | Cross-module events (achievements unlocked, etc.) | All modules | Pub/sub pattern |
| **workouts.js** | Workout CRUD operations | storage.js, intelligence/analytics.js | Writes to storage, publishes events |
| **exercises.js** | Exercise database with search/filter | storage.js, ui/exerciseSearch.js | Provides filtered exercise lists |
| **measurements.js** | Body measurements + photo references | storage.js, photos/photoManager.js | Stores measurements with photo IDs |
| **preferences.js** | User settings, onboarding state | storage.js, ui/onboardingView.js | Persisted preferences |
| **healthAdapter.js** | Health platform abstraction | healthKit.js, healthConnect.js | Facade pattern: unified interface |
| **healthKit.js** | iOS HealthKit via Capacitor plugin | Capacitor @capgo/capacitor-health | Platform-specific implementation |
| **healthConnect.js** | Android Health Connect via Capacitor | Capacitor @capgo/capacitor-health | Platform-specific implementation |
| **photoManager.js** | Photo capture, compression, CRUD | photos/photoStorage.js, Capacitor Camera | Coordinates photo lifecycle |
| **photoStorage.js** | IndexedDB blob storage for photos | IndexedDB via idb library | Stores/retrieves binary data |
| **recommender.js** | Workout recommendations based on history | workouts.js, exercises.js | Reads workout data, suggests exercises |
| **analytics.js** | Statistics calculations | workouts.js | Pure functions: data → insights |
| **achievements.js** | Achievement tracking logic | workouts.js, eventBus.js | Listens to workout events, publishes unlocks |
| **app.js** | Main UI orchestrator | All ui/views/*, state.js | Renders views based on state |
| **exerciseSearch.js** | Live search/filter UI component | exercises.js | Filters exercise list on user input |

### Data Flow Architecture

```
User Interaction
      ↓
UI Components (app.js, views/*, components/*)
      ↓
State Management (state.js) ← Event Bus (eventBus.js)
      ↓                              ↑
Data Modules (workouts.js, etc.)    |
      ↓                              |
Storage Layer (storage.js)          |
      ↓                              |
[localStorage / IndexedDB]          |
                                    |
Services (health, photos, etc.) ----+
      ↓
External (Capacitor Plugins, Web APIs)
```

**Key principles:**
1. **Unidirectional data flow**: UI reads from state, writes through data modules
2. **Event-driven side effects**: Achievements, streaks triggered by events, not direct calls
3. **Storage abstraction**: All persistence goes through storage.js
4. **Service facades**: Platform-specific code hidden behind adapters

## Patterns to Follow

### Pattern 1: Facade Pattern for Health Integration

**What:** Create a unified interface that abstracts platform differences between iOS HealthKit and Android Health Connect.

**When:** When integrating with platform-specific APIs that serve the same purpose but have different interfaces.

**Why:** iOS HealthKit and Android Health Connect (replacing deprecated Google Fit) have different data structures, units, and permission models. A facade provides one interface for the rest of your app.

**Example:**
```javascript
// services/health/healthAdapter.js
export class HealthAdapter {
  constructor() {
    this.platform = this._detectPlatform();
    this.implementation = this._getImplementation();
  }

  async requestPermissions(dataTypes) {
    return this.implementation.requestPermissions(dataTypes);
  }

  async readSteps(startDate, endDate) {
    const rawData = await this.implementation.readSteps(startDate, endDate);
    return this._normalizeSteps(rawData);
  }

  async writeWorkout(workoutData) {
    const platformData = this._transformWorkout(workoutData);
    return this.implementation.writeWorkout(platformData);
  }

  _normalizeSteps(platformData) {
    // Convert platform-specific format to app format
    return {
      count: platformData.value,
      date: new Date(platformData.timestamp),
      source: platformData.sourceName
    };
  }

  _detectPlatform() {
    // Detect iOS vs Android
  }

  _getImplementation() {
    return this.platform === 'ios'
      ? new HealthKitImpl()
      : new HealthConnectImpl();
  }
}

// Usage in your app:
import { HealthAdapter } from './services/health/healthAdapter.js';

const health = new HealthAdapter();
await health.requestPermissions(['steps', 'workouts']);
const steps = await health.readSteps(startDate, endDate);
```

**Integration with existing code:**
- Import HealthAdapter in app.js for UI actions
- Call from data modules when syncing workout data
- Keep platform-specific code isolated in healthKit.js and healthConnect.js

### Pattern 2: Proxy-Based Reactive State

**What:** Use JavaScript Proxy to create reactive state that automatically updates UI when data changes.

**When:** Managing application state that affects multiple UI components (user preferences, onboarding progress, gamification state).

**Why:** Eliminates manual UI update calls. State changes automatically trigger re-renders. This is how modern frameworks work, but you can implement it in ~50 lines of vanilla JS.

**Example:**
```javascript
// core/state.js
export function createReactiveState(initialState, onChange) {
  const handler = {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;

      if (oldValue !== value) {
        onChange(property, value, oldValue);
      }
      return true;
    },

    get(target, property) {
      const value = target[property];
      // If nested object, wrap it too
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler);
      }
      return value;
    }
  };

  return new Proxy(initialState, handler);
}

// Usage:
import { createReactiveState } from './core/state.js';

const appState = createReactiveState(
  {
    user: { level: 1, xp: 0, streak: 0 },
    onboarding: { completed: false, currentStep: 0 }
  },
  (property, newValue) => {
    console.log(`State changed: ${property} = ${newValue}`);
    // Trigger UI update
    updateUI();
  }
);

// Anywhere in your code:
appState.user.xp += 10;  // Automatically triggers onChange
```

**Integration with existing code:**
- Wrap existing appData from data.js in reactive proxy
- Replace manual render calls with automatic state-driven updates
- Migrate gradually: start with new features (gamification, onboarding)

### Pattern 3: IndexedDB for Photo Storage

**What:** Use IndexedDB to store photo blobs with an abstraction layer for easy key-value access.

**When:** Storing binary data (photos) that exceeds localStorage 5MB limit.

**Why:** IndexedDB supports storing blobs up to 60% of disk space. The `idb` library provides a promise-based API that's much simpler than raw IndexedDB.

**Example:**
```javascript
// services/photos/photoStorage.js
import { openDB } from 'idb';  // 1.19kB library

const DB_NAME = 'lagomstronk-photos';
const STORE_NAME = 'photos';

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      }
    });
  }
  return dbPromise;
}

export async function savePhoto(id, blob) {
  const db = await getDB();
  await db.put(STORE_NAME, blob, id);
  return id;
}

export async function getPhoto(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function deletePhoto(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getAllPhotoIds() {
  const db = await getDB();
  return db.getAllKeys(STORE_NAME);
}
```

**Photo capture flow:**
```javascript
// services/photos/photoManager.js
import { Camera } from '@capacitor/camera';
import { savePhoto } from './photoStorage.js';
import { generateId } from '../../utils/id.js';

export async function capturePhoto() {
  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: 'base64'
  });

  // Convert base64 to blob
  const blob = await fetch(`data:image/jpeg;base64,${photo.base64String}`)
    .then(res => res.blob());

  const photoId = generateId();
  await savePhoto(photoId, blob);

  return photoId;  // Store this ID with measurement
}

export async function displayPhoto(photoId, imgElement) {
  const blob = await getPhoto(photoId);
  const url = URL.createObjectURL(blob);
  imgElement.src = url;

  // Clean up object URL when done
  imgElement.onload = () => URL.revokeObjectURL(url);
}
```

**Integration with existing code:**
- Add photoId field to measurement records in data.js
- Display photos in progress view by loading from IndexedDB
- Keep photo metadata (date, measurement) in localStorage/state

### Pattern 4: Event Bus for Gamification

**What:** Pub/sub pattern to decouple gamification triggers from core workout logic.

**When:** Side effects (achievements, notifications) should happen in response to user actions without coupling systems.

**Why:** Your workout tracking code shouldn't know about achievements. When a workout is logged, publish an event. Achievement system subscribes and checks if conditions are met.

**Example:**
```javascript
// core/eventBus.js
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]
      .filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

// Usage in workouts module:
import { eventBus } from '../core/eventBus.js';

export function saveWorkout(data, dateStr, exercises) {
  // ... save logic ...

  // Publish event
  eventBus.emit('workout:completed', {
    date: dateStr,
    exerciseCount: exercises.length,
    totalVolume: calculateVolume(exercises)
  });

  return data;
}

// Achievement system subscribes:
import { eventBus } from '../core/eventBus.js';
import { checkAchievements, unlockAchievement } from './achievements.js';

eventBus.on('workout:completed', (workout) => {
  const newAchievements = checkAchievements(workout);
  newAchievements.forEach(achievement => {
    unlockAchievement(achievement);
    eventBus.emit('achievement:unlocked', achievement);
  });
});

// UI subscribes to show notifications:
eventBus.on('achievement:unlocked', (achievement) => {
  showAchievementNotification(achievement);
});
```

**Integration with existing code:**
- Add eventBus.emit() calls to existing save functions in data.js
- Build gamification system as event subscribers
- Keeps core workout logic unchanged

### Pattern 5: Exercise Search with Trie or Fuse.js

**What:** Fast, fuzzy search for exercise database using either a Trie data structure or Fuse.js library.

**When:** Filtering exercise list as user types (typeahead/autocomplete).

**Why:** Simple array.filter() with string.includes() works for small lists but doesn't support fuzzy matching ("bench" matches "Bench Press"). For 50+ exercises, you want fuzzy search.

**Example with Fuse.js (recommended for simplicity):**
```javascript
// services/exercises.js
import Fuse from 'fuse.js';  // 3kb gzipped, no deps

let exerciseFuse;

export function initializeExerciseSearch(exercises) {
  exerciseFuse = new Fuse(exercises, {
    keys: ['name', 'category', 'muscleGroup'],
    threshold: 0.3,  // Lower = stricter matching
    includeScore: true
  });
}

export function searchExercises(query) {
  if (!query) {
    return getAllExercises();
  }

  const results = exerciseFuse.search(query);
  return results.map(result => result.item);
}

// UI component usage:
import { searchExercises } from '../data/exercises.js';

const searchInput = document.getElementById('exercise-search');
const resultsContainer = document.getElementById('exercise-results');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  const matches = searchExercises(query);
  renderExerciseList(resultsContainer, matches);
});
```

**Alternative: Vanilla JS Trie (no dependencies):**
```javascript
class ExerciseTrie {
  constructor() {
    this.root = {};
  }

  insert(exercise) {
    let node = this.root;
    const key = exercise.name.toLowerCase();

    for (const char of key) {
      if (!node[char]) {
        node[char] = { exercises: [] };
      }
      node = node[char];
      node.exercises.push(exercise);
    }
  }

  search(prefix) {
    let node = this.root;
    const key = prefix.toLowerCase();

    for (const char of key) {
      if (!node[char]) return [];
      node = node[char];
    }

    return node.exercises || [];
  }
}

export const exerciseTrie = new ExerciseTrie();
```

**Recommendation:** Use Fuse.js for fuzzy matching. It's only 3kb and handles typos. Use vanilla Trie only if you need zero dependencies.

**Integration with existing code:**
- Wrap DEFAULT_EXERCISES from data.js with search initialization
- Add search input to library view
- Reuse same search for "add exercise" modal

### Pattern 6: Storage Migration Layer

**What:** Abstraction layer that can switch between localStorage and IndexedDB without changing calling code.

**When:** Starting with localStorage but need to migrate to IndexedDB for photos and larger datasets.

**Why:** You can't change all code at once. This lets you migrate gradually: photos first, then workout data if needed.

**Example:**
```javascript
// core/storage.js
import { get, set, del } from 'idb-keyval';  // Minimal IndexedDB wrapper

const USE_INDEXEDDB = true;  // Feature flag

export async function storageGet(key) {
  if (USE_INDEXEDDB) {
    return await get(key);
  } else {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
}

export async function storageSet(key, value) {
  if (USE_INDEXEDDB) {
    await set(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function storageDelete(key) {
  if (USE_INDEXEDDB) {
    await del(key);
  } else {
    localStorage.removeItem(key);
  }
}

// Usage (same as before, but async):
import { storageGet, storageSet } from './core/storage.js';

export async function loadData() {
  const stored = await storageGet(STORAGE_KEY);
  return stored || getDefaultData();
}

export async function saveData(data) {
  await storageSet(STORAGE_KEY, data);
}
```

**Migration strategy:**
1. Create storage.js abstraction with localStorage implementation
2. Replace localStorage calls with storageGet/Set (add async/await)
3. For photos, use separate photoStorage.js with IndexedDB (Pattern 3)
4. Later, flip USE_INDEXEDDB flag for main data if needed
5. Add migration script to move localStorage → IndexedDB

**Integration with existing code:**
- Modify data.js loadData() and saveData() to use storage.js
- Add async/await to all data functions (breaking change)
- Photos go directly to IndexedDB, skip localStorage entirely

### Pattern 7: Recommendation Engine (Client-Side)

**What:** Simple recommendation algorithm that suggests exercises based on workout history, muscle group balance, and time since last trained.

**When:** User needs workout suggestions or "what should I do today?" feature.

**Why:** You don't need TensorFlow for this. A rule-based system with weighted scoring works well for fitness recommendations.

**Example:**
```javascript
// services/intelligence/recommender.js
import { getWorkoutsSorted } from '../../data/workouts.js';
import { getAllExercises } from '../../data/exercises.js';

export function recommendExercises(options = {}) {
  const { count = 5, focusMuscleGroup = null } = options;
  const recentWorkouts = getWorkoutsSorted().slice(0, 10);
  const allExercises = getAllExercises();

  // Score each exercise
  const scores = allExercises.map(exercise => ({
    exercise,
    score: calculateScore(exercise, recentWorkouts, focusMuscleGroup)
  }));

  // Sort by score, return top N
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, count).map(s => s.exercise);
}

function calculateScore(exercise, recentWorkouts, focusMuscleGroup) {
  let score = 0;

  // 1. Recency: days since last performed
  const daysSinceLastPerformed = getDaysSinceExercise(exercise, recentWorkouts);
  if (daysSinceLastPerformed === null) {
    score += 50;  // Never done = high priority
  } else {
    score += Math.min(daysSinceLastPerformed * 2, 40);  // More days = higher score
  }

  // 2. Muscle group balance
  const muscleGroupFrequency = getMuscleGroupFrequency(recentWorkouts);
  const exerciseMuscleGroup = exercise.muscleGroup;
  const timesUsed = muscleGroupFrequency[exerciseMuscleGroup] || 0;
  score += (10 - timesUsed) * 5;  // Less used = higher score

  // 3. Focus muscle group (if specified)
  if (focusMuscleGroup && exercise.muscleGroup === focusMuscleGroup) {
    score += 30;
  }

  // 4. Variety: prefer exercises not in last workout
  const lastWorkout = recentWorkouts[0];
  if (lastWorkout && !lastWorkout.exercises.find(e => e.name === exercise.name)) {
    score += 10;
  }

  return score;
}

function getDaysSinceExercise(exercise, recentWorkouts) {
  const today = new Date();

  for (const workout of recentWorkouts) {
    const hasExercise = workout.exercises.find(e => e.name === exercise.name);
    if (hasExercise) {
      const workoutDate = new Date(workout.date);
      const diffDays = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }

  return null;  // Never performed
}

function getMuscleGroupFrequency(recentWorkouts) {
  const frequency = {};

  recentWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const group = exercise.muscleGroup || 'other';
      frequency[group] = (frequency[group] || 0) + 1;
    });
  });

  return frequency;
}

// Usage:
import { recommendExercises } from './services/intelligence/recommender.js';

// General recommendations
const suggestions = recommendExercises({ count: 5 });

// Focus on legs
const legWorkout = recommendExercises({ count: 4, focusMuscleGroup: 'legs' });
```

**Advanced: Add user preferences:**
```javascript
function calculateScore(exercise, recentWorkouts, focusMuscleGroup, userPrefs) {
  let score = 0;
  // ... existing scoring ...

  // 5. User preferences (favorite exercises get bonus)
  if (userPrefs.favorites.includes(exercise.name)) {
    score += 15;
  }

  // 6. Avoid disliked exercises
  if (userPrefs.dislikes.includes(exercise.name)) {
    score -= 100;  // Effectively remove from recommendations
  }

  return score;
}
```

**Integration with existing code:**
- Call recommendExercises() when user opens "add exercise" modal
- Display "Suggested for you" section at top of exercise list
- Add "smart workout" button that generates full workout based on recommendations

### Pattern 8: Onboarding State Machine

**What:** Manage multi-step onboarding flow with state machine pattern for clear step transitions and validation.

**When:** First-run experience with multiple screens (welcome → goals → preferences → permissions).

**Why:** Prevents bugs from manual step tracking. State machine ensures you can't skip steps or get into invalid states.

**Example:**
```javascript
// data/preferences.js
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  GOALS: 'goals',
  EXPERIENCE: 'experience',
  PREFERENCES: 'preferences',
  PERMISSIONS: 'permissions',
  COMPLETE: 'complete'
};

const STEP_ORDER = [
  ONBOARDING_STEPS.WELCOME,
  ONBOARDING_STEPS.GOALS,
  ONBOARDING_STEPS.EXPERIENCE,
  ONBOARDING_STEPS.PREFERENCES,
  ONBOARDING_STEPS.PERMISSIONS,
  ONBOARDING_STEPS.COMPLETE
];

export class OnboardingStateMachine {
  constructor(initialState = ONBOARDING_STEPS.WELCOME) {
    this.currentStep = initialState;
    this.data = {};
  }

  getCurrentStep() {
    return this.currentStep;
  }

  canGoNext() {
    return this.currentStep !== ONBOARDING_STEPS.COMPLETE;
  }

  canGoBack() {
    return this.currentStep !== ONBOARDING_STEPS.WELCOME;
  }

  next() {
    if (!this.canGoNext()) return false;

    const currentIndex = STEP_ORDER.indexOf(this.currentStep);
    this.currentStep = STEP_ORDER[currentIndex + 1];
    return true;
  }

  back() {
    if (!this.canGoBack()) return false;

    const currentIndex = STEP_ORDER.indexOf(this.currentStep);
    this.currentStep = STEP_ORDER[currentIndex - 1];
    return true;
  }

  setStepData(step, data) {
    this.data[step] = { ...this.data[step], ...data };
  }

  getStepData(step) {
    return this.data[step] || {};
  }

  getAllData() {
    return this.data;
  }

  isComplete() {
    return this.currentStep === ONBOARDING_STEPS.COMPLETE;
  }

  getProgress() {
    const currentIndex = STEP_ORDER.indexOf(this.currentStep);
    return {
      current: currentIndex + 1,
      total: STEP_ORDER.length,
      percentage: Math.round(((currentIndex + 1) / STEP_ORDER.length) * 100)
    };
  }
}

// Usage:
import { OnboardingStateMachine, ONBOARDING_STEPS } from './data/preferences.js';

const onboarding = new OnboardingStateMachine();

// User completes welcome screen
onboarding.next();  // Now on GOALS

// User selects goals
onboarding.setStepData(ONBOARDING_STEPS.GOALS, {
  primaryGoal: 'strength',
  workoutFrequency: 4
});

onboarding.next();  // Now on EXPERIENCE

// Progress indicator
const progress = onboarding.getProgress();
console.log(`Step ${progress.current} of ${progress.total}`);
```

**Integration with existing code:**
- Check onboarding state in app.js init()
- If not complete, show onboarding view instead of today view
- Store onboarding state in preferences via storage.js
- Load onboarding state on app start to resume if interrupted

## Anti-Patterns to Avoid

### Anti-Pattern 1: God Objects (Monolithic Modules)

**What goes wrong:** app.js and data.js grow to 2000+ lines with dozens of unrelated functions.

**Why bad:** Hard to navigate, merge conflicts, difficult to test individual features.

**Instead:** Split by feature/concern as shown in recommended architecture. Each module should have one clear responsibility.

**Detection:** If a file exceeds 500 lines or you need to scroll more than 3 screens to find a function, it's time to split.

### Anti-Pattern 2: Direct IndexedDB Calls Everywhere

**What goes wrong:** Calling openDB() and managing transactions in every component that needs data.

**Why bad:** Duplicate code, inconsistent error handling, hard to change database schema.

**Instead:** Use storage abstraction layer (Pattern 6) or photoStorage.js (Pattern 3) with clean API.

**Detection:** If you see openDB() or createObjectStore() in more than one file, you need abstraction.

### Anti-Pattern 3: Tight Coupling to Platform APIs

**What goes wrong:** Calling Capacitor Health plugin directly from workout saving code.

**Why bad:** Can't test without device, can't swap platforms, hard to add new health providers.

**Instead:** Use adapter/facade pattern (Pattern 1) to abstract platform differences.

**Detection:** If you see platform-specific imports (Capacitor plugins) in business logic files (data/*, services/*), refactor.

### Anti-Pattern 4: Synchronous localStorage in Async World

**What goes wrong:** Mixing localStorage.getItem() (sync) with IndexedDB (async) leads to race conditions and inconsistent state.

**Why bad:** LocalStorage blocks main thread. As you add IndexedDB for photos, you'll have some data sync and some async.

**Instead:** Make all storage operations async from day one using storage abstraction (Pattern 6).

**Detection:** If you have functions that sometimes return promises and sometimes return values directly, unify to all async.

### Anti-Pattern 5: Photo Paths in localStorage

**What goes wrong:** Storing base64 photo strings in localStorage or file:// paths that break across app updates.

**Why bad:** LocalStorage quota exceeded, file paths become invalid, can't migrate storage.

**Instead:** Store photos as blobs in IndexedDB, reference by ID (Pattern 3). Store only metadata (photoId, date) in main state.

**Detection:** If you see base64 strings longer than 100 chars in localStorage, you're doing it wrong.

### Anti-Pattern 6: String Matching Instead of Normalization

**What goes wrong:** Health data stored with different units (kg vs lbs), causes broken charts and wrong calculations.

**Why bad:** "70 kg" and "154 lbs" are the same weight but look different. String comparison fails.

**Instead:** Normalize all data to internal units (kg, cm, calories) in adapter layer. Convert to user preference only for display.

**Detection:** If you're parsing strings like "70 kg" to extract numbers in multiple places, you need normalization.

### Anti-Pattern 7: Achievement Checks in Workout Save Logic

**What goes wrong:** Checking if user unlocked "10 workouts" achievement inside saveWorkout() function.

**Why bad:** Workout logic shouldn't know about gamification. Adding new achievements requires modifying workout code.

**Instead:** Use event bus (Pattern 4). Workout module publishes events, achievement module subscribes.

**Detection:** If data modules import from gamification modules, dependencies are backwards.

## Build Order and Dependencies

**Phase 1: Foundation (No dependencies)**
1. **core/storage.js** - Storage abstraction layer
2. **core/eventBus.js** - Event bus for pub/sub
3. **utils/search.js** - Search utilities

**Phase 2: Data Layer (Depends on Phase 1)**
4. **data/exercises.js** - Exercise database with search
5. **data/preferences.js** - User settings, onboarding state machine
6. **Refactor data.js** → Split into:
   - **data/workouts.js** - Workout CRUD
   - **services/intelligence/analytics.js** - Stats calculations

**Phase 3: Storage Migration (Depends on Phase 1)**
7. **Migrate data.js to use core/storage.js** - Make all storage async
8. **services/photos/photoStorage.js** - IndexedDB photo storage
9. **services/photos/photoManager.js** - Photo capture and retrieval

**Phase 4: Advanced Features (Depends on Phase 2-3)**
10. **data/measurements.js** - Body measurements with photo refs (needs photoManager)
11. **services/intelligence/recommender.js** - Recommendation engine (needs workouts.js)
12. **services/gamification/** - Achievements, streaks, levels (needs eventBus, workouts.js)

**Phase 5: Platform Integrations (Depends on Phase 1-2)**
13. **services/health/healthAdapter.js** - Health abstraction (can develop without real plugin)
14. **Install Capacitor plugins** - @capgo/capacitor-health, @capacitor/camera
15. **services/health/healthKit.js + healthConnect.js** - Platform implementations

**Phase 6: UI Refactoring (Depends on Phase 2-5)**
16. **core/state.js** - Reactive state management
17. **Refactor app.js** → Extract views:
    - **ui/views/todayView.js**
    - **ui/views/historyView.js**
    - **ui/views/progressView.js**
    - **ui/views/onboardingView.js**
18. **ui/components/** - Reusable components (exerciseSearch, photoCapture, etc.)

**Dependency Graph:**
```
Phase 1 (Foundation)
    ↓
Phase 2 (Data Layer) ← Phase 3 (Storage Migration)
    ↓                        ↓
Phase 4 (Features) ← Phase 5 (Platform)
    ↓                        ↓
Phase 6 (UI Refactoring)
```

**Critical path:**
- Storage abstraction must come first (everything depends on it)
- Event bus early enables parallel development of gamification
- Photo storage needed before body measurements
- Platform integrations can happen late (use mocks during development)
- UI refactoring should be last (minimize disruption to working app)

## Integration Strategy with Existing Codebase

### Step 1: Add Foundation Without Breaking Existing Code

**Approach:** Create new modules alongside existing code. Don't refactor yet.

```javascript
// Add new files:
js/core/storage.js
js/core/eventBus.js

// Existing files unchanged:
js/data.js (still using localStorage directly)
js/app.js (still rendering directly)
```

**Test:** New modules work in isolation. Existing app still functions.

### Step 2: Gradual Migration via Adapters

**Approach:** Create adapter functions that wrap existing functions with new patterns.

```javascript
// data/workouts.js (new module)
import { addExerciseToWorkout as legacyAdd } from './data.js';
import { eventBus } from '../core/eventBus.js';

export function addExerciseToWorkout(data, dateStr, exercise) {
  const result = legacyAdd(data, dateStr, exercise);

  // Add new behavior (event publishing)
  eventBus.emit('exercise:added', { dateStr, exercise });

  return result;
}
```

**Test:** New module calls old code, adds new features. Existing code still works.

### Step 3: Feature Flagging for Storage Migration

**Approach:** Use feature flag to switch between localStorage and IndexedDB.

```javascript
// core/storage.js
const USE_INDEXEDDB = false;  // Start false, flip when ready

export async function storageGet(key) {
  if (USE_INDEXEDDB) {
    return await get(key);
  } else {
    return JSON.parse(localStorage.getItem(key));
  }
}
```

**Test:** Flip flag, verify data loads correctly. Rollback if issues.

### Step 4: Parallel Implementation for New Features

**Approach:** Build new features (photos, health integration) with new architecture. Don't touch existing workout tracking.

```javascript
// New feature uses new patterns:
js/services/photos/photoManager.js (IndexedDB from day 1)
js/services/health/healthAdapter.js (Facade pattern)

// Existing features unchanged:
js/data.js (still works as before)
```

**Test:** New features work. Old features unaffected.

### Step 5: UI Extraction via View Functions

**Approach:** Extract rendering logic to separate functions without changing how they're called.

```javascript
// Before (in app.js):
function renderTodayView() {
  // 100 lines of rendering logic
}

// After (extract to ui/views/todayView.js):
export function renderTodayView(data) {
  // 100 lines of rendering logic (moved, not changed)
}

// app.js now imports and calls:
import { renderTodayView } from './ui/views/todayView.js';
renderTodayView(appData);
```

**Test:** Views render identically. Code is just in different files.

### Integration Points Summary

| Existing System | Integration Point | New System |
|-----------------|-------------------|------------|
| **data.js saveData()** | Wrap with storage abstraction | **core/storage.js** |
| **data.js addExerciseToWorkout()** | Add event emission | **core/eventBus.js** |
| **app.js renderTodayView()** | Extract to separate module | **ui/views/todayView.js** |
| **localStorage** | Feature flag migration | **IndexedDB via idb** |
| **DEFAULT_EXERCISES array** | Wrap with search API | **data/exercises.js with Fuse.js** |

**Key principle:** Never rewrite. Always wrap, extend, or extract.

## Library Recommendations

| Purpose | Library | Size | Why |
|---------|---------|------|-----|
| **IndexedDB wrapper** | [idb](https://github.com/jakearchibald/idb) | 1.19kB | Promise-based, mirrors IndexedDB API, minimal overhead |
| **Fuzzy search** | [Fuse.js](https://fusejs.io/) | 3kB | Zero deps, good fuzzy matching, easy API |
| **Health integration** | [@capgo/capacitor-health](https://github.com/Cap-go/capacitor-health) | - | Capacitor plugin for HealthKit + Health Connect (replaces deprecated Google Fit) |
| **Camera** | [@capacitor/camera](https://capacitorjs.com/docs/apis/camera) | - | Official Capacitor plugin, works on Android/iOS |
| **State management** | Vanilla Proxy | 0kB | Built into JS, no library needed (see Pattern 2) |
| **Event bus** | Vanilla implementation | 0kB | ~30 lines (see Pattern 4) |

**Alternatives considered:**

| Category | Alternative | Why Not |
|----------|-------------|---------|
| IndexedDB | Dexie.js | More features but 15kB. idb is sufficient for this app. |
| IndexedDB | localForage | Falls back to localStorage (defeats purpose of migration). Use idb for explicit control. |
| Search | Vanilla Trie | Requires custom implementation. Fuse.js is only 3kB and handles fuzzy matching. |
| State | Redux | 2.6kB + boilerplate. Proxy pattern is lighter and sufficient for this app. |
| ML/Recommendation | TensorFlow.js | 146kB. Overkill for rule-based recommendations. Use vanilla scoring algorithm. |

## Storage Strategy

### Current: localStorage (~50KB used)

```
localStorage['lagomstronk_data'] = {
  workouts: [...],
  exerciseLibrary: [...],
  workoutTemplates: [...]
}
```

**Limits:**
- 5-10MB max (browser dependent)
- Synchronous (blocks main thread)
- No blob support

### Future: Hybrid localStorage + IndexedDB

```
localStorage['lagomstronk_data'] = {
  workouts: [...],           // Keep here (fast, small)
  exerciseLibrary: [...],    // Keep here (fast, small)
  workoutTemplates: [...],   // Keep here (fast, small)
  preferences: {...},        // Keep here (fast, small)
  measurements: [            // Keep metadata only
    { id: 'uuid', date: '2026-02-05', weight: 70, photoId: 'photo-uuid' }
  ]
}

IndexedDB['lagomstronk-photos'] = {
  'photo-uuid': Blob(jpeg data)  // Photos here (large)
}

IndexedDB['lagomstronk-health'] = {
  'sync-data': { lastSync: ..., data: [...] }  // Health sync cache
}
```

**Rationale:**
- localStorage for fast access to small data (<1MB)
- IndexedDB for large blobs (photos) and bulk data (health sync)
- Metadata in localStorage, binary data in IndexedDB
- Clear separation prevents quota issues

## Performance Considerations

### Bundle Size Budget

| Module | Target Size | Notes |
|--------|-------------|-------|
| **Core (app.js + data.js refactored)** | 60KB | Existing ~70KB, should shrink after splitting |
| **UI Views** | 30KB | Extracted from app.js |
| **Services (health, photos, etc.)** | 40KB | New functionality |
| **Libraries (idb, fuse.js, etc.)** | 5KB gzipped | Minimal external deps |
| **Total JS** | <150KB | Target: < 200KB for fast load |

**Optimization strategy:**
- Tree-shake unused exercises/templates
- Lazy load views (import views on navigation)
- Defer loading of services until first use
- Compress images before IndexedDB storage

### Offline First Priority

**Critical for offline:**
1. Workout logging (must work without internet)
2. Viewing history
3. Progress charts

**Can require online:**
1. Health data sync (requires platform connection)
2. Photo backup to cloud (future feature)

**Service worker strategy:**
- Cache all JS/CSS/HTML
- Cache Chart.js and other libs
- Don't cache user data (handled by localStorage/IndexedDB)

## Testing Strategy

### Unit Testing (No framework needed)

```javascript
// test/storage.test.js
import { storageGet, storageSet } from '../js/core/storage.js';

async function testStorageRoundTrip() {
  const testData = { foo: 'bar' };
  await storageSet('test-key', testData);
  const retrieved = await storageGet('test-key');

  console.assert(
    JSON.stringify(retrieved) === JSON.stringify(testData),
    'Storage round trip failed'
  );
}

testStorageRoundTrip();
```

### Integration Testing with Mocks

```javascript
// test/health.test.js
class MockHealthImplementation {
  async readSteps() {
    return { value: 5000, timestamp: Date.now() };
  }
}

import { HealthAdapter } from '../js/services/health/healthAdapter.js';

function testHealthNormalization() {
  const adapter = new HealthAdapter();
  adapter.implementation = new MockHealthImplementation();

  const steps = await adapter.readSteps(startDate, endDate);
  console.assert(steps.count === 5000, 'Step normalization failed');
}
```

### Manual Testing Checklist

- [ ] Workout tracking still works after storage migration
- [ ] Photos save and load correctly
- [ ] Recommendations update based on new workouts
- [ ] Achievements unlock at right times
- [ ] Onboarding flow completes without errors
- [ ] Health sync works on both iOS and Android
- [ ] App works offline (no network errors)

## Migration Path from Current Architecture

### Phase 1: Add Core Infrastructure (Week 1)

**Goal:** Foundation for new features without breaking existing code.

**Tasks:**
- Create `js/core/` directory
- Implement `storage.js`, `eventBus.js`
- Write unit tests for core modules
- Document API for team

**Test:** Run existing app, verify nothing breaks.

### Phase 2: Exercise Search Enhancement (Week 1)

**Goal:** First feature using new architecture.

**Tasks:**
- Create `js/data/exercises.js`
- Add Fuse.js (3kB)
- Implement exercise search
- Add search UI to library view

**Test:** Search exercises, add to workout. Verify existing exercise library still works.

### Phase 3: Photo Storage (Week 2)

**Goal:** Enable body measurement photos.

**Tasks:**
- Add `idb` library (1.2kB)
- Implement `js/services/photos/photoStorage.js`
- Implement `js/services/photos/photoManager.js`
- Add Capacitor Camera plugin
- Create measurement entry UI with photo capture

**Test:** Take photo, save measurement, view photo later. Check IndexedDB size.

### Phase 4: Storage Migration (Week 2-3)

**Goal:** Move from localStorage to IndexedDB for photos, prepare for health data.

**Tasks:**
- Modify `data.js` to use `storage.js` abstraction
- Make all storage operations async
- Test with localStorage (flag = false)
- Flip flag, test with IndexedDB
- Write migration script for existing users

**Test:** Export localStorage data, import to IndexedDB, verify integrity.

### Phase 5: Gamification (Week 3-4)

**Goal:** Add achievements and streaks.

**Tasks:**
- Create `js/services/gamification/`
- Implement achievement definitions
- Add event listeners for workout events
- Create UI for achievement notifications
- Add progress/level system

**Test:** Complete workouts, verify achievements unlock. Check edge cases (timezone, streak breaks).

### Phase 6: Health Integration (Week 4-5)

**Goal:** Sync workout data with HealthKit/Health Connect.

**Tasks:**
- Install `@capgo/capacitor-health` plugin
- Implement `js/services/health/healthAdapter.js`
- Implement platform-specific adapters
- Add health sync UI (permissions, settings)
- Handle sync errors gracefully

**Test:** Test on real iOS and Android devices. Verify data appears in Health app.

### Phase 7: Recommendation Engine (Week 5)

**Goal:** Suggest exercises based on history.

**Tasks:**
- Implement `js/services/intelligence/recommender.js`
- Add scoring algorithm
- Create "Suggested for you" UI
- Add "Smart Workout" generator

**Test:** Log diverse workouts, verify recommendations make sense. Test edge cases (new user, no history).

### Phase 8: Onboarding Flow (Week 6)

**Goal:** First-run experience for new users.

**Tasks:**
- Implement `data/preferences.js` state machine
- Create onboarding views
- Add permission requests (camera, health)
- Store user preferences

**Test:** Clear app data, complete onboarding. Test back button, skip flow, resume interrupted onboarding.

### Phase 9: UI Refactoring (Week 6-7)

**Goal:** Clean up app.js, improve maintainability.

**Tasks:**
- Implement `core/state.js` reactive state
- Extract views to `ui/views/`
- Extract components to `ui/components/`
- Reduce app.js to <300 lines

**Test:** Full regression test. All views work. No visual changes.

### Phase 10: Polish and Testing (Week 7-8)

**Goal:** Production-ready release.

**Tasks:**
- Performance profiling
- Bundle size optimization
- Offline testing
- Cross-device testing
- Documentation

**Test:** Full QA pass on iOS and Android.

## Confidence and Open Questions

**HIGH Confidence:**
- Modular architecture pattern (well-established in vanilla JS community)
- IndexedDB for photo storage (official PWA recommendation)
- Facade pattern for health integration (standard approach for platform abstraction)
- Event bus for gamification (decoupling pattern)
- Storage abstraction layer (common migration strategy)

**MEDIUM Confidence:**
- Recommendation engine scoring weights (will need tuning based on user feedback)
- Proxy-based state management (works well but may need polyfill for older browsers)
- Exercise search with Fuse.js vs Trie (both viable, preference-based)

**LOW Confidence:**
- Exact bundle size after all features (need to measure)
- Performance of IndexedDB on low-end Android devices (need device testing)
- Health data sync reliability across all Android manufacturers (fragmentation)

**Open Questions:**
1. **Offline photo sync:** Should photos sync to cloud backup when online? (Not in scope for this milestone?)
2. **Health data ownership:** Can users export their health sync data? Privacy consideration.
3. **Recommendation model tuning:** How do we know if recommendations are good? Need analytics/feedback mechanism.
4. **State persistence:** Should reactive state auto-save on every change or debounced?
5. **Migration strategy for existing users:** How to migrate localStorage → IndexedDB without data loss? Need migration script in Phase 4.

## Sources

**Architecture Patterns:**
- [PWA with Vanilla JS - GitHub](https://github.com/ibrahima92/pwa-with-vanilla-js)
- [Building PWAs with Vanilla JavaScript - DEV Community](https://dev.to/onwuemene/building-progressive-web-applications-with-vanilla-javascript-4733)
- [Modern PWA Magic - Medium](https://medium.com/illumination/modern-pwa-magic-how-i-built-a-resilient-progressive-web-app-with-vanilla-javascript-d2684f1c38f2)
- [Modern State Management in Vanilla JavaScript: 2026 Patterns - Medium](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [State Management in Vanilla JS: 2026 Trends - Medium](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de)

**Storage:**
- [Offline Data - PWA (web.dev)](https://web.dev/learn/pwa/offline-data)
- [PWA Local Storage Strategies - SimiCart](https://simicart.com/blog/pwa-local-storage/)
- [IndexedDB Wrapper Libraries Comparison - npm-compare](https://npm-compare.com/dexie,idb,localforage)
- [Best library for IndexedDB - paultman](https://www.paultman.com/posts/best-library-for-indexeddb-localforage-idb-keyval-or-idb/)
- [idb - GitHub](https://github.com/jakearchibald/idb)
- [localForage - GitHub](https://github.com/localForage/localForage)

**Photo Management:**
- [Take photo and access the picture library in your PWA - Medium](https://daviddalbusco.medium.com/take-photo-and-access-the-picture-library-in-your-pwa-without-plugins-876dc92989b)

**Health Integration:**
- [Capacitor Health Plugin - Cap-go GitHub](https://github.com/Cap-go/capacitor-health/)
- [Capacitor Health Plugin - mley GitHub](https://github.com/mley/capacitor-health)
- [Unifying Health Data: Apple HealthKit & Google Fit - WellAlly](https://www.wellally.tech/blog/react-native-expo-apple-healthkit-google-fit-integration)
- [Apple Health, Google Fit Integration Platforms - MindSea](https://mindsea.com/blog/apple-health-android-health-connect-integration-platforms-for-health-wellness-and-fitness/)

**Recommendation Systems:**
- [Build a Content-based recommendation engine in JS - DEV Community](https://dev.to/jimatjibba/build-a-content-based-recommendation-engine-in-js-2lpi)
- [Building JavaScript Recommendation Systems Using Brain.js - Medium](https://medium.com/devsphere/building-javascript-recommendation-systems-using-brain-js-5b18a77f7831)
- [Ditch Python: 5 JavaScript Libraries for Machine Learning - The New Stack](https://thenewstack.io/ditch-python-5-javascript-libraries-for-machine-learning/)

**Design Patterns:**
- [The Facade Pattern in Modern JavaScript - Medium](https://medium.com/@artemkhrenov/the-facade-pattern-in-modern-javascript-simplifying-complex-systems-df4de098529b)
- [Design Pattern #5 - Adapter Pattern - DEV Community](https://dev.to/superviz/design-pattern-5-adapter-pattern-4gif)
- [Structural design patterns in Node.js - Medium](https://medium.com/deno-the-complete-reference/structural-design-patterns-in-node-js-c3f82cc5a68f)

**Search & Filtering:**
- [How to create JavaScript list filter and search - CodeBrainer](https://codebrainer.com/blog/how-to-create-javascript-list-filter-and-search-for-records)
- [How To Create a Filter/Search List - W3Schools](https://www.w3schools.com/howto/howto_js_filter_lists.asp)
