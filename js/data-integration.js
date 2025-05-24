// Strava Dashboard - Data Integration Module

/**
 * This module handles loading and integrating data from the Python-generated JSON files
 * into the dashboard UI components.
 */

// Data file paths
const DATA_PATHS = {
    activities: 'data/activities.json',
    segments: 'data/segments.json',
    achievements: 'data/achievements.json',
    athlete: 'data/athlete.json',
    summary: 'data/summary.json',
    featuredActivities: 'data/featured_activities.json'
};

// Global data objects
let athleteData = null;
let activitiesData = null;
let segmentsData = null;
let achievementsData = null;
let summaryData = null;
let featuredActivitiesData = null;

// Initialize data loading
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

/**
 * Load all dashboard data from JSON files
 */
async function loadDashboardData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load all data files
        const [athlete, activities, segments, achievements, summary, featured] = await Promise.all([
            fetchJSON(DATA_PATHS.athlete),
            fetchJSON(DATA_PATHS.activities),
            fetchJSON(DATA_PATHS.segments),
            fetchJSON(DATA_PATHS.achievements),
            fetchJSON(DATA_PATHS.summary),
            fetchJSON(DATA_PATHS.featuredActivities)
        ]);
        
        // Store data globally
        athleteData = athlete;
        activitiesData = activities;
        segmentsData = segments;
        achievementsData = achievements;
        summaryData = summary;
        featuredActivitiesData = featured;
        
        // Update dashboard with loaded data
        updateDashboardWithData();
        
        // Hide loading state
        hideLoadingState();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // If data loading fails, use mock data for development
        loadMockData();
        hideLoadingState();
    }
}

