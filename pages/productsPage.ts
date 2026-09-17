import { Page, Locator } from '@playwright/test';

export class ProductsPage {

    private productsTitle: Locator;
    private cartBadge: Locator;
    private cartLink: Locator;

    constructor(private page: Page) {
        this.productsTitle = page.getByText('Products', { exact: true });
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.cartLink = page.locator('.shopping_cart_link');
    }

    getProductsTitle(): Locator {
        return this.productsTitle;
    }

    getProductCard(productName: string): Locator {
        return this.page
        .locator('.inventory_item')
        .filter({ hasText: productName });
    }

    async addProductToCart(productName: string): Promise<void> {
        await this.getProductCard(productName)
        .getByRole('button', { name: 'Add to cart' })
        .click();
    }
    getCartBadge(): Locator {
        return this.cartBadge;
    }

    async openCart(): Promise<void> {
        await this.cartLink.click();
    }


}