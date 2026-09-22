import { expect } from '@playwright/test';
import { bookerData } from '../../test-data/bookerData';
import { test } from '../../fixtures/testFixtures';

test.describe('Booking API + UI Integration', () => {
    test('should create a booking via API, verify it in Admin UI, and clean it up',
        {
            tag: ['@debug']
        },
        async ({ request, page, adminRoomPage }) => {

            let token: string | undefined;;
            let bookingRoomId: number | undefined;
            let checkin: string | undefined;
            let checkout: string | undefined;
            let bookingId: number | undefined;

            try {
                await test.step('Get an authorization token', async () => {
                    const response = await request.post('/api/auth/login', {
                        data: {
                            username: bookerData.loginUsername,
                            password: bookerData.loginPassword,
                        },
                    })
                    const loginBody = await response.json();

                    token = loginBody.token;
                    console.log(loginBody.token);
                })

                await test.step('API booking a room', async () => {
                    const bookingResponse = await request.post('/api/booking', {
                        headers: {
                            Cookie: `token=${token}`,
                        },
                        data: {
                            roomid: bookerData.roomId,
                            firstname: bookerData.booking.firstname,
                            lastname: bookerData.booking.lastname,
                            depositpaid: true,
                            email: bookerData.booking.email,
                            phone: bookerData.booking.phone,
                            bookingdates: {
                                checkin: bookerData.booking.checkin,
                                checkout: bookerData.booking.checkout,
                            },
                        }
                    })

                    const bookingResponseBody = await bookingResponse.json();

                    console.log(bookingResponseBody);
                    console.log(bookingResponse.status());
                    expect(bookingResponse.status()).toBe(201);
                    expect(bookingResponse.ok()).toBeTruthy();


                    bookingId = bookingResponseBody.bookingid;
                    bookingRoomId = bookingResponseBody.roomid;
                    checkin = bookingResponseBody.bookingdates.checkin;
                    checkout = bookingResponseBody.bookingdates.checkout;


                })

                await test.step('Verify the booking order on UI', async () => {
                    await page.context().addCookies([
                        {
                            name: 'token',
                            value: token,
                            domain: 'automationintesting.online',
                            path: '/',
                        },
                    ]);

                    await page.goto(`/admin/room/${bookingRoomId}`);

                    const bookingRow = adminRoomPage.getBookingRow(bookerData.booking.firstname,
                        bookerData.booking.lastname,
                        checkin,
                        checkout)
                    await expect(bookingRow).toBeVisible();
                })
            }

            finally {
                if (bookingId !== undefined && token !== undefined) {
                    await test.step('Delete the booking via API', async () => {
                        const deleteResponse = await request.delete(
                            `/api/booking/${bookingId}`,
                            {
                                headers: {
                                    Cookie: `token=${token}`,
                                },
                            }
                        );
                        expect(deleteResponse.status()).toBe(202);
                        expect(deleteResponse.ok()).toBeTruthy();
                    });
                }
            }
        })
})

