// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] New Service Worker installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              console.log('[App] New content available, refresh to update');
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] New Service Worker activated');
    });
  });
}

// Show update notification to user
function showUpdateNotification() {
  // Create a simple notification bar
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <span>New version available!</span>
    <button onclick="location.reload()">Update</button>
  `;
  document.body.appendChild(notification);
}

// Check if app is running offline
function isOffline() {
  return !navigator.onLine;
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('[App] Back online');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  console.log('[App] Gone offline');
  document.body.classList.add('offline');
});

// Set initial offline state
if (isOffline()) {
  document.body.classList.add('offline');
}

// ========== Install App Functionality ==========

// Store the install prompt event
let deferredPrompt = null;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[App] beforeinstallprompt fired');
  e.preventDefault();
  deferredPrompt = e;

  // Show the install button
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
  }
});

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('[App] App was installed');
  deferredPrompt = null;

  // Hide the install button
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.classList.add('hidden');
  }
});

// Install button click handler
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('install-btn');
  const installModal = document.getElementById('install-modal');
  const closeInstallModal = document.getElementById('close-install-modal');
  const closeInstallBtn = document.getElementById('close-install-btn');

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      // If we have the native prompt, use it
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log('[App] User choice:', choiceResult.outcome);
          deferredPrompt = null;
        });
      } else {
        // Show manual installation instructions
        if (installModal) {
          installModal.classList.add('active');
        }
      }
    });
  }

  // Close modal handlers
  if (closeInstallModal) {
    closeInstallModal.addEventListener('click', () => {
      installModal.classList.remove('active');
    });
  }

  if (closeInstallBtn) {
    closeInstallBtn.addEventListener('click', () => {
      installModal.classList.remove('active');
    });
  }

  if (installModal) {
    installModal.addEventListener('click', (e) => {
      if (e.target === installModal) {
        installModal.classList.remove('active');
      }
    });
  }

  // Check if already installed (standalone mode)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[App] Running in standalone mode');
    if (installBtn) {
      installBtn.classList.add('hidden');
    }
  }
});
