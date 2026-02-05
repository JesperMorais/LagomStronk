/**
 * Exercise card components for library view
 * Supports list view, grid view, and recent exercises
 */

/**
 * Render a single exercise card
 * @param {string} exercise - Exercise name
 * @param {Object} options - Rendering options
 * @param {boolean} options.isFavorite - Whether exercise is favorited
 * @param {boolean} options.isCustom - Whether exercise is custom
 * @param {Function} options.onSelect - Callback when card is selected
 * @param {Function} options.onFavorite - Callback when favorite toggled
 * @param {string} options.view - View mode ('list' or 'grid')
 * @returns {string} HTML string for exercise card
 */
export function renderExerciseCard(exercise, options = {}) {
  const { isFavorite = false, isCustom = false, onSelect, onFavorite, view = 'list' } = options;

  const favoriteClass = isFavorite ? 'active' : '';
  const customBadge = isCustom ? '<span class="exercise-custom-badge" title="Custom Exercise">👤</span>' : '';

  return `
    <div class="exercise-card-item ${view}" data-exercise="${exercise}">
      <div class="exercise-card-image">
        <div class="exercise-card-placeholder">💪</div>
      </div>
      <div class="exercise-card-content">
        <div class="exercise-card-title">${exercise}</div>
        ${customBadge}
      </div>
      <button class="exercise-card-favorite ${favoriteClass}"
              data-exercise="${exercise}"
              onclick="event.stopPropagation(); handleFavoriteToggle('${exercise.replace(/'/g, "\\'")}')">
        ★
      </button>
    </div>
  `;
}

/**
 * Render exercise list view
 * @param {Array<string>} exercises - Array of exercise names
 * @param {Array<string>} favorites - Array of favorited exercise names
 * @param {Object} customExercises - Custom exercises object
 * @param {Function} onSelect - Callback when exercise is selected
 * @returns {string} HTML string for exercise list
 */
export function renderExerciseList(exercises, favorites = [], customExercises = {}, onSelect) {
  if (exercises.length === 0) {
    return `
      <div class="library-empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No exercises found</p>
        <p class="empty-state-hint">Try adjusting your filters or search</p>
        <button class="btn btn-primary empty-state-cta" onclick="document.getElementById('add-custom-exercise-btn').click()">
          + Add Custom Exercise
        </button>
      </div>
    `;
  }

  return exercises.map(exercise => {
    const isFavorite = favorites.includes(exercise);
    const isCustom = !!customExercises[exercise];

    return renderExerciseCard(exercise, {
      isFavorite,
      isCustom,
      onSelect,
      view: 'list'
    });
  }).join('');
}

/**
 * Render exercise grid view
 * @param {Array<string>} exercises - Array of exercise names
 * @param {Array<string>} favorites - Array of favorited exercise names
 * @param {Object} customExercises - Custom exercises object
 * @param {Function} onSelect - Callback when exercise is selected
 * @returns {string} HTML string for exercise grid
 */
export function renderExerciseGrid(exercises, favorites = [], customExercises = {}, onSelect) {
  if (exercises.length === 0) {
    return `
      <div class="library-empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No exercises found</p>
        <p class="empty-state-hint">Try adjusting your filters or search</p>
        <button class="btn btn-primary empty-state-cta" onclick="document.getElementById('add-custom-exercise-btn').click()">
          + Add Custom Exercise
        </button>
      </div>
    `;
  }

  return exercises.map(exercise => {
    const isFavorite = favorites.includes(exercise);
    const isCustom = !!customExercises[exercise];

    return renderExerciseCard(exercise, {
      isFavorite,
      isCustom,
      onSelect,
      view: 'grid'
    });
  }).join('');
}

/**
 * Render recently used exercises as chips
 * @param {Array<string>} recentNames - Array of recent exercise names
 * @param {Function} onSelect - Callback when exercise chip is clicked
 * @returns {string} HTML string for recent exercises section
 */
export function renderRecentExercises(recentNames, onSelect) {
  if (!recentNames || recentNames.length === 0) {
    return '';
  }

  return `
    <div class="recent-exercises-section">
      <h4 class="recent-exercises-title">Recently Used</h4>
      <div class="recent-exercises-chips">
        ${recentNames.map(name => `
          <button class="recent-exercise-chip"
                  onclick="selectLibraryExercise('${name.replace(/'/g, "\\'")}')">
            ${name}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
