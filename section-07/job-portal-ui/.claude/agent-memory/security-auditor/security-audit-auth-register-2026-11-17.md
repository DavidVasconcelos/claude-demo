---
name: security-audit-auth-register-2026-11-17
description: Full security-auditor report (2026-11-17) on auth, credentials and localStorage in AuthContext.jsx and Register.jsx — overall MEDIUM, 3 medium, 5 low, 1 informational
metadata:
  type: project
---

Read-only audit by the security-auditor subagent, run as part of a three-reviewer team review on 2026-11-17. Nothing was edited; `npm audit` and lint were not run.

**Scope:** `src/context/AuthContext.jsx`, `src/pages/Register.jsx`, `src/components/ProtectedRoute.jsx`, the route table in `src/App.jsx`, the auth parts of `src/pages/Login.jsx`. `src/data/mockData.js` has no passwords or roles; dummy users and credentials are defined inside `AuthContext.jsx` (`DUMMY_USERS`).

**Risk summary: MEDIUM.** No critical or high findings. The login comparison at `AuthContext.jsx:180` is correct now (the earlier inversion, see [[bug-report-login-password-comparison]], is fixed).

## [MEDIUM] 1. Duplicate-email check and login matching are case- and whitespace-sensitive
- **Location:** `AuthContext.jsx:250` (register), `:180` (login). Email is stored as typed at `:258`.
- **Description:** both compare `u.email === userData.email` / `u.email === email` verbatim, with no trim or lowercase.
- **Attack scenario:** registering `Admin@Portal.com` or `admin@portal.com ` (trailing space) passes the duplicate check and creates a look-alike account, enabling impersonation of employers/admins in the UI and phishing-style confusion. Legitimate users who type their own email with different casing are locked out.
- **Fix:**
	```jsx
	const normalizedEmail = userData.email.trim().toLowerCase();
	// register: compare u.email.toLowerCase() === normalizedEmail, store email: normalizedEmail
	// login: compare u.email.toLowerCase() === email.trim().toLowerCase()
	```
- **Project context:** with a real backend, enforce the same normalization and a unique index server-side.

## [MEDIUM] 2. Corrupt or tampered `registeredUsers` is not guarded
- **Location:** `AuthContext.jsx:177` and `:241`.
- **Description:** `JSON.parse(localStorage.getItem('registeredUsers') || '[]')` is unguarded. Invalid JSON throws, and the surrounding `catch` returns the raw `error.message` to the UI (`Register.jsx:97`). Valid-but-tampered JSON is trusted: an entry with `"role": "ROLE_ADMIN"` and a known password logs in as admin because `role` is copied from the found record at `:196`.
- **Attack scenario:** anyone with console access or an XSS foothold writes an admin record into `registeredUsers` and logs in through the normal form. A malformed value breaks login and registration for every user on that browser.
- **Fix:**
	```jsx
	const readRegisteredUsers = () => {
		try {
			const parsed = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	};
	```
	Return a generic error message instead of `error.message`. Only honor `ROLE_JOB_SEEKER` from `registeredUsers`, since `register()` only creates that role.
- **Project context:** a backend must never take the role from client-supplied data.

## [MEDIUM] 3. Session restore trusts `jobPortalUser` without validating role or shape
- **Location:** `AuthContext.jsx:127-143`.
- **Description:** on startup any parsed object becomes `user` if `authToken` is merely present. The only check is that `email` contains `@`. The token value is never verified (`'mock-jwt-' + Date.now()` format). `role` is accepted at face value; `ProtectedRoute.jsx:22` and the `isAdmin`/`isEmployer`/`isJobSeeker` flags (`AuthContext.jsx:329-331`) derive from it.
- **Attack scenario:** setting `authToken` to any string and `jobPortalUser` to `{"role":"ROLE_ADMIN",...}` gets into `/admin/*` without credentials. A forged `userId` also controls the `{userId}`-suffixed storage keys, exposing another user's saved jobs and applications.
- **Fix:** validate that `role` is one of the three known values, that `userId` is defined, and that the token matches the `mock-jwt-` format. Must be server-verified once there is a backend.

