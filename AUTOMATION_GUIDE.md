# GitHub Profile Automation Guide

This project keeps your GitHub profile repository polished by updating profile stats, repository topics, missing descriptions, and repository quality reports.

## 1. Create Your Profile Repository

Create a public repository with the exact same name as your GitHub username. For example, if your username is `chetan-devops`, the repository name must also be `chetan-devops`.

## 2. Update Your Config

Edit `profile.config.json`:

- Replace `sharmachetan1212` with your GitHub username.
- Replace `sharmachetan1212` with your LinkedIn profile slug.
- Add your best repositories under `featuredProjects`.
- Add custom descriptions under `descriptionOverrides` for important repositories.

Also check `README.md` and adjust the intro, focus areas, badges, and contact links.

## 3. Add a Token for Cross-Repository Updates

The default `GITHUB_TOKEN` can update this profile repository, but it usually cannot update topics and descriptions across all your repositories.

Create a fine-grained GitHub token with access to the repositories you want to improve, then add it as a repository secret named `PROFILE_TOKEN`.

Recommended permissions:

- Repository metadata: read
- Contents: read and write
- Administration or repository settings: read and write, for topics and descriptions

## 4. Run Locally

Use Node.js 20 or later.

```bash
set GH_TOKEN=your_token_here
set GITHUB_OWNER=sharmachetan1212
npm run generate
npm run topics
npm run descriptions
npm run validate
```

PowerShell:

```powershell
$env:GH_TOKEN="your_token_here"
$env:GITHUB_OWNER="sharmachetan1212"
npm run profile
```

## 5. Run in GitHub Actions

Open the repository on GitHub:

1. Go to **Actions**.
2. Select **GitHub Profile Automation**.
3. Click **Run workflow**.

The workflow also runs every Sunday at `00:00 UTC`.

## What Gets Updated

- `README.md`: live repository totals and featured project links
- Repository topics: smart DevOps-focused tags based on repo names, descriptions, and languages
- Missing descriptions: generated descriptions for repositories that do not have one
- `generated/repository-quality.json`: quality report for descriptions, topics, READMEs, and licenses

## Important Notes

- The scripts skip archived repositories and forks.
- Existing descriptions are preserved.
- Topic updates replace each repository's topic list with the generated list.
- Keep `PROFILE_TOKEN` private. Never commit it to the repository.
