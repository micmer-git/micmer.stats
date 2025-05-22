/* ---------------------------------
   APP
--------------------------------- */
async function run() {
  try {
    document.getElementById("title").textContent = "Fetching Strava data…";
    const activities = await getActivities();
    const aggregated = aggregate(activities);

    populateYearSelect(aggregated.years);
    renderSummaryCards(aggregated, "all");
    renderChart(aggregated.years);
    renderTopCards(aggregated, "all");
    computeInsights(aggregated);

    document.getElementById("title").textContent = `My Strava Dashboard (${new Date().getFullYear()})`;

    // Event listeners
    document.getElementById("year-select").addEventListener("change", (e) => {
      const yr = e.target.value;
      renderSummaryCards(aggregated, yr);
    });

    document.getElementById("refresh-btn").addEventListener("click", async () => {
      localStorage.removeItem("strava_activities");
      await run();
    });

    document.getElementById("download-btn").addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `strava_activities_${Date.now()}.json`);
      a.click();
    });
  } catch (error) {
    console.error("Error running app:", error);
    document.getElementById("title").textContent = "Error loading Strava data";
    
    // Show error message to user
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      background: rgba(255, 77, 77, 0.2);
      border: 1px solid rgba(255, 77, 77, 0.5);
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
      max-width: 600px;
    `;
    errorDiv.innerHTML = `
      <h3>🚨 Error Loading Data</h3>
      <p>There was an issue connecting to Strava. Please check your configuration and try again.</p>
      <button onclick="location.reload()" style="margin-top: 1rem;">Retry</button>
    `;
    document.querySelector("header").appendChild(errorDiv);
  }
}

// Kickoff when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
