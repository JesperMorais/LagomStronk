/**
 * Storage Monitor - Tracks storage capacity and emits warnings
 *
 * Monitors browser storage usage using the Storage Quota API.
 * Emits events at 70% (warning) and 90% (critical) thresholds.
 * Events fire only once per session to avoid notification spam.
 */

import { eventBus, EVENTS } from './eventBus.js';

const WARNING_THRESHOLD = 0.70;  // 70%
const CRITICAL_THRESHOLD = 0.90; // 90%

// Session tracking - prevents repeated warnings
let warningShownThisSession = false;
let criticalShownThisSession = false;

/**
 * Check current storage capacity and emit events if thresholds exceeded
 * @returns {Object|null} Storage info object or null if API unavailable
 */
export async function checkStorageCapacity() {
  // Check for Storage Quota API support
  if (!navigator.storage || !navigator.storage.estimate) {
    console.warn('Storage Quota API not supported');
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? usage / quota : 0;

    // Emit critical event if threshold exceeded (check critical first)
    if (percentUsed >= CRITICAL_THRESHOLD && !criticalShownThisSession) {
      criticalShownThisSession = true;
      eventBus.emit(EVENTS.STORAGE_CRITICAL, {
        usage,
        quota,
        percentUsed: Math.round(percentUsed * 100)
      });
    }
    // Emit warning event if threshold exceeded
    else if (percentUsed >= WARNING_THRESHOLD && !warningShownThisSession) {
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

/**
 * Reset session warning flags (useful for testing)
 */
export function resetSessionWarnings() {
  warningShownThisSession = false;
  criticalShownThisSession = false;
}
