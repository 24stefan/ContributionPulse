

// mormalize daily counts into intensity indices 
function normalizeDailyCounts(dailyCounts, scale = "fixed") {
  const values = Object.entries(dailyCounts)
    .filter(([k, v]) => k !== "details")
    .map(([_, v]) => v);
  const max = Math.max(...values, 1);

  const intensities = {};
  for (const [date, count] of Object.entries(dailyCounts)) {
    if (date === "details") continue;
    if (scale === "percentile") {
      // handled separately via getPercentiles
      intensities[date] = 0;
    } else {
      // fixed scale 0-4
      const idx = Math.min(4, Math.floor((count / max) * 4));
      intensities[date] = idx;
    }
  }
  return intensities;
}

// calculate percentile for each day
function getPercentiles(dailyCounts) {
  const values = Object.entries(dailyCounts)
    .filter(([k, v]) => k !== "details")
    .map(([_, v]) => v)
    .sort((a, b) => a - b);

  const percentiles = {};
  for (const [date, count] of Object.entries(dailyCounts)) {
    if (date === "details") continue;
    const rank = values.findIndex(v => v >= count) + 1;
    percentiles[date] = Math.ceil((rank / values.length) * 100);
  }
  return percentiles;
}

module.exports = { normalizeDailyCounts, getPercentiles };
