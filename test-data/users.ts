export const users = {
    validUser: {
        username: 'standard_user',
        password: 'secret_sauce'
    },
    invalidUsers: [
    {
        testName: 'invalid username and invalid password',
        username: 'invalid_user',
        password: 'wrong_password',
        expectedError: 'Epic sadface',
    },
    {
        testName: 'valid username and invalid password',
        username: 'standard_user',
        password: 'wrong_password',
        expectedError: 'Epic sadface',
    },
    {
        testName: 'invalid username and valid password',
        username: 'invalid_user',
        password: 'secret_sauce',
        expectedError: 'Epic sadface',
    },
]
}