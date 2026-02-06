# Phase 2: UX Overhaul & Exercise System - Research

**Researched:** 2026-02-05
**Domain:** UI/UX Enhancement, Dashboard Design, Animation Systems, Exercise Management
**Confidence:** MEDIUM-HIGH

## Summary

This phase focuses on modernizing the app's user interface with a hero-based dashboard, improving workout logging UX with animations and helpful hints, and building a comprehensive exercise library with filtering and search. The research covers five key technical domains: data visualization with Chart.js, animation libraries for delightful interactions, custom numpad implementation, calendar UI patterns, and exercise filtering patterns.

The standard approach combines Chart.js (already in use) for stunning volume charts with gradient styling, Motion One (3.8kb) for micro-interactions and checkmark animations, canvas-confetti (10kb) for celebration effects, and vanilla JavaScript patterns for the custom numpad and filtering system. All solutions are lightweight, vanilla JS compatible, and follow modern mobile-first design patterns.

User decisions from CONTEXT.md constrain the research: hero + sections layout with customizable content, Spotify-style floating mini-player, custom numpad matching inspiration image, and specific color palette adherence. These locked decisions guide implementation choices rather than exploring alternatives.

**Primary recommendation:** Use Chart.js gradients for stunning visualizations, Motion One for all UI animations including checkmarks, canvas-confetti for PRs/achievements, vanilla JS for custom numpad (no library needed), and standard CSS patterns for filter drawer and floating mini-player.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Chart.js | 4.5.1 | Volume charts, progress visualizations | Already in use. Industry standard for canvas-based charts. Gradient support built-in. MIT license |
| Motion One | 11.x | UI animations, checkmarks, springs | Lightweight (3.8kb), modern WAAPI polyfill, MIT license. Replaced larger alternatives (GSAP 34kb, Anime 24kb) |
| canvas-confetti | 1.9.4 | Celebration effects (PRs, streaks) | 10kb, zero dependencies, highly customizable. ISC license |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Fuse.js | 7.x | Exercise search fuzzy matching | Optional: if simple string matching insufficient. 3kb, zero deps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion One | GSAP | GSAP is 34kb vs 3.8kb, more features but heavier. Both now free (MIT/proprietary) |
| Motion One | Anime.js | Anime.js is 24kb, older API patterns, less active development |
| canvas-confetti | js-confetti | Both ~10kb, similar features. canvas-confetti has broader adoption |
| Vanilla JS numpad | numeric-keyboard lib | Library adds 15kb+ overhead for functionality achievable in 50 lines |
| Vanilla JS calendar | Mobiscroll/Syncfusion | Commercial libraries overkill for simple month/week view toggle |

**Installation:**
```bash
# Animation (CDN recommended for small bundle)
# Motion One can be imported via ESM:
# import { animate } from "https://esm.sh/motion@11"

# Or npm:
npm install motion

# Confetti (CDN recommended)
# <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4"></script>

# Or npm:
npm install canvas-confetti

# Chart.js already installed (verify version)
npm install chart.js@^4.5.0

# Optional: Exercise search
npm install fuse.js@^7.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
js/
├── ui/
│   ├── components/
│   │   ├── numpad.js           # Custom numeric keypad
│   │   ├── miniPlayer.js       # Floating workout mini-player
│   │   ├── filterDrawer.js     # Exercise filter drawer
│   │   └── calendar.js         # Workout history calendar
│   ├── animations/
│   │   ├── checkmark.js        # Set completion animation
│   │   ├── confetti.js         # PR celebration effects
│   │   └── transitions.js      # View transitions, card animations
│   └── dashboard/
│       ├── hero.js             # Hero section with streak/suggested workout
│       ├── volumeChart.js      # Chart.js volume visualization
│       └── prCards.js          # Scrollable PR cards
├── data/
│   └── exercises.js            # Exercise database with search/filter
└── utils/
    └── skeleton.js             # Loading skeleton helpers
```

