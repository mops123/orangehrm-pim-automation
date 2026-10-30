import type { Locator, Page } from '@playwright/test';
import { inputGroup } from '@components/inputGroup';
import type { Employee } from '@data/employee';

export class AddEmployeePage {
  readonly firstName: Locator;
  readonly middleName: Locator;
  readonly lastName: Locator;
  readonly employeeId: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.employeeId = inputGroup(page, 'Employee Id').locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/addEmployee');
  }

  async fillForm(employee: Employee) {
    await this.firstName.fill(employee.firstName);
    await this.middleName.fill(employee.middleName);
    await this.lastName.fill(employee.lastName);
    await this.employeeId.fill(employee.employeeId);
  }

  async save(): Promise<number> {
    const created = this.page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().endsWith('/api/v2/pim/employees'),
    );
    await this.saveButton.click();
    const response = await created;
    const body: { data: { empNumber: number } } = await response.json();
    return body.data.empNumber;
  }

  fieldError(field: Locator): Locator {
    return field
      .locator('xpath=ancestor::div[contains(@class, "oxd-input-group")][1]')
      .locator('.oxd-input-field-error-message');
  }
}
