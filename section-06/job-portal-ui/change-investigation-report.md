# 🔎 Change Investigation Report

**Target**: `src/components/Footer.jsx:170-182`  
**Investigation Date**: 2026-11-12  
**Repository**: `git@github.com:DavidVasconcelos/claude-demo.git`  
**Branch**: main

> **Interpretation**: Lines 170-182 of `section-04/job-portal-ui/src/components/Footer.jsx` cover the **Cookie Policy** tooltip block (lines 170-181) and the opening line of the Contact Us tooltip (line 182). `section-04` is a copy of `section-03`, so blame there only points at the copy commit. The real history was traced through `section-03/job-portal-ui/src/components/Footer.jsx`.

---

## 📋 Investigation Summary

| Detail                  | Value                                              |
| ----------------------- | -------------------------------------------------- |
| File(s) Analyzed        | section-04/…/Footer.jsx (and origin in section-03) |
| Lines Investigated      | 170-182                                            |
| Total Commits on File   | 6 (including the section-04 copy commit)           |
| Unique Authors          | 1 (David Vasconcelos), plus Claude co-authors      |
| File Age (First Commit) | 2026-11-05                                         |
| Last Modified           | 2026-11-10 by David Vasconcelos                    |

---

## 👥 Author Breakdown

| #   | Author            | Email             | Commits | Lines Owned (file) | First Contribution | Last Contribution |
| --- | ----------------- | ----------------- | ------- | ------------------ | ------------------ | ----------------- |
| 1   | David Vasconcelos | dsv10@hotmail.com | 6       | 210 (100%)         | 2026-11-05         | 2026-11-10        |

Co-authors on commit trailers: Claude Sonnet 5.5, claude[bot].

**Primary Owner**: David Vasconcelos  
**Most Recent Contributor**: David Vasconcelos (copy commit 08f77a9)  
**CODEOWNERS**: Not configured

---

## 📅 Change Timeline (lines 170-182 only)

### 08f77a9 — 2026-11-10

- **Author**: David Vasconcelos <dsv10@hotmail.com>
- **Message**: chore: add section-04 as a copy of section-03 (#19)
- **Ticket References**: #19 (PR)
- **What Changed**:
  > Created the file in section-04 as a verbatim copy. All 13 target lines blame to this commit; no content change.

### ec8e76e — 2026-11-06 (section-03)

- **Author**: David Vasconcelos <dsv10@hotmail.com>
- **Message**: fix: show tooltip on footer contact us link (#9)
- **Body**: Wrapped Contact Us in the shared Tooltip. A second commit corrected the tooltip text, which wrongly mentioned Terms of Service. Fixes #4. Co-authored by Claude Sonnet 5.5.
- **Ticket References**: #9, #4
- **What Changed**:
  > Line 182 (the `<Tooltip text="Have a question…">` opener) was introduced here, replacing the bare `<Link>`.

### db2bd69 — 2026-11-05 (section-03)

- **Author**: David Vasconcelos <dsv10@hotmail.com>
- **Message**: fix: show tooltips on footer policy links (#3)
- **Body**: Privacy Policy, Terms of Service and Cookie Policy were bare anchors with no href or hover text. Added a reusable Tooltip component and wrapped the three links. Tooltips also open on keyboard focus. Fixes #2. Co-authored by Claude Sonnet 5.5.
- **Ticket References**: #3, #2
- **What Changed**:
  > Lines 170-181 were introduced here. The Cookie Policy anchor was wrapped in `<Tooltip>` with the cookie explanation text. `tabIndex={0}`, `cursor-pointer`, `focus:text-white`, `outline-none` and `group-focus:opacity-100` were added for keyboard accessibility.

### 7b74f3c — 2026-11-05 (section-03)

- **Author**: David Vasconcelos <dsv10@hotmail.com>
- **Message**: Init section-03
- **Ticket References**: None found
- **What Changed**:
  > Original version: a bare `<a>` for Cookie Policy with no href, tooltip or focus handling.

---

## 🔬 Line-by-Line Blame (Current State)

| Line    | Code (truncated)                                                 | Author            | Date       | Commit Message                                      |
| ------- | ---------------------------------------------------------------- | ----------------- | ---------- | --------------------------------------------------- |
| 170-181 | `<Tooltip text="We store your sign-in session…">` … `</Tooltip>` | David Vasconcelos | 2026-11-10 | chore: add section-04 as a copy of section-03 (#19) |
| 182     | `<Tooltip text="Have a question or need help?…">`                | David Vasconcelos | 2026-11-10 | chore: add section-04 as a copy of section-03 (#19) |

Blame in section-03 attributes 170-181 to `db2bd69` (2026-11-05) and 182 to `ec8e76e` (2026-11-06).

---

## 🎫 Linked Tickets & References

| Ticket ID | Commit  | Author            | Date       | Commit Subject                                   |
| --------- | ------- | ----------------- | ---------- | ------------------------------------------------ |
| #2        | db2bd69 | David Vasconcelos | 2026-11-05 | fix: show tooltips on footer policy links (#3)   |
| #3        | db2bd69 | David Vasconcelos | 2026-11-05 | (PR number)                                      |
| #4        | ec8e76e | David Vasconcelos | 2026-11-06 | fix: show tooltip on footer contact us link (#9) |
| #9        | ec8e76e | David Vasconcelos | 2026-11-06 | (PR number)                                      |
| #19       | 08f77a9 | David Vasconcelos | 2026-11-10 | chore: add section-04 as a copy of section-03    |

---

## 💡 Insights

- **Churn Assessment**: The target lines changed in 2 real commits (plus the init and the copy) within a single week. The first was a fix for missing tooltips, and the later change only touched line 182's neighbour block. The lines themselves have been stable since 2026-11-05.
- **Bus Factor**: One human author owns 100% of lines. Claude co-authored the tooltip commits.
- **Stale Code Risk**: None. The file was last touched 2 days ago.
- **Review Gaps**: Only the init commit (`7b74f3c`) lacks a ticket or PR reference. All later commits link to a PR and issues.
- **Note**: The Cookie Policy anchor still has no `href`. The tooltip is the only content for it.