### Pattern 1: Chart.js Gradient Bar Charts
**What:** Create stunning volume visualizations using linear gradients on bar charts.
**When to use:** Volume charts (weekly daily volume, 5-week overview with goal line).
**Example:**
```javascript
// Source: https://www.chartjs.org/docs/latest/samples/advanced/linear-gradient.html
const ctx = document.getElementById('volumeChart').getContext('2d');

// Create gradient
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(209, 255, 198, 0.8)');   // mint
gradient.addColorStop(1, 'rgba(209, 255, 198, 0.2)');   // mint-transparent

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Volume (kg)',
      data: [2500, 3200, 0, 2800, 3500, 0, 2900],
      backgroundColor: gradient,
      borderRadius: 8,
      borderSkipped: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        grid: { display: false }
      }
    }
  }
});
```

**Goal line overlay:**
```javascript
// Add goal line as second dataset
datasets: [{
  // ... bar dataset
}, {
  type: 'line',
  label: 'Goal',
  data: Array(7).fill(3000),
  borderColor: '#fbbf24',  // amber
  borderWidth: 2,
  borderDash: [5, 5],
  pointRadius: 0
}]
```

### Pattern 2: Motion One Checkmark Animation
**What:** Spring-based checkmark animation using Motion One's spring generators.
**When to use:** Set completion, exercise completion, achievement unlocks.
**Example:**
```javascript
// Source: Motion One documentation + spring physics
import { animate, spring } from "motion";

function animateCheckmark(element) {
  // Scale pop with spring physics
  animate(
    element,
    { scale: [0, 1.2, 1] },
    {
      duration: 0.6,
      easing: spring({ stiffness: 300, damping: 15 })
    }
  );

  // SVG checkmark stroke animation
  const path = element.querySelector('path');
  const length = path.getTotalLength();

  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  animate(
    path,
    { strokeDashoffset: [length, 0] },
    { duration: 0.4, delay: 0.1 }
  );

  // Row highlight
  const row = element.closest('.set-row');
  animate(
    row,
    {
      backgroundColor: ['transparent', 'rgba(209, 255, 198, 0.15)']
    },
    { duration: 0.3 }
  );
}
```

### Pattern 3: Custom Numeric Keypad (Vanilla JS)
**What:** Build custom numpad matching design inspiration with +/- steppers, settings, NEXT button.
**When to use:** Weight/reps input during workout logging.
**Example:**
```javascript
// Source: https://code-boxx.com/pure-javascript-numeric-keypad/ (adapted)
class Numpad {
  constructor(config = {}) {
    this.maxDigits = config.maxDigits || 6;
    this.maxDecimals = config.maxDecimals || 1;
    this.step = config.step || 2.5;
    this.onNext = config.onNext || (() => {});
    this.currentInput = null;
    this.value = '';

    this.render();
    this.attachEvents();
  }

  render() {
    const numpadHTML = `
      <div id="numpad" class="numpad">
        <div class="numpad-display">
          <input type="text" readonly id="numpad-value" value="0">
        </div>
        <div class="numpad-grid">
          <button class="numpad-btn" data-digit="1">1</button>
          <button class="numpad-btn" data-digit="2">2</button>
          <button class="numpad-btn" data-digit="3">3</button>
          <button class="numpad-btn numpad-toggle" data-action="keyboard">⌨️</button>

          <button class="numpad-btn" data-digit="4">4</button>
          <button class="numpad-btn" data-digit="5">5</button>
          <button class="numpad-btn" data-digit="6">6</button>
          <button class="numpad-btn" data-action="minus">−</button>

          <button class="numpad-btn" data-digit="7">7</button>
          <button class="numpad-btn" data-digit="8">8</button>
          <button class="numpad-btn" data-digit="9">9</button>
          <button class="numpad-btn" data-action="plus">+</button>

          <button class="numpad-btn" data-digit=".">.</button>
          <button class="numpad-btn" data-digit="0">0</button>
          <button class="numpad-btn" data-action="backspace">⌫</button>
          <button class="numpad-btn" data-action="settings">⚙️</button>

          <button class="numpad-btn numpad-next" data-action="next">NEXT</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', numpadHTML);
    this.element = document.getElementById('numpad');
    this.display = document.getElementById('numpad-value');
  }

  attachEvents() {
    this.element.addEventListener('click', (e) => {
      const btn = e.target.closest('.numpad-btn');
      if (!btn) return;

      const digit = btn.dataset.digit;
      const action = btn.dataset.action;

      if (digit) this.addDigit(digit);
      else if (action === 'backspace') this.backspace();
      else if (action === 'plus') this.stepUp();
      else if (action === 'minus') this.stepDown();
      else if (action === 'next') this.next();
      else if (action === 'keyboard') this.toggleKeyboard();
      else if (action === 'settings') this.openSettings();
    });
  }

  addDigit(digit) {
    if (digit === '.' && this.value.includes('.')) return;
    if (this.value.length >= this.maxDigits) return;

    this.value = (this.value === '0' && digit !== '.') ? digit : this.value + digit;
    this.updateDisplay();
  }

  backspace() {
    this.value = this.value.slice(0, -1) || '0';
    this.updateDisplay();
  }

  stepUp() {
    const current = parseFloat(this.value) || 0;
    this.value = (current + this.step).toFixed(1);
    this.updateDisplay();
  }

  stepDown() {
    const current = parseFloat(this.value) || 0;
    this.value = Math.max(0, current - this.step).toFixed(1);
    this.updateDisplay();
  }

  updateDisplay() {
    this.display.value = this.value;
    if (this.currentInput) {
      this.currentInput.value = this.value;
    }
  }

  show(inputElement, initialValue = '0') {
    this.currentInput = inputElement;
    this.value = initialValue;
    this.updateDisplay();
    this.element.classList.add('active');
  }

  hide() {
    this.element.classList.remove('active');
    this.currentInput = null;
  }

  next() {
    this.onNext(parseFloat(this.value));
    this.hide();
  }
}

