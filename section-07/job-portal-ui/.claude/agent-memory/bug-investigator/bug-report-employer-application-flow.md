---
name: bug-report-employer-application-flow
description: "Full bug-investigator report on the employer job application flow (JobContext.jsx, jobApplicationService.js, JobApplicants.jsx) in section-07/job-portal-ui — 13 findings, auth gaps, status/data-shape mismatches"
metadata:
  node_type: memory
  type: project
  originSessionId: a315bdee-d140-4033-a863-01d3df196c26
  modified: 2026-11-17T21:25:29.202Z
---

Report from the bug-investigator subagent (2026-11-17), read-only review, nothing was run and no files were changed. Requested as part of the three-reviewer team review. Related: [[bug-report-login-password-comparison]].

Files read: `JobContext.jsx`, `jobApplicationService.js`, `JobApplicants.jsx`, `JobsDataContext.jsx`; also the `/job-applicants/:jobId` route in `App.jsx`, plus greps for `globalPostedJobs` and `postedBy`. All paths are under `section-07/job-portal-ui/src`. Corrections the agent made on its resend are marked CORRECTED.

## Critical and high severity

### 1. Status vocabularies are mismatched, so the status filter and counts never work
- **Where:** `services/jobApplicationService.js:23` writes `status: 'APPLIED'`. `pages/JobApplicants.jsx:144` falls back to `'PENDING'`. The dropdown (`JobApplicants.jsx:442-446`), `getStatusColor` (`:202-210`) and `statusCounts` (`:224-228`) all use `'Applied'`, `'In Review'`, `'Interview'`, `'Hired'`, `'Rejected'`.
- **Root cause:** three status vocabularies. The service writes `APPLIED`, the UI expects title-case labels, the fallback is `PENDING`. A fresh application matches no status in the UI.
- **Effects:** every new application gets the default grey badge. The Applied count is always 0. The `<select>` has no option matching `APPLIED`. The `applied` filter returns nothing. After the employer picks "In Review", badge and counts work, but the seeker side then holds `"In Review"`, which is inconsistent with `APPLIED`/`PENDING` styles elsewhere.
- **Repro:** as a seeker apply to a job; as the employer open `/job-applicants/:id`; the application shows a grey badge and the "Applied" tab count is 0.
- **Fix:** one shared `APPLICATION_STATUS` constants module (`APPLIED`, `IN_REVIEW`, `INTERVIEW`, `HIRED`, `REJECTED`) used by the service, dropdown values and `getStatusColor`, with display labels kept separate. Normalize the `'PENDING'` fallback.
- **Filter note (`JobApplicants.jsx:219`):** `.replace(' ', '')` on `'In Review'` gives `'inreview'`, which matches the filter key. Fine once statuses are consistent.

### 2. The service returns a different data shape from the one the page expects
- **Where:** `getApplicationsByJob` (`jobApplicationService.js:79-98`) returns `{id, jobId, coverLetter, status, appliedAt, userId, applicantName, applicantEmail}`. `JobApplicants.jsx:60-146` reads `app.userProfile`, `app.userName`, `app.userEmail`, `app.userMobileNumber`.
- **Root cause:** the page was written for a Java backend response; the localStorage mock never provides those fields.
- **Effects:** name and email render as `undefined`. Title, location and bio always use fallbacks. No resume or profile picture. The contact and profile modals have nothing to show.
- **Repro:** open the applicants page for any job with an application.
- **Fix:** map `applicantName`/`applicantEmail` in the page, or have the service return `userName`, `userEmail`, `userProfile` (profile could be read from `registeredUsers`).

### 3. (High) Missing authorization: any employer can read and change any application
- **Where:** `services/jobApplicationService.js:79-98` (`getApplicationsByJob`) and `:111-127` (`updateApplicationStatus`). The route guard at `App.jsx:105-109` only checks the role.
- **Root cause:** neither service function checks the caller's role or that the job belongs to the caller. `JobApplicants.jsx:52` calls `getJobById(jobId)` but never compares `job.postedBy` with the current user, and does not stop when the job is null. `updateApplicationStatus` scans every user's `jobApplications_*` key and mutates the first record whose id matches, with no job or owner check.
- **Repro:** log in as employer A, open `/job-applicants/<jobId owned by employer B>`. B's applicants are listed and their status can be changed.
- **Fix:** in the service, read the current user, require `ROLE_EMPLOYER`, load the job and require `job.postedBy === current user id`; throw otherwise. For `updateApplicationStatus`, also look up the application's `jobId` and verify ownership. In the page, show not-found or access-denied when the job is missing or not owned.
- **Unverified:** how `postedBy` is set on static jobs in `mockData.js`. Decide how ownership works for seeded jobs.

## Medium severity

### 4. Job id type mismatch can hide applications
- **Where:** `jobApplicationService.js:87` (`a.jobId === parseInt(jobId)`), `:36` and `:73` (strict comparison with the raw `jobId`).
- **Root cause:** `jobId` is stored exactly as passed to `applyForJob`. If ever passed as a string, strict comparisons never match (applicants list, withdraw, `hasApplied`).
- **Fix:** normalize with `Number()` on write and compare.
- **Note:** latent risk, not a confirmed live bug. Not every caller of `applyForJob` was traced.

### 5. Employer status changes do not reach the seeker's in-memory state
- **Where:** `jobApplicationService.js:119-122` writes `jobApplications_<seekerId>`. `JobContext.jsx:26-113` loads `appliedJobs` once per `[user]` change.
- **Root cause:** no refresh, storage-event listener or polling, so the seeker sees the old status until re-login or reload.
- **Fix:** reload applications on entering the applied-jobs route, or listen to window `storage` events.

