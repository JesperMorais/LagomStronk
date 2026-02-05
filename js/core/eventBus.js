/**
 * Event Bus - Native EventTarget-based pub/sub system
 *
 * Provides decoupled communication between modules without dependencies.
 * Uses browser's native EventTarget API with zero overhead.
 */

class EventBus {
  constructor(description = 'lagomstronk-event-bus') {
    // Use comment node as event target - invisible in DOM, supports addEventListener
    this.eventTarget = document.appendChild(
      document.createComment(description)
    );
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Event type to listen for
   * @param {Function} listener - Event handler function
   * @returns {Function} Unsubscribe function
   */
  on(eventType, listener) {
    this.eventTarget.addEventListener(eventType, listener);
    // Return unsubscribe function for convenience
    return () => this.off(eventType, listener);
  }

  /**
   * Subscribe to an event that fires only once
   * @param {string} eventType - Event type to listen for
   * @param {Function} listener - Event handler function
   */
  once(eventType, listener) {
    this.eventTarget.addEventListener(eventType, listener, { once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - Event type to stop listening for
   * @param {Function} listener - Event handler to remove
   */
  off(eventType, listener) {
    this.eventTarget.removeEventListener(eventType, listener);
  }

  /**
   * Emit an event with optional data
   * @param {string} eventType - Event type to emit
   * @param {any} detail - Event payload (available as event.detail)
   * @returns {boolean} False if event was cancelled, true otherwise
   */
  emit(eventType, detail = null) {
    return this.eventTarget.dispatchEvent(
      new CustomEvent(eventType, { detail })
    );
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Event type constants to prevent typos
export const EVENTS = {
  // Workout events
  WORKOUT_COMPLETED: 'workout:completed',
  EXERCISE_ADDED: 'exercise:added',

  // Storage events
  STORAGE_WARNING: 'storage:warning',
  STORAGE_CRITICAL: 'storage:critical',

  // Migration events
  MIGRATION_STARTED: 'migration:started',
  MIGRATION_COMPLETE: 'migration:complete',
  MIGRATION_FAILED: 'migration:failed'
};
