---
name: bug-report-login-password-comparison
description: Full report - login always fails with "Invalid email or password" because login() uses u.password !== password (inverted check) in AuthContext.jsx:180
metadata:
  type: project
---

# Bug report: valid credentials rejected with "Invalid email or password"

## Symptoms
- Login page shows "Invalid email or password" even when the email and password are correct (demo buttons "employer", "admin", "jobseeker" also fail).
- Counter-intuitive side effect: submitting a correct email with a WRONG password succeeds and logs the user in as that account (authentication bypass).
- Registration works (no error) but the newly registered user can never log in with the password they chose.

## Root cause
`src/context/AuthContext.jsx:180` (inside `login()`, lines 163-233):

```js
const foundUser = searchPool.find(u => u.email === email && u.password !== password);
```

The password comparison is inverted (`!==` instead of `===`). For a correct password, `u.password !== password` is false, so `find` returns undefined, and lines 182-185 return `{ success: false, error: 'Invalid email or password' }`. For a wrong password the predicate is true and the user is found.

Introduced by commit e09511e "mock: mocking a bug" (1 line changed in AuthContext.jsx). `git log -- src/context/AuthContext.jsx` confirms it is the only change since the section-07 copy.

## Evidence
- Read of AuthContext.jsx: DUMMY_USERS (lines 7-111) hold plaintext passwords e.g. `employer@company.com` / `employer123`; Login.jsx `fillDemoCredentials` (lines 58-78) fills exactly those values, and `handleSubmit` (34-49) passes `formData.email, formData.password, formData.userType` straight to `login()` with no transformation, so Login.jsx is not at fault.
- `registeredUsers` (localStorage) entries are created in `register()` (lines 255-266) with `password: userData.password` in the same shape as dummy users, so they are affected identically; the data shape is fine.
- `src/data/mockData.js` contains no users or passwords (grep for DUMMY/password/users found only a job description string), so it is not involved.
- `register()` duplicate-email check (line 250) is correct (`some(u => u.email === ...)`), confirming only `login()` is wrong.
- The migration block in the load effect (lines 134-141) only touches already-logged-in cached users, not the login path.
- Static analysis only; app was not run in a browser.

## Recommended fix (not applied - investigation only)
Change `src/context/AuthContext.jsx:180` to:

```js
const foundUser = searchPool.find(u => u.email === email && u.password === password);
```

No other change needed. Provider nesting order is untouched.

## Verification steps
1. `npm run dev`, open /login, click the employer demo button, submit: should navigate to the employer area.
2. Try `employer@company.com` with a wrong password: must show "Invalid email or password".
3. Register a new job seeker (password 8-20 chars), then log in with it: should succeed; `localStorage.registeredUsers` should contain the user with the password.
4. Repeat for admin@portal.com / admin123 and jobseeker@email.com / jobseeker123.

## Watch out for
- Passwords are stored and compared in plaintext in localStorage (acceptable for mock only).
- Email comparison is case-sensitive and not trimmed (`u.email === email`); consider normalizing as a separate improvement.
- `userType` passed from Login.jsx is ignored by `login()`; a user can log in via any demo type. Not the cause of this bug.
- Adding a lint/test guard around login (a simple unit test for correct vs wrong password) would catch this class of regression.
