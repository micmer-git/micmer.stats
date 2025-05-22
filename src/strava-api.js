/* ---------------------------------
   STRAVA API
--------------------------------- */

// Fetch / Refresh Access Token
async function getAccessToken() {
  const stored = JSON.parse(localStorage.getItem("strava_token")) || {};
  if (stored.access_token && stored.expires_at * 1000 > Date.now() + 60 * 1000) {
    return stored.access_token;
  }
  
  try {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        grant_type: "refresh_token",
        refresh_token: CONFIG.refreshToken
      })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to refresh token: ${res.status}`);
    }
    
    const data = await res.json();
    localStorage.setItem("strava_token", JSON.stringify(data));
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

// Recursive pagination fetch
async function fetchActivities(after = 0, page = 1, perPage = 200, accum = []) {
  try {
    const token = await getAccessToken();
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch activities: ${res.status}`);
    }
    
    const data = await res.json();
    accum.push(...data);
    
    if (data.length === perPage) {
      return fetchActivities(after, page + 1, perPage, accum);
    }
    return accum;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

// Cache and auto-update daily (24h)
async function getActivities() {
  const cached = JSON.parse(localStorage.getItem("strava_activities")) || {};
  if (cached.data && Date.now() - cached.updated < DAY_MS) {
    return cached.data;
  }
  
  try {
    const activities = await fetchActivities(0);
    localStorage.setItem("strava_activities", JSON.stringify({ 
      data: activities, 
      updated: Date.now() 
    }));
    return activities;
  } catch (error) {
    console.error("Error getting activities:", error);
    // If we have cached data, return it even if expired
    if (cached.data) {
      console.warn("Using expired cached data due to API error");
      return cached.data;
    }
    throw error;
  }
}
