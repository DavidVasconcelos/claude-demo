# Technical Specification — Issue #5

## 1. Issue Overview

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Title       | The GitHub link is broken                                                              |
| Description | The GitHub link under "Job Portal" does not point to this repository (screenshot only) |
| Labels      | None                                                                                   |
| State       | CLOSED (fix merged in `57cbe74`, PR #10)                                               |
| Priority    | Low                                                                                    |

## 2. Problem Analysis

The issue has no comments and no milestone. The body is one sentence plus a screenshot (not inspected).
"Under Job Portal" is read as the footer brand section, where the social icons live.

Verified in the repo:

- `src/components/Footer.jsx:58` links to `https://github.com/DavidVasconcelos/claude-demo`, which is this repository.
- Commit `57cbe74` ("fix: point footer GitHub link to this repository", PR #10) changed one line in `section-03`'s `Footer.jsx`.
  `section-04` was copied from `section-03` afterwards (`08f77a9`), so it inherited the fix.
- The only other "GitHub" match in `src` is the company seed record in `mockData.js:299`, a fictional employer unrelated to the footer.

Conclusion: already resolved; no code change needed. This is inferred from the diff, since the original broken URL was not recorded in the issue.

## 3. Proposed Solution

None required. Optional hardening: the repo URL is hardcoded inline in the footer, like the other social links, so it can drift again.
Leaving it matches the existing pattern, and extracting a constant would be over-engineering for one link.

## 4. Step-by-Step Implementation

1. Verify — open the footer GitHub icon in `npm run dev` and confirm it opens the repository.
2. Close out — no code change; nothing else to do.

## 5. Verification Strategy

### Unit Tests

- No test runner is configured; none added.

### Integration Tests

- Not applicable.

### Manual Checks

- Footer GitHub icon click → new tab at `github.com/DavidVasconcelos/claude-demo`, returns 200.
- Link has `target="_blank"` and `rel="noopener noreferrer"` → present.

## 6. Files to Modify

| File Path | Nature of Change |
| --------- | ---------------- |
| None      | —                |

## 7. New Files to Create

| File Path | Purpose |
| --------- | ------- |
| None      | —       |

## 8. Existing Utilities to Leverage

| Utility                      | Benefit                                |
| ---------------------------- | -------------------------------------- |
| Existing footer anchor markup | Already has safe `target`/`rel` set    |

## 9. Acceptance Criteria

- Footer GitHub link points to this repository.
- No regressions in the footer.

## 10. Out of Scope

- Placeholder handles on other social links (`instagram.com/jobportal`, `linkedin.com/company/jobportal`).
- Centralizing social URLs into config.
- The fictional "GitHub" company in `mockData.js`.
