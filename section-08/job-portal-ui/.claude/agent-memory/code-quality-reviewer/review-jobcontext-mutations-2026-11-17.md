---
name: review-jobcontext-mutations-2026-11-17
description: Code-quality-reviewer report (2026-11-17) on JobContext postJob/updateJob/deleteJob state vs localStorage consistency plus coding-standards deviations
metadata:
  type: project
---

Read-only review by the code-quality-reviewer subagent, run as part of a three-reviewer team review on 2026-11-17. Nothing was edited. File reviewed: `src/context/JobContext.jsx`, plus greps of other files touching the same storage keys. `npm run lint` reported 30 errors and 3 warnings across the repo, none visible in `JobContext.jsx` (output was truncated, so an error above the cut can't be ruled out).

**Provenance note:** the reviewer's original numbered list ran to item 16. The messages relayed to the lead clipped items 6-11 and 12-16, so those were reconstructed from the reviewer's condensed resend. Content is faithful but numbering below is regrouped.

**Overall assessment:** needs significant revision for the employer mutations.

## Critical issues

### 1. `updateJob` never updates `globalPostedJobs` (`JobContext.jsx:285-296`)
- `updateJob` changes only `postedJobs` state; the effect at `:118-122` mirrors it to `postedJobs_{id}`.
- `globalPostedJobs` is what public listings read (`getAllJobsSync` at `:337`, `savedJobService.js:19`, `jobApplicationService.js:46`, `companyService.js:21`). It keeps old data, so employer edits never reach job seekers.
- `MyJobs.jsx:88-93` patches `globalPostedJobs` by hand, so context and page each own half of the update.
- **Fix:** do the global write inside `updateJob`, as `deleteJob` does, and remove the page-level copy.
	```js
	const updateJob = (jobId, updates) => {
		// ...role guard...
		setPostedJobs(prev => prev.map(job => (job.id === jobId ? { ...job, ...updates } : job)));
		const globalJobs = readGlobalPostedJobs();
		writeGlobalPostedJobs(globalJobs.map(job => (job.id === jobId ? { ...job, ...updates } : job)));
		return { success: true, message: 'Job updated successfully!' };
	};
	```

### 2. No ownership check on `updateJob` / `deleteJob` (`:285-312`)
- Both check only the role. `deleteJob` filters `globalPostedJobs` by `id` alone, so employer A can delete employer B's job by id. `updateJob` spreads `updates` over the job, letting a caller overwrite `postedBy`, `id` or `company`.
- **Fix:** require `job.postedBy === (user.userId || user.id)`, apply it to the global filter and map too, and strip `id` and `postedBy` from `updates`.

### 3. `postJob` / `deleteJob` write storage inside the handler, not through state (`:258-283`, `:307-309`)
- `setPostedJobs` runs first; the `localStorage.setItem` for `globalPostedJobs` follows, not wrapped in try/catch. If `JSON.parse` throws on corrupt data or the write fails on quota, the function throws after the state update is queued. The effect then persists `postedJobs_{id}` while the global list never gets the job, and the caller sees an exception instead of `{ success: false }`.
- `deleteJob` has the same problem: a parse failure after `setPostedJobs` removes the job from the employer's list but leaves it public.
- **Fix:** wrap each body in try/catch and return `{ success: false, error }`. Do the global write first and update state only if it succeeds.

### 4. `PostJob.jsx` bypasses the context entirely (definitive, resolved)
- `PostJob.jsx` does NOT call `postJob`. It does not import `useJobs` (imports at `:3-4`, `:29-30`). It builds its own `newJob` with `id: Date.now()` at `:136-137`, writes `globalPostedJobs` directly at `:172-173`, writes `postedJobs_{id}` directly at `:176-178`, then calls `forceRefresh()` from `JobsDataContext` at `:181`.
- There is no duplicate write. Instead `JobContext.postJob`, `updateJob` and `deleteJob` have no callers in `src`. The only related hit is `MyJobs.jsx:88-93`, which patches `globalPostedJobs` itself.
- **Risk (critical, partly unconfirmed):** `PostJob` writes `postedJobs_{id}` behind the context's back, so the context's `postedJobs` state never learns about the new job. The persistence effect at `:118-122` rewrites that key from state whenever `postedJobs` or `user` changes. A later change can overwrite the key with the stale list, dropping the page-posted job from the employer's personal list (it stays public in `globalPostedJobs`). Depends on how `MyJobs` loads its list, which was not read.
- **Fix:** have `PostJob` call `useJobs().postJob`, and `MyJobs` call `updateJob` and `deleteJob`. The context should be the only writer for both keys, and the effect-based persistence at `:118-129` should go.
- Earlier duplicate-id claim for this item was withdrawn: it is a divergence between two implementations, not a double write.

## Warnings

- **`:264-265` ids:** `id: Date.now()` can collide (two posts in the same ms, two tabs, or with static mock ids), and `...jobData` is spread AFTER `id`, so callers can override `id`, `postedBy`, `applicationsCount`. Use `crypto.randomUUID()` or spread first. `parseInt(jobId)` at `:316`, `:344`, `:349` would need updating if ids become strings. `Date.now()` ids exist in two places (`JobContext.jsx:264`, `PostJob.jsx:137`).
- **Delete leaves orphans (`:298-312`):** `savedJobs_*` and `jobApplications_*` entries, plus `allApplications` state, still point at the missing job.
- **`:314-334`:** `globalApplications` has no writers in `src`, so `getJobApplications` always returns `[]`. Neither function checks job ownership.
- **`:258-283`:** no try/catch around `JSON.parse` and `setItem`; state updates before the global write succeeds (see critical #3).
- **User id fallback (`:87`, `:120`, `:268` vs `:46`, `:70`):** `user.userId || user.id` is used for employers only; the seeker branch uses `userId` first. Add a single `getUserId(user)` helper.
- **`forceRefresh` gap:** `JobsDataContext` exposes `forceRefresh` (used at `PostJob.jsx:30`, `:181`), but `JobContext.postJob`/`updateJob`/`deleteJob` never call it. Matters once pages are routed through them.
- **First-load race (plausible, unreproduced):** a stale-overwrite on first load, and a React effect-ordering inference that the saver effect overwrites saved data on login. The `>= 0` guard at `:119`/`:126` is always true (confident). Treat the rest as likely, not confirmed.

## Coding-standards deviations
- `JobContext.jsx:46`, `:88`, `:315`: keys `appliedJobs_{id}`, `allApplications_{id}`, `globalApplications` are not in the documented list in `data-layer.md`. The documented applications key is `jobApplications_{userId}`. Use that key or document the new ones.
- `PostJob.jsx` (loading screen, around `:200`): uses `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`. Dark mode must go through `ThemeContext` with conditional classes. Only part of the file was read; there may be more `dark:` uses.
- `PostJob.jsx:172-178`: the page reads and writes localStorage directly; pages should go through `src/services/` or the context.
- `JobContext.jsx`: 2-space indentation throughout where the project standard is tabs. Trailing whitespace on `:84`, `:89`, `:97`, `:290`, `:326`. No comment explaining why both `globalPostedJobs` and `postedJobs_{id}` exist.
- `JobContext.jsx:44`, `:51`, `:68`, `:75`, `:167` and others: `console.error` in catch blocks (minor). Surface errors to users with `react-toastify` at call sites.
- Withdrawn by the reviewer: an item that speculated about lint output for this file.

## Suggestions
- Extract `readGlobalPostedJobs()` / `writeGlobalPostedJobs()` into `src/services/` with try/catch around the parse. The `JSON.parse(localStorage.getItem('globalPostedJobs') || '[]')` pattern appears about eight times across five files.
- Route employer mutations through a service that calls `delay()`, as the data-layer rules require.
- Add a single `getUserId(user)` helper to replace the `user.userId || user.id` fallbacks.
- Call `forceRefresh` from `JobsDataContext` after any employer mutation, as `PostJob.jsx:181` already does.

## What's done well
- Functional `setState` updates (`prev => ...`) everywhere, so no stale-closure problems.
- Seeker flows call the service first and update state only after it succeeds; employer functions should follow that order.
- Role guards applied consistently; `useJobs` throws a clear error outside its provider.
- State is cleared on logout (`:106-112`).
