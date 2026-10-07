import { expect } from '@playwright/test';
import { test } from '../../../fixtures/testFixtures';
import { users } from '../../../test-data/users';

test.describe('Login', () => {
    test('TC-01: valid registered user can log in successfully', async ({
        loginPage,
        productsPage,
    }) => {
        await loginPage.goto();
        await loginPage.login(
            users.validUser.username,
            users.validUser.password,
        );

        await expect(productsPage.getProductsTitle()).toBeVisible();
    });

    for (const user of users.invalidUsers) {
        test(`TC-02: login fails with ${user.testName}`, async ({
            loginPage,
            productsPage,
        }) => {
            await loginPage.goto();
            await loginPage.login(user.username, user.password);

            await expect(loginPage.getErrorMessage()).toBeVisible();
            await expect(loginPage.getErrorMessage()).toContainText(
                user.expectedError,
            );
            await expect(productsPage.getProductsTitle()).not.toBeVisible();
        });
    }
});