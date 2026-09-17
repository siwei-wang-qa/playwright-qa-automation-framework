import {Page,Locator} from '@playwright/test';

export class CartPage {

    private cartItems: Locator;

    constructor(private page: Page) {
        this.cartItems = page.locator('.cart_item');
    }

    getCartItems(): Locator {
        return this.cartItems;
    }

    getCartItemByName(productName: string): Locator {
        return this.cartItems.filter({ hasText: productName });
    }

    async removeProduct(productName: string): Promise<void> {
       this.getCartItemByName(productName)
       .getByRole('button', { name: 'Remove' }).click();
    }
}