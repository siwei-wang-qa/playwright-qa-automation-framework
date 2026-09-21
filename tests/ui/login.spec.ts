import { expect } from '@playwright/test';
import { test } from '../../fixtures/testFixtures';
import { users } from '../../test-data/users';

test.describe('Login tests', () => {


    test.beforeEach(async ({ loginPage }) => {

        await loginPage.goto();
    });

    test('valid login',
        {
            tag: ['@smoke', '@regression'],
        },
        async ({ loginPage, productsPage }) => {

            await test.step('login with valid credentials', async () => {

                await loginPage.login(users.validUser.username, users.validUser.password);

                await expect(productsPage.getProductsTitle()).toBeVisible();
            })
        });

    for (const user of users.invalidUsers) {
        test(`invalid login - ${user.testName}`, async ({ loginPage }) => {
            await test.step(`login with invalid credentials - ${user.testName}`, async () => {  
            await loginPage.login(user.username, user.password);

            await expect(loginPage.getErrorMessage()).toContainText(user.expectedError);

        })})
    };
});

