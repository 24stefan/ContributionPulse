const dayjs = require("dayjs");
const { normalizeDailyCounts, getPercentiles } = require("../utils/normalize");

/**
 * Generates SVG heatmap with rich tooltips, percentile info, streak visualization, and legend
 * @param {Object} dailyCounts - { "YYYY-MM-DD": count, details: { commits, prs, merges, repos } }
 * @param {Object} options - configurable options
 * @param {string} username - username for header
 * @returns {string} SVG string
 */
function generateSVG(dailyCounts, options = {}, username = "User") {
  const cellSize = options.cellSize || 12;
  const gap = options.gap || 2;
  const theme = options.theme || "light";
  const year = options.year || dayjs().year();
  const showLegend = options.showLegend !== false;
  const showStats = options.showStats !== false;
  const scaleType = options.scale || "fixed";

  const palettes = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    neon: ["#0ff", "#0f0", "#ff0", "#f0f", "#f00"],
    matrix: ["#001100", "#003300", "#006600", "#00cc00", "#00ff00"],
  };

  const colors = palettes[theme] || palettes.light;

  // normalize daily counts to intensity indices
  const intensities = normalizeDailyCounts(dailyCounts, scaleType);
  const percentiles = getPercentiles(dailyCounts);

  // Grid setup:
  const firstDay = dayjs(`${year}-01-01`).startOf("week");
  const totalWeeks = 53;
  const totalRows = 7;

  const svgCells = [];
  const monthLabels = [];

  let lastMonth = null;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  let totalCommits = 0, totalPRs = 0, totalMerges = 0, totalRepos = 0;

  for (let week = 0; week < totalWeeks; week++) {
    for (let dow = 0; dow < totalRows; dow++) {
      const date = firstDay.add(week * 7 + dow, "day");
      if (date.year() !== year) continue;

      const dateStr = date.format("YYYY-MM-DD");
      const count = dailyCounts[dateStr] ?? 0;
      const intensity = intensities[dateStr] ?? 0;
      const color = colors[intensity] || colors[0];

      // Update streaks
      if (count > 0) tempStreak++;
      else tempStreak = 0;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      if (date.isSame(dayjs(), "day")) currentStreak = tempStreak;

      // Coordinates
      const x = week * (cellSize + gap);
      const y = dow * (cellSize + gap);

      // Details breakdown
      const details = dailyCounts.details?.[dateStr] ?? {};
      const commits = details.commits || 0;
      const prs = details.prs || 0;
      const merges = details.merges || 0;
      const repos = details.repos || 0;

      totalCommits += commits;
      totalPRs += prs;
      totalMerges += merges;
      totalRepos += repos;

      const percentile = percentiles[dateStr] ? ` (Top ${percentiles[dateStr]}%)` : "";

      // Tooltip
      const tooltip = `${dateStr} — ${count} activities${percentile}\n` +
                      `Commits: ${commits}\nPRs: ${prs}\nMerges: ${merges}\nRepos: ${repos}`;

      svgCells.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2" ry="2">` +
        `<title>${tooltip}</title>` +
        `</rect>`
      );

      // Month labels
      const month = date.format("MMM");
      if (dow === 0 && month !== lastMonth) {
        monthLabels.push(
          `<text x="${x}" y="${-cellSize * 0.3}" font-size="${cellSize}" fill="#666">${month}</text>`
        );
        lastMonth = month;
      }
    }
  }

  // Legend
  let legend = "";
  if (showLegend) {
    const legendX = 0;
    const legendY = totalRows * (cellSize + gap) + 10;
    const maxIntensity = Math.max(...Object.values(intensities));
    const legendItems = colors.map((c, i) => {
      const label = i === 0 ? "0" : i === colors.length - 1 ? `${maxIntensity}+` : i;
      return `<rect x="${legendX + i * (cellSize + gap * 2)}" y="${legendY}" width="${cellSize}" height="${cellSize}" fill="${c}"></rect>` +
             `<text x="${legendX + i * (cellSize + gap * 2)}" y="${legendY + cellSize + 10}" font-size="${cellSize * 0.8}" fill="#666">${label}</text>`;
    });
    legend = legendItems.join("\n");
  }

  // Stats footer
  let statsFooter = "";
  if (showStats) {
    const statsY = totalRows * (cellSize + gap) + 50;
    statsFooter = `<text x="0" y="${statsY}" font-size="${cellSize}" fill="#333">` +
                  `Current Streak: ${currentStreak}, Longest Streak: ${longestStreak} | ` +
                  `Total: ${totalCommits} commits, ${totalPRs} PRs, ${totalMerges} Merges, ${totalRepos} Repos` +
                  `</text>`;
  }

  // SVG dimensions
  const width = totalWeeks * (cellSize + gap);
  const height = totalRows * (cellSize + gap) + (showLegend ? 40 : 0) + (showStats ? 20 : 0);

  // Header text
  const userNameText = `<text x="0" y="-20" font-size="${cellSize * 1.2}" fill="#333">` +
                       `${username} — ${totalCommits} commits in ${year}</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <desc>ContributionPulse heatmap for year ${year}</desc>
  ${userNameText}
  ${monthLabels.join("\n")}
  ${svgCells.join("\n")}
  ${legend}
  ${statsFooter}
</svg>
  `.trim();
}

module.exports = { generateSVG };
