const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");

const { fetchPublicEvents } = require("./github");
const { parseEvents } = require("../utils/parser");
const { loadCache, saveCache } = require("../utils/cache");
const { generateSVG } = require("../svg/generator");

// GET /api/user/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const format = req.query.format || "json";
  const token = req.query.token || null;
  const year = parseInt(req.query.year) || dayjs().year();
  const scale = req.query.scale || "fixed";
  const theme = req.query.theme || "light";
  const cellSize = parseInt(req.query.size) || 12;
  const showLegend = req.query.showLegend !== "0";
  const showStats = req.query.showStats !== "0";

  try {
    //  ;oad cached data if available
    let data = loadCache(username);

    //  fetch events if cache is empty
    if (!data) {
      let events = [];
      try {
        events = await fetchPublicEvents(username, token);
      } catch (err) {
        console.warn(`GitHub fetch failed for ${username}: ${err.message}`);
      }

      //  parses events into daily counts with breakdown
      data = parseEvents(events || []);

      
      saveCache(username, data);
    }

    //  ensures minimal structure for zero-event users
    if (!data || Object.keys(data).length === 0) {
      data = { details: {} };
      for (let d = 0; d < 365; d++) {
        const date = dayjs(`${year}-01-01`).add(d, "day").format("YYYY-MM-DD");
        data[date] = 0;
      }
    }

    // returning svg if requested
    if (format === "svg") {
      const svg = generateSVG(data, {
        cellSize,
        theme,
        year,
        scale,
        showLegend,
        showStats,
      }, username);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=1800");
      return res.send(svg);
    }

    // returning json if requested
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=1800");
    res.json(data);

  } catch (err) {
    console.error(`Error fetching data for ${username}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
