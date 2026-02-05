import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../data/exercises.js';

let wizard = null;

/**
 * ExerciseWizard - Multi-step guided wizard for creating custom exercises
 */
class ExerciseWizard {
  constructor(options = {}) {
    this.onComplete = options.onComplete || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.currentStep = 1;
    this.totalSteps = 3;

    // Form data
    this.exerciseName = '';
    this.primaryMuscles = [];
    this.secondaryMuscles = [];
    this.equipment = '';

    this.modal = null;
  }

  open() {
    this.render();
    document.body.appendChild(this.modal);
    // Trigger animation
    requestAnimationFrame(() => {
      this.modal.classList.add('active');
    });
  }

  close() {
    this.modal.classList.remove('active');
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
    }, 200);
  }

  destroy() {
    this.close();
  }

  render() {
    this.modal = document.createElement('div');
    this.modal.className = 'wizard-modal';
    this.modal.innerHTML = `
      <div class="wizard-content">
        <div class="wizard-header">
          <h3 class="wizard-title">Create Custom Exercise</h3>
          <button class="wizard-close" aria-label="Close">&times;</button>
        </div>
        <div class="wizard-progress">
          <div class="wizard-progress-bar">
            <div class="wizard-progress-fill"></div>
          </div>
          <div class="wizard-progress-text">Step <span class="wizard-current-step">1</span> of ${this.totalSteps}</div>
        </div>
        <div class="wizard-body">
          <!-- Step content will be rendered here -->
        </div>
        <div class="wizard-footer">
          <button class="wizard-btn wizard-btn-secondary wizard-back-btn" style="display: none;">Back</button>
          <button class="wizard-btn wizard-btn-primary wizard-next-btn">Next</button>
        </div>
      </div>
    `;

    this.attachEvents();
    this.renderStep();
  }

  attachEvents() {
    // Close button
    const closeBtn = this.modal.querySelector('.wizard-close');
    closeBtn.addEventListener('click', () => {
      this.onCancel();
      this.close();
    });

    // Back button
    const backBtn = this.modal.querySelector('.wizard-back-btn');
    backBtn.addEventListener('click', () => {
      this.prevStep();
    });

    // Next button
    const nextBtn = this.modal.querySelector('.wizard-next-btn');
    nextBtn.addEventListener('click', () => {
      if (this.currentStep === this.totalSteps) {
        this.createExercise();
      } else {
        this.nextStep();
      }
    });

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.onCancel();
        this.close();
      }
    });
  }

  renderStep() {
    const body = this.modal.querySelector('.wizard-body');
    const backBtn = this.modal.querySelector('.wizard-back-btn');
    const nextBtn = this.modal.querySelector('.wizard-next-btn');
    const currentStepEl = this.modal.querySelector('.wizard-current-step');
    const progressFill = this.modal.querySelector('.wizard-progress-fill');

    // Update progress
    currentStepEl.textContent = this.currentStep;
    const progress = (this.currentStep / this.totalSteps) * 100;
    progressFill.style.width = `${progress}%`;

    // Show/hide back button
    backBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';

    // Update next button text
    nextBtn.textContent = this.currentStep === this.totalSteps ? 'Create Exercise' : 'Next';

    // Render step content
    switch (this.currentStep) {
      case 1:
        body.innerHTML = this.renderNameStep();
        this.attachNameStepEvents();
        break;
      case 2:
        body.innerHTML = this.renderMusclesStep();
        this.attachMusclesStepEvents();
        break;
      case 3:
        body.innerHTML = this.renderEquipmentStep();
        this.attachEquipmentStepEvents();
        break;
    }

    // Update next button state
    this.updateNextButton();
  }

  renderNameStep() {
    return `
      <div class="wizard-step">
        <h4 class="wizard-step-title">Exercise Name</h4>
        <p class="wizard-step-hint">Choose a descriptive name for your exercise</p>
        <div class="wizard-form-group">
          <input
            type="text"
            class="wizard-input wizard-exercise-name"
            placeholder="e.g., Cable Flyes"
            value="${this.exerciseName}"
            autofocus
          >
          <div class="wizard-validation" style="display: none;">Exercise name must be at least 2 characters</div>
        </div>
      </div>
    `;
  }

  attachNameStepEvents() {
    const input = this.modal.querySelector('.wizard-exercise-name');

    input.addEventListener('input', () => {
      this.exerciseName = input.value.trim();
      this.updateNextButton();
    });

    // Allow Enter to proceed
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.canProceed()) {
        this.nextStep();
      }
    });
  }

  renderMusclesStep() {
    const primaryGroups = Object.keys(MUSCLE_GROUPS);

    // Get available secondary groups (exclude selected primary)
    const availableSecondary = primaryGroups.filter(g => !this.primaryMuscles.includes(g));

    return `
      <div class="wizard-step">
        <h4 class="wizard-step-title">Muscle Groups</h4>
        <p class="wizard-step-hint">Select which muscles this exercise targets</p>

        <div class="wizard-muscle-section">
          <label class="wizard-section-label">Primary Muscles <span class="wizard-required">*</span></label>
          <p class="wizard-section-hint">Main muscles worked (select at least one)</p>
          <div class="wizard-chips" data-type="primary">
            ${primaryGroups.map(group => `
              <button
                class="wizard-chip ${this.primaryMuscles.includes(group) ? 'active' : ''}"
                data-value="${group}"
              >
                ${group}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="wizard-muscle-section">
          <label class="wizard-section-label">Secondary Muscles</label>
          <p class="wizard-section-hint">Supporting muscles (optional)</p>
          <div class="wizard-chips" data-type="secondary">
            ${availableSecondary.map(group => `
              <button
                class="wizard-chip ${this.secondaryMuscles.includes(group) ? 'active' : ''}"
                data-value="${group}"
              >
                ${group}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  attachMusclesStepEvents() {
    const primaryChips = this.modal.querySelector('[data-type="primary"]');
    const secondaryChips = this.modal.querySelector('[data-type="secondary"]');

    // Primary muscle selection
    primaryChips.addEventListener('click', (e) => {
      if (!e.target.classList.contains('wizard-chip')) return;

      const value = e.target.dataset.value;

      if (this.primaryMuscles.includes(value)) {
        // Deselect
        this.primaryMuscles = this.primaryMuscles.filter(m => m !== value);
        e.target.classList.remove('active');
      } else {
        // Select
        this.primaryMuscles.push(value);
        e.target.classList.add('active');
      }

      // Re-render to update secondary options
      this.renderStep();
      this.updateNextButton();
    });

    // Secondary muscle selection
    secondaryChips.addEventListener('click', (e) => {
      if (!e.target.classList.contains('wizard-chip')) return;

      const value = e.target.dataset.value;

      if (this.secondaryMuscles.includes(value)) {
        // Deselect
        this.secondaryMuscles = this.secondaryMuscles.filter(m => m !== value);
        e.target.classList.remove('active');
      } else {
        // Select
        this.secondaryMuscles.push(value);
        e.target.classList.add('active');
      }

      this.updateNextButton();
    });
  }

  renderEquipmentStep() {
    return `
      <div class="wizard-step">
        <h4 class="wizard-step-title">Equipment</h4>
        <p class="wizard-step-hint">Select the equipment needed</p>

        <div class="wizard-chips">
          ${EQUIPMENT_TYPES.map(type => `
            <button
              class="wizard-chip ${this.equipment === type ? 'active' : ''}"
              data-value="${type}"
            >
              ${type}
            </button>
          `).join('')}
        </div>

        <div class="wizard-summary">
          <h5 class="wizard-summary-title">Summary</h5>
          <div class="wizard-summary-item">
            <span class="wizard-summary-label">Name:</span>
            <span class="wizard-summary-value">${this.exerciseName}</span>
          </div>
          <div class="wizard-summary-item">
            <span class="wizard-summary-label">Primary:</span>
            <span class="wizard-summary-value">${this.primaryMuscles.join(', ')}</span>
          </div>
          ${this.secondaryMuscles.length > 0 ? `
            <div class="wizard-summary-item">
              <span class="wizard-summary-label">Secondary:</span>
              <span class="wizard-summary-value">${this.secondaryMuscles.join(', ')}</span>
            </div>
          ` : ''}
          <div class="wizard-summary-item">
            <span class="wizard-summary-label">Equipment:</span>
            <span class="wizard-summary-value">${this.equipment || 'Not selected'}</span>
          </div>
        </div>
      </div>
    `;
  }

  attachEquipmentStepEvents() {
    const chipsContainer = this.modal.querySelector('.wizard-chips');

    chipsContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('wizard-chip')) return;

      const value = e.target.dataset.value;

      // Single select - deselect others
      const allChips = chipsContainer.querySelectorAll('.wizard-chip');
      allChips.forEach(chip => chip.classList.remove('active'));

      this.equipment = value;
      e.target.classList.add('active');

      // Update summary
      this.renderStep();
      this.updateNextButton();
    });
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
    }
  }

  nextStep() {
    if (!this.canProceed()) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.renderStep();
    }
  }

  validateName() {
    return this.exerciseName.length >= 2;
  }

  canProceed() {
    switch (this.currentStep) {
      case 1:
        return this.validateName();
      case 2:
        return this.primaryMuscles.length > 0;
      case 3:
        return this.equipment !== '';
      default:
        return false;
    }
  }

  updateNextButton() {
    const nextBtn = this.modal.querySelector('.wizard-next-btn');
    const validationMsg = this.modal.querySelector('.wizard-validation');

    const isValid = this.canProceed();
    nextBtn.disabled = !isValid;

    // Show validation message for name step
    if (this.currentStep === 1 && validationMsg) {
      if (this.exerciseName.length > 0 && !isValid) {
        validationMsg.style.display = 'block';
      } else {
        validationMsg.style.display = 'none';
      }
    }
  }

  createExercise() {
    if (!this.canProceed()) return;

    const metadata = {
      primaryMuscles: this.primaryMuscles,
      secondaryMuscles: this.secondaryMuscles,
      equipment: this.equipment
    };

    this.onComplete(this.exerciseName, metadata);
    this.close();
  }
}

/**
 * Open the exercise wizard
 */
export function openExerciseWizard(options = {}) {
  if (wizard) {
    wizard.destroy();
  }
  wizard = new ExerciseWizard(options);
  wizard.open();
  return wizard;
}

/**
 * Close the exercise wizard
 */
export function closeExerciseWizard() {
  if (wizard) {
    wizard.close();
    wizard = null;
  }
}

export { ExerciseWizard };
