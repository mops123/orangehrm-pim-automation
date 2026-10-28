import type { Locator, Page } from '@playwright/test';

export class Sidebar {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('aside').getByRole('navigation');
  }

  async open(module: string) {
    await this.root.getByRole('link', { name: module, exact: true }).click();
  }
}
