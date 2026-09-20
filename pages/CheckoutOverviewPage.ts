import { Page, Locator } from '@playwright/test';

export class CheckoutOverviewPage {

    private paymentInfoLabel: Locator;
    private paymentInfoValue: Locator;
    private shippingInfoLabel: Locator;
    private shippingInfoValue: Locator;
    private totalInfoLabel: Locator;
    private subtotalLabel: Locator;
    private taxLabel: Locator;
    private totalLabel: Locator;
    private cancelButton: Locator;
    private finishButton: Locator;
    private cartItems: Locator;
    private cartBadge: Locator;


    constructor(private page: Page) {
        this.paymentInfoLabel = page.getByTestId('payment-info-label');
        this.paymentInfoValue = page.getByTestId('payment-info-value');
        this.shippingInfoLabel = page.getByTestId('shipping-info-label');
        this.shippingInfoValue = page.getByTestId('shipping-info-value');
        this.totalInfoLabel = page.getByTestId('total-info-label');
        this.subtotalLabel = page.getByTestId('subtotal-label');
        this.taxLabel = page.getByTestId('tax-label');
        this.totalLabel = page.getByTestId('total-label');
        this.cancelButton = page.locator('#cancel');
        this.finishButton = page.locator('#finish');
        this.cartItems = page.locator('.cart_item');
        this.cartBadge = page.locator('.shopping_cart_badge');
    }

    getCartBadge(): Locator {
        return this.cartBadge;
    }


    getPaymentInfoLabel(): Locator {
        return this.paymentInfoLabel;
    }

    getPaymentInfoValue(): Locator {
        return this.paymentInfoValue;
    }

    getShippingInfoLabel(): Locator {
        return this.shippingInfoLabel;
    }

    getShippingInfoValue(): Locator {
        return this.shippingInfoValue;
    }

    getTotalInfoLabel(): Locator {
        return this.totalInfoLabel;
    }

    getSubtotalLabel(): Locator {
        return this.subtotalLabel;
    }

    getTaxLabel(): Locator {
        return this.taxLabel;
    }

    getTotalLabel(): Locator {
        return this.totalLabel;
    }

    getCartItemByName(productName: string): Locator {
        return this.cartItems.filter({ hasText: productName });
    }

    async getItemPrice(productName: string): Promise<number> {
        const item = this.getCartItemByName(productName);

        const priceText = await item
            .locator('.inventory_item_price')
            .innerText();

        return Number(priceText.replace('$', ''));
    }

    async clickFinish(): Promise<void> {
        await this.finishButton.click();
    }

    async clickCancel(): Promise<void> {
        await this.cancelButton.click();
    }

    async getSubtotalValue(): Promise<number> {
        const text = await this.subtotalLabel.innerText();
        return Number(text.replace('Item total: $', ''));
    }

    async getTaxValue(): Promise<number> {
        const text = await this.taxLabel.innerText();
        return Number(text.replace('Tax: $', ''));
    }

    async getTotalValue(): Promise<number> {
        const text = await this.totalLabel.innerText();
        return Number(text.replace('Total: $', ''));
    }
}
