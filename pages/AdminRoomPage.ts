import { Page, Locator } from '@playwright/test';

export class AdminRoomPage {
    constructor(private page: Page) {}

    getBookingRow(
        firstName: string,
        lastName: string,
        checkin: string,
        checkout: string
    ): Locator {
        return this.page
            .locator('.detail.booking-1')
            .filter({ hasText: firstName })
            .filter({ hasText: lastName })
            .filter({ hasText: checkin })
            .filter({ hasText: checkout });
    }
}