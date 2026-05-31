import { test, expect } from '@playwright/test';

test('rejestracja, logowanie i wejście na /user', async ({ page }) => {
  const user = `e2e_${Date.now()}`;
  const password = 'pass1234';

  await page.goto('/');

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Rejestracja' }).click();
  await page.locator('#reg-username').fill(user);
  await page.locator('#reg-fullname').fill('Test E2E');
  await page.locator('#reg-password').fill(password);
  await page.locator('#reg-email').fill(`${user}@example.com`);
  await page.getByRole('button', { name: 'Zarejestruj się' }).click();
  await expect(page).toHaveURL('/');

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Logowanie' }).click();
  await page.locator('#login-username').fill(user);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.locator('.login-name b')).toHaveText(user);

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Moje dane' }).click();
  await expect(page).toHaveURL('/user');
  await expect(page.getByText(user, { exact: true }).first()).toBeVisible();
});
