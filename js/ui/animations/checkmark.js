/**
 * Checkmark animation for set completion
 * Draws an SVG checkmark with a spring-like stroke animation
 */

export function animateCheckmark(element) {
  // Add checkmark SVG if not present
  if (!element.querySelector('.checkmark-svg')) {
    element.innerHTML = `
      <svg class="checkmark-svg" viewBox="0 0 24 24" width="24" height="24">
        <path class="checkmark-path" fill="none" stroke="currentColor" stroke-width="3"
              d="M4 12l5 5L20 6" />
      </svg>
    `;
  }

  // Trigger animation
  element.classList.remove('checked');
  void element.offsetWidth; // Force reflow
  element.classList.add('checked');

  // Highlight row
  const row = element.closest('.set-row');
  if (row) {
    row.classList.add('completed');
  }

  return new Promise(resolve => setTimeout(resolve, 500));
}
