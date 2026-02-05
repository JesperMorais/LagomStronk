/**
 * PR Cards component - horizontal scrollable PR cards
 */

/**
 * Get recent PRs from workout history
 * @param {Array} workouts - Array of workout objects
 * @param {number} limit - Maximum number of PRs to return
 * @returns {Array} Array of PR objects
 */
function getRecentPRs(workouts, limit = 5) {
    if (!workouts || workouts.length === 0) {
        return [];
    }

    // Sort workouts by date (most recent first)
    const sortedWorkouts = [...workouts].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    const exerciseBests = {};
    const prs = [];

    // Iterate through workouts from oldest to newest to track PRs
    for (let i = sortedWorkouts.length - 1; i >= 0; i--) {
        const workout = sortedWorkouts[i];

        workout.exercises.forEach(exercise => {
            const exerciseName = exercise.name;

            // Initialize tracking for this exercise
            if (!exerciseBests[exerciseName]) {
                exerciseBests[exerciseName] = {
                    maxWeight: 0,
                    maxVolume: 0,
                    max1RM: 0
                };
            }

            // Calculate metrics for this exercise session
            let maxWeight = 0;
            let totalVolume = 0;
            let max1RM = 0;

            exercise.sets.forEach(set => {
                const weight = set.weight || 0;
                const reps = set.reps || 0;

                // Track max weight
                if (weight > maxWeight) {
                    maxWeight = weight;
                }

                // Calculate volume
                totalVolume += weight * reps;

                // Calculate estimated 1RM using Brzycki formula
                if (reps > 0 && weight > 0) {
                    const estimated1RM = weight * (36 / (37 - reps));
                    if (estimated1RM > max1RM) {
                        max1RM = estimated1RM;
                    }
                }
            });

            const previous = exerciseBests[exerciseName];

            // Check for weight PR
            if (maxWeight > previous.maxWeight) {
                prs.push({
                    exercise: exerciseName,
                    type: 'weight',
                    value: maxWeight,
                    previousValue: previous.maxWeight,
                    date: workout.date
                });
                exerciseBests[exerciseName].maxWeight = maxWeight;
            }

            // Check for volume PR
            if (totalVolume > previous.maxVolume) {
                prs.push({
                    exercise: exerciseName,
                    type: 'volume',
                    value: totalVolume,
                    previousValue: previous.maxVolume,
                    date: workout.date
                });
                exerciseBests[exerciseName].maxVolume = totalVolume;
            }

            // Check for 1RM PR
            if (max1RM > previous.max1RM) {
                prs.push({
                    exercise: exerciseName,
                    type: '1rm',
                    value: max1RM,
                    previousValue: previous.max1RM,
                    date: workout.date
                });
                exerciseBests[exerciseName].max1RM = max1RM;
            }
        });
    }

    // Sort PRs by date (most recent first) and limit
    return prs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

/**
 * Get icon for PR type
 * @param {string} type - PR type (weight, volume, 1rm)
 * @returns {string} Icon emoji
 */
function getPRTypeIcon(type) {
    const icons = {
        'weight': '💪',
        'volume': '📊',
        '1rm': '🎯'
    };
    return icons[type] || '🏆';
}

/**
 * Format PR value with appropriate units
 * @param {number} value - PR value
 * @param {string} type - PR type
 * @returns {string} Formatted value string
 */
function formatPRValue(value, type) {
    if (type === 'volume') {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k kg';
        }
        return Math.round(value) + ' kg';
    } else if (type === 'weight' || type === '1rm') {
        return value.toFixed(1) + ' kg';
    }
    return value.toString();
}

/**
 * Format relative date
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative date string
 */
function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + 'd ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + 'w ago';
    return Math.floor(diffDays / 30) + 'mo ago';
}

/**
 * Get PR type label
 * @param {string} type - PR type
 * @returns {string} Human-readable label
 */
function getPRTypeLabel(type) {
    const labels = {
        'weight': 'Max Weight',
        'volume': 'Total Volume',
        '1rm': 'Est. 1RM'
    };
    return labels[type] || 'PR';
}

/**
 * Render PR cards section
 * @param {HTMLElement} container - Container element
 * @param {Array} workouts - Array of workout objects
 */
export function renderPRCards(container, workouts) {
    if (!container) return;

    const prs = getRecentPRs(workouts, 5);

    // Empty state
    if (prs.length === 0) {
        container.innerHTML = `
            <div class="pr-cards-section">
                <div class="pr-cards-header">
                    <h3 class="pr-cards-title">Recent PRs</h3>
                </div>
                <div class="pr-empty-state">
                    <div class="pr-empty-icon">🏆</div>
                    <div class="pr-empty-text">No PRs yet</div>
                    <div class="pr-empty-hint">Keep training to set your first personal record!</div>
                </div>
            </div>
        `;
        return;
    }

    // Render PR cards
    container.innerHTML = `
        <div class="pr-cards-section">
            <div class="pr-cards-header">
                <h3 class="pr-cards-title">Recent PRs</h3>
            </div>
            <div class="pr-cards-scroll">
                ${prs.map(pr => `
                    <div class="pr-card">
                        <div class="pr-card-icon">${getPRTypeIcon(pr.type)}</div>
                        <div class="pr-card-content">
                            <div class="pr-card-exercise">${pr.exercise}</div>
                            <div class="pr-card-type">${getPRTypeLabel(pr.type)}</div>
                            <div class="pr-card-value">${formatPRValue(pr.value, pr.type)}</div>
                            <div class="pr-card-date">${formatRelativeDate(pr.date)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
