import { test, expect } from '@playwright/test';
import { apiAuthData } from '../../test-data/apiAuthData';

test.describe('Authentication API', () => {

    test('should authenticate a valid user and access protected user data', async ({ request }) => {

        const loginResponse = await request.post('/auth/login', {
            data: {
                username: apiAuthData.validUser.username,
                password: apiAuthData.validUser.password,
            },
        });

        expect(loginResponse.status()).toBe(200);
        expect(loginResponse.ok()).toBeTruthy();

        const loginBody = await loginResponse.json();

        expect(loginBody.username).toBe(apiAuthData.validUser.username);
        expect(loginBody.accessToken).toBeTruthy();

        const accessToken = loginBody.accessToken;

        const userResponse = await request.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        expect(userResponse.status()).toBe(200);
        expect(userResponse.ok()).toBeTruthy();

        const userBody = await userResponse.json();

        expect(userBody.id).toBe(loginBody.id);
        expect(userBody.username).toBe(apiAuthData.validUser.username);
        expect(userBody.email).toBeTruthy();
    });

    test('should reject login with invalid credentials', async ({ request }) => {

        const response = await request.post('/auth/login', {
            data: {
                username: apiAuthData.invalidUser.username,
                password: apiAuthData.invalidUser.password,
            },
        });

        expect(response.ok()).toBeFalsy();

        const body = await response.json();

        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(body.message).toBeTruthy();
    });

    test('should reject login without a password', async ({ request }) => {


        const response = await request.post('/auth/login', {
            data: {
                username: apiAuthData.validUser.username,
            },
        });

        const body = await response.json();
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        expect(body.message).toBe("Username and password required");
    });

    test('should reject access with an invalid token', { tag: ['@debug'] }, async ({ request }) => {

        const response = await request.post('/auth/login', {
            data: {
                username: apiAuthData.validUser.username,
                password: apiAuthData.validUser.password,
            },
        })
        const body = await response.json();

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        expect(body.accessToken).toBeTruthy();

        const accessToken = body.accessToken;
        const invalidToken = `${accessToken}11111`;
        const userResponse = await request.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${invalidToken}`,
            },
        });

        const userBody = await userResponse.json();
        expect(userResponse.ok()).toBeFalsy();
        expect(userResponse.status()).toBe(500);

        expect(userBody.message).toBe("invalid signature");

    })
});