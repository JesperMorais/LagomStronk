/**
 * Volume Chart component with Chart.js gradients
 */

/**
 * Get weekly volume data (Monday through Sunday)
 * @param {Array} workouts - Array of workout objects
 * @returns {Array} Array of 7 days with volume totals
 */
function getWeeklyVolume(workouts) {
    if (!workouts || workouts.length === 0) {
        return Array(7).fill(0);
    }

    // Get current week Monday-Sunday
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sunday, 1=Monday, etc
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Initialize 7 days with 0 volume
    const weekVolume = Array(7).fill(0);

    // Calculate volume for each workout in current week
    workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        // Check if workout is in current week
        const daysSinceMonday = Math.floor((workoutDate - monday) / (1000 * 60 * 60 * 24));

        if (daysSinceMonday >= 0 && daysSinceMonday < 7) {
            // Calculate total volume for this workout
            const volume = workout.exercises.reduce((total, exercise) => {
                const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (set.reps * set.weight);
                }, 0);
                return total + exerciseVolume;
            }, 0);

            weekVolume[daysSinceMonday] += volume;
        }
    });

    return weekVolume;
}

/**
 * Create volume chart with gradient bars and goal line
 * @param {string} canvasId - Canvas element ID
 * @param {Array} weekData - Array of 7 daily volume values
 * @param {number} goalVolume - Goal volume line value (default: 3000)
 * @returns {Chart} Chart.js instance
 */
export function createVolumeChart(canvasId, weekData, goalVolume = 3000) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');

    // Create mint gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(209, 255, 198, 0.9)'); // Solid mint at top
    gradient.addColorStop(1, 'rgba(209, 255, 198, 0.1)'); // Transparent at bottom

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Volume (kg)',
                    data: weekData,
                    backgroundColor: gradient,
                    borderColor: 'rgba(209, 255, 198, 0.3)',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Goal',
                    type: 'line',
                    data: Array(7).fill(goalVolume),
                    borderColor: '#fbbf24', // Amber
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(35, 44, 51, 0.95)',
                    titleColor: '#D1FFC6',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(209, 255, 198, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'k kg';
                            }
                            return value + ' kg';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            if (value >= 1000) {
                                return (value / 1000) + 'k';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });

    return chart;
}

/**
 * Update existing chart with new data
 * @param {Chart} chart - Chart.js instance
 * @param {Array} newData - New weekly volume data
 */
export function updateVolumeChart(chart, newData) {
    if (!chart || !chart.data) return;

    chart.data.datasets[0].data = newData;
    chart.update('none'); // No animation for performance
}

/**
 * Render volume chart in container
 * @param {HTMLElement} container - Container element
 * @param {Array} workouts - Array of workout objects
 * @returns {Chart} Chart instance
 */
export function renderDashboardVolumeChart(container, workouts) {
    if (!container) return null;

    // Calculate weekly volume
    const weekData = getWeeklyVolume(workouts);

    // Create canvas if it doesn't exist
    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'dashboard-volume-chart';
        canvas.style.height = '200px';

        const canvasContainer = container.querySelector('.volume-chart-container');
        if (canvasContainer) {
            canvasContainer.innerHTML = '';
            canvasContainer.appendChild(canvas);
        } else {
            container.appendChild(canvas);
        }
    }

    // Initialize chart
    const chart = createVolumeChart('dashboard-volume-chart', weekData);

    return chart;
}
