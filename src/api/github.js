const { Octokit } = require("@octokit/rest");
const octokit = new Octokit(); 

async function fetchPublicEvents(username, token = null) {
  const client = token ? new Octokit({ auth: token }) : octokit;

  try {
    const { data } = await client.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });
    return data || [];
  } catch (err) {
    if (err.status === 422) {
     
      console.warn(`GitHub 422: no recent events for ${username}`);
      return [];
    }
    if (err.status === 403) {
      
      console.warn(`GitHub 403: rate limit for ${username}`);
      return [];
    }
    throw new Error(`GitHub API error: ${err.status || err.message}`);
  }
}

module.exports = { fetchPublicEvents };
