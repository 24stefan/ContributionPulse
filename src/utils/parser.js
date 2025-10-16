function parseEvents(events) {
  const dailyCounts = {};

  events.forEach(event => {
    const date = new Date(event.created_at).toISOString().split("T")[0];

    if (!dailyCounts[date]) dailyCounts[date] = 0;

    switch (event.type) {
      case "PushEvent":
        dailyCounts[date] += event.payload.commits.length;
        break;
      case "PullRequestEvent":
        if (event.payload.action === "opened") dailyCounts[date] += 1;
        if (event.payload.pull_request.merged) dailyCounts[date] += 1;
        break;
      case "CreateEvent":
        dailyCounts[date] += 1;
        break;
      default:
        break; // other events ignored for now,  will update this  later
    }
  });

  return dailyCounts;
}

module.exports = { parseEvents };
