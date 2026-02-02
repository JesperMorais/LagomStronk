import { getExerciseHistory, getVolumeHistory, formatDate } from './data.js';

let progressChart = null;
let volumeChart = null;

// Initialize or update the progress chart for a specific exercise
export function updateProgressChart(data, exerciseName) {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    const history = getExerciseHistory(data, exerciseName);

    // Destroy existing chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }

    if (history.length === 0) {
        // Show empty state
        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Max Weight (kg)',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: getChartOptions('No data yet for ' + exerciseName)
        });
        return;
    }

    const labels = history.map(h => formatDate(h.date));
    const weights = history.map(h => h.maxWeight);

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Max Weight (kg)',
                data: weights,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: getChartOptions(exerciseName + ' - Weight Progression')
    });
}

// Initialize or update the volume chart
export function updateVolumeChart(data) {
    const ctx = document.getElementById('volume-chart');
    if (!ctx) return;

    const history = getVolumeHistory(data);

    // Destroy existing chart if it exists
    if (volumeChart) {
        volumeChart.destroy();
    }

    if (history.length === 0) {
        volumeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Volume (kg)',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }]
            },
            options: getChartOptions('No workout data yet')
        });
        return;
    }

    const labels = history.map(h => formatDate(h.date));
    const volumes = history.map(h => h.totalVolume);

    volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Total Volume (kg)',
                data: volumes,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        },
        options: getChartOptions('Total Volume Per Workout')
    });
}

// Common chart options
function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 14,
                    weight: '500'
                },
                color: '#6b7280'
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };
}

// Destroy all charts (cleanup)
export function destroyCharts() {
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    if (volumeChart) {
        volumeChart.destroy();
        volumeChart = null;
    }
}