// Usage
const numpad = new Numpad({
  maxDigits: 6,
  maxDecimals: 1,
  step: 2.5,
  onNext: (value) => {
    console.log('User entered:', value);
    // Advance to next input field
  }
});

// Attach to input fields
document.querySelectorAll('.weight-input').forEach(input => {
  input.addEventListener('focus', () => {
    numpad.show(input, input.value || '0');
  });
});
```

### Pattern 4: Floating Mini-Player (Spotify-style)
**What:** Persistent bottom bar showing workout name + timer, tap to return to workout.
**When to use:** User navigates away from active workout.
**Example:**
```javascript
// Vanilla JS fixed-bottom pattern
class MiniPlayer {
  constructor() {
    this.element = null;
    this.workout = null;
    this.timerInterval = null;
  }

  show(workoutData) {
    this.workout = workoutData;
    this.render();
    this.startTimer();

    // Animate in from bottom
    requestAnimationFrame(() => {
      this.element.style.transform = 'translateY(0)';
    });
  }

  render() {
    const html = `
      <div class="mini-player" id="mini-player">
        <div class="mini-player-content">
          <div class="mini-player-info">
            <span class="mini-player-name">${this.workout.name}</span>
            <span class="mini-player-timer" id="mini-timer">00:00</span>
          </div>
          <button class="mini-player-expand" id="mini-expand">
            ↑
          </button>
        </div>
      </div>
    `;

    if (!this.element) {
      document.body.insertAdjacentHTML('beforeend', html);
      this.element = document.getElementById('mini-player');
      this.element.style.transform = 'translateY(100%)';

      // Tap to expand
      document.getElementById('mini-expand').addEventListener('click', () => {
        this.expand();
      });
    } else {
      this.element.querySelector('.mini-player-name').textContent = this.workout.name;
    }
  }

