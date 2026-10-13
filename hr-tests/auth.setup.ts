import { test as setup, expect } from '@playwright/test';

const users = [
  { username: 'admin.anil', role: 'ADMIN' },
  { username: 'hr.sita', role: 'HR' },
  { username: 'emp.ram', role: 'EMPLOYEE' },
];

for (const user of users) {
  setup(`log in as ${user.role}`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Password').fill('Sajilo@123');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Wait for proof of login BEFORE saving, or you save an empty session
    await expect(page.getByTestId('role-badge')).toHaveText(user.role);

    await page.context().storageState({
      path: `playwright/.auth/${user.role.toLowerCase()}.json`,
    });
  });
}