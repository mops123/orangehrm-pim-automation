import type { Locator, Page } from '@playwright/test';
import { DataTable } from '@components/DataTable';
import { inputGroup } from '@components/inputGroup';

export class EmployeeListPage {
  readonly employeeName: Locator;
  readonly employeeId: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly table: DataTable;

  constructor(private readonly page: Page) {
    this.employeeName = inputGroup(page, 'Employee Name').locator('input');
    this.employeeId = inputGroup(page, 'Employee Id').locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.table = new DataTable(page);
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  async searchById(employeeId: string) {
    await this.employeeId.fill(employeeId);
    await this.search();
  }

  async searchByName(name: string) {
    await this.employeeName.fill(name);
    await this.search();
  }

  async reset() {
    await this.waitForList(() => this.resetButton.click());
  }

  async search() {
    await this.waitForList(() => this.searchButton.click());
  }

  async openEmployee(row: Locator) {
    await row.click();
    await this.page.waitForURL(/viewPersonalDetails/);
  }

  private async waitForList(action: () => Promise<void>) {
    const listLoaded = this.page.waitForResponse(
      (r) =>
        r.request().method() === 'GET' &&
        r.url().includes('/api/v2/pim/employees?') &&
        r.url().includes('model=detailed'),
    );
    await action();
    await listLoaded;
  }
}