  startTimer() {
    let seconds = this.workout.elapsedSeconds || 0;
    const timerElement = document.getElementById('mini-timer');

    this.timerInterval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  hide() {
    this.element.style.transform = 'translateY(100%)';
    clearInterval(this.timerInterval);
    setTimeout(() => {
      this.element?.remove();
      this.element = null;
    }, 300);
  }

  expand() {
    // Navigate back to workout view
    window.location.hash = '#workout';
    this.hide();
  }
}

// Usage
const miniPlayer = new MiniPlayer();

// Show when user navigates away from active workout
function handleNavigation(newView) {
  if (activeWorkout && newView !== 'workout') {
    miniPlayer.show({
      name: activeWorkout.name,
      elapsedSeconds: activeWorkout.startTime ? Math.floor((Date.now() - activeWorkout.startTime) / 1000) : 0
    });
  } else {
    miniPlayer.hide();
  }
}
```

**CSS for mini-player:**
```css
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(35, 44, 51, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  padding: 12px 16px;
}

.mini-player-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.mini-player-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-player-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.mini-player-timer {
  font-size: 12px;
  color: #9ca3af;
}

.mini-player-expand {
  background: rgba(209, 255, 198, 0.15);
  border: 1px solid rgba(209, 255, 198, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  color: #D1FFC6;
  font-size: 20px;
}
```

### Pattern 5: Filter Drawer Pattern
**What:** Off-canvas drawer for exercise filtering by muscle group and equipment.
**When to use:** Exercise library view, workout builder.
**Example:**
```javascript
// Standard mobile filter drawer pattern
class FilterDrawer {
  constructor() {
    this.isOpen = false;
    this.filters = {
      muscleGroups: [],
      equipment: []
    };
    this.render();
  }

  render() {
    const html = `
      <div class="filter-drawer" id="filter-drawer">
        <div class="filter-overlay" id="filter-overlay"></div>
        <div class="filter-panel">
          <div class="filter-header">
            <h3>Filter Exercises</h3>
            <button class="filter-close" id="filter-close">✕</button>
          </div>

          <div class="filter-content">
            <div class="filter-section">
              <h4>Muscle Groups</h4>
              <div class="filter-chips" id="muscle-filters">
                <!-- Generated dynamically -->
              </div>
            </div>

            <div class="filter-section">
              <h4>Equipment</h4>
              <div class="filter-chips" id="equipment-filters">
                <!-- Generated dynamically -->
              </div>
            </div>
          </div>

          <div class="filter-actions">
            <button class="btn-secondary" id="filter-clear">Clear All</button>
            <button class="btn-primary" id="filter-apply">Apply Filters</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    this.element = document.getElementById('filter-drawer');
    this.attachEvents();
  }

  open() {
    this.isOpen = true;
    this.element.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('active');
    document.body.style.overflow = '';
  }

  attachEvents() {
    document.getElementById('filter-overlay').addEventListener('click', () => this.close());
    document.getElementById('filter-close').addEventListener('click', () => this.close());
    document.getElementById('filter-clear').addEventListener('click', () => this.clearFilters());
    document.getElementById('filter-apply').addEventListener('click', () => this.applyFilters());
  }
}
```

**CSS for filter drawer:**
```css
.filter-drawer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

.filter-drawer.active {
  pointer-events: auto;
}

.filter-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s;
}

.filter-drawer.active .filter-overlay {
  opacity: 1;
}

.filter-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 85%;
  max-width: 400px;
  background: #1e2a38;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.filter-drawer.active .filter-panel {
  transform: translateX(0);
}
```

### Pattern 6: Loading Skeletons
**What:** Placeholder UI that mimics final content structure during data loading.
**When to use:** Dashboard load, exercise library load, chart rendering (>300ms).
**Example:**
```javascript
// Skeleton pattern for workout history cards
function renderSkeleton(container, count = 3) {
  const skeletonHTML = Array(count).fill(null).map(() => `
    <div class="workout-card skeleton">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-date"></div>
      </div>
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
    </div>
  `).join('');

  container.innerHTML = skeletonHTML;
}

// CSS with wave animation
```css
.skeleton {
  animation: skeleton-wave 1.5s infinite;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
}

@keyframes skeleton-wave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-title {
  height: 20px;
  width: 60%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-date {
  height: 14px;
  width: 40%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}
```
```

### Pattern 7: Workout Calendar with Expandable Weeks
**What:** Month overview with day intensity markers, tap to expand week detail.
**When to use:** Workout history view.
**Example:**
```javascript
// Hybrid calendar pattern
class WorkoutCalendar {
  constructor(workoutData) {
    this.workouts = workoutData;
    this.currentMonth = new Date();
    this.expandedWeek = null;
  }

  render() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let html = '<div class="calendar-grid">';

    // Render days with workout intensity
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const workout = this.workouts.find(w => w.date === dateStr);

      const intensity = workout ? this.calculateIntensity(workout) : 0;

      html += `
        <button class="calendar-day"
                data-date="${dateStr}"
                style="background: ${this.getIntensityColor(intensity)}">
          <span>${day}</span>
        </button>
      `;
    }

    html += '</div>';
    return html;
  }

  calculateIntensity(workout) {
    // Volume-based intensity (0-1 scale)
    const totalVolume = workout.exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0);
    }, 0);

    return Math.min(totalVolume / 10000, 1); // Normalize to max 10000kg
  }

  getIntensityColor(intensity) {
    // Gradient from transparent to mint
    const alpha = 0.2 + (intensity * 0.6);
    return `rgba(209, 255, 198, ${alpha})`;
  }
}
```

### Anti-Patterns to Avoid
- **Heavy animation libraries:** Don't use GSAP (34kb) or Anime.js (24kb) when Motion One (3.8kb) suffices
- **Custom chart implementations:** Don't hand-roll bar charts. Chart.js handles gradients, animations, responsiveness
- **jQuery numpad plugins:** Modern vanilla JS is simpler and lighter than jQuery + plugin overhead
- **Commercial calendar libraries:** Mobiscroll/Syncfusion are overkill for simple month/week toggle
- **Inline styles for animations:** Use CSS classes + Motion One for reusable, performant animations
- **SVG confetti from scratch:** canvas-confetti is tested, performant, and 10kb. Don't rebuild it

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti effects | Custom canvas particle system | canvas-confetti | Edge cases: particle physics, gravity, drift, fade, canvas cleanup. 10kb vs 100+ lines |
| Chart gradients | Manual canvas gradient drawing | Chart.js gradients | Handles responsiveness, animations, accessibility, cross-browser quirks |
| Spring animations | Manual easing calculations | Motion One spring() | Physics calculations complex. Motion One's spring is 300 bytes, battle-tested |
| Filter drawer animations | CSS transitions only | Motion One + CSS | Smooth interruptions, gesture tracking, proper z-index handling |
| Fuzzy search | String.includes() loops | Fuse.js (optional) | Handles typos, scoring, highlighting. 3kb vs buggy custom implementation |

**Key insight:** UI animation and data visualization have solved problems. Chart.js and Motion One are tiny (7kb combined) compared to custom implementations that will be buggier, slower, and less accessible.

## Common Pitfalls

### Pitfall 1: Chart.js Gradient Lifecycle
**What goes wrong:** Creating new gradient on every chart update causes memory leaks.
**Why it happens:** Chart.js re-renders on data updates. Gradient references accumulate.
**How to avoid:** Create gradient once, reuse reference, or use chart plugin to manage lifecycle.
**Warning signs:** Browser memory growing over time, chart render getting slower.

```javascript
// BAD: Creates new gradient every update
function updateChart(data) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  chart.data.datasets[0].backgroundColor = gradient;
  chart.update();
}

// GOOD: Create gradient once
const volumeGradient = ctx.createLinearGradient(0, 0, 0, 400);
volumeGradient.addColorStop(0, 'rgba(209, 255, 198, 0.8)');
volumeGradient.addColorStop(1, 'rgba(209, 255, 198, 0.2)');

function updateChart(data) {
  chart.data.datasets[0].data = data;
  chart.update('none'); // Skip animation for performance
}
```

### Pitfall 2: Animation Performance on Low-End Devices
**What goes wrong:** Confetti with 500 particles drops to 20fps on budget Android phones.
**Why it happens:** Canvas rendering is CPU-intensive. Too many particles overwhelm GPU.
**How to avoid:** Cap particle count at 100 for confetti, use `will-change` CSS for animations, test on low-end device.
**Warning signs:** Janky animations, scroll lag during animations.

```javascript
// BAD: Too many particles
confetti({ particleCount: 500 });

// GOOD: Reasonable count with device detection
const isMobile = /Android|iPhone/i.test(navigator.userAgent);
confetti({
  particleCount: isMobile ? 50 : 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

### Pitfall 3: Numpad Z-Index Conflicts
**What goes wrong:** Numpad appears behind mini-player or other fixed elements.
**Why it happens:** Fixed positioning without proper z-index stacking context.
**How to avoid:** Use z-index hierarchy: toast (9999) > numpad (1001) > mini-player (100) > modals (1000).
**Warning signs:** Numpad partially visible, buttons unclickable.

```css
/* Z-index hierarchy */
.toast { z-index: 9999; }       /* Always on top */
.numpad { z-index: 1001; }      /* Above modals */
.filter-drawer { z-index: 1000; }
.mini-player { z-index: 100; }  /* Above content, below modals */
```

### Pitfall 4: Previous Set Hints with Empty History
**What goes wrong:** First workout shows empty placeholders, looks broken.
**Why it happens:** No previous set data exists for hints.
**How to avoid:** Show helpful text like "Add your first set" instead of empty placeholder.
**Warning signs:** User confusion on first workout, blank inputs.

```javascript
// BAD: Always show previous value
input.placeholder = previousSet?.weight || '';

// GOOD: Context-aware hints
if (previousSet) {
  input.placeholder = previousSet.weight;
  input.classList.add('has-hint');
} else if (isFirstWorkout) {
  input.placeholder = 'Start with a comfortable weight';
} else {
  input.placeholder = '0';
}
```

### Pitfall 5: Calendar Performance with Large History
**What goes wrong:** Rendering 1000+ workouts in calendar view freezes UI for 2+ seconds.
**Why it happens:** Calculating intensity for every day in 2-year history synchronously.
**How to avoid:** Paginate by month, calculate intensities on worker thread, cache calculations.
**Warning signs:** Calendar view slow to open, scroll jank.

```javascript
// BAD: Calculate all at once
workouts.forEach(w => calculateIntensity(w));

// GOOD: Calculate current month only, cache results
const monthCache = new Map();

function getMonthIntensities(year, month) {
  const key = `${year}-${month}`;
  if (monthCache.has(key)) return monthCache.get(key);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const intensities = workouts
    .filter(w => w.date >= monthStart && w.date <= monthEnd)
    .map(w => ({ date: w.date, intensity: calculateIntensity(w) }));

  monthCache.set(key, intensities);
  return intensities;
}
```

### Pitfall 6: Floating Mini-Player Navigation Loops
**What goes wrong:** Mini-player shows/hides repeatedly when navigating, causes flicker.
**Why it happens:** Navigation events fire during mini-player animations.
**How to avoid:** Debounce navigation handler, check if workout is actually active.
**Warning signs:** Mini-player flashing, animation interruptions.

```javascript
// BAD: Immediate show/hide
window.addEventListener('hashchange', () => {
  if (activeWorkout && location.hash !== '#workout') {
    miniPlayer.show();
  } else {
    miniPlayer.hide();
  }
});

// GOOD: Debounced with state check
let navigationTimeout;
window.addEventListener('hashchange', () => {
  clearTimeout(navigationTimeout);
  navigationTimeout = setTimeout(() => {
    const isWorkoutView = location.hash === '#workout';
    const shouldShow = activeWorkout && !isWorkoutView;

    if (shouldShow && !miniPlayer.isVisible) {
      miniPlayer.show();
    } else if (!shouldShow && miniPlayer.isVisible) {
      miniPlayer.hide();
    }
  }, 100);
});
```

## Code Examples

Verified patterns from official sources:

### Confetti on PR Achievement
```javascript
// Source: https://github.com/catdad/canvas-confetti
function celebratePR(exerciseName, newValue) {
  // Show toast notification
  showToast(`New PR! ${exerciseName}: ${newValue}kg`, 'success');

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#D1FFC6', '#86efac', '#ffffff']
  });

  // Optional: Second burst for extra celebration
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 250);
}
```

### Set Completion Flow
```javascript
// Source: Motion One + vanilla patterns
import { animate, spring } from "motion";

async function completeSet(setElement) {
  const checkbox = setElement.querySelector('.set-checkbox');
  const row = setElement.closest('.set-row');

  // 1. Checkmark pop animation
  await animate(
    checkbox,
    { scale: [0, 1.2, 1] },
    { duration: 0.5, easing: spring({ stiffness: 400, damping: 15 }) }
  ).finished;

  // 2. Row highlight
  row.classList.add('completed');
  animate(
    row,
    { backgroundColor: ['transparent', 'rgba(209, 255, 198, 0.15)'] },
    { duration: 0.3 }
  );

  // 3. Small confetti burst
  const rect = checkbox.getBoundingClientRect();
  confetti({
    particleCount: 20,
    spread: 40,
    origin: {
      x: rect.left / window.innerWidth,
      y: rect.top / window.innerHeight
    },
    colors: ['#D1FFC6']
  });

  // 4. Haptic feedback (if supported)
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // 5. Save state
  saveSetCompletion(setElement.dataset.setId);
}
```

### Volume Chart with Goal Line
```javascript
// Source: Chart.js documentation examples
function createVolumeChart(canvasId, weekData) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  // Create gradient for bars
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(209, 255, 198, 0.8)');
  gradient.addColorStop(1, 'rgba(209, 255, 198, 0.2)');

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Volume',
        data: weekData.volumes,
        backgroundColor: gradient,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 40
      }, {
        type: 'line',
        label: 'Goal',
        data: Array(7).fill(weekData.goal),
        borderColor: '#fbbf24',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(35, 44, 51, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(209, 255, 198, 0.3)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => {
              if (context.dataset.label === 'Goal') {
                return `Goal: ${context.parsed.y}kg`;
              }
              return `Volume: ${context.parsed.y}kg`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            callback: (value) => `${value}kg`
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af'
          }
        }
      }
    }
  });
}

