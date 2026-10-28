import type { Locator, Page } from '@playwright/test';

export class Autocomplete {
  readonly input: Locator;

  constructor(
    private readonly page: Page,
    group: Locator,
  ) {
    this.input = group.locator('input');
  }

  async choose(text: string, option = text) {
    await this.input.fill(text);
    // the list first shows a "Searching...." placeholder option, so wait for the real one
    await this.page.getByRole('listbox').getByRole('option', { name: option }).first().click();
  }
}
