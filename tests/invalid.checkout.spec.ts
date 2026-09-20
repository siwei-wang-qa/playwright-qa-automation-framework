import { expect } from '@playwright/test';
import { test } from '../fixtures/testFixtures';
import { checkoutData, invalidCheckoutCases } from '../test-data/checkoutData';

test.describe('Checkout tests with invalid information', () => {

    test.beforeEach(async ({ productsPage }) => {
        await productsPage.goto();
    });

    for (const testCase of invalidCheckoutCases) {
        test(`checkout validation - ${testCase.testName}`, {
            tag: ['@regression']
        },
            async ({ productsPage, cartPage, checkoutPage }) => {
                await test.step('Add Backpack to cart', async () => {
                    await productsPage.addProductToCart(checkoutData.productName);
                    await expect(productsPage.getCartBadge()).toHaveText('1');
                })

                await test.step('Open cart and verify Backpack', async () => {
                    await productsPage.openCart();
                    await expect(cartPage.getCartItemByName(checkoutData.productName)).toBeVisible();
                })
                await test.step('Click Checkout button', async () => {
                    await cartPage.clickCheckout();
                    await expect(checkoutPage.getCheckoutTitle()).toHaveText(checkoutData.checkoutTitle);
                })
                await test.step('Fill checkout information- ${testCase.testName}', async () => {
                    await checkoutPage.fillCustomerInformation(testCase.firstName, testCase.lastName, testCase.postalCode);
                })
                await test.step('Click Continue button', async () => {
                    await checkoutPage.continueCheckout();
                })
                await test.step('Verify error message', async () => {
                    await expect(checkoutPage.getErrorMessage()).toContainText(testCase.expectedError);
                    await expect(checkoutPage.getCheckoutTitle()).toContainText(checkoutData.checkoutTitle);
                })
            }
        );
    }

})