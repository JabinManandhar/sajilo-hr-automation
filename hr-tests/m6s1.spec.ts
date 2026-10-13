import { test, expect } from '@playwright/test';

test('employee can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('emp.ram');
  await page.getByLabel('Password').fill('Sajilo@123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Namaste, Ram Thapa')).toBeVisible();
  await expect(page.getByTestId('role-badge')).toHaveText('EMPLOYEE');
});


test.describe('Reusing a saved session', () => {
  test.use({ storageState: 'playwright/.auth/employee.json' });

  test('opens the dashboard without logging in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('role-badge')).toHaveText('EMPLOYEE');
  });
});