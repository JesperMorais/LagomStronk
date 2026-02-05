/**
 * Custom numeric keypad for mobile-optimized number input
 * Matches design from inspiration/numpad.jpg
 */

export class Numpad {
  constructor(options = {}) {
    this.maxDigits = options.maxDigits || 6;
    this.maxDecimals = options.maxDecimals || 1;
    this.step = options.step || 2.5;
    this.onNext = options.onNext || (() => {});
    this.onPlateCalc = options.onSettings || options.onPlateCalc || (() => {});
    this.currentInput = null;
    this.value = '';
    this.isVisible = false;
    this.element = null;

    this.render();
    this.attachEvents();
  }

  render() {
    const numpad = document.createElement('div');
    numpad.className = 'numpad';
    numpad.innerHTML = `
      <div class="numpad-grid">
        <!-- Row 1: 1, 2, 3, keyboard toggle -->
        <button class="numpad-btn" data-action="digit" data-value="1">1</button>
        <button class="numpad-btn" data-action="digit" data-value="2">2</button>
        <button class="numpad-btn" data-action="digit" data-value="3">3</button>
        <button class="numpad-btn numpad-special numpad-keyboard" data-action="keyboard" style="grid-column: span 2;">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
            <rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="3" y="3" width="2" height="2" rx="0.5"/>
            <rect x="6" y="3" width="2" height="2" rx="0.5"/>
            <rect x="9" y="3" width="2" height="2" rx="0.5"/>
            <rect x="12" y="3" width="2" height="2" rx="0.5"/>
            <rect x="15" y="3" width="2" height="2" rx="0.5"/>
            <rect x="3" y="6" width="2" height="2" rx="0.5"/>
            <rect x="6" y="6" width="2" height="2" rx="0.5"/>
            <rect x="9" y="6" width="2" height="2" rx="0.5"/>
            <rect x="12" y="6" width="2" height="2" rx="0.5"/>
            <rect x="15" y="6" width="2" height="2" rx="0.5"/>
            <rect x="5" y="9" width="10" height="2" rx="0.5"/>
          </svg>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" style="margin-left: 4px;">
            <path d="M5 6L0 0h10L5 6z"/>
          </svg>
        </button>

        <!-- Row 2: 4, 5, 6, -, + -->
        <button class="numpad-btn" data-action="digit" data-value="4">4</button>
        <button class="numpad-btn" data-action="digit" data-value="5">5</button>
        <button class="numpad-btn" data-action="digit" data-value="6">6</button>
        <button class="numpad-btn numpad-stepper" data-action="stepDown">−</button>
        <button class="numpad-btn numpad-stepper" data-action="stepUp">+</button>

        <!-- Row 3: 7, 8, 9, plate calculator -->
        <button class="numpad-btn" data-action="digit" data-value="7">7</button>
        <button class="numpad-btn" data-action="digit" data-value="8">8</button>
        <button class="numpad-btn" data-action="digit" data-value="9">9</button>
        <button class="numpad-btn numpad-plate-calc" data-action="plateCalc" style="grid-column: span 2;" title="Plate Calculator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- Weight plate icon -->
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <span style="font-size: 0.75rem; font-weight: 500;">Plates</span>
        </button>

        <!-- Row 4: ., 0, backspace, NEXT -->
        <button class="numpad-btn numpad-special" data-action="digit" data-value=".">.</button>
        <button class="numpad-btn" data-action="digit" data-value="0">0</button>
        <button class="numpad-btn numpad-special" data-action="backspace">
          <svg width="24" height="20" viewBox="0 0 24 20" fill="currentColor">
            <path d="M8 2l-6 8 6 8h14a2 2 0 002-2V4a2 2 0 00-2-2H8z" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14 7l-4 6m0-6l4 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="numpad-btn numpad-next" data-action="next" style="grid-column: span 2;">NEXT</button>
      </div>
    `;

    this.element = numpad;
    document.body.appendChild(numpad);
  }

  attachEvents() {
    this.element.addEventListener('mousedown', (e) => {
      // Prevent focus stealing from input
      e.preventDefault();
    });

    this.element.addEventListener('click', (e) => {
      const btn = e.target.closest('.numpad-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      switch (action) {
        case 'digit':
          this.addDigit(value);
          break;
        case 'backspace':
          this.backspace();
          break;
        case 'stepUp':
          this.stepUp();
          break;
        case 'stepDown':
          this.stepDown();
          break;
        case 'next':
          this.next();
          break;
        case 'keyboard':
          this.toggleKeyboard();
          break;
        case 'plateCalc':
          this.onPlateCalc();
          break;
      }
    });
  }

  addDigit(digit) {
    if (!this.currentInput) return;

    let newValue = this.value + digit;

    // Handle decimal point
    if (digit === '.') {
      // Only one decimal point allowed
      if (this.value.includes('.')) return;
      // If empty or only has minus, add 0 before decimal
      if (!this.value || this.value === '-') {
        newValue = '0.';
      }
    } else {
      // Check decimal places limit
      if (this.value.includes('.')) {
        const decimalPlaces = this.value.split('.')[1].length;
        if (decimalPlaces >= this.maxDecimals) return;
      }

      // Check max digits (excluding decimal point)
      const totalDigits = this.value.replace('.', '').length;
      if (totalDigits >= this.maxDigits) return;
    }

    this.value = newValue;
    this.updateDisplay();
  }

  backspace() {
    if (!this.currentInput) return;
    this.value = this.value.slice(0, -1);
    this.updateDisplay();
  }

  stepUp() {
    if (!this.currentInput) return;
    const currentVal = parseFloat(this.value) || 0;
    const newVal = currentVal + this.step;
    this.value = newVal.toString();
    this.updateDisplay();
  }

  stepDown() {
    if (!this.currentInput) return;
    const currentVal = parseFloat(this.value) || 0;
    const newVal = Math.max(0, currentVal - this.step);
    this.value = newVal.toString();
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.currentInput) return;
    this.currentInput.value = this.value;

    // Dispatch input event for any listeners
    this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  show(inputElement, initialValue = '') {
    this.currentInput = inputElement;
    this.value = initialValue;
    this.isVisible = true;
    this.element.classList.add('visible');

    // Ensure input stays focused (for cursor)
    if (this.currentInput) {
      this.currentInput.focus();
    }
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove('visible');
    this.currentInput = null;
    this.value = '';
  }

  next() {
    if (!this.currentInput) return;
    this.onNext(this.value, this.currentInput);
  }

  toggleKeyboard() {
    if (!this.currentInput) return;

    // Hide numpad
    this.hide();

    // Remove readonly to allow system keyboard
    this.currentInput.removeAttribute('readonly');

    // Focus input to trigger system keyboard
    this.currentInput.focus();

    // Re-add readonly after a delay (when user dismisses keyboard)
    setTimeout(() => {
      if (document.activeElement !== this.currentInput) {
        this.currentInput.setAttribute('readonly', 'readonly');
      }
    }, 300);
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }
    this.currentInput = null;
    this.value = '';
  }
}

// Singleton and convenience functions
let globalNumpad = null;

export function initNumpad(options = {}) {
  if (globalNumpad) globalNumpad.destroy();
  globalNumpad = new Numpad(options);
  return globalNumpad;
}

export function showNumpad(input, initialValue) {
  globalNumpad?.show(input, initialValue);
}

export function hideNumpad() {
  globalNumpad?.hide();
}

export function getNumpad() {
  return globalNumpad;
}
