import { test, expect } from '@playwright/test';

test.describe('Network Mocking', () => {
    test('should display mocked API data', async ({ page }) => {

        await page.route('**/api/branding', async route => {
            //console.log('Mock intercepted:', route.request().url());

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    address: {
                        county: 'Mock County CA',
                        line1: 'Mock LINE ADDRESS',
                        line2: 'Mock Valley',
                        postCode: '1A1 1A',
                        postTown: 'Mock Town'
                    },
                    contact: {
                        email: 'mock@test.com',
                        name: 'Mock test',
                        phone: '012345678901'
                    },
                    description: 'Mock hotel description',
                    directions: 'Mock directions',
                    logoUrl: '/images/rbp-logo.jpg',
                    map: {
                        latitude: 30,
                        longitude: 100
                    },
                    name: 'Mock SWW'
                })

            });

        })


        await page.goto('/');
        //console.log(await page.locator('body').innerText());

        await expect(
            page.getByRole('heading', { name: 'Mock SWW', exact: true })
        ).toBeVisible();
    })

    test('should handle branding API failure', async ({ page }) => {

        await page.route('**/api/branding', async route => {
            console.log('Mocking branding API with 500');
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'Internal Server Error'
                }),
            });
        });

        await page.goto('/');
        const bodyText = await page.locator('body').innerText();

        // console.log('BODY START');
        // console.log(JSON.stringify(bodyText));
        // console.log('BODY END');
        await expect(
            page.getByText('This page couldn’t load')
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Reload' })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Back' })
        ).toBeVisible();

    });
})