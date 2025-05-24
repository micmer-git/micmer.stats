// Strava Dashboard - Charts JavaScript

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

// Initialize all charts
function initializeCharts() {
    createDistanceChart();
    createMonthlyChart();
    createWeeklyChart();
    createCircularProgressCharts();
}

// Create distance over time chart
function createDistanceChart() {
    const ctx = document.getElementById('distance-chart').getContext('2d');
    
    // Sample data - will be replaced with actual data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Cycling',
                data: [65, 78, 90, 81, 95, 110, 120, 130, 95, 85, 70, 60],
                borderColor: '#fc5200',
                backgroundColor: 'rgba(252, 82, 0, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Running',
                data: [30, 35, 40, 45, 50, 45, 40, 35, 45, 50, 40, 35],
                borderColor: '#00b2ff',
                backgroundColor: 'rgba(0, 178, 255, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Swimming',
                data: [5, 8, 10, 12, 15, 18, 20, 18, 15, 12, 10, 8],
                borderColor: '#44d62c',
                backgroundColor: 'rgba(68, 214, 44, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + ' km';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    };
    
    new Chart(ctx, config);
}

// Create monthly comparison chart
function createMonthlyChart() {
    const ctx = document.getElementById('monthly-chart').getContext('2d');
    
    // Sample data - will be replaced with actual data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: '2025',
                data: [65, 78, 90, 81, 95, 110, 120, 130, 95, 85, 70, 60],
                backgroundColor: 'rgba(252, 82, 0, 0.7)',
                borderColor: 'rgba(252, 82, 0, 1)',
                borderWidth: 1
            },
            {
                label: '2024',
                data: [60, 70, 80, 75, 85, 100, 110, 120, 90, 80, 65, 55],
                backgroundColor: 'rgba(252, 82, 0, 0.3)',
                borderColor: 'rgba(252, 82, 0, 0.6)',
                borderWidth: 1
            }
        ]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + ' km';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    };
    
    new Chart(ctx, config);
}

// Create weekly activity distribution chart
function createWeeklyChart() {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    // Sample data - will be replaced with actual data
    const data = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Activities',
                data: [3, 5, 2, 4, 1, 7, 6],
                backgroundColor: 'rgba(252, 82, 0, 0.2)',
                borderColor: 'rgba(252, 82, 0, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(252, 82, 0, 1)',
                pointRadius: 5
            }
        ]
    };
    
    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + ' activities';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    };
    
    new Chart(ctx, config);
}

// Create circular progress charts
function createCircularProgressCharts() {
    // Distance progress
    createCircularProgress('distance-progress', 75, '#fc5200');
    
    // Time progress
    createCircularProgress('time-progress', 65, '#00b2ff');
    
    // Elevation progress
    createCircularProgress('elevation-progress', 85, '#ff9800');
    
    // Activities progress
    createCircularProgress('activities-progress', 90, '#44d62c');
}

// Create a circular progress chart
function createCircularProgress(elementId, percentage, color) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    const config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    color,
                    'rgba(200, 200, 200, 0.2)'
                ],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            circumference: 360,
            rotation: -90,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutCubic'
            }
        }
    };
    
    new Chart(ctx, config);
}

// Update charts based on activity type
function updateCharts(type) {
    // This will be implemented when we have actual data
}
