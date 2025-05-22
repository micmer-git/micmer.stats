/* ---------------------------------
   RENDERING
--------------------------------- */
let chart;

function populateYearSelect(years) {
  const select = document.getElementById("year-select");
  select.innerHTML = "<option value=\"all\">All Years</option>";
  Object.keys(years)
    .sort((a, b) => b - a)
    .forEach((y) => {
      select.innerHTML += `<option value="${y}">${y}</option>`;
    });
}

function renderSummaryCards(data, year) {
  const wrap = document.getElementById("summary-cards");
  wrap.innerHTML = "";
  const src = year === "all" ? data.overall : data.years[year];
  const metrics = [
    { label: "Distance (km)", value: src.distance.toFixed(0) },
    { label: "Moving Time (h)", value: src.moving.toFixed(1) },
    { label: "Elevation (m)", value: src.elevation.toFixed(0) },
    { label: "Calories", value: src.calories.toFixed(0) },
    { label: "Rides", value: src.rides },
    { label: "Runs", value: src.runs }
  ];
  metrics.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<span class="card-value">0</span><span class="card-label">${m.label}</span>`;
    wrap.appendChild(card);
    animateValue(card.querySelector(".card-value"), m.value);
  });
}

function renderTopCards(data, year) {
  const wrap = document.getElementById("top-cards");
  wrap.innerHTML = "";
  const candidates = [data.maxDistance, data.maxMoving, data.maxElevation];
  candidates.forEach((c) => {
    const act = c.act;
    const date = new Date(act.start_date).toLocaleDateString();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="card-label">${act.name}</span>
      <span class="card-value">${c === data.maxDistance ? (c.v.toFixed(1) + " km") : c === data.maxMoving ? ((c.v / 3600).toFixed(1) + " h") : (c.v.toFixed(0) + " m")}</span>
      <span class="card-label" style="opacity:0.7;font-size:0.8rem;">${date}</span>
    `;
    wrap.appendChild(card);
  });
}

function renderChart(years) {
  const ctx = document.getElementById("yearlyChart").getContext("2d");
  const labels = Object.keys(years).sort();
  const dist = labels.map((y) => years[y].distance);
  const elev = labels.map((y) => years[y].elevation / 1000);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Distance (km)",
          data: dist,
          borderWidth: 0
        },
        {
          label: "Elevation (km)",  
          data: elev,
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#fff" } },
        title: {
          display: true,
          text: "Year‑over‑Year Distance & Elevation",
          color: "#fff"
        }
      },
      scales: {
        y: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { display: false }
        }
      }
    }
  });
}

/* ---------------------------------
   INSIGHTS
--------------------------------- */
function computeInsights(data) {
  const years = Object.keys(data.years).length;
  const avgDist = data.overall.distance / years;
  const weekActive = data.overall.rides + data.overall.runs;
  const body = document.querySelector("body");
  const div = document.createElement("div");
  div.style.maxWidth = "1024px";
  div.style.textAlign = "center";
  div.style.opacity = 0.9;
  div.innerHTML = `
    <p>🔥 You average <strong>${avgDist.toFixed(0)} km</strong> per year across <strong>${years}</strong> years on Strava.</p>
    <p>⚡ Your most epic day covered <strong>${data.maxDistance.v.toFixed(1)} km</strong> – keep pushing!</p>
    <p>⛰️ Cumulative elevation gain is like scaling <strong>${(data.overall.elevation / 8848).toFixed(1)}</strong> Everests!</p>
  `;
  body.appendChild(div);
}
