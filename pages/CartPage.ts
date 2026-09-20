import { Page, Locator } from '@playwright/test';

export class CartPage {

    private cartItems: Locator;
    private checkoutButton: Locator;
    private cartTitle: Locator;
    private cartBadge: Locator;


    constructor(private page: Page) {
        this.cartItems = page.locator('.cart_item');
        this.checkoutButton = page.locator('#checkout');
        this.cartTitle = page.locator('.title');
        this.cartBadge = page.locator('.shopping_cart_badge');

    }

    getCartBadge(): Locator {
        return this.cartBadge;
    }
    
    getCartItems(): Locator {
        return this.cartItems;
    }

    getCartTitle(): Locator {
        return this.cartTitle;
    }

    getCartItemByName(productName: string): Locator {
        return this.cartItems.filter({ hasText: productName });
    }

    async removeProduct(productName: string): Promise<void> {
        await this.getCartItemByName(productName)
            .getByRole('button', { name: 'Remove' }).click();
    }

    async clickCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }

}