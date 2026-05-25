# Normal Git Workflow

Use this checklist before changing, committing, or pushing work in this repository.

## 1. Start In The Correct Repository

The workspace root is only a container. Run Git commands inside the repository that owns the files.

```bash
cd root-vcs-hosting
git status --short
git branch --show-current
git remote -v
```

Expected result:

- The current branch is the branch you intend to change.
- The remote points to the expected GitHub repository.
- Existing untracked or modified files are understood before new work starts.

## 2. Create Or Select A Work Branch

For small documentation changes on a personal repo, `main` can be acceptable. For feature work, use a branch.

```bash
git switch -c docs/git-workflow
```

If the branch already exists:

```bash
git switch docs/git-workflow
```

## 3. Make A Small Change

Keep each change focused on one purpose:

- Documentation update
- Script fix
- Workflow update
- Config change

Avoid mixing unrelated edits in one commit.

## 4. Review Before Staging

Check what changed before using `git add`.

```bash
git status --short
git diff
```

If a file contains secrets, tokens, passwords, or local-only notes, do not stage it.

## 5. Stage Only Intended Files

Prefer staging exact files.

```bash
git add GIT_WORKFLOW.md
git status --short
git diff --staged
```

Use `git add .` only after confirming every changed file belongs in the commit.

## 6. Commit With A Clear Message

Use a message that explains the result, not only the action.

```bash
git commit -m "Document normal Git workflow"
```

Good commit messages:

- `Document normal Git workflow`
- `Clarify profile automation setup`
- `Update repository metadata config`

## 7. Push And Verify

Push the branch or main branch to GitHub.

```bash
git push origin main
```

For a feature branch:

```bash
git push -u origin docs/git-workflow
```

After pushing:

```bash
git status --short
git log --oneline -5
```

Expected result:

- Working tree is clean, except intentional local-only files.
- Latest commit appears in the log.
- GitHub shows the pushed commit or branch.

## Safe Undo Commands

Use these when reviewing or correcting local work.

```bash
git restore <file>
git restore --staged <file>
git revert <commit>
```

Be careful with destructive commands such as `git reset --hard` and `git clean -fd`. Use them only when you are certain no needed local work will be lost.
