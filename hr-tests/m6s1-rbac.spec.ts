import { test, expect } from '../fixtures/auth';

test.describe('Role-based access', { tag: '@rbac' }, () => {
  test('employee sees their name and no Payroll link', async ({ employeePage }) => {
    await employeePage.goto('/dashboard');
    await expect(employeePage.getByText('Namaste, Ram Thapa')).toBeVisible();
    const nav = employeePage.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'My leave' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Payroll' })).toHaveCount(0);
  });

  test('admin can open Payroll', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await adminPage.getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Payroll' }).click();
    await expect(adminPage).toHaveURL('/payroll');
    await expect(adminPage.getByTestId('payroll-total')).toHaveText('Rs 6,30,000');
  });

  test('employee typing the Payroll URL is refused', async ({ employeePage }) => {
    await employeePage.goto('/payroll');
    await expect(employeePage.getByRole('heading', { name: 'Access denied' })).toBeVisible();
    await expect(employeePage.getByText('Your role (EMPLOYEE) cannot open Payroll.')).toBeVisible();
    await expect(employeePage.getByTestId('payroll-total')).toHaveCount(0);
  });
});