// Usage
const volumeChart = createVolumeChart('volumeChartCanvas', {
  volumes: [2500, 3200, 0, 2800, 3500, 0, 2900],
  goal: 3000
});
```

### Filter Chips Toggle
```javascript
// Multi-select filter chips pattern
class FilterChips {
  constructor(containerId, options, onChangeCallback) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.selected = new Set();
    this.onChange = onChangeCallback;
    this.render();
  }

  render() {
    this.container.innerHTML = this.options.map(opt => `
      <button class="filter-chip" data-value="${opt.value}">
        ${opt.label}
      </button>
    `).join('');

    this.container.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      this.toggle(chip.dataset.value);
      chip.classList.toggle('active');
    });
  }

  toggle(value) {
    if (this.selected.has(value)) {
      this.selected.delete(value);
    } else {
      this.selected.add(value);
    }
    this.onChange(Array.from(this.selected));
  }

  clear() {
    this.selected.clear();
    this.container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    this.onChange([]);
  }
}

// Usage
const muscleFilter = new FilterChips('muscle-filters', [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Legs', value: 'legs' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Arms', value: 'arms' }
], (selected) => {
  console.log('Selected muscle groups:', selected);
  filterExercises({ muscleGroups: selected });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSAP for animations | Motion One | 2024 | Motion One is 3.8kb vs GSAP 34kb. Both free now, Motion preferred for bundle size |
| Anime.js | Motion One | 2024 | Motion One uses modern WAAPI, better performance, smaller (3.8kb vs 24kb) |
| Custom chart libraries | Chart.js 4.x | 2023 | Chart.js 4 added tree-shaking, TypeScript, better gradients. Now <70kb |
| jQuery numpad plugins | Vanilla JS patterns | 2020+ | Modern JS (ES6+) makes jQuery unnecessary. Simpler, lighter code |
| Commercial calendar libs | Vanilla JS + CSS Grid | 2022+ | CSS Grid makes calendar layout trivial. No need for 50kb+ libraries |
| Skeleton loaders as images | CSS-only skeletons | 2021+ | CSS animations perform better, no image downloads, easier to maintain |

**Deprecated/outdated:**
- **jQuery dependencies:** Modern browsers support all needed DOM APIs natively
- **Heavy animation libraries:** WAAPI support (96%+ browsers) makes polyfills tiny
- **Inline SVG for icons:** Use CSS shapes or icon fonts for better caching
- **localStorage for images:** IndexedDB required for blob storage (Phase 1 already migrated)

## Open Questions

Things that couldn't be fully resolved:

1. **Motion One exact bundle size**
   - What we know: Documentation claims 3.8kb for animate(), but exact breakdown unclear
   - What's unclear: Tree-shaking effectiveness, actual production bundle size with spring()
   - Recommendation: Install and measure with bundlephobia or webpack-bundle-analyzer

2. **Chart.js gradient responsiveness**
   - What we know: Gradients use canvas context, may need recreation on resize
   - What's unclear: Does Chart.js handle gradient recreation automatically on responsive resize?
   - Recommendation: Test on device rotation, implement resize listener if needed

3. **Confetti performance threshold**
   - What we know: 100 particles recommended, but device variance high
   - What's unclear: Exact particle count where low-end Android (2GB RAM) drops below 30fps
   - Recommendation: A/B test 50 vs 100 particles, add performance.now() measurements

4. **Skeleton vs spinner for dashboard load**
   - What we know: Skeletons preferred for >3s loads, spinners for 300ms-3s
   - What's unclear: Actual dashboard load time with IndexedDB queries
   - Recommendation: Measure with Performance API, use skeleton if >1s average

5. **Filter drawer vs bottom sheet on small phones**
   - What we know: Side drawer is standard, but 320px width screens are cramped
   - What's unclear: User preference for slide-up sheet vs side drawer on <375px width
   - Recommendation: Implement side drawer first (standard pattern), gather feedback

6. **Calendar month caching strategy**
   - What we know: Need to cache calculated intensities to avoid re-calculation
   - What's unclear: Cache invalidation strategy when workouts edited
   - Recommendation: Cache with workout count hash, invalidate on count change

## Sources

### Primary (HIGH confidence)
- [Chart.js Official Documentation](https://www.chartjs.org/docs/latest/) - Gradient examples, bar chart configuration
- [Chart.js Linear Gradient Sample](https://www.chartjs.org/docs/latest/samples/advanced/linear-gradient.html) - Official gradient implementation
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) - v1.9.4, API documentation, examples
- [Motion Dev](https://motion.dev/) - Official Motion library site
- [Motion One GitHub](https://github.com/motiondivision/motionone) - MIT license confirmation, module structure
- [Code Boxx Numpad Tutorial](https://code-boxx.com/pure-javascript-numeric-keypad/) - Vanilla JS numpad pattern

### Secondary (MEDIUM confidence)
- [Top 10 JavaScript Charting Libraries 2026 - Carmatec](https://www.carmatec.com/blog/top-10-javascript-charting-libraries/) - Chart.js ecosystem comparison
- [Motion One Bundle Size - LogRocket](https://blog.logrocket.com/exploring-motion-one-framer-motion/) - 3.8kb claim for animate()
- [Fitness App UX Best Practices - Stormotion](https://stormotion.io/blog/fitness-app-ux/) - Dashboard design patterns
- [Loading Skeleton Best Practices - NN/g](https://www.nngroup.com/articles/skeleton-screens/) - When to use skeletons vs spinners
- [Filter Drawer Patterns - Mobbin](https://mobbin.com/glossary/drawer) - Mobile filter UI patterns
- [FAB Design Patterns - Material Design 3](https://m3.material.io/components/floating-action-button/overview) - FAB positioning and behavior

### Tertiary (LOW confidence)
- [Motion Magazine - Should I use Framer Motion or Motion One?](https://motion.dev/magazine/should-i-use-framer-motion-or-motion-one) - Library comparison, unverified claims
- [Fitness Dashboard Templates - Exercise.com](https://www.exercise.com/grow/fitness-app-design-templates/) - Design inspiration, not technical
- WebSearch results for calendar libraries - Multiple commercial products, need individual verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Chart.js, Motion One, canvas-confetti all verified from official sources with version numbers
- Architecture: HIGH - Patterns are standard web practices (filter drawer, FAB, mini-player), well-documented
- Pitfalls: MEDIUM-HIGH - Based on Chart.js GitHub issues and common performance problems, but not all tested in this app
- Code examples: HIGH - All examples adapted from official documentation or verified tutorials
- Design patterns: MEDIUM - Fitness app patterns from WebSearch, not verified with user testing

**Research date:** 2026-02-05
**Valid until:** ~30 days (March 2026) - Chart.js and Motion One are stable libraries with infrequent breaking changes
