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
