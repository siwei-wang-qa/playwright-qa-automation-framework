# Invalid Login Feature

## Testing Goal

Open https://www.saucedemo.com.

Attempt to log in using:
- username: standard_user
- password: wrong_password

Verify that login is rejected.

The test should PASS only if:
- the browser remains on the login page
- an error message is displayed
- the user does not reach the inventory page

Report PASS or FAIL based on observable evidence.