
# ContributionPulse

ContributionPulse is a Node.js tool that fetches GitHub user activity and visualizes it as a yearly contribution heatmap (SVG), similar to GitHub's own contribution graph. It supports caching, percentile-based normalization, streak tracking, and customizable themes.

---

## Features

- Fetch public GitHub events (Push, Pull Requests, Create events)
- Parse events into daily counts
- Normalize daily counts into intensity indices or percentiles
- Generate SVG heatmaps with:
  - Color themes (light, dark, neon, matrix)
  - Tooltips showing commits, PRs, merges, and repos
  - Month labels
  - Current and longest streaks
  - Optional legend and stats footer
- Cache fetched data for faster repeated access
- Local test script to generate SVGs for multiple users

---

## Directory Structure

```

.
├── node_modules
├── src/
│   ├── api/
│   │   ├── github.js       # GitHub API fetcher
│   │   └── user.js         # Express endpoint for user data
│   ├── cache/              # Cache files stored here
│   ├── svg/
│   │   └── generator.js    # SVG heatmap generator
│   ├── utils/
│   │   ├── cache.js        # Cache read/write utilities
│   │   ├── normalize.js    # Normalization and percentile calculations
│   │   └── parser.js       # Event parser
│   └── index.js            # Entry point for the server
├── .env                    # Environment variables
├── tests/
│   └── test_github_svgs.sh # Test script to fetch SVGs
├── .gitignore
├── package-lock.json
└── README.md

```






### API Endpoint

**GET** `/api/user/:username`

Query parameters:

| Parameter    | Type    | Default      | Description                              |
| ------------ | ------- | ------------ | ---------------------------------------- |
| `format`     | string  | `json`       | Output format: `json` or `svg`           |
| `token`      | string  | `null`       | GitHub personal access token             |
| `year`       | number  | current year | Year to display                          |
| `scale`      | string  | `fixed`      | Normalization: `fixed` or `percentile`   |
| `size`       | number  | 12           | Cell size for SVG                        |
| `theme`      | string  | `light`      | Theme: `light`, `dark`, `neon`, `matrix` |
| `showLegend` | boolean | true         | Show legend in SVG                       |
| `showStats`  | boolean | true         | Show stats footer in SVG                 |

**Example:**

```bash
curl "http://localhost:3000/api/user/octocat?format=svg&theme=dark&year=2025"
```

---




## License

MIT License




