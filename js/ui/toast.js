/**
 * Toast Notification System
 *
 * Provides accessible, dismissible toast notifications.
 * Subscribes to storage events and displays appropriate warnings.
 */

import { eventBus, EVENTS } from '../core/eventBus.js';

/**
 * Show a toast notification
 * @param {string} message - Toast content (can include HTML)
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 * @param {object} options - { duration, dismissible }
 */
export function showToast(message, type = 'info', options = {}) {
  const {
    duration = 5000,
    dismissible = true
  } = options;

  const container = getOrCreateContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  toast.innerHTML = `
    <div class="toast-content">${message}</div>
    ${dismissible ? '<button class="toast-dismiss" aria-label="Dismiss notification">&times;</button>' : ''}
  `;

  container.appendChild(toast);

  // Auto dismiss
  let timeoutId = null;
  if (duration > 0) {
    timeoutId = setTimeout(() => removeToast(toast), duration);
  }

  // Manual dismiss
  if (dismissible) {
    const dismissBtn = toast.querySelector('.toast-dismiss');
    dismissBtn.addEventListener('click', () => {
      if (timeoutId) clearTimeout(timeoutId);
      removeToast(toast);
    });
  }

  return toast;
}

function removeToast(toast) {
  toast.classList.add('toast-exit');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 300); // Match CSS animation duration
}

function getOrCreateContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show storage warning toast (70% capacity)
 */
export function showStorageWarning(percentUsed) {
  showToast(
    `<strong>Storage Getting Full</strong>
     You're using ${percentUsed}% of available storage. Consider exporting old workouts to free up space.`,
    'warning',
    { duration: 8000 }
  );
}

/**
 * Show storage critical toast (90% capacity)
 */
export function showStorageCritical(percentUsed) {
  showToast(
    `<strong>Storage Almost Full!</strong>
     You're using ${percentUsed}% of available storage. Export and delete old workouts to prevent data loss.`,
    'error',
    { duration: 0, dismissible: true } // Duration 0 = stays until dismissed
  );
}

/**
 * Show migration error toast with retry
 */
export function showMigrationError(error, onRetry) {
  const toast = showToast(
    `<strong>Data Migration Failed</strong>
     ${error || 'Unknown error'}.
     <button id="retry-migration-btn" style="margin-top:8px;padding:4px 12px;background:var(--primary-color);border:none;border-radius:4px;color:white;cursor:pointer;">Retry</button>`,
    'error',
    { duration: 0, dismissible: true }
  );

  // Attach retry handler
  const retryBtn = toast.querySelector('#retry-migration-btn');
  if (retryBtn && onRetry) {
    retryBtn.addEventListener('click', () => {
      removeToast(toast);
      onRetry();
    });
  }
}

// Subscribe to storage events
eventBus.on(EVENTS.STORAGE_WARNING, ({ detail }) => {
  showStorageWarning(detail.percentUsed);
});

eventBus.on(EVENTS.STORAGE_CRITICAL, ({ detail }) => {
  showStorageCritical(detail.percentUsed);
});
