import fs from "node:fs";

const API_BASE = "https://api.github.com";

export function loadConfig() {
  return JSON.parse(fs.readFileSync("profile.config.json", "utf8"));
}

export function getOwner(config) {
  const configured = config.username && config.username !== "YOUR_GITHUB_USERNAME" ? config.username : "";
  return process.env.GITHUB_REPOSITORY_OWNER || process.env.GITHUB_OWNER || configured;
}

export function getToken() {
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
}

export async function githubRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Missing GH_TOKEN or GITHUB_TOKEN environment variable.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} ${response.statusText}: ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listRepositories(owner) {
  const repositories = [];
  let page = 1;

  while (true) {
    const batch = await githubRequest(`/users/${owner}/repos?per_page=100&page=${page}&sort=updated`);
    repositories.push(...batch);
    if (batch.length < 100) {
      return repositories.filter((repo) => !repo.fork && !repo.archived);
    }
    page += 1;
  }
}

export async function getRepositoryTrafficViews(owner, repo) {
  return githubRequest(`/repos/${owner}/${repo}/traffic/views`);
}

export function detectTopics(repo, config) {
  const source = `${repo.name} ${repo.description || ""} ${repo.language || ""}`.toLowerCase();
  const topics = new Set(config.defaultTopics || []);

  const mappings = [
    ["terraform", ["terraform", "iac", "infrastructure"]],
    ["docker", ["docker", "container"]],
    ["kubernetes", ["kubernetes", "k8s", "helm"]],
    ["jenkins", ["jenkins", "pipeline"]],
    ["github-actions", ["github actions", "workflow", "actions"]],
    ["aws", ["aws", "amazon web services", "cloud"]],
    ["python", ["python"]],
    ["javascript", ["javascript", "node", "nodejs"]],
    ["devops", ["devops", "ci", "cd", "deployment"]],
    ["linux", ["linux", "shell", "bash"]]
  ];

  for (const [topic, keywords] of mappings) {
    if (keywords.some((keyword) => source.includes(keyword))) {
      topics.add(topic);
    }
  }

  return [...topics].slice(0, 20);
}

export function generateDescription(repo, config) {
  if (config.descriptionOverrides?.[repo.name]) {
    return config.descriptionOverrides[repo.name];
  }

  const name = repo.name.replace(/[-_]/g, " ");
  const language = repo.language ? `${repo.language} ` : "";

  if (repo.name.toLowerCase().includes("jenkins")) {
    return `${name} project for CI/CD pipeline automation.`;
  }

  if (repo.name.toLowerCase().includes("terraform")) {
    return `${name} project for infrastructure as code automation.`;
  }

  if (repo.name.toLowerCase().includes("docker")) {
    return `${name} project for containerized application workflows.`;
  }

  return `${language}${name} project with practical automation and development workflows.`;
}
