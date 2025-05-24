#!/usr/bin/env python3
"""
Strava Dashboard Data Fetcher

This script fetches activity data from the Strava API and updates the dashboard data files.
It's designed to be run daily via a cron job or similar scheduler.

Requirements:
- Python 3.6+
- requests library
- A Strava API application with client_id and client_secret

Usage:
1. Set up environment variables or config file with Strava API credentials
2. Run the script: python strava_data_fetcher.py
"""

import os
import sys
import json
import time
import argparse
import logging
from datetime import datetime, timedelta
import requests
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("strava_fetcher.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("strava_fetcher")

# Constants
CONFIG_FILE = "strava_config.json"
TOKEN_FILE = "strava_token.json"
DATA_DIR = "data"
ACTIVITIES_FILE = f"{DATA_DIR}/activities.json"
SEGMENTS_FILE = f"{DATA_DIR}/segments.json"
ACHIEVEMENTS_FILE = f"{DATA_DIR}/achievements.json"
ATHLETE_FILE = f"{DATA_DIR}/athlete.json"
SUMMARY_FILE = f"{DATA_DIR}/summary.json"
FEATURED_ACTIVITIES_FILE = f"{DATA_DIR}/featured_activities.json"

# Strava API endpoints
AUTH_URL = "https://www.strava.com/oauth/token"
ATHLETE_URL = "https://www.strava.com/api/v3/athlete"
ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities"
ACTIVITY_URL = "https://www.strava.com/api/v3/activities/{id}"
SEGMENTS_URL = "https://www.strava.com/api/v3/segments/{id}"
SEGMENT_EFFORTS_URL = "https://www.strava.com/api/v3/segment_efforts/{id}"

class StravaFetcher:
    """Class to handle Strava API authentication and data fetching"""
    
    def __init__(self, config_file=CONFIG_FILE, token_file=TOKEN_FILE):
        """Initialize with config and token file paths"""
        self.config_file = config_file
        self.token_file = token_file
        self.config = self._load_config()
        self.token_data = self._load_token()
        self.headers = None
        
        # Ensure data directory exists
        os.makedirs(DATA_DIR, exist_ok=True)
    
    def _load_config(self):
        """Load configuration from file or environment variables"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading config file: {e}")
        
        # Try environment variables if file doesn't exist
        config = {
            "client_id": os.environ.get("STRAVA_CLIENT_ID"),
            "client_secret": os.environ.get("STRAVA_CLIENT_SECRET"),
            "refresh_token": os.environ.get("STRAVA_REFRESH_TOKEN"),
            "featured_activities": os.environ.get("STRAVA_FEATURED_ACTIVITIES", "").split(",")
        }
        
        # Check if we have the minimum required config
        if not config["client_id"] or not config["client_secret"]:
            logger.error("Missing Strava API credentials. Please set up config file or environment variables.")
            sys.exit(1)
        
        return config
    
    def _load_token(self):
        """Load token data from file if it exists"""
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading token file: {e}")
        
        # Return empty dict if file doesn't exist
        return {}
    
    def _save_token(self):
        """Save token data to file"""
        try:
            with open(self.token_file, 'w') as f:
                json.dump(self.token_data, f)
        except Exception as e:
            logger.error(f"Error saving token file: {e}")
    
    def authenticate(self):
        """Authenticate with Strava API using client credentials flow"""
        # Check if we have a valid access token
        if self.token_data and 'expires_at' in self.token_data:
            if self.token_data['expires_at'] > time.time():
                logger.info("Using existing access token")
                self.headers = {"Authorization": f"Bearer {self.token_data['access_token']}"}
                return True
        
        # If we have a refresh token, use it to get a new access token
        if self.token_data and 'refresh_token' in self.token_data:
            refresh_token = self.token_data['refresh_token']
        elif 'refresh_token' in self.config:
            refresh_token = self.config['refresh_token']
        else:
            logger.error("No refresh token available. Please authorize the application first.")
            return False
        
        # Request new access token
        payload = {
            'client_id': self.config['client_id'],
            'client_secret': self.config['client_secret'],
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        }
        
        try:
            response = requests.post(AUTH_URL, data=payload)
            response.raise_for_status()
            self.token_data = response.json()
            self._save_token()
            self.headers = {"Authorization": f"Bearer {self.token_data['access_token']}"}
            logger.info("Successfully obtained new access token")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication error: {e}")
            return False
    
    def get_athlete(self):
        """Get athlete profile data"""
        try:
            response = requests.get(ATHLETE_URL, headers=self.headers)
            response.raise_for_status()
            athlete_data = response.json()
            
            # Save athlete data
            with open(ATHLETE_FILE, 'w') as f:
                json.dump(athlete_data, f)
            
            logger.info("Successfully fetched athlete data")
            return athlete_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching athlete data: {e}")
            return None
    
    def get_activities(self, limit=None):
        """Get athlete activities"""
        all_activities = []
        page = 1
        per_page = 50  # Maximum allowed by Strava API
        
        while True:
            try:
                params = {
                    'page': page,
                    'per_page': per_page
                }
                response = requests.get(ACTIVITIES_URL, headers=self.headers, params=params)
                response.raise_for_status()
                activities = response.json()
                
                if not activities:
                    break
                
                all_activities.extend(activities)
                logger.info(f"Fetched {len(activities)} activities (page {page})")
                
                if len(activities) < per_page or (limit and len(all_activities) >= limit):
                    break
                
                page += 1
                time.sleep(1)  # Respect rate limits
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching activities: {e}")
                break
        
        # Save activities data
        with open(ACTIVITIES_FILE, 'w') as f:
            json.dump(all_activities, f)
        
        logger.info(f"Successfully fetched {len(all_activities)} activities")
        return all_activities
    
    def get_activity_details(self, activity_id):
        """Get detailed information for a specific activity"""
        try:
            response = requests.get(ACTIVITY_URL.format(id=activity_id), headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching activity {activity_id}: {e}")
            return None
    
    def get_segment_details(self, segment_id):
        """Get detailed information for a specific segment"""
        try:
            response = requests.get(SEGMENTS_URL.format(id=segment_id), headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching segment {segment_id}: {e}")
            return None
    
    def get_featured_activities(self):
        """Get detailed information for featured activities"""
        featured_ids = self.config.get('featured_activities', [])
        if not featured_ids:
            logger.info("No featured activities configured")
            return []
        
        featured_activities = []
        for activity_id in featured_ids:
            if not activity_id:
                continue
            
            activity = self.get_activity_details(activity_id)
            if activity:
                featured_activities.append(activity)
                time.sleep(1)  # Respect rate limits
        
        # Save featured activities
        with open(FEATURED_ACTIVITIES_FILE, 'w') as f:
            json.dump(featured_activities, f)
        
        logger.info(f"Successfully fetched {len(featured_activities)} featured activities")
        return featured_activities
    
    def process_segments(self, activities):
        """Process segment efforts from activities"""
        segment_efforts = {}
        
        for activity in activities:
            if 'segment_efforts' in activity:
                for effort in activity['segment_efforts']:
                    segment_id = effort['segment']['id']
                    if segment_id not in segment_efforts:
                        segment_efforts[segment_id] = {
                            'id': segment_id,
                            'name': effort['segment']['name'],
                            'efforts': [],
                            'count': 0,
                            'best_time': None,
                            'last_time': None
                        }
                    
                    segment_efforts[segment_id]['efforts'].append({
                        'id': effort['id'],
                        'elapsed_time': effort['elapsed_time'],
                        'date': activity['start_date'],
                        'activity_id': activity['id']
                    })
                    segment_efforts[segment_id]['count'] += 1
        
        # Process segment statistics
        for segment_id, segment in segment_efforts.items():
            if segment['efforts']:
                # Sort efforts by time
                segment['efforts'].sort(key=lambda x: x['elapsed_time'])
                segment['best_time'] = segment['efforts'][0]['elapsed_time']
                
                # Sort efforts by date
                segment['efforts'].sort(key=lambda x: x['date'], reverse=True)
                segment['last_time'] = segment['efforts'][0]['elapsed_time']
        
        # Convert to list and save
        segments_list = list(segment_efforts.values())
        with open(SEGMENTS_FILE, 'w') as f:
            json.dump(segments_list, f)
        
        logger.info(f"Successfully processed {len(segments_list)} segments")
        return segments_list
    
    def calculate_achievements(self, activities):
        """Calculate achievements based on activities"""
        achievements = []
        
        # Group activities by type
        activities_by_type = {
            'ride': [],
            'run': [],
            'swim': [],
            'all': activities
        }
        
        for activity in activities:
            activity_type = activity.get('type', '').lower()
            if activity_type in activities_by_type:
                activities_by_type[activity_type].append(activity)
        
        # Calculate total distance achievements
        distance_thresholds = {
            'ride': [100, 500, 1000, 5000, 10000],
            'run': [50, 100, 250, 500, 1000],
            'swim': [5, 10, 25, 50, 100]
        }
        
        for activity_type, thresholds in distance_thresholds.items():
            total_distance = sum(a.get('distance', 0) for a in activities_by_type.get(activity_type, [])) / 1000  # Convert to km
            
            for threshold in thresholds:
                progress = min(100, (total_distance / threshold) * 100)
                achievements.append({
                    'id': f"{activity_type}_distance_{threshold}",
                    'title': f"{threshold}km {activity_type.capitalize()}",
                    'description': f"Complete {threshold}km of {activity_type.capitalize()} activities",
                    'progress': progress,
                    'completed': progress >= 100,
                    'type': activity_type,
                    'category': 'distance'
                })
        
        # Calculate elevation achievements
        elevation_thresholds = {
            'ride': [1000, 5000, 10000, 25000, 50000],
            'run': [500, 1000, 2500, 5000, 10000]
        }
        
        for activity_type, thresholds in elevation_thresholds.items():
            total_elevation = sum(a.get('total_elevation_gain', 0) for a in activities_by_type.get(activity_type, []))
            
            for threshold in thresholds:
                progress = min(100, (total_elevation / threshold) * 100)
                achievements.append({
                    'id': f"{activity_type}_elevation_{threshold}",
                    'title': f"{threshold}m Elevation",
                    'description': f"Climb {threshold}m in {activity_type.capitalize()} activities",
                    'progress': progress,
                    'completed': progress >= 100,
                    'type': activity_type,
                    'category': 'elevation'
                })
        
        # Calculate streak achievements
        # (This is a simplified version - a more complex implementation would track consecutive days)
        streak_thresholds = [5, 10, 30, 60, 100]
        activity_dates = set(a.get('start_date_local', '').split('T')[0] for a in activities if 'start_date_local' in a)
        current_streak = len(activity_dates)
        
        for threshold in streak_thresholds:
            progress = min(100, (current_streak / threshold) * 100)
            achievements.append({
                'id': f"streak_{threshold}",
                'title': f"{threshold} Day Streak",
                'description': f"Complete activities on {threshold} different days",
                'progress': progress,
                'completed': progress >= 100,
                'type': 'all',
                'category': 'streak'
            })
        
        # Calculate personal records
        # This would require more detailed analysis of activities
        
        # Save achievements
        with open(ACHIEVEMENTS_FILE, 'w') as f:
            json.dump(achievements, f)
        
        logger.info(f"Successfully calculated {len(achievements)} achievements")
        return achievements
    
    def calculate_summary(self, activities):
        """Calculate summary statistics for dashboard"""
        summary = {
            'last_updated': datetime.now().isoformat(),
            'years': {},
            'totals': {
                'distance': 0,
                'elevation_gain': 0,
                'moving_time': 0,
                'count': 0
            },
            'activity_types': {}
        }
        
        # Group activities by year and type
        for activity in activities:
            if 'start_date_local' not in activity:
                continue
                
            year = activity['start_date_local'].split('-')[0]
            activity_type = activity.get('type', 'other').lower()
            
            # Initialize year if not exists
            if year not in summary['years']:
                summary['years'][year] = {
                    'distance': 0,
                    'elevation_gain': 0,
                    'moving_time': 0,
                    'count': 0,
                    'activity_types': {}
                }
            
            # Initialize activity type if not exists
            if activity_type not in summary['years'][year]['activity_types']:
                summary['years'][year]['activity_types'][activity_type] = {
                    'distance': 0,
                    'elevation_gain': 0,
                    'moving_time': 0,
                    'count': 0
                }
            
            if activity_type not in summary['activity_types']:
                summary['activity_types'][activity_type] = {
                    'distance': 0,
                    'elevation_gain': 0,
                    'moving_time': 0,
                    'count': 0
                }
            
            # Add activity stats to year totals
            distance = activity.get('distance', 0) / 1000  # Convert to km
            elevation = activity.get('total_elevation_gain', 0)
            moving_time = activity.get('moving_time', 0) / 3600  # Convert to hours
            
            summary['years'][year]['distance'] += distance
            summary['years'][year]['elevation_gain'] += elevation
            summary['years'][year]['moving_time'] += moving_time
            summary['years'][year]['count'] += 1
            
            summary['years'][year]['activity_types'][activity_type]['distance'] += distance
            summary['years'][year]['activity_types'][activity_type]['elevation_gain'] += elevation
            summary['years'][year]['activity_types'][activity_type]['moving_time'] += moving_time
            summary['years'][year]['activity_types'][activity_type]['count'] += 1
            
            summary['activity_types'][activity_type]['distance'] += distance
            summary['activity_types'][activity_type]['elevation_gain'] += elevation
            summary['activity_types'][activity_type]['moving_time'] += moving_time
            summary['activity_types'][activity_type]['count'] += 1
            
            summary['totals']['distance'] += distance
            summary['totals']['elevation_gain'] += elevation
            summary['totals']['moving_time'] += moving_time
            summary['totals']['count'] += 1
        
        # Calculate monthly and weekly stats for current year
        current_year = datetime.now().year
        current_year_str = str(current_year)
        
        if current_year_str in summary['years']:
            summary['current_year'] = current_year_str
            summary['months'] = {}
            summary['weeks'] = {}
            
            # Filter activities for current year
            current_year_activities = [a for a in activities if a.get('start_date_local', '').startswith(current_year_str)]
            
            # Group by month
            for activity in current_year_activities:
                month = activity['start_date_local'].split('-')[1]
                
                if month not in summary['months']:
                    summary['months'][month] = {
                        'distance': 0,
                        'elevation_gain': 0,
                        'moving_time': 0,
                        'count': 0
                    }
                
                summary['months'][month]['distance'] += activity.get('distance', 0) / 1000
                summary['months'][month]['elevation_gain'] += activity.get('total_elevation_gain', 0)
                summary['months'][month]['moving_time'] += activity.get('moving_time', 0) / 3600
                summary['months'][month]['count'] += 1
            
            # Calculate current week and month totals
            now = datetime.now()
            current_month = now.strftime('%m')
            
            # Current week (last 7 days)
            week_start = (now - timedelta(days=7)).isoformat()
            current_week_activities = [a for a in activities if a.get('start_date_local', '') >= week_start]
            
            summary['current_week'] = {
                'distance': sum(a.get('distance', 0) for a in current_week_activities) / 1000,
                'elevation_gain': sum(a.get('total_elevation_gain', 0) for a in current_week_activities),
                'moving_time': sum(a.get('moving_time', 0) for a in current_week_activities) / 3600,
                'count': len(current_week_activities)
            }
            
            # Current month
            if current_month in summary['months']:
                summary['current_month'] = summary['months'][current_month]
            else:
                summary['current_month'] = {
                    'distance': 0,
                    'elevation_gain': 0,
                    'moving_time': 0,
                    'count': 0
                }
        
        # Save summary
        with open(SUMMARY_FILE, 'w') as f:
            json.dump(summary, f)
        
        logger.info("Successfully calculated summary statistics")
        return summary
    
    def calculate_personal_records(self, activities):
        """Calculate personal records from activities"""
        records = {
            'run': {
                'fastest_5k': None,
                'fastest_10k': None,
                'fastest_half_marathon': None,
                'fastest_marathon': None,
                'longest_distance': None,
                'most_elevation': None
            },
            'ride': {
                'longest_distance': None,
                'most_elevation': None,
                'fastest_40k': None,
                'best_avg_power': None
            },
            'swim': {
                'longest_distance': None,
                'fastest_100m': None
            }
        }
        
        # Group activities by type
        activities_by_type = {
            'ride': [],
            'run': [],
            'swim': []
        }
        
        for activity in activities:
            activity_type = activity.get('type', '').lower()
            if activity_type in activities_by_type:
                activities_by_type[activity_type].append(activity)
        
        # Calculate running records
        run_activities = activities_by_type['run']
        if run_activities:
            # Sort by distance for longest run
            run_activities_by_distance = sorted(run_activities, key=lambda x: x.get('distance', 0), reverse=True)
            if run_activities_by_distance:
                longest_run = run_activities_by_distance[0]
                records['run']['longest_distance'] = {
                    'value': longest_run.get('distance', 0) / 1000,
                    'date': longest_run.get('start_date_local', ''),
                    'activity_id': longest_run.get('id')
                }
            
            # Sort by elevation for most elevation
            run_activities_by_elevation = sorted(run_activities, key=lambda x: x.get('total_elevation_gain', 0), reverse=True)
            if run_activities_by_elevation:
                most_elevation_run = run_activities_by_elevation[0]
                records['run']['most_elevation'] = {
                    'value': most_elevation_run.get('total_elevation_gain', 0),
                    'date': most_elevation_run.get('start_date_local', ''),
                    'activity_id': most_elevation_run.get('id')
                }
            
            # Find 5K, 10K, half marathon, and marathon records
            # This is simplified - in reality, you'd need to analyze splits or use Strava's best_efforts
            for run in run_activities:
                distance = run.get('distance', 0)
                moving_time = run.get('moving_time', 0)
                
                # 5K (5000m with some tolerance)
                if 4900 <= distance <= 5100:
                    if not records['run']['fastest_5k'] or moving_time < records['run']['fastest_5k']['value']:
                        records['run']['fastest_5k'] = {
                            'value': moving_time,
                            'date': run.get('start_date_local', ''),
                            'activity_id': run.get('id')
                        }
                
                # 10K (10000m with some tolerance)
                if 9900 <= distance <= 10100:
                    if not records['run']['fastest_10k'] or moving_time < records['run']['fastest_10k']['value']:
                        records['run']['fastest_10k'] = {
                            'value': moving_time,
                            'date': run.get('start_date_local', ''),
                            'activity_id': run.get('id')
                        }
                
                # Half Marathon (21097m with some tolerance)
                if 21000 <= distance <= 21200:
                    if not records['run']['fastest_half_marathon'] or moving_time < records['run']['fastest_half_marathon']['value']:
                        records['run']['fastest_half_marathon'] = {
                            'value': moving_time,
                            'date': run.get('start_date_local', ''),
                            'activity_id': run.get('id')
                        }
                
                # Marathon (42195m with some tolerance)
                if 42000 <= distance <= 42400:
                    if not records['run']['fastest_marathon'] or moving_time < records['run']['fastest_marathon']['value']:
                        records['run']['fastest_marathon'] = {
                            'value': moving_time,
                            'date': run.get('start_date_local', ''),
                            'activity_id': run.get('id')
                        }
        
        # Calculate cycling records
        ride_activities = activities_by_type['ride']
        if ride_activities:
            # Sort by distance for longest ride
            ride_activities_by_distance = sorted(ride_activities, key=lambda x: x.get('distance', 0), reverse=True)
            if ride_activities_by_distance:
                longest_ride = ride_activities_by_distance[0]
                records['ride']['longest_distance'] = {
                    'value': longest_ride.get('distance', 0) / 1000,
                    'date': longest_ride.get('start_date_local', ''),
                    'activity_id': longest_ride.get('id')
                }
            
            # Sort by elevation for most elevation
            ride_activities_by_elevation = sorted(ride_activities, key=lambda x: x.get('total_elevation_gain', 0), reverse=True)
            if ride_activities_by_elevation:
                most_elevation_ride = ride_activities_by_elevation[0]
                records['ride']['most_elevation'] = {
                    'value': most_elevation_ride.get('total_elevation_gain', 0),
                    'date': most_elevation_ride.get('start_date_local', ''),
                    'activity_id': most_elevation_ride.get('id')
                }
            
            # Sort by average power
            ride_activities_with_power = [r for r in ride_activities if r.get('average_watts')]
            if ride_activities_with_power:
                ride_activities_by_power = sorted(ride_activities_with_power, key=lambda x: x.get('average_watts', 0), reverse=True)
                best_power_ride = ride_activities_by_power[0]
                records['ride']['best_avg_power'] = {
                    'value': best_power_ride.get('average_watts', 0),
                    'date': best_power_ride.get('start_date_local', ''),
                    'activity_id': best_power_ride.get('id')
                }
            
            # Find fastest 40K
            # This is simplified - in reality, you'd need to analyze splits
            for ride in ride_activities:
                distance = ride.get('distance', 0)
                moving_time = ride.get('moving_time', 0)
                
                # 40K (40000m with some tolerance)
                if 39500 <= distance <= 40500:
                    if not records['ride']['fastest_40k'] or moving_time < records['ride']['fastest_40k']['value']:
                        records['ride']['fastest_40k'] = {
                            'value': moving_time,
                            'date': ride.get('start_date_local', ''),
                            'activity_id': ride.get('id')
                        }
        
        # Calculate swimming records
        swim_activities = activities_by_type['swim']
        if swim_activities:
            # Sort by distance for longest swim
            swim_activities_by_distance = sorted(swim_activities, key=lambda x: x.get('distance', 0), reverse=True)
            if swim_activities_by_distance:
                longest_swim = swim_activities_by_distance[0]
                records['swim']['longest_distance'] = {
                    'value': longest_swim.get('distance', 0),
                    'date': longest_swim.get('start_date_local', ''),
                    'activity_id': longest_swim.get('id')
                }
        
        # Add records to summary file
        try:
            with open(SUMMARY_FILE, 'r') as f:
                summary = json.load(f)
            
            summary['records'] = records
            
            with open(SUMMARY_FILE, 'w') as f:
                json.dump(summary, f)
            
            logger.info("Successfully calculated personal records")
        except Exception as e:
            logger.error(f"Error updating summary with records: {e}")
        
        return records

def main():
    """Main function to run the Strava data fetcher"""
    parser = argparse.ArgumentParser(description='Fetch Strava activity data for dashboard')
    parser.add_argument('--config', help='Path to config file', default=CONFIG_FILE)
    parser.add_argument('--token', help='Path to token file', default=TOKEN_FILE)
    parser.add_argument('--limit', type=int, help='Limit number of activities to fetch', default=None)
    parser.add_argument('--detailed', action='store_true', help='Fetch detailed activity data')
    args = parser.parse_args()
    
    logger.info("Starting Strava data fetcher")
    
    # Initialize fetcher
    fetcher = StravaFetcher(config_file=args.config, token_file=args.token)
    
    # Authenticate
    if not fetcher.authenticate():
        logger.error("Authentication failed")
        return 1
    
    # Get athlete data
    athlete = fetcher.get_athlete()
    if not athlete:
        logger.error("Failed to fetch athlete data")
        return 1
    
    # Get activities
    activities = fetcher.get_activities(limit=args.limit)
    if not activities:
        logger.error("Failed to fetch activities")
        return 1
    
    # Get detailed activity data if requested
    if args.detailed:
        detailed_activities = []
        for activity in activities[:min(len(activities), 50)]:  # Limit to 50 to avoid rate limits
            detailed = fetcher.get_activity_details(activity['id'])
            if detailed:
                detailed_activities.append(detailed)
                time.sleep(1)  # Respect rate limits
        
        if detailed_activities:
            activities = detailed_activities
            with open(ACTIVITIES_FILE, 'w') as f:
                json.dump(detailed_activities, f)
    
    # Get featured activities
    featured_activities = fetcher.get_featured_activities()
    
    # Process segments
    segments = fetcher.process_segments(activities)
    
    # Calculate achievements
    achievements = fetcher.calculate_achievements(activities)
    
    # Calculate summary statistics
    summary = fetcher.calculate_summary(activities)
    
    # Calculate personal records
    records = fetcher.calculate_personal_records(activities)
    
    logger.info("Strava data fetcher completed successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())
