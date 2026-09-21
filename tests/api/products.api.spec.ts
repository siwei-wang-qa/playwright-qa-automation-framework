import { test, expect } from '@playwright/test';
import { apiProductData } from '../../test-data/apiProductData';

test.describe('Products API', () => {

    test('should return product details for a valid product ID', async ({ request }) => {

        const response = await request.get(
            `/products/${apiProductData.existingProductId}`
        );

        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();

        const body = await response.json();

        expect(body.id).toBe(apiProductData.existingProductId);
        expect(body.title).toBeTruthy();
        expect(typeof body.price).toBe('number');
        expect(body.price).toBeGreaterThanOrEqual(0);

    });

    test('should create a product with valid data', async ({ request }) => {

        const response = await request.post('/products/add',
            {
                data: {
                    title: apiProductData.newProduct.title,
                    price: apiProductData.newProduct.price,
                }
            })

        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();

        const body = await response.json();

        expect(body.title).toBe(apiProductData.newProduct.title);
        expect(body.price).toBe(apiProductData.newProduct.price);
        expect(body.id).toBeTruthy();


    });

    test('should return 404 for a non-existent product', async ({ request }) => {

        const response = await request.get(
            `/products/${apiProductData.nonExistentProductId}`
        )
        const body = await response.json();
        expect(response.status()).toBe(404);
        expect(response.ok()).toBeFalsy();
        expect(body.message).toContain('not found');

    });

    test('should update only the specified product field', async ({ request }) => {

        
        const response = await request.patch(`/products/${apiProductData.existingProductId}`,
            {
                data: { price: apiProductData.updateProduct.price }
            });

        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();
        expect(body.id).toBe(apiProductData.existingProductId);
        expect(body.price).toBe(apiProductData.updateProduct.price);
    });

    test('should delete a product successfully', async ({ request }) => {
        const response = await request.delete(`/products/${apiProductData.existingProductId}`);

        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();
        expect(body.isDeleted).toBe(true);
        expect(body.id).toBe(apiProductData.existingProductId);
    });

})