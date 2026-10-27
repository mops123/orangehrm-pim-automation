import { test as setup, expect } from '@playwright/test';
import { adminStorageState, env } from '@config/env';
import { LoginPage } from '@pages/LoginPage';

setup('log in as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.admin.username, env.admin.password);

  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: adminStorageState });
});
