import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/productsPage';
import { users } from '../test-data/users';
import { CartPage } from '../pages/CartPage';

test.describe('Login tests', () => {

    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid login',
        {
            tag: ['@smoke', '@regression'],
        },
        async ({ page }) => {


            const productsPage = new ProductsPage(page);
            await test.step('login with valid credentials', async () => {

                await loginPage.login(users.validUser.username, users.validUser.password);

                await expect(productsPage.getProductsTitle()).toBeVisible();
            })
        });

    for (const user of users.invalidUsers) {
        test(`invalid login - ${user.testName}`, async ({ page }) => {

            await loginPage.login(user.username, user.password);

            // await expect( loginPage.getErrorMessage()).toContainText(user.expectedError);

            expect(await loginPage.getErrorMessageText()).toContain(user.expectedError);
        })
    };
});

test.describe('Products tests', () => {
    let loginPage: LoginPage;
    let productsPage: ProductsPage;

    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page);
        productsPage = new ProductsPage(page);

        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);

    });

    test('add product to cart and remove form cart', {
        tag: ['@smoke', '@regression']
    },
        async ({ page }) => {


            const cartPage = new CartPage(page);

            await test.step('Add Backpack to cart', async () => {
                await productsPage.addProductToCart('Sauce Labs Backpack');

                await expect(productsPage.getCartBadge()).toHaveText('1');
            })

            await test.step('Open cart and verify Backpack', async () => {
                await productsPage.openCart();

                await expect(cartPage.getCartItemByName('Sauce Labs Backpack')).toBeVisible();
            })

            await test.step('Remove Backpack and verify cart is empty', async () => {
                await cartPage.removeProduct('Sauce Labs Backpack');

                await expect(cartPage.getCartItems()).toHaveCount(0);
            })
        });
});