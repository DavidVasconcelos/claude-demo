# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project-specific guidance (commands, structure, architecture, coding standards) lives in the `CLAUDE.md` inside each project folder, e.g. `section-03/job-portal-ui/CLAUDE.md`.

## Git Conventions

### Branching

```text
feature/add-job-filter-sidebar         # New features
fix/employer-route-redirect-loop       # Bug fixes
docs/update-readme                     # Documentation only
chore/upgrade-dependencies             # Maintenance, tooling
refactor/simplify-auth-context         # Code refactoring
style/mobile-job-card-spacing          # Visual/style changes
```

- Branch off `main` for all new work
- Keep branches short-lived; open a PR when ready
- Delete branches after merging
- Rename the session with the branch name

### Commit Messages

Follow **Conventional Commits**:

```text
feat: add saved jobs count to navbar
fix: correct role guard on employer routes
docs: update README with localStorage keys
chore: upgrade react-router to v7.8
refactor: extract job card into reusable component
style: fix spacing on mobile job list
```

- Use present tense, lowercase, no period at the end
- Keep the subject line under 72 characters
- Add a body for non-obvious changes

### Pull Requests

- PR title should match the commit message format
- Include a summary and test plan in the PR description
- Target `main` as the base branch
