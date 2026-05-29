# Profile Automation Scripts Review

This note documents the profile automation scripts, their inputs, outputs, commands, and safety notes.

## Command Map

| npm command | Script |
| --- | --- |
| `npm run generate` | `scripts/generate-stats.js` |
| `npm run topics` | `scripts/update-topics.js` |
| `npm run descriptions` | `scripts/update-descriptions.js` |
| `npm run validate` | `scripts/validate-repos.js` |
| `npm run profile` | Runs generate, topics, descriptions, and validate in sequence |

## Shared Inputs And Helpers

Most scripts use `scripts/lib/github.js`.

Shared inputs:
- `profile.config.json` for username, LinkedIn username, profile sections, featured projects, default topics, and description overrides.
- `GITHUB_REPOSITORY_OWNER`, `GITHUB_OWNER`, or `username` from `profile.config.json` to decide the GitHub owner.
- `GH_TOKEN` or `GITHUB_TOKEN` for GitHub API calls that modify repository metadata.
- GitHub public repository data from the GitHub API.

Shared helper behavior:
- `loadConfig()` reads `profile.config.json`.
- `getOwner()` decides the GitHub account owner.
- `getToken()` reads `GH_TOKEN` or `GITHUB_TOKEN`.
- `githubRequest()` sends GitHub API requests and requires a token for non-GET/non-HEAD methods.
- `listRepositories()` returns non-fork, non-archived repositories.
- `detectTopics()` creates topic names from repository name, description, language, and default topics.
- `generateDescription()` creates descriptions from overrides or repository naming patterns.

## `generate-stats.js`

Purpose:
Updates the profile README sections and writes a generated stats file.

Input:
- `profile.config.json`
- `README.md`
- GitHub repository list for the owner
- GitHub traffic API for profile views

Output:
- Updates `README.md`
- Creates or updates `generated/profile-stats.json`

Important logic:
- Replaces content between README marker comments like `ABOUT`, `EXPERIENCE`, `NOW-BUILDING`, `PROFILE-STATS`, `PROFILE-VIEWS`, and `FEATURED-PROJECTS`.
- Calculates repository count, total stars, total forks, and most used languages.
- Attempts to read profile traffic views; if unavailable, it keeps profile views as unavailable instead of failing the whole script.

Command:
`npm run generate`

Notes:
- This script modifies local files.
- It reads GitHub data and may need a token for traffic data access.

## `update-topics.js`

Purpose:
Updates GitHub repository topics.

Input:
- `profile.config.json`
- GitHub repository list for the owner
- `GH_TOKEN` or `GITHUB_TOKEN`

Output:
- Updates topics directly on GitHub repositories.

Important logic:
- Loops through every non-fork, non-archived repository.
- Calls `detectTopics()` to build topic names.
- Sends a `PUT` request to `/repos/{owner}/{repo}/topics`.

Command:
`npm run topics`

Notes:
- This script changes GitHub repository metadata.
- Do not run it without confirming the token and repository list.

## `update-descriptions.js`

Purpose:
Adds descriptions to GitHub repositories that do not already have one.

Input:
- `profile.config.json`
- GitHub repository list for the owner
- `GH_TOKEN` or `GITHUB_TOKEN`

Output:
- Updates missing repository descriptions directly on GitHub.

Important logic:
- Skips repositories that already have a description.
- Uses `descriptionOverrides` from `profile.config.json` first.
- Falls back to generated descriptions based on repository name and language.
- Sends a `PATCH` request to `/repos/{owner}/{repo}`.

Command:
`npm run descriptions`

Notes:
- This script changes GitHub repository metadata.
- It is safer than overwriting all descriptions because it skips repositories that already have descriptions.

## `validate-repos.js`

Purpose:
Checks repository hygiene across descriptions, topics, READMEs, and licenses.

Input:
- `profile.config.json`
- GitHub repository list for the owner
- GitHub repository file checks for `README.md` and `LICENSE`

Output:
- Creates or updates `generated/repository-quality.json`
- Prints repositories that need improvement

Important logic:
- Checks whether each repository has a description.
- Checks whether each repository has topics.
- Checks whether each repository has a README.
- Checks whether each repository has a license object or a `LICENSE` file.

Command:
`npm run validate`

Notes:
- This script writes a local generated report.
- It uses GitHub API reads and should not modify GitHub repository metadata.

## Safe Run Order

Start with read-only or local-file commands:

1. `npm run generate`
2. `npm run validate`

Run metadata-changing commands only after confirming token and config:

1. `npm run topics`
2. `npm run descriptions`
3. `npm run profile`

## Learning Summary

- `generate-stats.js` mainly updates local profile files.
- `validate-repos.js` creates a local quality report.
- `update-topics.js` and `update-descriptions.js` modify GitHub repository metadata.
- `profile.config.json` is the central source for profile content, featured projects, topic defaults, and description overrides.
- `GH_TOKEN` or `GITHUB_TOKEN` is required when a script sends write requests to GitHub.
