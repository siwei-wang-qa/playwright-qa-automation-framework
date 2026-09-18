import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/productsPage';
import { CartPage } from '../pages/CartPage';
import { users } from '../test-data/users';

type MyFixtures = {
    loginPage: LoginPage;
    productsPage: ProductsPage;
    cartPage: CartPage;
    loggedInProductsPage: ProductsPage;
};


export const test = base.extend<MyFixtures>({

    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    productsPage: async ({ page }, use) => {
        const productsPage = new ProductsPage(page);
        await use(productsPage);
    },
    cartPage: async ({ page }, use) => {
        const cartPage = new CartPage(page);
        await use(cartPage);
    },

    loggedInProductsPage: async ({ loginPage, productsPage }, use) => {
        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);
        await use(productsPage);
    }

});