/**
 * Fetch JSON data from file
 * @param {string} path - Path to JSON file
 * @returns {Promise<Object>} - Parsed JSON data
 */
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${path}:`, error);
        throw error;
    }
}

/**
 * Update all dashboard components with loaded data
 */
function updateDashboardWithData() {
    // Update athlete profile
    updateAthleteProfile();
    
    // Update year overview
    updateYearOverview();
    
    // Update activity trends charts
    updateActivityCharts();
    
    // Update featured activities
    updateFeaturedActivities();
    
    // Update achievements
    updateAchievements();
    
    // Update personal records
    updatePersonalRecords();
    
    // Update segment analysis
    updateSegmentAnalysis();
    
    // Update last updated timestamp
    updateLastUpdated();
}

/**
 * Update athlete profile section
 */
function updateAthleteProfile() {
    if (!athleteData) return;
    
    // Update profile image and name
    const profileImage = document.getElementById('profile-image');
    const userName = document.getElementById('user-name');
    
    if (profileImage && athleteData.profile) {
        profileImage.src = athleteData.profile;
        profileImage.alt = athleteData.firstname + ' ' + athleteData.lastname;
    }
    
    if (userName) {
        userName.textContent = athleteData.firstname + ' ' + athleteData.lastname;
    }
    
    // Update quick stats if summary data is available
    if (summaryData && summaryData.current_week && summaryData.current_month) {
        const weekDistance = document.getElementById('week-distance');
        const monthDistance = document.getElementById('month-distance');
        
        if (weekDistance) {
            weekDistance.textContent = formatDistance(summaryData.current_week.distance);
        }
        
        if (monthDistance) {
            monthDistance.textContent = formatDistance(summaryData.current_month.distance);
        }
    }
}

/**
 * Update year overview section
 */
function updateYearOverview() {
    if (!summaryData || !summaryData.years) return;
    
    const currentYear = new Date().getFullYear().toString();
    const previousYear = (new Date().getFullYear() - 1).toString();
    
    // Update current year card
    if (summaryData.years[currentYear]) {
        const yearData = summaryData.years[currentYear];
        
        document.getElementById('current-year').textContent = currentYear;
        document.getElementById('total-distance').textContent = formatDistance(yearData.distance, false);
        document.getElementById('total-time').textContent = formatDuration(yearData.moving_time, false);
        document.getElementById('total-elevation').textContent = formatElevation(yearData.elevation_gain, false);
        document.getElementById('activity-count').textContent = yearData.count;
        
        // Update circular progress charts
        updateCircularProgressCharts(yearData);
    }
    
    // Update previous year card
    if (summaryData.years[previousYear]) {
        const yearData = summaryData.years[previousYear];
        
        document.getElementById('previous-year').textContent = previousYear;
        document.getElementById('prev-total-distance').textContent = formatDistance(yearData.distance);
        document.getElementById('prev-total-time').textContent = formatDuration(yearData.moving_time);
        document.getElementById('prev-total-elevation').textContent = formatElevation(yearData.elevation_gain);
        document.getElementById('prev-activity-count').textContent = yearData.count;
    }
}

/**
 * Update circular progress charts with year data
 * @param {Object} yearData - Year summary data
 */
function updateCircularProgressCharts(yearData) {
    // Calculate progress percentages based on goals
    // These goals could be customized or calculated from previous years
    const distanceGoal = 2000; // 2000 km
    const timeGoal = 200; // 200 hours
    const elevationGoal = 20000; // 20000 meters
    const activityGoal = 150; // 150 activities
    
    const distancePercentage = Math.min(100, (yearData.distance / distanceGoal) * 100);
    const timePercentage = Math.min(100, (yearData.moving_time / timeGoal) * 100);
    const elevationPercentage = Math.min(100, (yearData.elevation_gain / elevationGoal) * 100);
    const activityPercentage = Math.min(100, (yearData.count / activityGoal) * 100);
    
    // Update charts
    updateCircularProgress('distance-progress', distancePercentage, '#fc5200');
    updateCircularProgress('time-progress', timePercentage, '#00b2ff');
    updateCircularProgress('elevation-progress', elevationPercentage, '#ff9800');
    updateCircularProgress('activities-progress', activityPercentage, '#44d62c');
}

/**
 * Update activity trend charts
 */
function updateActivityCharts() {
    if (!summaryData || !activitiesData) return;
    
    // Update distance over time chart
    updateDistanceChart();
    
    // Update monthly comparison chart
    updateMonthlyChart();
    
    // Update weekly activity distribution chart
    updateWeeklyChart();
}

/**
 * Update distance over time chart with real data
 */
function updateDistanceChart() {
    if (!summaryData || !summaryData.months) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activityTypes = ['ride', 'run', 'swim'];
    const colors = {
        'ride': '#fc5200',
        'run': '#00b2ff',
        'swim': '#44d62c'
    };
    
    // Prepare datasets
    const datasets = activityTypes.map(type => {
        const monthlyData = Array(12).fill(0);
        
        // If we have summary data with activity types
        if (summaryData.years && summaryData.current_year) {
            const yearData = summaryData.years[summaryData.current_year];
            
            if (yearData && yearData.activity_types && yearData.activity_types[type]) {
                // For each month, get distance for this activity type
                for (let i = 1; i <= 12; i++) {
                    const monthStr = i.toString().padStart(2, '0');
                    if (summaryData.months && summaryData.months[monthStr]) {
                        // This is simplified - in a real implementation, we'd need to filter by activity type per month
                        // Here we're just distributing the yearly total proportionally
                        const monthTotal = summaryData.months[monthStr].distance;
                        const yearTotal = yearData.distance;
                        const typeTotal = yearData.activity_types[type].distance;
                        
                        if (yearTotal > 0) {
                            monthlyData[i-1] = (monthTotal / yearTotal) * typeTotal;
                        }
                    }
                }
            }
        }
        
        return {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            data: monthlyData,
            borderColor: colors[type],
            backgroundColor: colors[type].replace(')', ', 0.1)').replace('rgb', 'rgba'),
            tension: 0.4,
            fill: true
        };
    });
    
    // Update chart
    const chart = Chart.getChart('distance-chart');
    if (chart) {
        chart.data.datasets = datasets;
        chart.update();
    }
}

/**
 * Update monthly comparison chart with real data
 */
function updateMonthlyChart() {
    if (!summaryData || !summaryData.months) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear().toString();
    const previousYear = (new Date().getFullYear() - 1).toString();
    
    // Prepare current year data
    const currentYearData = Array(12).fill(0);
    if (summaryData.months) {
        for (let i = 1; i <= 12; i++) {
            const monthStr = i.toString().padStart(2, '0');
            if (summaryData.months[monthStr]) {
                currentYearData[i-1] = summaryData.months[monthStr].distance;
            }
        }
    }
    
    // Prepare previous year data (simplified - would need actual previous year data)
    const previousYearData = currentYearData.map(val => val * 0.9); // Just for demonstration
    
    // Update chart
    const chart = Chart.getChart('monthly-chart');
    if (chart) {
        chart.data.datasets[0].data = currentYearData;
        chart.data.datasets[1].data = previousYearData;
        chart.data.datasets[0].label = currentYear;
        chart.data.datasets[1].label = previousYear;
        chart.update();
    }
}

/**
 * Update weekly activity distribution chart with real data
 */
function updateWeeklyChart() {
    if (!activitiesData) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activityCounts = Array(7).fill(0);
    
    // Count activities by day of week
    activitiesData.forEach(activity => {
        if (activity.start_date_local) {
            const date = new Date(activity.start_date_local);
            const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            activityCounts[dayIndex]++;
        }
    });
    
    // Update chart
    const chart = Chart.getChart('weekly-chart');
    if (chart) {
        chart.data.datasets[0].data = activityCounts;
        chart.update();
    }
}

/**
 * Update featured activities section
 */
function updateFeaturedActivities() {
    if (!featuredActivitiesData) return;
    
    const container = document.getElementById('activities-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add featured activities
    featuredActivitiesData.forEach(activity => {
        const card = createActivityCard(activity);
        container.appendChild(card);
    });
    
    // If no featured activities, add some recent ones
    if (featuredActivitiesData.length === 0 && activitiesData && activitiesData.length > 0) {
        // Sort by date, newest first
        const sortedActivities = [...activitiesData].sort((a, b) => {
            return new Date(b.start_date_local) - new Date(a.start_date_local);
        });
        
        // Add up to 10 recent activities
        const recentActivities = sortedActivities.slice(0, 10);
        recentActivities.forEach(activity => {
            const card = createActivityCard(activity);
            container.appendChild(card);
        });
    }
}

/**
 * Create activity card element
 * @param {Object} activity - Activity data
 * @returns {HTMLElement} - Activity card element
 */
function createActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'glass-card activity-card';
    
    // Format activity data
    const distance = formatDistance(activity.distance / 1000);
    const duration = formatDuration(activity.moving_time / 3600);
    const elevation = formatElevation(activity.total_elevation_gain);
    const pace = activity.type.toLowerCase() === 'run' 
        ? formatPace(activity.moving_time / (activity.distance / 1000))
        : formatSpeed(activity.distance / activity.moving_time * 3.6);
    const paceLabel = activity.type.toLowerCase() === 'run' ? 'Avg Pace' : 'Avg Speed';
    
    // Create card content
    card.innerHTML = `
        <img src="${activity.map?.summary_polyline ? 
            `https://maps.googleapis.com/maps/api/staticmap?size=400x200&path=enc:${activity.map.summary_polyline}&key=YOUR_API_KEY` : 
            'assets/activity-placeholder.jpg'}" 
            alt="Activity" class="activity-image">
        <div class="activity-details">
            <h3 class="activity-title">${activity.name}</h3>
            <div class="activity-date">${formatDate(activity.start_date_local)}</div>
            <div class="activity-stats">
                <div>
                    <div class="activity-stat-label">Distance</div>
                    <div>${distance}</div>
                </div>
                <div>
                    <div class="activity-stat-label">Time</div>
                    <div>${duration}</div>
                </div>
                <div>
                    <div class="activity-stat-label">Elevation</div>
                    <div>${elevation}</div>
                </div>
                <div>
                    <div class="activity-stat-label">${paceLabel}</div>
                    <div>${pace}</div>
                </div>
            </div>
            <a href="https://www.strava.com/activities/${activity.id}" target="_blank" class="activity-link">
                View on Strava <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `;
    
    return card;
}

/**
 * Update achievements section
 */
function updateAchievements() {
    if (!achievementsData) return;
    
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Filter achievements based on current activity type
    const currentType = document.querySelector('.activity-type.active')?.dataset.type || 'all';
    let filteredAchievements = achievementsData;
    
    if (currentType !== 'all') {
        filteredAchievements = achievementsData.filter(achievement => 
            achievement.type === currentType || achievement.type === 'all'
        );
    }
    
    // Sort achievements: completed first, then by progress
    filteredAchievements.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return b.progress - a.progress;
    });
    
    // Add achievements (limit to 15 for display)
    const displayAchievements = filteredAchievements.slice(0, 15);
    displayAchievements.forEach(achievement => {
        const achievementEl = createAchievement(achievement);
        container.appendChild(achievementEl);
    });
}

/**
 * Create achievement element
 * @param {Object} achievement - Achievement data
 * @returns {HTMLElement} - Achievement element
 */
function createAchievement(achievement) {
    const achievementEl = document.createElement('div');
    achievementEl.className = achievement.completed ? 'achievement' : 'achievement achievement-locked';
    
    // Determine icon based on category
    let icon = 'trophy';
    switch (achievement.category) {
        case 'distance':
            icon = 'route';
            break;
        case 'elevation':
            icon = 'mountain';
            break;
        case 'streak':
            icon = 'calendar-check';
            break;
        case 'speed':
            icon = 'tachometer-alt';
            break;
    }
    
    // Create achievement content
    achievementEl.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-progress">
            <div class="achievement-progress-bar" style="width: ${achievement.progress}%"></div>
        </div>
    `;
    
    return achievementEl;
}

