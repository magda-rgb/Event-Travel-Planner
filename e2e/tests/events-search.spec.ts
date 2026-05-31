import { test, expect } from '@playwright/test';

test('wyszukiwanie wydarzeń po mieście i przejście do szczegółów', async ({ page }) => {
  test.skip(!process.env.TICKETMASTER_API_KEY, 'Ustaw $env:TICKETMASTER_API_KEY w PowerShell przed npm run e2e');

  await page.goto('/');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByRole('button', { name: 'Szukaj' }).click();

  await expect(page).toHaveURL(/\/search\?.*city=Warszawa/);
  await expect(page.getByText('Ładowanie wydarzeń…')).toHaveCount(0, { timeout: 30_000 });

  const errorText = page.getByText(/Nie można teraz załadować|Brak wydarzeń pasujących/);
  if (await errorText.isVisible()) {
    throw new Error(`Brak wyników wyszukiwania: ${await errorText.textContent()}`);
  }

  await expect(page.getByRole('button', { name: 'Zobacz szczegóły' }).first()).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole('button', { name: 'Zobacz szczegóły' }).first().click();
  await expect(page).toHaveURL(/\/event\//);
});
