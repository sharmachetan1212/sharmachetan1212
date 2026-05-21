import { generateDescription, githubRequest, listRepositories, loadConfig, getOwner } from "./lib/github.js";

const config = loadConfig();
const owner = getOwner(config);

if (!owner) {
  throw new Error("Set `username` in profile.config.json or provide GITHUB_REPOSITORY_OWNER.");
}

const repositories = await listRepositories(owner);

for (const repo of repositories) {
  if (repo.description) {
    console.log(`Skipped ${repo.name}; description already exists.`);
    continue;
  }

  const description = generateDescription(repo, config);
  await githubRequest(`/repos/${owner}/${repo.name}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
  });

  console.log(`Updated description for ${repo.name}: ${description}`);
}
