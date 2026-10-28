import type { Locator, Page } from '@playwright/test';

export class Select {
  readonly value: Locator;

  constructor(
    private readonly page: Page,
    group: Locator,
  ) {
    this.value = group.locator('.oxd-select-text-input');
  }

  async choose(option: string) {
    await this.value.click();
    await this.page.getByRole('listbox').getByRole('option', { name: option, exact: true }).click();
  }
}
