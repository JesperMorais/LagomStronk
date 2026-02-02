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
                    borderColor: '#2dd4bf',
                    backgroundColor: 'rgba(45, 212, 191, 0.15)',
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
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2dd4bf',
                pointBorderColor: '#0a0a0a',
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
                    backgroundColor: 'rgba(45, 212, 191, 0.6)',
                    borderColor: '#2dd4bf',
                    borderWidth: 0,
                    borderRadius: 6
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
                backgroundColor: 'rgba(45, 212, 191, 0.6)',
                borderColor: '#2dd4bf',
                borderWidth: 0,
                borderRadius: 6,
                hoverBackgroundColor: '#2dd4bf'
            }]
        },
        options: getChartOptions('Total Volume Per Workout')
    });
}

// Common chart options - Mint dark mode
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
                color: '#2dd4bf',
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
                    color: '#a1a1aa'
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
                    color: '#a1a1aa'
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
