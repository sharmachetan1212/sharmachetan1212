# GitHub Actions Workflow Review

Workflow file: `.github/workflows/profile-automation.yml`

## Purpose

The `GitHub Profile Automation` workflow keeps the profile repository README and repository metadata up to date. It can be started manually from GitHub Actions and also runs on a weekly schedule.

## Triggers

- `schedule`: runs every Sunday at `00:00 UTC` using cron `0 0 * * 0`.
- `workflow_dispatch`: allows a manual run from the GitHub Actions UI.

## Concurrency

- Group: `profile-automation-${{ github.ref }}`
- `cancel-in-progress: true`

This prevents multiple profile automation runs from updating the same branch at the same time. If a newer run starts for the same ref, the older in-progress run is cancelled.

## Permissions

- `contents: write`

The workflow needs write access because the final step can commit changes back to `README.md`.

## Token Use

The workflow uses `secrets.PROFILE_TOKEN || github.token`.

- `PROFILE_TOKEN` is preferred when it exists.
- `github.token` is used as a fallback.
- `PROFILE_TOKEN` is needed for cross-repository metadata changes such as topics and descriptions.
- Tokens must stay in GitHub Actions secrets and must never be committed to the repository.

## Job

Job name: `improve-profile`

Runner: `ubuntu-latest`

## Steps

1. `Checkout`
   - Uses `actions/checkout@v6`.
   - Checks out the repository default branch, not just the triggering ref.
   - Uses full history with `fetch-depth: 0`.
   - Uses `PROFILE_TOKEN` when available, otherwise the default GitHub token.

2. `Sync default branch`
   - Fetches the latest default branch from `origin`.
   - Resets the workspace to `origin/${{ github.event.repository.default_branch }}`.
   - This makes the automation start from the latest remote default branch state.

3. `Setup Node.js`
   - Uses `actions/setup-node@v6`.
   - Installs Node.js `24`.
   - The repository requires Node.js `>=20`, so this satisfies the package engine requirement.

4. `Generate profile README stats`
   - Runs `node scripts/generate-stats.js`.
   - Uses `GH_TOKEN` and `GITHUB_REPOSITORY_OWNER`.
   - Expected output is an updated generated section in `README.md`.

5. `Update repository topics`
   - Runs `node scripts/update-topics.js`.
   - Uses `GH_TOKEN` and `GITHUB_REPOSITORY_OWNER`.
   - Updates repository topics through the GitHub API.

6. `Update missing repository descriptions`
   - Runs `node scripts/update-descriptions.js`.
   - Uses `GH_TOKEN` and `GITHUB_REPOSITORY_OWNER`.
   - Adds descriptions only where the script decides they are missing.

7. `Validate repository quality`
   - Runs `node scripts/validate-repos.js`.
   - Uses `GH_TOKEN` and `GITHUB_REPOSITORY_OWNER`.
   - Checks repository quality signals such as descriptions, topics, READMEs, and licenses.

8. `Ensure generated directory exists`
   - Runs `mkdir -p generated`.
   - Creates the output directory if it is missing.

9. `Commit automation updates`
   - Uses `stefanzweifel/git-auto-commit-action@v7`.
   - Commit message: `chore: update profile automation [skip ci]`
   - File pattern: `README.md`
   - Only README changes are committed by this step.

## Important Observations

- The workflow creates `generated/`, and the guide mentions `generated/repository-quality.json`, but the auto-commit step only includes `README.md`. If generated quality reports should be committed, the `file_pattern` must include them.
- `Sync default branch` uses `git reset --hard`, which is acceptable inside the disposable GitHub Actions runner, but it would be unsafe as a local command without checking worktree state first.
- Metadata update steps depend on a token with enough repository permissions. Without `PROFILE_TOKEN`, README updates may work while topics or descriptions may fail or be limited.

## Local Learning Summary

- A GitHub Actions workflow is made from triggers, permissions, jobs, runners, and steps.
- Secrets are passed into steps through environment variables.
- Actions such as `checkout`, `setup-node`, and `git-auto-commit-action` provide reusable workflow behavior.
- Shell steps run commands directly on the runner.
- The final commit step controls what generated changes are preserved in the repository.
