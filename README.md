# claude-demo

My personal study repository for the Udemy course **[Claude Code Bootcamp: Hooks, MCP & Agentic AI Workflows](https://www.udemy.com/course/claude-code-bootcamp/)**.

It holds the notes, experiments and demo projects I built while learning how to use [Claude Code](https://claude.com/claude-code), Anthropic's agentic coding tool, from the terminal.

## About the course

The course goes from first install to advanced agentic workflows. It is taught in English and expects basic programming knowledge, some comfort with the terminal, a GitHub account and a paid Claude account.

## Topics covered and what I built

| # | Topic | What I learned | Where it lives in this repo |
| --- | ----- | -------------- | --------------------------- |
| 1 | **Setup & basics** | Installing Claude Code, using the CLI and VS Code integration, operating modes, configuration files | `section-01/` (`color-explore`, `future-me`) |
| 2 | **Permissions** | Allow / Ask / Deny rules and `settings.json` | `.claude/settings.local.json` |
| 3 | **CLAUDE.md** | Project-specific instructions and conventions; root file for Git conventions, one per project for code guidance | `CLAUDE.md`, `section-03/job-portal-ui/CLAUDE.md` |
| 4 | **Context management & rules** | Context window, sessions, splitting a large `CLAUDE.md` into `.claude/rules/` files (architecture, coding standards, data layer, git conventions, routing and roles) | `section-04/job-portal-ui/.claude/rules/` |
| 5 | **GitHub integration** | Claude Code GitHub Actions for `@claude` mentions and automatic PR review, with Sonnet and scoped permissions | `.github/workflows/claude.yml`, `claude-code-review.yml` |
| 6 | **Skills & commands** | Reusable, model-invoked workflows: `analyze-issue`, `get-to-the-choppa` (issue to implementation), `feature-guide` (end-to-end feature walkthroughs) and the `/investigate-change` slash command | `section-05/` onwards, `.claude/skills/`, `.claude/commands/` |
| 7 | **Hooks** | Deterministic checks at defined points: file protection (`protect_files.sh`), line limits (`line_limit.py`) and a secret guard (`secret-gruard.py`) | `section-06/job-portal-ui/.claude/hooks/` |
| 8 | **MCP (Model Context Protocol)** | Project-scoped `.mcp.json` with Chrome DevTools, Playwright and Context7 (API key via `${CONTEXT7_API_KEY}`) | `section-07/job-portal-ui/.mcp.json` |
| 9 | **Sub-agents** | Focused agents with persistent memory: `bug-investigator`, `code-quality-reviewer`, `performance-reviewer`, `security-auditor`; reports are saved in `agent-memory/` | `section-08/job-portal-ui/.claude/agents/`, `.claude/agent-memory/` |
| 10 | **Agent Teams & parallel sessions** | Running the three reviewers together as a team and collecting their reports | `section-08/job-portal-ui/.claude/agent-memory/` |
| 11 | **Git worktrees** | Isolating parallel work in separate working copies, with branch naming rules (rename `worktree-*` branches to `type/description`) | `CLAUDE.md`, `.claude/worktrees/` (ignored) |
| 12 | **Build the wall: Docker Sandboxes** | Running Claude Code inside an isolated Docker sandbox (`sbx`) so it can work autonomously without touching the host | `section-08/wall/`, `sbx-sync-claude-ui.sh` |

> Section names and order may differ slightly from the live curriculum on Udemy.

## The demo apps

- **`color-explore`, `future-me`** (section 01-02): small starter projects used to learn the basics. `future-me` also has a growing list of quotes.
- **`job-portal-ui`** (sections 03-08): a React + Vite job portal with job seeker and employer roles, localStorage-backed data, protected routes and lazy-loaded pages (via `Suspense`). Each section starts as a copy of the previous one and adds the tooling for that topic, so the `.claude/` setup grows from section to section.

### Bug hunt with sub-agents

In section 07/08 I introduced a deliberate bug (`mock: mocking a bug`) and used the `bug-investigator` agent to find it: an inverted password comparison in `AuthContext` `login()`. It was fixed in `fix: correct inverted password check in login`. A broader employer application flow investigation produced 13 findings (missing employer authorization, status and data-shape mismatches, dead `JobContext` code). The code-quality, performance and security agents then reviewed the project as a team.

## Git conventions

- Branch off `main`, use `feature/`, `fix/`, `docs/`, `chore/`, `refactor/` or `style/` prefixes
- [Conventional Commits](https://www.conventionalcommits.org/): present tense, lowercase, no trailing period, subject under 72 characters
- Pull requests target `main`, with a summary and test plan

## Repository goals

- Keep short notes for each topic in my own words
- Build small demos that exercise each feature (hooks, MCP servers, skills, sub-agents)
- Track my progress through the course

## Repository layout

```text
claude-demo/
├── README.md
├── CLAUDE.md                    # Git conventions shared by all projects
├── sbx-sync-claude-ui.sh        # Copies host Claude theme and status line into a Docker sandbox
├── .github/workflows/           # Claude Code GitHub Actions
├── .claude/                     # Local settings and worktrees
├── section-01/                  # color-explore, future-me
├── section-02/                  # future-me
├── section-03/                  # job-portal-ui + CLAUDE.md
├── section-04/                  # job-portal-ui + .claude/rules
├── section-05/                  # job-portal-ui + skills and commands
├── section-06/                  # job-portal-ui + hooks
├── section-07/                  # job-portal-ui + MCP servers
└── section-08/                  # job-portal-ui + sub-agents, plus the Docker Sandbox "wall" demo
```

Each `section-NN/` folder holds the demo projects for that part of the course. Project-specific commands and architecture live in the `CLAUDE.md` inside each project folder.

## Links

- Course: <https://www.udemy.com/course/claude-code-bootcamp/>
- Claude Code docs: <https://docs.claude.com/en/docs/claude-code>
