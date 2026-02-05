/**
 * Confetti animations for celebrations
 * Uses canvas-confetti library loaded from CDN
 */

function getConfetti() {
  return window.confetti;
}

/**
 * Small confetti burst at element location
 * @param {HTMLElement} element - Element to burst from
 * @param {Object} options - Customization options
 */
export function burstConfetti(element, options = {}) {
  const confetti = getConfetti();
  if (!confetti) {
    console.warn('canvas-confetti not loaded');
    return;
  }

  // Get element position for origin
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: options.particleCount || 20,
    spread: options.spread || 40,
    origin: { x, y },
    colors: options.colors || ['#D1FFC6', '#86efac', '#ffffff'],
    startVelocity: options.startVelocity || 20,
    gravity: options.gravity || 1.2,
    scalar: options.scalar || 0.8,
    disableForReducedMotion: true
  });
}

/**
 * Celebrate a personal record with double burst
 * @param {string} exerciseName - Name of exercise for logging
 */
export function celebratePR(exerciseName) {
  const confetti = getConfetti();
  if (!confetti) {
    console.warn('canvas-confetti not loaded');
    return;
  }

  console.log(`🎉 Personal Record on ${exerciseName}!`);

  // Double burst from sides
  const colors = ['#D1FFC6', '#86efac', '#4ade80', '#ffffff'];

  // Left side burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors,
    startVelocity: 45,
    disableForReducedMotion: true
  });

  // Right side burst
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors,
    startVelocity: 45,
    disableForReducedMotion: true
  });
}
