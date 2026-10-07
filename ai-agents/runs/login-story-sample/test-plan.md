# Login Feature Test Plan

## Required Test Cases

| ID | Scenario / Steps | Expected Result | Acceptance Criteria |
|---|---|---|---|
| TC-01 | Enter valid registered username and password, then submit login. | Login succeeds and user is redirected to the Products page. | AC1, AC2 |
| TC-02 | Enter invalid credentials, then submit login. | Login fails, user is not authenticated, and an error message is displayed. | AC3, AC4 |

## Recommended Additional Tests

- Submit with an empty username.
- Submit with an empty password.
- Submit with both fields empty.
- Verify password input is masked.
- Verify behavior for leading/trailing spaces.
- Verify login using keyboard submission.
- Verify the Products page cannot be accessed without authentication.
- Verify error message content, placement, and accessibility.

## Clarifications Needed

1. What qualifies as “invalid credentials”: invalid username, invalid password, or both?
2. What exact error message should be displayed?
3. Should the error message differ for an unknown username versus an incorrect password?
4. Should users be redirected to a specific Products page URL?
5. What should happen when either or both fields are blank?