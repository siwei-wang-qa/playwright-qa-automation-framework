import { expect } from '@playwright/test';
import { test } from '../../fixtures/testFixtures';
import { checkoutData } from '../../test-data/checkoutData';
import { completeCheckout } from '../../helpers/checkoutFlow';
import fs from 'fs';

test.describe('Checkout tests', () => {

    test.beforeEach(async ({ productsPage }) => {
        await productsPage.goto();
    });

    test('checkout process', {
        tag: ['@smoke', '@regression']
    },
        async ({ productsPage, cartPage, checkoutPage, checkoutOverviewPage, checkoutCompletePage }) => {

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

            await test.step('Fill in checkout information', async () => {
                await checkoutPage.fillCustomerInformation(checkoutData.customerInfo.firstName, checkoutData.customerInfo.lastName, checkoutData.customerInfo.postalCode);
            });

            await test.step('Click Continue button', async () => {
                await checkoutPage.continueCheckout();
            })

            await test.step('Verify checkout overview information', async () => {
                await expect(checkoutOverviewPage.getPaymentInfoLabel()).toHaveText(checkoutData.paymentInfo.label);
                await expect(checkoutOverviewPage.getPaymentInfoValue()).toContainText(checkoutData.paymentInfo.value);
                await expect(checkoutOverviewPage.getShippingInfoLabel()).toHaveText(checkoutData.shippingInfo.label);
                await expect(checkoutOverviewPage.getShippingInfoValue()).toHaveText(checkoutData.shippingInfo.value);
                await expect(checkoutOverviewPage.getTotalInfoLabel()).toHaveText(checkoutData.totalInfo.label);
                await expect(checkoutOverviewPage.getSubtotalLabel()).toHaveText(checkoutData.totalInfo.subtotal);
                await expect(checkoutOverviewPage.getTaxLabel()).toContainText(checkoutData.totalInfo.tax);
                await expect(checkoutOverviewPage.getTotalLabel()).toContainText(checkoutData.totalInfo.total);
                await expect(checkoutOverviewPage.getCartItemByName(checkoutData.productName)).toBeVisible();
            })

            await test.step('Click Finish button', async () => {
                await checkoutOverviewPage.clickFinish();
            })

            await test.step('Verify checkout complete page', async () => {
                await expect(checkoutCompletePage.getCompleteHeader()).toHaveText(checkoutData.completeHeader);
                await expect(checkoutCompletePage.getCompleteText()).toHaveText(checkoutData.completeText);
                await expect(checkoutCompletePage.getPonyExpress()).toBeVisible();
            })

        })

    test('cancel checkout process', {
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
            await test.step('Fill in checkout information', async () => {
                await checkoutPage.fillCustomerInformation(checkoutData.customerInfo.firstName, checkoutData.customerInfo.lastName, checkoutData.customerInfo.postalCode);
            })
            await test.step('Click Cancel button', async () => {
                await checkoutPage.cancelCheckout();
            })
            await test.step('Verify cart page', async () => {
                await expect(cartPage.getCartItemByName(checkoutData.productName)).toBeVisible();
            })
            await test.step('Cart badge should still be 1', async () => {
                await expect(cartPage.getCartBadge()).toHaveText('1');
            })
            await test.step('Verify cart title', async () => {
                await expect(cartPage.getCartTitle()).toContainText(checkoutData.cartTitle);
            })
        })

    test('complete checkout process and Download receipt', {
        tag: ['@regression']
    },
        async ({ page, productsPage, cartPage, checkoutPage, checkoutOverviewPage, checkoutCompletePage }) => {

            await test.step('Complete checkout', async () => {
                await completeCheckout({ productsPage, cartPage, checkoutPage, checkoutOverviewPage });

                await expect(checkoutCompletePage.getCompleteHeader()).toHaveText(checkoutData.completeHeader);
            })

            await test.step('Download PDF receipt', async () => {
                const downloadPromise = page.waitForEvent('download');

                await checkoutCompletePage.clickGeneratePdfOrder();

                const download = await downloadPromise;

                expect(download.suggestedFilename()).toMatch(/\.pdf$/);

                const downloadPath = `test-results/downloads/order-${Date.now()}.pdf`;

                await download.saveAs(downloadPath);

                expect(fs.existsSync(downloadPath)).toBeTruthy();
            });

        }
    )

    test('checkout multi items', {
        tag: ['@regression']
    },
        async ({ productsPage, cartPage, checkoutPage, checkoutOverviewPage, checkoutCompletePage }) => {
            await test.step('Add multiple items to cart', async () => {
                for (const product of checkoutData.products) {
                    await productsPage.addProductToCart(product);
                }
                await expect(productsPage.getCartBadge()).toHaveText('2');
            });

            await test.step('Open cart and verify multiple items', async () => {
                await productsPage.openCart();
            });

            await test.step('Verify multiple items in cart', async () => {
                for (const product of checkoutData.products) {
                    await expect(cartPage.getCartItemByName(product)).toBeVisible();
                }
            })

            await test.step('Click Checkout button', async () => {
                await cartPage.clickCheckout();
                await expect(checkoutPage.getCheckoutTitle()).toHaveText(checkoutData.checkoutTitle);
            })

            await test.step('Fill in checkout information', async () => {
                await checkoutPage.fillCustomerInformation(checkoutData.customerInfo.firstName, checkoutData.customerInfo.lastName, checkoutData.customerInfo.postalCode);
            })

            await test.step('Click Continue button', async () => {
                await checkoutPage.continueCheckout();
            })

            await test.step('Verify checkout overview information', async () => {
                let itemTotal: number = 0;

                for (const product of checkoutData.products) {
                    await expect(checkoutOverviewPage.getCartItemByName(product)).toContainText(product);
                    const itemPrice = await checkoutOverviewPage.getItemPrice(product);
                    itemTotal += itemPrice;
                }

                itemTotal = Number(itemTotal.toFixed(2));
                const taxTotal = Number((itemTotal * 0.08).toFixed(2));
                const totalPrice = Number((itemTotal + taxTotal).toFixed(2));

                const actualSubtotal = await checkoutOverviewPage.getSubtotalValue();
                const actualTax = await checkoutOverviewPage.getTaxValue();
                const actualTotal = await checkoutOverviewPage.getTotalValue();

                await expect(checkoutOverviewPage.getPaymentInfoLabel()).toHaveText(checkoutData.paymentInfo.label);
                await expect(checkoutOverviewPage.getPaymentInfoValue()).toContainText(checkoutData.paymentInfo.value);
                await expect(checkoutOverviewPage.getShippingInfoLabel()).toHaveText(checkoutData.shippingInfo.label);
                await expect(checkoutOverviewPage.getShippingInfoValue()).toHaveText(checkoutData.shippingInfo.value);
                await expect(checkoutOverviewPage.getTotalInfoLabel()).toHaveText(checkoutData.totalInfo.label);
                expect(actualSubtotal).toBe(itemTotal);
                expect(actualTax).toBe(taxTotal);
                expect(actualTotal).toBe(totalPrice);

            })

            await test.step('Click Finish button', async () => {
                await checkoutOverviewPage.clickFinish();
            })

            await test.step('Verify checkout complete page', async () => {
                await expect(checkoutCompletePage.getCompleteHeader()).toHaveText(checkoutData.completeHeader);
                await expect(checkoutCompletePage.getCompleteText()).toHaveText(checkoutData.completeText);
                await expect(checkoutCompletePage.getPonyExpress()).toBeVisible();
            })

        })

    test('remove item from cart', {
        tag: ['@regression']
    },
        async ({ productsPage, cartPage, checkoutPage, checkoutOverviewPage, checkoutCompletePage }) => {
            await test.step('Add multiple items to cart', async () => {
                for (const product of checkoutData.products) {
                    await productsPage.addProductToCart(product);
                }
                await expect(productsPage.getCartBadge()).toHaveText('2');
            });

            await test.step('Open cart and verify multiple items', async () => {
                await productsPage.openCart();
            });

            await test.step('Verify multiple items in cart', async () => {
                for (const product of checkoutData.products) {
                    await expect(cartPage.getCartItemByName(product)).toBeVisible();
                }
            })

            await test.step('Remove one item', async () => {
                await cartPage.removeProduct(checkoutData.products[0]);
                await expect(
                    cartPage.getCartItemByName(checkoutData.products[0])
                ).toHaveCount(0);
                await expect(productsPage.getCartBadge()).toHaveText('1');
            })

            await test.step('Click Checkout button', async () => {
                await cartPage.clickCheckout();
                await expect(checkoutPage.getCheckoutTitle()).toHaveText(checkoutData.checkoutTitle);
            })

            await test.step('Fill in checkout information', async () => {
                await checkoutPage.fillCustomerInformation(checkoutData.customerInfo.firstName, checkoutData.customerInfo.lastName, checkoutData.customerInfo.postalCode);
            })

            await test.step('Click Continue button', async () => {
                await checkoutPage.continueCheckout();
            })

            await test.step('Verify removed item is not in checkout overview', async () => {
                await expect(checkoutOverviewPage.getCartBadge()).toHaveText('1');

                await expect(
                    checkoutOverviewPage.getCartItemByName(checkoutData.products[0])
                ).toHaveCount(0);

                await expect(
                    checkoutOverviewPage.getCartItemByName(checkoutData.products[1])
                ).toBeVisible();

            })


        })
})

