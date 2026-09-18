import { expect } from '@playwright/test';
import { test } from '../fixtures/testFixtures';


test.describe('Products tests', () => {

    test.beforeEach(async ({ productsPage }) => {
        await productsPage.goto();
    });

    test('add product to cart and remove form cart', {
        tag: ['@smoke', '@regression']
    },


        async ({ productsPage, cartPage }) => {


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