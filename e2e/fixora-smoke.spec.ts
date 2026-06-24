import { expect, test } from '@playwright/test';

test.describe('Fixora public flows', () => {
	test('homepage loads with hero search', async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expect(page.getByPlaceholder(/what needs fixing/i)).toBeVisible({ timeout: 60_000 });
	});

	test('search page loads', async ({ page }) => {
		await page.goto('/search', { waitUntil: 'domcontentloaded' });
		await expect(page.getByPlaceholder(/what's wrong with your device/i)).toBeVisible({ timeout: 60_000 });
	});

	test('login page loads', async ({ page }) => {
		await page.goto('/login', { waitUntil: 'domcontentloaded' });
		await expect(page.locator('input[type="email"], input[name="userEmail"]').first()).toBeVisible({
			timeout: 60_000,
		});
	});
});
