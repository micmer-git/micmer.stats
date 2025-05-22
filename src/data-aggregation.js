/* ---------------------------------
   DATA AGGREGATION
--------------------------------- */
function aggregate(activities) {
  const years = {};
  let overall = { distance: 0, moving: 0, elevation: 0, calories: 0, rides: 0, runs: 0 };
  let maxDistance = { v: 0 };
  let maxMoving = { v: 0 };
  let maxElevation = { v: 0 };

  activities.forEach((act) => {
    const year = new Date(act.start_date).getFullYear();
    const sport = act.type;

    if (!years[year]) {
      years[year] = {
        distance: 0,
        moving: 0,
        elevation: 0,
        calories: 0,
        rides: 0,
        runs: 0
      };
    }

    const distKm = act.distance / 1000;
    const elev = act.total_elevation_gain || 0;
    const kcal = act.calories || 0;

    years[year].distance += distKm;
    years[year].moving += act.moving_time / 3600;
    years[year].elevation += elev;
    years[year].calories += kcal;
    years[year][sport.toLowerCase() === "ride" ? "rides" : "runs"] += 1;

    overall.distance += distKm;
    overall.moving += act.moving_time / 3600;
    overall.elevation += elev;
    overall.calories += kcal;
    overall[sport.toLowerCase() === "ride" ? "rides" : "runs"] += 1;

    if (distKm > maxDistance.v) maxDistance = { v: distKm, act };
    if (act.moving_time > maxMoving.v) maxMoving = { v: act.moving_time, act };
    if (elev > maxElevation.v) maxElevation = { v: elev, act };
  });

  return { years, overall, maxDistance, maxMoving, maxElevation };
}
