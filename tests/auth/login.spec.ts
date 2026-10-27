import { test, expect } from '@playwright/test';
import { env } from '@config/env';
import { LoginPage } from '@pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('admin can log in with valid credentials', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.login(env.admin.username, env.admin.password);

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows an error for a wrong password', { tag: '@regression' }, async ({ page }) => {
    await loginPage.login(env.admin.username, 'not-the-password');

    await expect(loginPage.error).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('requires username and password', { tag: '@regression' }, async () => {
    await loginPage.submit.click();

    await expect(loginPage.fieldError('Username')).toHaveText('Required');
    await expect(loginPage.fieldError('Password')).toHaveText('Required');
  });
});
