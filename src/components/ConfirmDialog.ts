import type { Locator, Page } from '@playwright/test';

export class ConfirmDialog {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
    this.title = this.root.locator('.oxd-text--card-title');
  }

  async confirmDelete() {
    await this.root.getByRole('button', { name: 'Yes, Delete' }).click();
  }

  async cancel() {
    await this.root.getByRole('button', { name: 'No, Cancel' }).click();
  }
}
