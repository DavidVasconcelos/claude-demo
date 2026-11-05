# claude-demo

My personal study repository for the Udemy course **[Claude Code Bootcamp: Hooks, MCP & Agentic AI Workflows](https://www.udemy.com/course/claude-code-bootcamp/)**.

It holds the notes, experiments and demo projects I build while learning how to use [Claude Code](https://claude.com/claude-code), Anthropic's agentic coding tool, from the terminal.

## About the course

The course goes from first install to advanced agentic workflows. It is taught in English and expects basic programming knowledge, some comfort with the terminal, a GitHub account and a paid Claude account.

## Topics covered

| # | Topic | What I'm learning |
| --- | ----- | ----------------- |
| 1 | **Setup & basics** | Installing Claude Code, using the CLI and the VS Code integration, operating modes, configuration files |
| 2 | **Permissions** | Allow / Ask / Deny rules and `settings.json` |
| 3 | **CLAUDE.md** | Giving Claude project-specific instructions and conventions |
| 4 | **Context management** | The context window, sessions, checkpoints, session forking, recovering from failures |
| 5 | **GitHub integration** | Pull request review, issue triage, bug fixes |
| 6 | **Rules, Memory & Skills** | Reusable instructions that persist across sessions |
| 7 | **Hooks** | Running team coding standards and checks automatically at defined points |
| 8 | **MCP (Model Context Protocol)** | Connecting Claude to browsers, databases, up-to-date docs and other external tools |
| 9 | **Sub-agents** | Delegating focused tasks to specialised agents |
| 10 | **Agent Teams & parallel sessions** | Running several agents or sessions at once |
| 11 | **Git worktrees** | Isolating parallel work in separate working copies |

> The outline above is based on the public course description and third-party reviews. Section names and order may differ slightly from the live curriculum on Udemy.

## Repository goals

- Keep short notes for each topic in my own words
- Build small demos that exercise each feature (hooks, MCP servers, skills, sub-agents)
- Track my progress through the course

## Repository layout

```text
claude-demo/
├── README.md
├── .gitignore
├── section-01/
├── section-02/
├── section-03/
├── section-04/
├── section-05/
├── section-06/
└── section-07/
```

Each `section-NN/` folder holds the demo projects for that part of the course.

## Links

- Course: <https://www.udemy.com/course/claude-code-bootcamp/>
- Claude Code docs: <https://docs.claude.com/en/docs/claude-code>
