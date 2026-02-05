/**
 * Mini-player component for active workouts
 * Spotify-style floating bar that shows workout name and timer
 */

export class MiniPlayer {
  constructor() {
    this.element = null;
    this.workout = null;
    this.timerInterval = null;
    this.startTime = null;
    this.isResting = false;
    this.restEndTime = null;
    this.isVisible = false;
  }

  render() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'mini-player';
      this.element.innerHTML = `
        <div class="mini-player-content">
          <div class="mini-player-info">
            <div class="mini-player-name"></div>
            <div class="mini-player-timer"></div>
          </div>
          <button class="mini-player-expand" aria-label="Expand workout">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      `;

      // Add click handler for expand button
      const expandBtn = this.element.querySelector('.mini-player-expand');
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.expand();
      });

      // Add click handler for entire mini-player
      this.element.addEventListener('click', () => {
        this.expand();
      });

      document.body.appendChild(this.element);
    }

    return this.element;
  }

  show(workoutData) {
    this.workout = workoutData;
    // Use provided startTime or current time
    this.startTime = workoutData.startTime || Date.now();
    this.isResting = false;
    this.restEndTime = null;

    this.render();

    const nameEl = this.element.querySelector('.mini-player-name');
    nameEl.textContent = workoutData.name || 'Active Workout';

    // Add visible class after small delay for animation
    setTimeout(() => {
      this.element.classList.add('visible');
      this.isVisible = true;
      // Add body padding to prevent content being hidden
      document.body.classList.add('mini-player-active');
    }, 10);

    this.startTimer();
  }

  hide() {
    if (!this.element) return;

    this.stopTimer();
    this.element.classList.remove('visible');
    document.body.classList.remove('mini-player-active');
    this.isVisible = false;

    // Remove element after animation
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
      }
    }, 300);
  }

  startTimer() {
    this.stopTimer(); // Clear any existing timer
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimer() {
    const timerEl = this.element?.querySelector('.mini-player-timer');
    if (!timerEl) return;

    if (this.isResting && this.restEndTime) {
      // Rest countdown
      const remaining = Math.max(0, this.restEndTime - Date.now());
      const seconds = Math.ceil(remaining / 1000);

      if (seconds === 0) {
        // Rest complete
        this.isResting = false;
        this.restEndTime = null;
        timerEl.textContent = this.formatTime(Math.floor((Date.now() - this.startTime) / 1000));
        timerEl.classList.remove('resting');

        // Optional: haptic feedback when rest ends
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        timerEl.textContent = `Rest: ${this.formatTime(seconds)}`;
        timerEl.classList.add('resting');
      }
    } else {
      // Workout duration
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      timerEl.textContent = this.formatTime(elapsed);
      timerEl.classList.remove('resting');
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  startRest(durationSeconds) {
    this.isResting = true;
    this.restEndTime = Date.now() + (durationSeconds * 1000);
    this.updateTimer();
  }

  expand() {
    // Dispatch custom event that app.js will listen for
    window.dispatchEvent(new CustomEvent('mini-player:expand', {
      detail: { workout: this.workout }
    }));
  }
}

// Singleton instance
let miniPlayerInstance = null;

/**
 * Initialize mini-player singleton
 */
export function initMiniPlayer() {
  if (!miniPlayerInstance) {
    miniPlayerInstance = new MiniPlayer();
  }
  return miniPlayerInstance;
}

/**
 * Show mini-player with workout data
 * @param {Object} workoutData - Workout info { name, date, etc }
 */
export function showMiniPlayer(workoutData) {
  const player = initMiniPlayer();
  player.show(workoutData);
  return player;
}

/**
 * Hide mini-player
 */
export function hideMiniPlayer() {
  if (miniPlayerInstance) {
    miniPlayerInstance.hide();
  }
}

/**
 * Get mini-player instance
 */
export function getMiniPlayer() {
  return miniPlayerInstance;
}
