import { detectTopics, githubRequest, listRepositories, loadConfig, getOwner } from "./lib/github.js";

const config = loadConfig();
const owner = getOwner(config);

if (!owner) {
  throw new Error("Set `username` in profile.config.json or provide GITHUB_REPOSITORY_OWNER.");
}

const repositories = await listRepositories(owner);

for (const repo of repositories) {
  const topics = detectTopics(repo, config);
  await githubRequest(`/repos/${owner}/${repo.name}/topics`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ names: topics })
  });
  console.log(`Updated topics for ${repo.name}: ${topics.join(", ")}`);
}
