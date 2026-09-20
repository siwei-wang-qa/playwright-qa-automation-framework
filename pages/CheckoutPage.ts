import { Page, Locator } from '@playwright/test';

export class CheckoutPage {

    private checkoutTitle: Locator;
    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private postalCodeInput: Locator;
    private cancelButton: Locator;
    private continueButton: Locator;
    private errorMessage: Locator;


    constructor(private page: Page) {
        this.checkoutTitle = page.locator('.title');
        this.firstNameInput = page.locator('#first-name');
        this.lastNameInput = page.locator('#last-name');
        this.postalCodeInput = page.locator('#postal-code');
        this.cancelButton = page.locator('#cancel');
        this.continueButton = page.locator('#continue');
        this.errorMessage = page.getByTestId('error');
    }

    getCheckoutTitle(): Locator {
        return this.checkoutTitle;
    }

    async fillCustomerInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
    }

    async cancelCheckout(): Promise<void> {
        await this.cancelButton.click();
    }

    async continueCheckout(): Promise<void> {
        await this.continueButton.click();
    }

    getErrorMessage(): Locator {
        return this.errorMessage;
    } 

}