import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../data/exercises.js';

/**
 * FilterDrawer - Exercise filter drawer with chip-based selection
 * Allows filtering exercises by muscle groups and equipment types
 */
export class FilterDrawer {
  constructor(options = {}) {
    this.onApply = options.onApply || (() => {});
    this.onClear = options.onClear || (() => {});

    this.selectedMuscles = [];
    this.selectedEquipment = [];
    this.element = null;
    this.overlay = null;
  }

  /**
   * Render the filter drawer HTML
   */
  render() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'filter-overlay';

    // Create drawer
    this.element = document.createElement('div');
    this.element.className = 'filter-drawer';

    const muscleGroups = Object.keys(MUSCLE_GROUPS);

    this.element.innerHTML = `
      <div class="filter-drawer-header">
        <h3>Filter Exercises</h3>
      </div>

      <div class="filter-drawer-body">
        <div class="filter-section">
          <h4 class="filter-section-title">Muscle Groups</h4>
          <div class="filter-chips" data-type="muscle">
            ${muscleGroups.map(muscle => `
              <button class="filter-chip" data-value="${muscle}">
                ${muscle}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-section-title">Equipment</h4>
          <div class="filter-chips" data-type="equipment">
            ${EQUIPMENT_TYPES.map(equipment => `
              <button class="filter-chip" data-value="${equipment}">
                ${equipment}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-drawer-footer">
        <button class="btn btn-secondary" id="filter-clear-btn">Clear All</button>
        <button class="btn btn-primary" id="filter-apply-btn">
          Apply
          <span class="filter-count-badge"></span>
        </button>
      </div>
    `;

    // Append to body
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.element);

    // Attach event listeners
    this.attachEvents();

    return this.element;
  }

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Overlay click - close drawer
    this.overlay.addEventListener('click', () => this.close());

    // Chip toggles
    const chips = this.element.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        chip.classList.toggle('active');
        this.updateSelections();
        this.updateCount();
      });
    });

    // Clear button
    const clearBtn = this.element.querySelector('#filter-clear-btn');
    clearBtn.addEventListener('click', () => {
      this.clear();
      this.onClear();
    });

    // Apply button
    const applyBtn = this.element.querySelector('#filter-apply-btn');
    applyBtn.addEventListener('click', () => {
      this.apply();
    });
  }

  /**
   * Update internal selection state
   */
  updateSelections() {
    const muscleChips = this.element.querySelectorAll('.filter-chips[data-type="muscle"] .filter-chip.active');
    const equipmentChips = this.element.querySelectorAll('.filter-chips[data-type="equipment"] .filter-chip.active');

    this.selectedMuscles = Array.from(muscleChips).map(chip => chip.dataset.value);
    this.selectedEquipment = Array.from(equipmentChips).map(chip => chip.dataset.value);
  }

  /**
   * Update count badge on Apply button
   */
  updateCount() {
    const count = this.selectedMuscles.length + this.selectedEquipment.length;
    const badge = this.element.querySelector('.filter-count-badge');

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  /**
   * Open the drawer
   */
  open() {
    // Restore previous selections
    this.restoreSelections();
    this.updateCount();

    // Show overlay and drawer
    this.overlay.classList.add('active');
    this.element.classList.add('active');
  }

  /**
   * Close the drawer
   */
  close() {
    this.overlay.classList.remove('active');
    this.element.classList.remove('active');
  }

  /**
   * Clear all selections
   */
  clear() {
    this.selectedMuscles = [];
    this.selectedEquipment = [];

    const chips = this.element.querySelectorAll('.filter-chip');
    chips.forEach(chip => chip.classList.remove('active'));

    this.updateCount();
  }

  /**
   * Apply filters
   */
  apply() {
    this.updateSelections();
    this.onApply(this.getFilters());
    this.close();
  }

  /**
   * Get current filter selections
   */
  getFilters() {
    return {
      muscleGroups: this.selectedMuscles,
      equipment: this.selectedEquipment
    };
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters() {
    return this.selectedMuscles.length > 0 || this.selectedEquipment.length > 0;
  }

  /**
   * Set filters programmatically
   */
  setFilters(filters) {
    this.selectedMuscles = filters.muscleGroups || [];
    this.selectedEquipment = filters.equipment || [];
    this.restoreSelections();
    this.updateCount();
  }

  /**
   * Restore chip selections based on internal state
   */
  restoreSelections() {
    // Clear all first
    const chips = this.element.querySelectorAll('.filter-chip');
    chips.forEach(chip => chip.classList.remove('active'));

    // Restore muscle selections
    this.selectedMuscles.forEach(muscle => {
      const chip = this.element.querySelector(`.filter-chips[data-type="muscle"] .filter-chip[data-value="${muscle}"]`);
      if (chip) chip.classList.add('active');
    });

    // Restore equipment selections
    this.selectedEquipment.forEach(equipment => {
      const chip = this.element.querySelector(`.filter-chips[data-type="equipment"] .filter-chip[data-value="${equipment}"]`);
      if (chip) chip.classList.add('active');
    });
  }

  /**
   * Destroy the drawer
   */
  destroy() {
    if (this.overlay) this.overlay.remove();
    if (this.element) this.element.remove();
    this.overlay = null;
    this.element = null;
  }
}

// Singleton instance
let drawerInstance = null;

/**
 * Initialize filter drawer (singleton pattern)
 */
export function initFilterDrawer(options) {
  if (drawerInstance) {
    drawerInstance.destroy();
  }

  drawerInstance = new FilterDrawer(options);
  drawerInstance.render();

  return drawerInstance;
}

/**
 * Open the filter drawer
 */
export function openFilterDrawer() {
  if (drawerInstance) {
    drawerInstance.open();
  }
}

/**
 * Close the filter drawer
 */
export function closeFilterDrawer() {
  if (drawerInstance) {
    drawerInstance.close();
  }
}

/**
 * Get the drawer instance
 */
export function getFilterDrawer() {
  return drawerInstance;
}
