const fs = require("fs");
const path = require("path");

// Generate cache file path per user
function cacheFile(username) {
  return path.join(__dirname, "..", "cache", `${username}.json`);
}

// Save data to cache
function saveCache(username, data) {
  const cacheData = {
    ts: Date.now(), // timestamp
    data
  };
  fs.writeFileSync(cacheFile(username), JSON.stringify(cacheData));
}

// load cached data, return null if expired or missing
function loadCache(username, ttl = 60 * 60 * 1000) { // default 1 hour
  const file = cacheFile(username);
  if (!fs.existsSync(file)) return null;

  const cached = JSON.parse(fs.readFileSync(file));
  if (Date.now() - cached.ts > ttl) return null; // cache expired

  return cached.data;
}

module.exports = { saveCache, loadCache };
