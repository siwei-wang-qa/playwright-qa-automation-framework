import { test as setup, expect } from '@playwright/test';
import { users } from '../test-data/users';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.getByPlaceholder('Username').fill(
    users.validUser.username
  );

  await page.getByPlaceholder('Password').fill(
    users.validUser.password
  );

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(
    page.getByText('Products')
  ).toBeVisible();

  await page.context().storageState({
    path: authFile
  });
});