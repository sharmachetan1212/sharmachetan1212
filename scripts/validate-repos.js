import fs from "node:fs";
import { githubRequest, listRepositories, loadConfig, getOwner } from "./lib/github.js";

async function hasFile(owner, repo, path) {
  try {
    await githubRequest(`/repos/${owner}/${repo}/contents/${path}`);
    return true;
  } catch (error) {
    if (error.message.includes("404")) {
      return false;
    }
    throw error;
  }
}

const config = loadConfig();
const owner = getOwner(config);

if (!owner) {
  throw new Error("Set `username` in profile.config.json or provide GITHUB_REPOSITORY_OWNER.");
}

const repositories = await listRepositories(owner);
const report = [];

for (const repo of repositories) {
  const checks = {
    repository: repo.name,
    hasDescription: Boolean(repo.description),
    hasTopics: repo.topics.length > 0,
    hasReadme: await hasFile(owner, repo.name, "README.md"),
    hasLicense: Boolean(repo.license) || (await hasFile(owner, repo.name, "LICENSE"))
  };

  report.push(checks);
}

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/repository-quality.json", JSON.stringify(report, null, 2));

const needsWork = report.filter((repo) => !repo.hasDescription || !repo.hasTopics || !repo.hasReadme || !repo.hasLicense);

if (needsWork.length === 0) {
  console.log("All checked repositories have descriptions, topics, READMEs, and licenses.");
} else {
  console.log("Repositories needing improvement:");
  for (const repo of needsWork) {
    const missing = Object.entries(repo)
      .filter(([key, value]) => key !== "repository" && !value)
      .map(([key]) => key.replace(/^has/, "").toLowerCase());
    console.log(`- ${repo.repository}: missing ${missing.join(", ")}`);
  }
}