## [LOW] 4. `register()` stores unvalidated fields and has dead userType/company handling
- **Location:** `AuthContext.jsx:255-263`, `Register.jsx:12-15`, `:65`.
- **Description:** role is hardcoded to `ROLE_JOB_SEEKER` (correct). But `userType` and `company` sit in form state, `company` is validated for employers without being used, and there is no UI to select `userType`, so it is dead code. `name` and `mobileNumber` are stored untrimmed. `register()` does no validation of its own and relies entirely on the page's `validateForm`.
- **Fix:** remove the dead handling or implement it deliberately. If employer sign-up is added, keep the role server-assigned or gated by admin approval. Re-validate and trim inside `register()`. On a real backend, whitelist fields rather than spreading the request body.

## [LOW] 5. Weak email regex and length-only password policy
- **Location:** `Register.jsx:39` and `:44-50`.
- **Description:** `/\S+@\S+\.\S+/` is unanchored, so `a@b.c junk` passes. Password policy checks length only (8-20); the 20-character cap is unnecessary.
- **Fix:** anchor as `/^\S+@\S+\.\S+$/`; drop the max length or raise it to 64+.

## [LOW] 6. `updateProfile` spreads arbitrary data into the user, including role
- **Location:** `AuthContext.jsx:289-293`.
- **Description:** `{ ...user, ...profileData }` is persisted to `jobPortalUser`. If any caller passes `role`, `userId` or `email`, the session identity changes with no check. Callers were not traced, so this is a latent risk, not a confirmed exploit.
- **Fix:** whitelist the editable fields and drop `role`, `userId`, `email`. This mass-assignment pattern becomes privilege escalation on a real backend.

## [LOW] 7. Token and user are not set together in `login()`
- **Location:** `AuthContext.jsx:189` vs `:226`.
- **Description:** `authToken` is written before the profile fetch and before `setUser`. A failure between those lines would leave a token with no user. The current path is caught, so this is hygiene, not a defect. Logout (`:314-318`) correctly clears `authToken` and `jobPortalUser`.
- **Fix:** set token and user together after all async work finishes.

## [LOW] 8. Demo credentials shown or auto-filled in the login UI
- **Location:** `Login.jsx:62`, `:68`, `:74`.
- **Fix:** gate the demo buttons behind `import.meta.env.DEV` so they do not ship in production builds.

## [INFORMATIONAL] 9. Noisy logging outside the requested focus
`JobApplicants.jsx:57-149` and `Profile.jsx` log applicant objects, profile data and resume/picture metadata. `ThemeContext`, `JobsDataContext`, `CompaniesContext` log routine state. `AuthContext.jsx` itself does not log credentials or tokens. Strip applicant PII logging before production.

## Secure patterns noted
- Login comparison is correct and returns a generic "Invalid email or password".
- Role is never taken from the form: `login()` ignores its `userType` argument and `register()` hardcodes `ROLE_JOB_SEEKER`.
- `ProtectedRoute` waits for `isLoading` and checks `allowedRoles`. Every employer, job-seeker and admin route in `App.jsx` is wrapped with explicit `allowedRoles`.
- Post-login redirect (`Login.jsx:21`, `:45`) is in-app only, so no open redirect.
- Password inputs use `type="password"`; no `dangerouslySetInnerHTML` in the reviewed files; persisted `jobPortalUser` is built from a field whitelist (`AuthContext.jsx:191-199`) that excludes the password.

## By-design limitations (must change before production)
- Passwords are plaintext in source (`DUMMY_USERS`) and in localStorage (`registeredUsers`). A real backend needs salted hashing (argon2/bcrypt) and server-side comparison.
- `authToken` is fake and unverified; all role and authentication checks are client-side, so anyone can edit localStorage or React state to change role. A real backend needs server-issued verified tokens and server-side authorization on every data operation. An HttpOnly, Secure, SameSite cookie is preferable to a token in localStorage, which any XSS can read.
- No rate limiting or lockout on login.
- Email uniqueness needs a database constraint.
