/**
 * Floating Action Button (FAB) component
 * Mint-themed circular button with icon and label
 */

export class FAB {
    constructor(options = {}) {
        this.icon = options.icon || '🏋️'; // Default dumbbell
        this.label = options.label || 'Start Workout';
        this.onClick = options.onClick || (() => {});
        this.element = null;
    }

    /**
     * Render the FAB element
     * @returns {HTMLElement} The FAB button element
     */
    render() {
        const fab = document.createElement('button');
        fab.className = 'fab';
        fab.innerHTML = `
            <span class="fab-icon">${this.icon}</span>
            <span class="fab-label">${this.label}</span>
        `;
        fab.addEventListener('click', this.onClick);
        this.element = fab;
        return fab;
    }

    /**
     * Show the FAB with animation
     */
    show() {
        if (this.element) {
            this.element.classList.add('visible');
        }
    }

    /**
     * Hide the FAB with animation
     */
    hide() {
        if (this.element) {
            this.element.classList.remove('visible');
        }
    }

    /**
     * Mount the FAB to a container
     * @param {HTMLElement} container - Container to mount FAB to
     */
    mount(container) {
        if (!this.element) this.render();
        container.appendChild(this.element);
        // Animate in after mount
        requestAnimationFrame(() => this.show());
    }

    /**
     * Remove the FAB from DOM
     */
    unmount() {
        this.element?.remove();
        this.element = null;
    }

    /**
     * Update FAB icon
     * @param {string} icon - New icon (emoji or HTML)
     */
    setIcon(icon) {
        this.icon = icon;
        if (this.element) {
            const iconEl = this.element.querySelector('.fab-icon');
            if (iconEl) iconEl.innerHTML = icon;
        }
    }

    /**
     * Update FAB label
     * @param {string} label - New label text
     */
    setLabel(label) {
        this.label = label;
        if (this.element) {
            const labelEl = this.element.querySelector('.fab-label');
            if (labelEl) labelEl.textContent = label;
        }
    }
}

// Global FAB instance (singleton pattern)
let globalFAB = null;

/**
 * Initialize the global FAB
 * @param {Function} onClick - Click handler function
 * @returns {FAB} The FAB instance
 */
export function initFAB(onClick) {
    if (globalFAB) {
        globalFAB.unmount();
    }

    globalFAB = new FAB({
        icon: '🏋️',
        label: 'Start Workout',
        onClick
    });

    // Mount to app container or body
    const appContainer = document.querySelector('.app') || document.body;
    globalFAB.mount(appContainer);

    return globalFAB;
}

/**
 * Show the global FAB
 */
export function showFAB() {
    if (globalFAB) {
        globalFAB.show();
    }
}

/**
 * Hide the global FAB
 */
export function hideFAB() {
    if (globalFAB) {
        globalFAB.hide();
    }
}

/**
 * Get the global FAB instance
 * @returns {FAB|null}
 */
export function getFAB() {
    return globalFAB;
}
