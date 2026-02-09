import { getExerciseHistory, getVolumeHistory, getWeightHistory, getMeasurementHistory, getBodyFatHistory, formatDate, getRecentQualityScores } from './data.js';

let progressChart = null;
let volumeChart = null;
let weightChart = null;
const measurementCharts = {};
let bodyFatChart = null;
let qualityChart = null;

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

// Initialize or update the weight trend chart
export function updateWeightChart(data) {
    const ctx = document.getElementById('weight-chart');
    if (!ctx) return;

    const history = getWeightHistory(data);

    // Destroy existing chart if it exists
    if (weightChart) {
        weightChart.destroy();
        weightChart = null;
    }

    if (history.length < 2) {
        // Show encouraging empty state
        const emptyMsg = history.length === 0
            ? 'Log your weight to see trends'
            : 'Log one more entry to see the trend';
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => formatDate(h.date)),
                datasets: [{
                    label: 'Weight (kg)',
                    data: history.map(h => h.value),
                    borderColor: '#D1FFC6',
                    backgroundColor: 'rgba(209, 255, 198, 0.15)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#D1FFC6',
                    pointBorderColor: '#0f1419',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: getChartOptions(emptyMsg)
        });
        return;
    }

    const labels = history.map(h => formatDate(h.date));
    const weights = history.map(h => h.value);

    // Calculate Y-axis range based on data for better visibility
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const padding = Math.max(2, (maxWeight - minWeight) * 0.3);

    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Weight (kg)',
                data: weights,
                borderColor: '#D1FFC6',
                backgroundColor: 'rgba(209, 255, 198, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#D1FFC6',
                pointBorderColor: '#0f1419',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Weight Trend',
                    font: { size: 14, weight: '600' },
                    color: '#D1FFC6',
                    padding: { bottom: 16 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 },
                        color: '#9ca3af'
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.floor(minWeight - padding),
                    suggestedMax: Math.ceil(maxWeight + padding),
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' },
                    border: { display: false }
                }
            }
        }
    });
}

// Initialize or update the body fat trend chart
export function updateBodyFatChart(data) {
    const ctx = document.getElementById('bodyfat-chart');
    if (!ctx) return;

    const history = getBodyFatHistory(data);

    // Destroy existing chart if exists
    if (bodyFatChart) {
        bodyFatChart.destroy();
        bodyFatChart = null;
    }

    if (history.length < 2) {
        const emptyMsg = history.length === 0
            ? 'Log your body fat % to see trends'
            : 'Log one more entry to see the trend';
        bodyFatChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => formatDate(h.date)),
                datasets: [{
                    label: 'Body Fat (%)',
                    data: history.map(h => h.value),
                    borderColor: '#D1FFC6',
                    backgroundColor: 'rgba(209, 255, 198, 0.15)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#D1FFC6',
                    pointBorderColor: '#0f1419',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: emptyMsg,
                        font: { size: 12, weight: '500' },
                        color: '#9ca3af',
                        padding: { bottom: 8 }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: '#9ca3af' },
                        border: { display: false }
                    },
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' },
                        border: { display: false }
                    }
                }
            }
        });
        return;
    }

    const labels = history.map(h => formatDate(h.date));
    const values = history.map(h => h.value);

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = Math.max(2, (maxVal - minVal) * 0.3);

    bodyFatChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Body Fat (%)',
                data: values,
                borderColor: '#D1FFC6',
                backgroundColor: 'rgba(209, 255, 198, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#D1FFC6',
                pointBorderColor: '#0f1419',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 9 },
                        color: '#9ca3af'
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.floor(minVal - padding),
                    suggestedMax: Math.ceil(maxVal + padding),
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) { return value + '%'; }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

// Initialize or update a measurement chart for a specific type (bicep, chest, waist, thigh)
export function updateMeasurementChart(data, type) {
    const ctx = document.getElementById(`${type}-chart`);
    if (!ctx) return;

    const history = getMeasurementHistory(data, type);

    // Destroy existing chart for this type if exists
    if (measurementCharts[type]) {
        measurementCharts[type].destroy();
        measurementCharts[type] = null;
    }

    if (history.length < 2) {
        const emptyMsg = history.length === 0
            ? 'No data yet'
            : 'Log one more entry to see the trend';
        measurementCharts[type] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => formatDate(h.date)),
                datasets: [{
                    label: `${type} (cm)`,
                    data: history.map(h => h.value),
                    borderColor: '#D1FFC6',
                    backgroundColor: 'rgba(209, 255, 198, 0.15)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#D1FFC6',
                    pointBorderColor: '#0f1419',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: emptyMsg,
                        font: { size: 12, weight: '500' },
                        color: '#9ca3af',
                        padding: { bottom: 8 }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: '#9ca3af' },
                        border: { display: false }
                    },
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' },
                        border: { display: false }
                    }
                }
            }
        });
        return;
    }

    const labels = history.map(h => formatDate(h.date));
    const values = history.map(h => h.value);

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = Math.max(2, (maxVal - minVal) * 0.3);

    measurementCharts[type] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${type} (cm)`,
                data: values,
                borderColor: '#D1FFC6',
                backgroundColor: 'rgba(209, 255, 198, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#D1FFC6',
                pointBorderColor: '#0f1419',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 9 },
                        color: '#9ca3af'
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.floor(minVal - padding),
                    suggestedMax: Math.ceil(maxVal + padding),
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' },
                    border: { display: false }
                }
            }
        }
    });
}

// Initialize or update the workout quality chart
export function updateQualityChart(data) {
    const ctx = document.getElementById('quality-chart');
    if (!ctx) return;

    const qualityScores = getRecentQualityScores(data, 10);

    // Destroy existing chart if it exists
    if (qualityChart) {
        qualityChart.destroy();
    }

    if (qualityScores.length === 0) {
        qualityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Quality Score',
                    data: [],
                    borderColor: '#D1FFC6',
                    backgroundColor: 'rgba(209, 255, 198, 0.15)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: getChartOptions('Not enough workouts yet')
        });
        return;
    }

    const labels = qualityScores.map(q => formatDate(q.date));
    const scores = qualityScores.map(q => q.score);

    qualityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Quality Score',
                data: scores,
                borderColor: '#D1FFC6',
                backgroundColor: 'rgba(209, 255, 198, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#D1FFC6',
                pointBorderColor: '#0f1419',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 },
                        color: '#9ca3af'
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 20
                    },
                    border: { display: false }
                }
            }
        }
    });
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
    if (weightChart) {
        weightChart.destroy();
        weightChart = null;
    }
    for (const type of Object.keys(measurementCharts)) {
        if (measurementCharts[type]) {
            measurementCharts[type].destroy();
            measurementCharts[type] = null;
        }
    }
    if (bodyFatChart) {
        bodyFatChart.destroy();
        bodyFatChart = null;
    }
    if (qualityChart) {
        qualityChart.destroy();
        qualityChart = null;
    }
}
