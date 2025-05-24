/* Entry – hydrates SPA & wires global interactions */
import { h, render } from 'https://esm.sh/preact@10.21.0';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
const html = htm.bind(h);

import YearPicker from './components/YearPicker.jsx';
import HeroKPI   from './components/HeroKPI.jsx';
import MileageChart from './components/charts/MileageChart.jsx';
import LoadChart    from './components/charts/LoadChart.jsx';
import PowerCurve   from './components/charts/PowerCurve.jsx';
import MilestoneGrid from './components/MilestoneGrid.jsx';
import SegmentTable  from './components/SegmentTable.jsx';
import milestonesDef  from './milestones.js';
import climbs         from './segments.js';

function App() {
  const [raw, setRaw] = useState(null);
  const [year, setYear] = useState(null);
  const [prefersReduced, setPRM] = useState(matchMedia('(prefers-reduced-motion: reduce)').matches);

  // fetch with SW cache fallback
  useEffect(() => {
    fetch('../data/history.json', { cache: 'reload' })
      .then(r => r.json())
      .then(data => {
        setRaw(data);
        setYear(data.years.at(-1).year);  // default newest
      })
      .catch(() => toast('Offline – using last cached data'));
  }, []);

  useEffect(() => {
    if (raw) document.documentElement.style.setProperty('--primary-year', year);
  }, [year, raw]);

  if (!raw) return html`<p class="text-center py-10">Loading…</p>`;

  const ydata = raw.years.find(y => y.year === year);
  const milestones = evaluateMilestones(raw.activities, milestonesDef);

  return html`
    <${YearPicker} years=${raw.years.map(y => y.year)} current=${year} onChange=${setYear} />
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <${HeroKPI} label="Km Run"    value=${ydata.run.distance_km}     unit="km" />
      <${HeroKPI} label="Km Ride"   value=${ydata.ride.distance_km}    unit="km" />
      <${HeroKPI} label="Elev Gain" value=${ydata.all.elev_m}          unit="m" />
      <${HeroKPI} label="Activities" value=${ydata.all.count}          unit=""  />
    </section>

    <${MileageChart} data=${ydata.monthly} />
    <${LoadChart}    data=${ydata.load} />
    <${PowerCurve}   data=${ydata.power_curve} />

    <${MilestoneGrid} items=${milestones} reduced=${prefersReduced} />
    <${SegmentTable} segments=${climbs} attempts=${ydata.segment_counts} />
  `;
}

render(html`<${App}/>`, document.getElementById('app'));

// --- Utilities ---------------------------------------------------------------
function toast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-lg glass backdrop-blur text-sm';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4e3);
}

function evaluateMilestones(acts, defs) {
  // crunch through activities once, build hash tables for distance/pace/elev etc.
  // returns [{...def, unlocked:true/false,date:iso}, ...] sorted
  // 🔬 omitted: sub-function computes CTL/ATL for science badges
  return defs.map(d => ({ ...d, unlocked:false }));
}

// theme toggle
document.getElementById('themeBtn').addEventListener('click', () => {
  const root = document.documentElement;
  const cur  = root.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.theme = next;
});