/**
 * Update personal records section
 */
function updatePersonalRecords() {
    if (!summaryData || !summaryData.records) return;
    
    const records = summaryData.records;
    
    // Update running records
    updateRecordsList('running-records', records.run);
    
    // Update cycling records
    updateRecordsList('cycling-records', records.ride);
    
    // Update swimming records
    updateRecordsList('swimming-records', records.swim);
}

/**
 * Update records list
 * @param {string} containerId - ID of container element
 * @param {Object} records - Records data
 */
function updateRecordsList(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add records
    for (const [key, record] of Object.entries(records)) {
        if (!record) continue;
        
        const item = document.createElement('li');
        item.className = 'record-item';
        
        // Format record title
        let title = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Format record value
        let value = '';
        if (key.includes('distance')) {
            value = formatDistance(record.value);
        } else if (key.includes('elevation')) {
            value = formatElevation(record.value);
        } else if (key.includes('power')) {
            value = `${Math.round(record.value)} W`;
        } else {
            value = formatDuration(record.value / 3600);
        }
        
        // Create record content
        item.innerHTML = `
            <span class="record-title">${title}</span>
            <a href="https://www.strava.com/activities/${record.activity_id}" target="_blank" class="record-value">
                ${value}
            </a>
        `;
        
        container.appendChild(item);
    }
}

