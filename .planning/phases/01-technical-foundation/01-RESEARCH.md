# Phase 1: Technical Foundation - Research

**Researched:** 2026-02-05
**Domain:** Browser Storage, Event-Driven Architecture, Data Migration
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational infrastructure that all future features depend on. This research investigated four core areas: storage abstraction (localStorage to IndexedDB), data migration patterns, capacity monitoring, and event bus architecture.

The standard approach uses **idb-keyval** (295 bytes) for simple key-value storage with a localStorage-like API, combined with the native **Storage Quota API** (`navigator.storage.estimate()`) for capacity monitoring. For the event bus, the native **EventTarget** pattern provides zero-dependency pub/sub with browser DevTools compatibility. Migration follows the "upgrade-on-read" pattern: read from localStorage, write to both systems during transition, then flip a feature flag.

The critical insight from research: IndexedDB has built-in versioning via `onupgradeneeded` callbacks, which should be leveraged for schema management. The Storage Quota API works across all modern browsers since 2023 and provides usage/quota estimates (though not exact values for security reasons).

**Primary recommendation:** Use idb-keyval for the storage abstraction layer, with native EventTarget for the event bus. Both are zero-to-minimal dependency solutions that integrate cleanly with vanilla JavaScript.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Latest | IndexedDB key-value storage | 295 bytes, localStorage-like API, Jake Archibald (Google Chrome team), promise-based |
| Storage Quota API | Native | Capacity monitoring | Built into browsers, `navigator.storage.estimate()`, no dependencies |
| EventTarget | Native | Event bus | Built into JavaScript, zero bytes, browser DevTools compatible |
| CustomEvent | Native | Event data passing | Built into JavaScript, supports detail property for payload |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| [idb](https://github.com/jakearchibald/idb) | 8.x | Full IndexedDB wrapper | Only if needing cursors, indexes, complex queries (not needed for Phase 1) |
| [Notyf](https://carlosroso.com/notyf/) | 3.x | Toast notifications | If custom toast implementation proves too complex (~3KB) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| idb-keyval | localForage | localForage is larger (7KB) but falls back to localStorage (defeats migration purpose) |
| idb-keyval | Dexie.js | Dexie is powerful (20KB) but overkill for key-value storage |
| Native EventTarget | mitt | mitt is 200 bytes but adds dependency for marginal gain |
| Native EventTarget | js-event-bus | More features but unnecessary complexity |

**Installation:**
```bash
npm install idb-keyval
```

No other installations needed - Storage Quota API and EventTarget are browser natives.

## Architecture Patterns

### Recommended Project Structure
```
js/
├── core/
│   ├── storage.js           # Storage abstraction layer
│   ├── eventBus.js          # Event bus singleton
│   └── storageMonitor.js    # Capacity monitoring
├── data/
│   └── migration.js         # localStorage -> IndexedDB migration
└── ... (existing files)
```

### Pattern 1: Storage Abstraction Layer
**What:** A unified interface that can switch between localStorage and IndexedDB without changing calling code.
**When to use:** Always for persistent storage operations.
**Example:**
```javascript
// Source: idb-keyval official documentation + custom abstraction
import { get, set, del, keys, clear } from 'idb-keyval';

const STORAGE_KEY = 'lagomstronk_data';

// Feature flag for migration control
let useIndexedDB = false;

export async function storageGet(key) {
  if (useIndexedDB) {
    return await get(key);
  }
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export async function storageSet(key, value) {
  if (useIndexedDB) {
    await set(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function storageDelete(key) {
  if (useIndexedDB) {
    await del(key);
  } else {
    localStorage.removeItem(key);
  }
}

export function enableIndexedDB() {
  useIndexedDB = true;
}

export function isUsingIndexedDB() {
  return useIndexedDB;
}
```

### Pattern 2: Event Bus (EventTarget-based)
**What:** A singleton event bus using native EventTarget for decoupled feature communication.
**When to use:** Cross-module communication, gamification triggers, storage events.
**Example:**
```javascript
// Source: CSS-Tricks EventTarget pattern + MDN CustomEvent docs
class EventBus {
  constructor(description = 'lagomstronk-event-bus') {
    // Comment node as event target - invisible in DOM, supports addEventListener
    this.eventTarget = document.appendChild(
      document.createComment(description)
    );
  }

  on(eventType, listener) {
    this.eventTarget.addEventListener(eventType, listener);
    return () => this.off(eventType, listener); // Return unsubscribe function
  }

  once(eventType, listener) {
    this.eventTarget.addEventListener(eventType, listener, { once: true });
  }

  off(eventType, listener) {
    this.eventTarget.removeEventListener(eventType, listener);
  }

  emit(eventType, detail = null) {
    return this.eventTarget.dispatchEvent(
      new CustomEvent(eventType, { detail })
    );
  }
}

// Singleton export
export const eventBus = new EventBus();

// Event type constants (prevents typos)
export const EVENTS = {
  WORKOUT_COMPLETED: 'workout:completed',
  EXERCISE_ADDED: 'exercise:added',
  STORAGE_WARNING: 'storage:warning',
  STORAGE_CRITICAL: 'storage:critical',
  MIGRATION_STARTED: 'migration:started',
  MIGRATION_COMPLETE: 'migration:complete',
  MIGRATION_FAILED: 'migration:failed'
};
```

### Pattern 3: Storage Capacity Monitor
**What:** Periodic monitoring of storage usage with event-driven warnings.
**When to use:** On app load and after storage operations.
**Example:**
```javascript
// Source: MDN StorageManager.estimate() documentation
import { eventBus, EVENTS } from './eventBus.js';

const WARNING_THRESHOLD = 0.70; // 70%
const CRITICAL_THRESHOLD = 0.90; // 90%

let warningShownThisSession = false;
let criticalShownThisSession = false;

export async function checkStorageCapacity() {
  if (!navigator.storage || !navigator.storage.estimate) {
    console.warn('Storage Quota API not supported');
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? usage / quota : 0;

    // Emit warning events based on thresholds
    if (percentUsed >= CRITICAL_THRESHOLD && !criticalShownThisSession) {
      criticalShownThisSession = true;
      eventBus.emit(EVENTS.STORAGE_CRITICAL, {
        usage,
        quota,
        percentUsed: Math.round(percentUsed * 100)
      });
    } else if (percentUsed >= WARNING_THRESHOLD && !warningShownThisSession) {
      warningShownThisSession = true;
      eventBus.emit(EVENTS.STORAGE_WARNING, {
        usage,
        quota,
        percentUsed: Math.round(percentUsed * 100)
      });
    }

    return {
      usage,
      quota,
      percentUsed: Math.round(percentUsed * 100),
      usageMB: (usage / 1024 / 1024).toFixed(2),
      quotaMB: (quota / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Error checking storage capacity:', error);
    return null;
  }
}

export function resetSessionWarnings() {
  warningShownThisSession = false;
  criticalShownThisSession = false;
}
```

### Pattern 4: Silent Migration with Retry
**What:** Migrate localStorage data to IndexedDB on app load, with error recovery.
**When to use:** App initialization, before any data operations.
**Example:**
```javascript
// Source: Migration patterns research + IndexedDB best practices
import { get, set } from 'idb-keyval';
import { eventBus, EVENTS } from './eventBus.js';

const STORAGE_KEY = 'lagomstronk_data';
const MIGRATION_FLAG_KEY = 'lagomstronk_migrated';
const BACKUP_KEY = 'lagomstronk_backup';

export async function migrateToIndexedDB() {
  // Check if already migrated
  const migrated = await get(MIGRATION_FLAG_KEY);
  if (migrated) {
    return { success: true, skipped: true };
  }

  eventBus.emit(EVENTS.MIGRATION_STARTED);

  try {
    // Read from localStorage
    const localStorageData = localStorage.getItem(STORAGE_KEY);
    if (!localStorageData) {
      // No data to migrate
      await set(MIGRATION_FLAG_KEY, { migratedAt: new Date().toISOString() });
      eventBus.emit(EVENTS.MIGRATION_COMPLETE, { hadData: false });
      return { success: true, hadData: false };
    }

    const data = JSON.parse(localStorageData);

    // Write to IndexedDB
    await set(STORAGE_KEY, data);

    // Verify migration
    const verified = await get(STORAGE_KEY);
    if (!verified || JSON.stringify(verified) !== JSON.stringify(data)) {
      throw new Error('Migration verification failed');
    }

    // Mark as migrated
    await set(MIGRATION_FLAG_KEY, {
      migratedAt: new Date().toISOString(),
      workoutCount: data.workouts?.length || 0
    });

    // Keep localStorage backup (don't delete until quota pressure)
    localStorage.setItem(BACKUP_KEY, localStorageData);

    eventBus.emit(EVENTS.MIGRATION_COMPLETE, {
      hadData: true,
      workoutCount: data.workouts?.length || 0
    });

    return { success: true, hadData: true };

  } catch (error) {
    console.error('Migration failed:', error);
    eventBus.emit(EVENTS.MIGRATION_FAILED, { error: error.message });
    return { success: false, error: error.message };
  }
}

export async function retryMigration() {
  // Clear migration flag to allow retry
  await set(MIGRATION_FLAG_KEY, null);
  return migrateToIndexedDB();
}
```

### Anti-Patterns to Avoid
- **Synchronous storage in async world:** Never mix sync localStorage calls with async IndexedDB without proper abstraction.
- **Deleting localStorage immediately:** Keep backup until quota pressure; users may need rollback path.
- **Ignoring multi-tab conflicts:** IndexedDB version changes can conflict across tabs; handle `onversionchange` events.
- **Hardcoded storage keys:** Use constants to prevent typos and enable find-all-references.
- **No verification after write:** Always verify data integrity after migration before marking complete.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB promise wrapper | Raw IndexedDB callbacks | idb-keyval | 295 bytes, handles edge cases, maintained by Chrome team |
| Storage quota checking | Manual byte counting | `navigator.storage.estimate()` | Browser API since 2023, handles compression/deduplication |
| Event system | Custom callback arrays | Native EventTarget | Built-in, zero bytes, DevTools compatible, memory-leak resistant |
| Toast notifications | Custom DOM manipulation | CSS + JS pattern or Notyf | Toast positioning, animation timing, a11y are complex |

**Key insight:** Browser APIs have matured significantly. The Storage Quota API, EventTarget, and CustomEvent cover most needs without libraries. idb-keyval is the one external dependency worth adding because raw IndexedDB is genuinely painful.

## Common Pitfalls

### Pitfall 1: Assuming Storage Quota Values Are Exact
**What goes wrong:** Code relies on exact byte values from `navigator.storage.estimate()`, but values are approximations.
**Why it happens:** MDN documents that values are "not exact" due to compression, deduplication, and security obfuscation.
**How to avoid:** Use percentage thresholds (70%, 90%), not absolute byte values. Never display raw bytes to users.
**Warning signs:** Tests pass locally but fail in production; different browsers report wildly different values.

### Pitfall 2: Migration Without Verification
**What goes wrong:** Data written to IndexedDB, localStorage deleted, but IndexedDB write silently failed.
**Why it happens:** IndexedDB operations are async; developers assume success without verification.
**How to avoid:** Always read back after write and compare with original. Keep localStorage backup until verified.
**Warning signs:** Users report missing data after app update.

### Pitfall 3: Multi-Tab Version Conflicts
**What goes wrong:** User has app open in two tabs. One tab triggers migration, other tab continues using localStorage.
**Why it happens:** IndexedDB `onupgradeneeded` blocks while other connections exist.
**How to avoid:** Listen for `onversionchange` event, prompt user to close other tabs or auto-refresh.
**Warning signs:** Migration hangs; users see "blocked" errors.

### Pitfall 4: Session-Based Warning Shows Repeatedly
**What goes wrong:** 70% warning shown, user dismisses, navigates to another view, warning shows again.
**Why it happens:** "Once per session" flag reset on view change or state loss.
**How to avoid:** Store session flag in sessionStorage or module-level variable. Use event bus to coordinate.
**Warning signs:** Users complain about annoying repeated warnings.

### Pitfall 5: Toast Notification Accessibility
**What goes wrong:** Toast shows but screen readers don't announce it; users with motor disabilities can't dismiss it.
**Why it happens:** Missing `role="alert"` or `aria-live`; dismiss button too small or missing.
**How to avoid:** Use `role="alert"` for warnings, `role="status"` for info. Auto-dismiss with generous timing (5+ seconds). Ensure focusable dismiss button.
**Warning signs:** Accessibility audit failures; user complaints.

## Code Examples

Verified patterns from official sources:

### Storage Abstraction with Migration Check
```javascript
// Source: idb-keyval docs + custom migration logic
import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'lagomstronk_data';
const MIGRATION_FLAG = 'lagomstronk_migrated';

let storageMode = 'localStorage'; // 'localStorage' | 'indexedDB'

export async function initializeStorage() {
  const migrated = await get(MIGRATION_FLAG);
  storageMode = migrated ? 'indexedDB' : 'localStorage';
  return storageMode;
}

export async function loadData() {
  if (storageMode === 'indexedDB') {
    return await get(STORAGE_KEY) || getDefaultData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : getDefaultData();
}

export async function saveData(data) {
  if (storageMode === 'indexedDB') {
    await set(STORAGE_KEY, data);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
```

### Event Bus Usage for Decoupled Features
```javascript
// Source: CSS-Tricks EventTarget pattern
import { eventBus, EVENTS } from './core/eventBus.js';

// In data module - emit workout completion
export function saveWorkout(data, dateStr, exercises) {
  // ... existing save logic ...

  eventBus.emit(EVENTS.WORKOUT_COMPLETED, {
    date: dateStr,
    exerciseCount: exercises.length,
    totalVolume: calculateVolume(exercises)
  });

  return data;
}

// In future gamification module - subscribe to events
eventBus.on(EVENTS.WORKOUT_COMPLETED, ({ detail }) => {
  checkAchievements(detail);
  updateStreak(detail.date);
});

// In storage monitor - emit warnings
eventBus.on(EVENTS.STORAGE_WARNING, ({ detail }) => {
  showStorageWarningToast(detail.percentUsed);
});
```

### Toast Notification Pattern
```javascript
// Source: Notyf pattern + vanilla implementation
function showToast(message, type = 'info', options = {}) {
  const {
    duration = 5000,
    dismissible = true,
    position = 'top-right'
  } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-${position}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  toast.innerHTML = `
    <div class="toast-content">${message}</div>
    ${dismissible ? '<button class="toast-dismiss" aria-label="Dismiss">&times;</button>' : ''}
  `;

  const container = document.getElementById('toast-container') || createToastContainer();
  container.appendChild(toast);

  // Auto dismiss
  const timeoutId = setTimeout(() => removeToast(toast), duration);

  // Manual dismiss
  if (dismissible) {
    toast.querySelector('.toast-dismiss').addEventListener('click', () => {
      clearTimeout(timeoutId);
      removeToast(toast);
    });
  }

  return toast;
}

function removeToast(toast) {
  toast.classList.add('toast-exit');
  setTimeout(() => toast.remove(), 300); // Match CSS animation
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw IndexedDB callbacks | Promise wrappers (idb-keyval) | 2018+ | Much simpler async code |
| document.createEvent + initEvent | `new CustomEvent(type, { detail })` | 2016 | Cleaner API, better TypeScript support |
| Manual quota checking | `navigator.storage.estimate()` | Baseline 2023 | Reliable cross-browser API |
| Event emitter libraries (EventEmitter3) | Native EventTarget | Always available | Zero dependencies, browser support |

**Deprecated/outdated:**
- **localForage localStorage fallback:** If you need IndexedDB, you need IndexedDB. Fallback defeats migration purpose.
- **document.createEvent/initEvent:** Deprecated since 2016. Use `new Event()` or `new CustomEvent()`.
- **synchronous storage patterns:** Modern apps should treat all storage as async from day one.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact quota values per browser**
   - What we know: Storage Quota API returns estimates, not exact values
   - What's unclear: Exact threshold where 70% estimate maps to actual limit
   - Recommendation: Use percentage thresholds conservatively; 70% warning is safe

2. **Multi-tab migration coordination**
   - What we know: IndexedDB has `onversionchange` event for cross-tab communication
   - What's unclear: Best UX for prompting user to close other tabs
   - Recommendation: Show modal in old tabs asking to refresh; use BroadcastChannel API if needed

3. **Backup retention duration**
   - What we know: User prefers keeping localStorage backup until quota pressure
   - What's unclear: When to delete backup automatically
   - Recommendation: Keep backup indefinitely; only delete if quota approaches 90% AND migration verified

## Sources

### Primary (HIGH confidence)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) - API documentation, bundle size (295 bytes)
- [idb GitHub](https://github.com/jakearchibald/idb) - Full IndexedDB wrapper (1.19KB), upgrade patterns
- [MDN StorageManager.estimate()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate) - Storage Quota API specification
- [MDN Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) - onupgradeneeded patterns, versioning
- [CSS-Tricks EventTarget Event Bus](https://css-tricks.com/lets-create-a-lightweight-native-event-bus-in-javascript/) - Native event bus implementation

### Secondary (MEDIUM confidence)
- [Best library for IndexedDB comparison](https://www.paultman.com/posts/best-library-for-indexeddb-localforage-idb-keyval-or-idb/) - idb-keyval vs idb vs localForage
- [npm-compare IndexedDB libraries](https://npm-compare.com/dexie,idb-keyval,localforage) - Bundle size comparisons
- [DEV Community localStorage vs IndexedDB](https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai) - Migration considerations

### Tertiary (LOW confidence)
- Toast notification patterns from various blog posts - Needs validation with accessibility audit

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - idb-keyval and Storage Quota API verified from official sources
- Architecture: HIGH - Patterns verified from MDN and Google Chrome team recommendations
- Pitfalls: HIGH - localStorage quota, migration verification documented in official guides
- Event bus: HIGH - Native EventTarget is browser standard since IE9

**Research date:** 2026-02-05
**Valid until:** 6 months (stable APIs, unlikely to change significantly)
