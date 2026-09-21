import { test as setup, expect } from '@playwright/test';
import { env } from '../../config/env';

const authFile = 'playwright/.auth/user.json';


setup('authenticate', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Username').fill(
    env.username
  );

  await page.getByPlaceholder('Password').fill(
    env.password
  );

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(
    page.getByText('Products')
  ).toBeVisible();

  await page.context().storageState({
    path: authFile
  });
});