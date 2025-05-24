// Strava Dashboard - Main JavaScript

// DOM Elements
const activityTypeSelector = document.querySelector('.activity-selector');
const yearCards = document.querySelectorAll('.year-card');
const bottomNavItems = document.querySelectorAll('.nav-item');
const backToTopButton = document.querySelector('.back-to-top');
const activitiesContainer = document.getElementById('activities-container');
const achievementsContainer = document.getElementById('achievements-container');
const segmentsContainer = document.getElementById('segments-container');

// Global Variables
let userData = {};
let activities = [];
let segments = [];
let achievements = [];
let currentActivityType = 'all';
let lastUpdated = new Date();

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadMockData(); // This will be replaced with actual API data
});

// Initialize the dashboard with user data
function initializeDashboard() {
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
    document.getElementById('previous-year').textContent = currentYear - 1;
    
    // Set last updated date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(lastUpdated);
    document.getElementById('last-updated').textContent = formattedDate;
    
    // Initialize circular progress charts
    initializeCircularProgress();
}

// Setup event listeners
function setupEventListeners() {
    // Activity type selector
    activityTypeSelector.addEventListener('click', function(e) {
        if (e.target.classList.contains('activity-type')) {
            const activityTypes = document.querySelectorAll('.activity-type');
            activityTypes.forEach(type => type.classList.remove('active'));
            e.target.classList.add('active');
            
            currentActivityType = e.target.dataset.type;
            filterActivitiesByType(currentActivityType);
        }
    });
    
    // Year card expansion
    yearCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
            const icon = this.querySelector('.toggle-icon i');
            if (this.classList.contains('expanded')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });
    });
    
    // Bottom navigation
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            const section = document.getElementById(sectionId);
            window.scrollTo({
                top: section.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });
    
    // Back to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize circular progress charts
function initializeCircularProgress() {
    // This will be implemented with Chart.js in charts.js
}

// Filter activities by type
function filterActivitiesByType(type) {
    // Filter activities and update UI
    updateDashboardData(type);
}

// Update dashboard data based on activity type
function updateDashboardData(type) {
    // This will update all dashboard sections based on the selected activity type
    // For now, we'll use mock data
    updateYearOverview(type);
    updateActivityTrends(type);
    updateFeaturedActivities(type);
    updateAchievements(type);
    updatePersonalRecords(type);
    updateSegmentAnalysis(type);
}

// Update year overview section
function updateYearOverview(type) {
    // Update metrics based on activity type
    // This will be replaced with actual data calculations
}

// Update activity trends charts
function updateActivityTrends(type) {
    // Update charts based on activity type
    // This will be implemented in charts.js
}

// Update featured activities section
function updateFeaturedActivities(type) {
    // Clear current activities
    // activitiesContainer.innerHTML = '';
    
    // Filter activities by type and add to container
    // This will be replaced with actual data rendering
}

// Update achievements section
function updateAchievements(type) {
    // Update achievements based on activity type
    // This will be replaced with actual achievement calculations
}

// Update personal records section
function updatePersonalRecords(type) {
    // Update records based on activity type
    // This will be replaced with actual record calculations
}

// Update segment analysis section
function updateSegmentAnalysis(type) {
    // Update segments based on activity type
    // This will be replaced with actual segment data
}

// Format time (seconds to HH:MM:SS)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
        hours > 0 ? hours : null,
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
}

// Format pace (seconds per kilometer to MM:SS)
function formatPace(secondsPerKm) {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.floor(secondsPerKm % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Load mock data for development
function loadMockData() {
    // Mock user data
    userData = {
        name: 'John Doe',
        profile: 'assets/profile-placeholder.jpg',
        weekDistance: 42.5,
        monthDistance: 180.2
    };
    
    // Update UI with mock data
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('week-distance').textContent = userData.weekDistance + ' km';
    document.getElementById('month-distance').textContent = userData.monthDistance + ' km';
    
    // Mock year overview data
    document.getElementById('total-distance').textContent = '1,250';
    document.getElementById('total-time').textContent = '85';
    document.getElementById('total-elevation').textContent = '12,500';
    document.getElementById('activity-count').textContent = '95';
    
    document.getElementById('prev-total-distance').textContent = '1,120 km';
    document.getElementById('prev-total-time').textContent = '78 h';
    document.getElementById('prev-total-elevation').textContent = '10,800 m';
    document.getElementById('prev-activity-count').textContent = '82';
    
    // Animation for achievements
    const progressBars = document.querySelectorAll('.achievement-progress-bar');
    setTimeout(() => {
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 300);
        });
    }, 500);
}

// Create activity card element
function createActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'glass-card activity-card';
    
    // This will be implemented when we have actual data
    
    return card;
}

// Create achievement element
function createAchievement(achievement) {
    const achievementEl = document.createElement('div');
    achievementEl.className = 'achievement';
    
    // This will be implemented when we have actual data
    
    return achievementEl;
}

// Create segment element
function createSegment(segment) {
    const segmentEl = document.createElement('div');
    segmentEl.className = 'segment-card';
    
    // This will be implemented when we have actual data
    
    return segmentEl;
}

// Add animation classes to elements when they come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.glass-card, .achievement, .metric-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
};

// Call animation function
window.addEventListener('load', animateOnScroll);
