---
name: auth-users-live-in-authcontext
description: Login users (DUMMY_USERS) are hardcoded in src/context/AuthContext.jsx, not in src/data/mockData.js; registered users in localStorage registeredUsers
metadata:
  type: reference
---

- `DUMMY_USERS` (employers, jobSeekers, admins; plaintext passwords) is defined at the top of `src/context/AuthContext.jsx`. `src/data/mockData.js` has NO users, so do not look there for login bugs.
- `login()` searches dummy users plus `localStorage.registeredUsers` (array of `{id, name, email, mobileNumber, password, role: 'ROLE_JOB_SEEKER', profileComplete}`) in a single pool.
- `Login.jsx` just forwards form values to `login()`; the `userType` argument is ignored.
- See [[bug-report-login-password-comparison]] for a past inverted-password-check bug.
