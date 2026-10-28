import type { Locator, Page } from '@playwright/test';

export function inputGroup(scope: Page | Locator, label: string): Locator {
  const page = 'goto' in scope ? scope : scope.page();
  return scope
    .locator('.oxd-input-group')
    .filter({ has: page.locator('label').getByText(label, { exact: true }) });
}
