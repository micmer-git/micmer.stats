# Strava Dashboard - User Guide

## Overview

This document provides instructions for setting up and using your Strava Dashboard, a mobile-optimized static HTML dashboard that showcases your cycling, running, and swimming statistics from Strava, with milestone tracking and segment analysis.

## Project Structure

```
strava-dashboard/
├── assets/                  # Images and static assets
├── css/
│   └── styles.css           # Main stylesheet with glassmorphism design
├── data/                    # Data files (populated by Python script)
├── js/
│   ├── charts.js            # Chart visualizations
│   ├── data-integration.js  # Data loading and integration
│   └── main.js              # Main dashboard functionality
├── index.html               # Dashboard HTML
├── requirements.md          # Project requirements
├── strava_data_fetcher.py   # Python script for Strava API
├── strava_config.json       # Configuration file (you need to create this)
└── wireframe.md             # Dashboard design wireframe
```

## Setup Instructions

### 1. Set Up Strava API Access

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application:
   - Application Name: "Personal Strava Dashboard" (or your preferred name)
   - Website: Your GitHub Pages URL (e.g., `https://yourusername.github.io`)
   - Authorization Callback Domain: `yourusername.github.io` (without https:// or path)
3. After creating the application, note your `Client ID` and `Client Secret`

### 2. Create Configuration File

Create a file named `strava_config.json` in the project root with the following content:

```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "featured_activities": ["ACTIVITY_ID_1", "ACTIVITY_ID_2", "..."]
}
```

Replace:
- `YOUR_CLIENT_ID` with your Strava API Client ID
- `YOUR_CLIENT_SECRET` with your Strava API Client Secret
- `ACTIVITY_ID_1`, etc. with IDs of activities you want to feature (optional)

### 3. Initial Authentication

1. Run the Python script with the `--auth` flag:
   ```
   python strava_data_fetcher.py --auth
   ```
2. Follow the instructions to authorize the application
3. The script will save your authentication token for future use

### 4. Fetch Your Data

Run the Python script to fetch your Strava data:
```
python strava_data_fetcher.py
```

This will:
- Fetch your athlete profile
- Download your activities
- Process segments and achievements
- Calculate statistics and personal records
- Save all data to the `data/` directory

### 5. Set Up GitHub Pages

1. Create a new GitHub repository
2. Push the entire `strava-dashboard` directory to the repository
3. Enable GitHub Pages in the repository settings:
   - Go to Settings > Pages
   - Select "main" branch as the source
   - Click Save

Your dashboard will be available at `https://yourusername.github.io/repository-name/`

### 6. Automate Data Updates

To keep your dashboard updated, set up a scheduled task to run the Python script daily:

#### On Linux/Mac:
```
crontab -e
```

Add the following line to run the script daily at 5 AM:
```
0 5 * * * cd /path/to/strava-dashboard && python strava_data_fetcher.py
```

#### On Windows:
Use Task Scheduler to create a daily task that runs the Python script.

## Dashboard Features

### Activity Filtering
- Use the activity type selector to filter data by Cycling, Running, Swimming, or All Activities

### Year Overview
- View your current and previous year statistics
- Track progress with circular progress indicators
- Expand/collapse yearly data cards

### Activity Trends
- Distance over time chart
- Monthly comparison between current and previous year
- Weekly activity distribution

### Featured Activities
- Horizontal scrollable section of featured activities
- Comprehensive stats for each activity
- Direct links to activities on Strava

### Achievements & Milestones
- Visual progress tracking for 50 different achievements
- Categories include distance, elevation, consistency, and speed records
- Progress bars show completion percentage

### Personal Records
- Best times for running distances (5K, 10K, half-marathon, marathon)
- Cycling records (longest ride, most elevation, best power)
- Swimming achievements
- Links to the original activities

### Segment Analysis
- Track your performance on climbing segments
- View completion count, best time, and last attempt
- Compare progress over time

## Customization

### Adding Featured Activities
1. Find the activity IDs of rides/runs you want to feature
2. Add them to the `featured_activities` array in `strava_config.json`
3. Run the Python script again to update the data

### Modifying Achievements
The Python script automatically generates 50 achievements across different categories. To customize:
1. Edit the `calculate_achievements` function in `strava_data_fetcher.py`
2. Adjust thresholds or add new achievement types
3. Run the script again to update achievements

### Changing Design
- Modify `styles.css` to change colors, animations, or layout
- The primary color variable (`--primary-color`) controls the orange theme
- Adjust the blur effect variable (`--blur-effect`) to change the glassmorphism intensity

## Troubleshooting

### Authentication Issues
If you encounter authentication problems:
1. Delete the `strava_token.json` file
2. Run `python strava_data_fetcher.py --auth` to re-authenticate

### Missing Data
If some data is not appearing in the dashboard:
1. Check the `data/` directory to ensure JSON files were created
2. Look for error messages in the Python script output
3. Verify your Strava privacy settings allow access to the required data

### Deployment Issues
If the dashboard doesn't appear on GitHub Pages:
1. Ensure the repository is public
2. Check that GitHub Pages is enabled in repository settings
3. Verify the correct branch is selected as the source

## Support

For any issues or questions, please refer to:
- [Strava API Documentation](https://developers.strava.com/docs/reference/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- The comments in the Python script and JavaScript files for detailed explanations