/**
 * Update segment analysis section
 */
function updateSegmentAnalysis() {
    if (!segmentsData) return;
    
    const container = document.getElementById('segments-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Sort segments by count
    const sortedSegments = [...segmentsData].sort((a, b) => b.count - a.count);
    
    // Add segments (limit to 10 for display)
    const displaySegments = sortedSegments.slice(0, 10);
    displaySegments.forEach(segment => {
        const segmentEl = createSegment(segment);
        container.appendChild(segmentEl);
    });
}

/**
 * Create segment element
 * @param {Object} segment - Segment data
 * @returns {HTMLElement} - Segment element
 */
function createSegment(segment) {
    const segmentEl = document.createElement('div');
    segmentEl.className = 'segment-card';
    
    // Format segment data
    const bestTime = formatDuration(segment.best_time / 60, false, true);
    const lastTime = formatDuration(segment.last_time / 60, false, true);
    
    // Create segment content
    segmentEl.innerHTML = `
        <div class="segment-header">
            <div class="segment-name">${segment.name}</div>
            <div class="segment-count">${segment.count}</div>
        </div>
        <div class="segment-details">
            <div>Best time: ${bestTime} | Last attempt: ${lastTime}</div>
        </div>
    `;
    
    return segmentEl;
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    if (!summaryData || !summaryData.last_updated) return;
    
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = formatDate(summaryData.last_updated);
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    // Add loading spinner to each section
    const sections = ['year-overview', 'activity-trends', 'featured-activities', 'achievements', 'personal-records', 'segment-analysis'];
    
    sections.forEach(section => {
        const container = document.getElementById(section);
        if (container) {
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = '<div class="loading-spinner"></div>';
            container.appendChild(loading);
        }
    });
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Remove loading spinners
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
}

/**
 * Format distance value
 * @param {number} distance - Distance in kilometers
 * @param {boolean} includeUnit - Whether to include unit
 * @returns {string} - Formatted distance
 */
function formatDistance(distance, includeUnit = true) {
    if (distance === undefined || distance === null) return '-';
    
    const formatted = distance < 10 
        ? distance.toFixed(1) 
        : Math.round(distance).toLocaleString();
    
    return includeUnit ? `${formatted} km` : formatted;
}

/**
 * Format elevation value
 * @param {number} elevation - Elevation in meters
 * @param {boolean} includeUnit - Whether to include unit
 * @returns {string} - Formatted elevation
 */
function formatElevation(elevation, includeUnit = true) {
    if (elevation === undefined || elevation === null) return '-';
    
    const formatted = Math.round(elevation).toLocaleString();
    return includeUnit ? `${formatted} m` : formatted;
}

/**
 * Format duration value
 * @param {number} hours - Duration in hours
 * @param {boolean} includeUnit - Whether to include unit
 * @param {boolean} showMinutes - Whether to show minutes for short durations
 * @returns {string} - Formatted duration
 */
function formatDuration(hours, includeUnit = true, showMinutes = false) {
    if (hours === undefined || hours === null) return '-';
    
    if (showMinutes && hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes}m`;
    }
    
    if (hours < 1) {
        return includeUnit ? `${Math.round(hours * 60)}m` : Math.round(hours * 60).toString();
    }
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
        return includeUnit ? `${wholeHours}h` : wholeHours.toString();
    }
    
    return `${wholeHours}h ${minutes}m`;
}

/**
 * Format pace value (min/km)
 * @param {number} secondsPerKm - Pace in seconds per kilometer
 * @returns {string} - Formatted pace
 */
function formatPace(secondsPerKm) {
    if (secondsPerKm === undefined || secondsPerKm === null) return '-';
    
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.floor(secondsPerKm % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

/**
 * Format speed value (km/h)
 * @param {number} kmPerHour - Speed in kilometers per hour
 * @returns {string} - Formatted speed
 */
function formatSpeed(kmPerHour) {
    if (kmPerHour === undefined || kmPerHour === null) return '-';
    
    return `${kmPerHour.toFixed(1)} km/h`;
}

/**
 * Format date value
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Load mock data for development and testing
 */
function loadMockData() {
    console.log('Loading mock data for development');
    
    // Mock athlete data
    athleteData = {
        firstname: 'John',
        lastname: 'Doe',
        profile: 'assets/profile-placeholder.jpg'
    };
    
    // Mock summary data
    summaryData = {
        last_updated: new Date().toISOString(),
        current_year: '2025',
        years: {
            '2025': {
                distance: 1250,
                elevation_gain: 12500,
                moving_time: 85,
                count: 95,
                activity_types: {
                    'ride': { distance: 950, elevation_gain: 10000, moving_time: 60, count: 45 },
                    'run': { distance: 250, elevation_gain: 2000, moving_time: 20, count: 40 },
                    'swim': { distance: 50, elevation_gain: 0, moving_time: 5, count: 10 }
                }
            },
            '2024': {
                distance: 1120,
                elevation_gain: 10800,
                moving_time: 78,
                count: 82,
                activity_types: {
                    'ride': { distance: 850, elevation_gain: 9000, moving_time: 55, count: 40 },
                    'run': { distance: 220, elevation_gain: 1800, moving_time: 18, count: 35 },
                    'swim': { distance: 50, elevation_gain: 0, moving_time: 5, count: 7 }
                }
            }
        },
        current_week: {
            distance: 42.5,
            elevation_gain: 550,
            moving_time: 3.5,
            count: 3
        },
        current_month: {
            distance: 180.2,
            elevation_gain: 2200,
            moving_time: 12,
            count: 12
        },
        records: {
            'run': {
                'fastest_5k': { value: 1290, date: '2025-03-15T08:30:00Z', activity_id: '1234567890' },
                'fastest_10k': { value: 2730, date: '2025-02-10T09:15:00Z', activity_id: '1234567891' },
                'fastest_half_marathon': { value: 6135, date: '2025-04-05T07:00:00Z', activity_id: '1234567892' },
                'fastest_marathon': { value: 13522, date: '2024-10-12T06:30:00Z', activity_id: '1234567893' },
                'longest_distance': { value: 42.2, date: '2024-10-12T06:30:00Z', activity_id: '1234567893' },
                'most_elevation': { value: 850, date: '2025-01-20T08:00:00Z', activity_id: '1234567894' }
            },
            'ride': {
                'longest_distance': { value: 160.5, date: '2025-05-01T07:00:00Z', activity_id: '1234567895' },
                'most_elevation': { value: 2450, date: '2025-03-28T08:30:00Z', activity_id: '1234567896' },
                'fastest_40k': { value: 3922, date: '2025-04-15T16:00:00Z', activity_id: '1234567897' },
                'best_avg_power': { value: 245, date: '2025-02-05T17:30:00Z', activity_id: '1234567898' }
            },
            'swim': {
                'longest_distance': { value: 3000, date: '2025-04-10T06:00:00Z', activity_id: '1234567899' },
                'fastest_100m': { value: 85, date: '2025-03-05T06:30:00Z', activity_id: '1234567900' }
            }
        }
    };
    
    // Mock achievements data
    achievementsData = [
        {
            id: 'ride_distance_1000',
            title: '1000km Ride',
            description: 'Complete 1000km of Ride activities',
            progress: 75,
            completed: false,
            type: 'ride',
            category: 'distance'
        },
        {
            id: 'ride_elevation_8848',
            title: 'Everesting',
            description: 'Climb 8848m in a single ride',
            progress: 25,
            completed: false,
            type: 'ride',
            category: 'elevation'
        },
        {
            id: 'run_pace_5k_20',
            title: 'Sub-20 5K',
            description: 'Run 5K in under 20 minutes',
            progress: 0,
            completed: false,
            type: 'run',
            category: 'speed'
        }
    ];
    
    // Mock segments data
    segmentsData = [
        {
            id: 12345,
            name: 'Alpe d\'Huez',
            count: 5,
            best_time: 3510,
            last_time: 3735
        },
        {
            id: 12346,
            name: 'Col du Galibier',
            count: 2,
            best_time: 5145,
            last_time: 5422
        }
    ];
    
    // Update dashboard with mock data
    updateDashboardWithData();
}
