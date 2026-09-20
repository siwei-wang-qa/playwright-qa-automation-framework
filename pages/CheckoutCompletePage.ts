import { Page, Locator } from '@playwright/test';

export class CheckoutCompletePage {

    private ponyExpress: Locator;
    private completeHeader: Locator;
    private completeText: Locator;
    private backToProductsButton: Locator;
    private generatePdfOrderButton: Locator;


    constructor(private page: Page) {
        this.ponyExpress = page.getByTestId('pony-express');
        this.completeHeader = page.getByTestId('complete-header');
        this.completeText = page.getByTestId('complete-text');
        this.backToProductsButton = page.getByTestId('back-to-products');
        this.generatePdfOrderButton = page.getByTestId('generate-pdf-order');

    }


    getPonyExpress(): Locator {
        return this.ponyExpress;
    }

    getCompleteHeader(): Locator {
        return this.completeHeader;
    }

    getCompleteText(): Locator {
        return this.completeText;
    }

    async clickBackToProducts(): Promise<void> {
        await this.backToProductsButton.click();
    }

    async clickGeneratePdfOrder(): Promise<void> {
        await this.generatePdfOrderButton.click();
    }


}