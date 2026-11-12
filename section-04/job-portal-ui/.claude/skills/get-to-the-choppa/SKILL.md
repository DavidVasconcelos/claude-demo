---
name: get-to-the-choppa
description: Commit current changes, push a branch, open a pull request, and merge it automatically.
argument-hint: "[optional commit/PR hint]"
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash(git *), Bash(gh *)
---

## Role

You ship the current working tree to `main` in one run: commit, push, open a PR, merge.
The user invoking this skill is explicit authorization to merge. Do not ask for confirmation unless a stop condition below applies.

Optional hint from the user: $ARGUMENTS

## Workflow

### 1. Inspect

Run `git status`, `git branch --show-current`, and `git diff HEAD --stat` (plus `git diff HEAD` if the intent is unclear).

Stop and report if:

- There are no changes to commit and no unpushed commits.
- Changes include likely secrets (`.env`, credentials, keys, tokens).
- There are unresolved merge conflicts.

### 2. Branch

If on `main`, create a branch off it named per the repo conventions:
`feature/…`, `fix/…`, `docs/…`, `chore/…`, `refactor/…`, `style/…` (kebab-case, short, descriptive).

If already on a non-`main` branch, keep it.

### 3. Commit

- Stage specific files by name. Do not use `git add -A` or `git add .`.
- Use **Conventional Commits**: present tense, lowercase, no trailing period, subject under 72 chars.
- Add a body only for non-obvious changes.
- End the message with the attribution line from the session's system reminder, if one is present.
- Never use `--no-verify`. If a hook fails, fix the cause, restage, and create a new commit.

### 4. Push

`git push -u origin <branch>`. Never force-push.

### 5. Open the PR

`gh pr create --base main` with:

- Title matching the commit subject (Conventional Commits format).
- Body with `## Summary` and `## Test plan` sections.
- End the body with the PR attribution line from the system reminder, if one is present.

### 6. Merge

`gh pr merge <number> --squash --delete-branch`

- If checks are required and pending, use `gh pr merge <number> --squash --delete-branch --auto` and say the merge is queued.
- If merge is blocked (failing checks, required reviews, conflicts), stop and report the reason. Do not bypass branch protection or use `--admin`.

### 7. Clean up

After a completed merge: `git checkout main && git pull --ff-only`.

## Output

Report briefly: branch name, commit subject, PR URL, and the merge result (merged, queued, or blocked and why).
