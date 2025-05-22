import 'dotenv/config';
import fetch from 'node-fetch';

const token = process.env.STRAVA_ACCESS_TOKEN;

if (!token) {
    console.error('No STRAVA_ACCESS_TOKEN found in .env');
    process.exit(1);
}

async function fetchActivities() {
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        console.error('Failed to fetch activities:', res.status, await res.text());
        return;
    }

    const activities = await res.json();
    console.log('Fetched activities:', activities);
}

fetchActivities();