### 6. Dead employer code in JobContext that reports success but changes nothing
- **Where:** `JobContext.jsx:314-334` (`getJobApplications`, `updateApplicationStatus`). Also `:21`, `:88-104`, `:124-129` (`allApplications` state).
- **Root cause:** these read and write a `globalApplications` key that nothing populates, because applying writes `jobApplications_<userId>`. `allApplications_<id>` is persisted but never set.
- **Effects:** `getJobApplications` always returns `[]`. The context's `updateApplicationStatus` returns `success: true` while changing nothing, writes `applicant.status` (wrong shape) and has no ownership check.
- **Evidence:** grep shows nothing calls these context functions. `JobApplicants.jsx` imports `useJobs` at `:3` but never uses it.
- **Fix:** delete them, or point them at the service.

### 7. applicationsCount is only in memory
- **Where:** `contexts/JobsDataContext.jsx:104-118`, called from `JobContext.jsx:162` and `:243`. `postJob` sets `applicationsCount: 0` at `JobContext.jsx:270`.
- **Root cause:** count is incremented/decremented only in jobs state; not persisted, not derived from stored applications. Any refetch (TTL, window focus, `forceRefresh`) resets it to what `fetchAllJobs` returns.
- **Fix:** derive the count from stored applications in a service function.

### 8. Duplicate applications are possible, and withdraw removes all of them
- **Where:** `JobContext.jsx:141-144` (duplicate check against in-memory state) and `jobApplicationService.js:16-29` (no duplicate check). Withdraw at `:36`.
- **Root cause:** check and write are separated by `await delay()`. A fast double-click or two tabs can pass the stale check and create two records. Withdraw filters by `jobId` only, so it deletes every duplicate.
- **Fix:** reject in the service when a record for that `jobId` already exists; add an in-flight guard in the context.

### 9. Date.now() ids can collide
- **Where:** `jobApplicationService.js:20` (application id) and `JobContext.jsx:264` (job id).
- **Root cause:** two records created in the same millisecond share an id. `updateApplicationStatus` matches `a.id` across all users' keys and updates the first hit, so it could change the wrong user's application.
- **Fix:** `crypto.randomUUID()`, or combine the id with the user id.

### 10. The service reads the current user at call time, after an await
- **Where:** `jobApplicationService.js:4-11`, used after `await delay()` in each function.
- **Root cause:** the storage key is computed from whoever is in `jobPortalUser` when the code runs. If the user logs out or switches accounts during the delay, the write goes to the wrong key, or to `jobApplications_undefined` when no user is stored.
- **Fix:** read the user id before the await, and throw when there is no user.

## Low severity

### 11. No status validation or transition rules
- **Where:** `jobApplicationService.js:111-127`.
- **Root cause:** any string is accepted and any transition allowed (e.g. Hired back to Applied).
- **Fix:** validate against shared status constants; define allowed transitions if the product needs them.

### 12. Effect and race issues in JobApplicants.jsx
- **Where:** `:41-160` (load effect) and `:162-185`.
- **Root cause:**
  - `getJobById` is not memoized in `JobsDataContext` (`:87`), so it is a new function on every provider render. The load effect lists it as a dependency (`:160`), so the whole load reruns, including the applications fetch, on every provider re-render, including every `applicationsCount` update.
  - No cancellation flag, so overlapping loads can finish out of order and overwrite newer state.
  - `handleStatusChange` has no pending guard or rollback.
  - The `setTimeout` in `showNotification` is never cleared.
- **CORRECTED:** the first version said the effect would not rerun when jobs finish loading. It does rerun, because `getJobById` changes when `jobs` changes. The real problem is too many reruns. If jobs are not loaded on the first run, `job` is null for that run and a later run fixes it.
- **Fix:** wrap `getJobById` in `useCallback` with `[jobs]`, and add an ignore flag in the effect cleanup.

### 13. Smaller issues
- `JobApplicants.jsx:3` and `:11`: `useJobs` imported but unused (lint noise).
- `JobContext.jsx:119` and `:126`: `postedJobs.length >= 0` is always true.
- **CORRECTED:** the first version called the first-render save a data-loss risk. Re-checking effect order: the load effect reads storage and sets state, the save effect writes the stale `[]` in the same commit, and the next render writes the loaded value back. The stored value is overwritten only briefly. It matters only if the page closes between those two commits. Not high priority.
- Key mismatch: `JobContext.jsx:87-88` and `:268` use `user.userId || user.id`, while the seeker branch (`:46`, `:70`) and the service use `userId` first. Check that the user object always has a consistent id field.
- `jobApplicationService.js:103-106`: `getCompanyApplications` is a stub returning `[]`.
- `JobContext.jsx:316`, `:344`, `:349`: `parseInt` without a radix.

## Suggested priority (from the agent)
1. #3 authorization.
2. #1 status constants and #2 data shape, so the employer page works at all.
3. #6 dead code that fakes success.
4. #8 and #9 (duplicates and id collisions).
5. #5 and #7 (stale state and counts).
6. The rest.

## Verification steps (from the agent)
- As employer A, open employer B's job-applicants URL and confirm access is denied.
- Apply as a seeker, open the employer page, confirm the application shows as Applied with the right colour and count.
- Change the status as the employer, then log in as the seeker and confirm the new status.
- Double-click Apply and confirm only one record is stored.
- Confirm `applicationsCount` survives a `forceRefresh`.
