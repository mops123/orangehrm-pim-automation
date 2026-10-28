import type { Locator, Page } from '@playwright/test';

export class DataTable {
  readonly root: Locator;
  readonly rows: Locator;
  readonly recordsInfo: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('table');
    this.rows = this.root.locator('.oxd-table-body').getByRole('row');
    this.recordsInfo = page.locator('.orangehrm-horizontal-padding').getByText(/Records? Found/);
  }

  rowWith(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  async cell(row: Locator, column: string): Promise<Locator> {
    const columnHeaders = this.root.getByRole('columnheader');
    await columnHeaders.first().waitFor();
    const headers = await columnHeaders.allInnerTexts();
    const index = headers.map((h) => h.trim()).indexOf(column);
    if (index === -1) {
      throw new Error(`Column "${column}" not found in: ${JSON.stringify(headers)}`);
    }
    return row.getByRole('cell').nth(index);
  }

  deleteButton(row: Locator): Locator {
    return row.locator('button:has(.bi-trash)');
  }

  editButton(row: Locator): Locator {
    return row.locator('button:has(.bi-pencil-fill)');
  }
}
