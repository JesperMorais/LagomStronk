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
                    borderColor: '#D1FFC6',
                    backgroundColor: 'rgba(209, 255, 198, 0.15)',
                    tension: 0.4,
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
                borderColor: '#D1FFC6',
                backgroundColor: 'rgba(209, 255, 198, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#D1FFC6',
                pointBorderColor: '#0f1419',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
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
                    backgroundColor: 'rgba(209, 255, 198, 0.5)',
                    borderColor: '#D1FFC6',
                    borderWidth: 0,
                    borderRadius: 8
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
                backgroundColor: 'rgba(209, 255, 198, 0.5)',
                borderColor: '#D1FFC6',
                borderWidth: 0,
                borderRadius: 8,
                hoverBackgroundColor: '#D1FFC6'
            }]
        },
        options: getChartOptions('Total Volume Per Workout')
    });
}

// Common chart options - David Stenman palette
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
                    weight: '600'
                },
                color: '#D1FFC6',
                padding: { bottom: 16 }
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
                    },
                    color: '#9ca3af'
                },
                border: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#9ca3af'
                },
                border: {
                    display: false
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
