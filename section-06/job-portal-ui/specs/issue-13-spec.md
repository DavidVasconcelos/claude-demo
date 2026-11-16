# Technical Specification — Issue #13

## 1. Issue Overview

| Field       | Value                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Title       | The X link is outdated                                                                                 |
| Description | Twitter no longer exists. Change the URL to x.com and show the X logo instead of the Twitter bird.     |
| Labels      | None                                                                                                   |
| State       | CLOSED (fix landed in `a55b190`, PR #17)                                                               |
| Priority    | Low                                                                                                    |

## 2. Problem Analysis

The issue reports an outdated Twitter link and bird logo in the UI (screenshot attached, not inspected).
Issue comments show Claude's workflow fixed it in three places on branch `claude/issue-13-20261109-2004`:
`Footer.jsx`, `mockData.js`, `JobDetail.jsx`. The fix was merged as `a55b190`.

Verified against the current `section-04/job-portal-ui` tree (identical change exists in `section-03`):

- `src/components/Footer.jsx:29` — link is `https://x.com/jobportal`, inline X SVG path, `aria-label="X"`, dark hover.
- `src/data/mockData.js:814` — company `socialMedia.twitter` value is `https://x.com/<company>`.
- `src/pages/JobDetail.jsx:~447` — share button label is "X".
- `grep -i twitter src` returns only the `socialMedia.twitter` key name in `mockData.js`.

Conclusion: the issue is resolved. Remaining gaps are minor:

- The data key `socialMedia.twitter` still uses the old name. Nothing in `src` reads `socialMedia`, so it is cosmetic.
- The "X" share button in `JobDetail.jsx` has no `onClick` or link. This predates the issue and is not part of it.
- The fix was never linted or built (Claude's comments say npm was blocked).

## 3. Proposed Solution

No functional change is required. Optional follow-ups, smallest first:

1. Run `npm run lint` and `npm run build` to confirm the merged fix is clean.
2. Optionally rename `socialMedia.twitter` to `socialMedia.x` in `mockData.js`. Safe because no consumer reads it.

Trade-off: the rename is purely naming hygiene. Skip it if the key is expected to match a future API contract.

## 4. Step-by-Step Implementation

1. Verify — run `npm run lint` and `npm run build` in `section-04/job-portal-ui`.
2. Visual check — run `npm run dev`, confirm the footer shows the X logo in light and dark themes.
3. (Optional) Rename key — change `twitter:` to `x:` in `src/data/mockData.js:814`; re-grep for consumers first.

## 5. Verification Strategy

### Unit Tests

- No test runner is configured in `package.json` scripts; none added for this change.

### Integration Tests

- Not applicable.

### Manual Checks

- Footer X icon → renders the X glyph, links to `https://x.com/jobportal`, opens in a new tab.
- Footer hover → icon turns white on a dark gradient, no blue.
- Job detail page → "Share this job" shows "X" and not "Twitter".
- `grep -rni twitter src` → no user-visible occurrences.

## 6. Files to Modify

| File Path                    | Nature of Change                                |
| ---------------------------- | ----------------------------------------------- |
| `src/data/mockData.js`       | (Optional) rename `socialMedia.twitter` → `x`   |

## 7. New Files to Create

| File Path | Purpose |
| --------- | ------- |
| None      | —       |

## 8. Existing Utilities to Leverage

| Utility                     | Benefit                                    |
| --------------------------- | ------------------------------------------ |
| Inline SVG pattern in Footer | Same approach as the LinkedIn/Facebook icons |
| `npm run lint` / `build`     | Confirms no regressions                    |

## 9. Acceptance Criteria

- Footer link points to `x.com` and shows the X logo.
- No user-visible "Twitter" text or bird icon remains.
- `npm run lint` and `npm run build` pass.
- No regressions in footer layout or dark mode.

## 10. Out of Scope

- Making the share buttons in `JobDetail.jsx` functional.
- Replacing the placeholder `x.com/jobportal` handle.
- Changes to `section-03` (separate copy).
- Adding a test framework.
