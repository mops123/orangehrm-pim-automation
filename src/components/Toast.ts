import type { Locator, Page } from '@playwright/test';

export class Toast {
  readonly root: Locator;
  readonly title: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.root = page.locator('.oxd-toast');
    this.title = this.root.locator('.oxd-text--toast-title');
    this.message = this.root.locator('.oxd-text--toast-message');
  }
}
