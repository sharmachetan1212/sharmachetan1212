import fs from "node:fs";
import { listRepositories, loadConfig, getOwner, getRepositoryTrafficViews } from "./lib/github.js";

function replaceSection(readme, marker, content) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  return readme.replace(pattern, `${start}\n${content}\n${end}`);
}

function renderStats(repositories) {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = repositories.reduce((counts, repo) => {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }
    return counts;
  }, {});

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([language, count]) => `${language} (${count})`)
    .join(", ") || "Add languages by pushing more projects";

  return [
    `- Public repositories tracked: **${repositories.length}**`,
    `- Total stars: **${totalStars}**`,
    `- Total forks: **${totalForks}**`,
    `- Most used languages: **${topLanguages}**`
  ].join("\n");
}

function renderFeaturedProjects(config, owner) {
  const projects = config.featuredProjects || [];
  if (projects.length === 0) {
    return "- Add featured projects in `profile.config.json`.";
  }

  return projects
    .map((project) => `- [${project.repo}](https://github.com/${owner}/${project.repo}) - ${project.description}`)
    .join("\n");
}

async function getProfileTraffic(owner, config) {
  const profileRepository = config.profileRepository || owner;

  try {
    return await getRepositoryTrafficViews(owner, profileRepository);
  } catch (error) {
    console.warn(`Could not load unique profile views from GitHub traffic API: ${error.message}`);
    return null;
  }
}

function renderProfileViews(traffic) {
  if (!traffic) {
    return "- Unique profile visitors: **Unavailable**";
  }

  return [
    `- Unique profile visitors: **${traffic.uniques}**`,
    `- Total profile views: **${traffic.count}**`,
    "- Window: **Last 14 days from GitHub traffic data**"
  ].join("\n");
}

const config = loadConfig();
const owner = getOwner(config);

if (!owner) {
  throw new Error("Set `username` in profile.config.json or provide GITHUB_REPOSITORY_OWNER.");
}

const repositories = await listRepositories(owner);
const profileTraffic = await getProfileTraffic(owner, config);
const stats = renderStats(repositories);
const profileViews = renderProfileViews(profileTraffic);
const featuredProjects = renderFeaturedProjects(config, owner);
let readme = fs.readFileSync("README.md", "utf8");

readme = readme.replaceAll("YOUR_GITHUB_USERNAME", owner);
readme = readme.replaceAll("YOUR_LINKEDIN_USERNAME", config.linkedin || "YOUR_LINKEDIN_USERNAME");
readme = replaceSection(readme, "PROFILE-STATS", stats);
readme = replaceSection(readme, "PROFILE-VIEWS", profileViews);
readme = replaceSection(readme, "FEATURED-PROJECTS", featuredProjects);

fs.writeFileSync("README.md", readme);
fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  "generated/profile-stats.json",
  JSON.stringify(
    {
      owner,
      updatedAt: new Date().toISOString(),
      repositories: repositories.length,
      stars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forks: repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
      profileViews: profileTraffic
        ? {
            uniqueVisitorsLast14Days: profileTraffic.uniques,
            totalViewsLast14Days: profileTraffic.count
          }
        : null
    },
    null,
    2
  )
);

console.log(`Updated README.md stats for ${owner}.`);
