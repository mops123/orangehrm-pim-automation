import { expect, type Locator, type Page } from '@playwright/test';
import { inputGroup } from '@components/inputGroup';
import { Select } from '@components/Select';
import type { PersonalDetails } from '@data/employee';

export function toUiDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${year}-${day}-${month}`;
}

export class EmployeeDetailsPage {
  readonly form: Locator;
  readonly firstName: Locator;
  readonly middleName: Locator;
  readonly lastName: Locator;
  readonly employeeId: Locator;
  readonly nationality: Select;
  readonly maritalStatus: Select;
  readonly dateOfBirth: Locator;
  readonly saveButton: Locator;
  private readonly loader: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form').filter({ has: page.getByPlaceholder('First Name') });
    this.firstName = this.form.getByPlaceholder('First Name');
    this.middleName = this.form.getByPlaceholder('Middle Name');
    this.lastName = this.form.getByPlaceholder('Last Name');
    this.employeeId = inputGroup(this.form, 'Employee Id').locator('input');
    this.nationality = new Select(page, inputGroup(this.form, 'Nationality'));
    this.maritalStatus = new Select(page, inputGroup(this.form, 'Marital Status'));
    this.dateOfBirth = inputGroup(this.form, 'Date of Birth').locator('input');
    this.saveButton = this.form.getByRole('button', { name: 'Save' });
    this.loader = page.locator('.oxd-form-loader');
  }

  async goto(empNumber: number) {
    await this.page.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`);
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded() {
    await this.page.waitForURL(/viewPersonalDetails/);
    // the form renders empty first and the loader shows up only after a short delay
    await expect(this.firstName).not.toHaveValue('');
    await expect(this.loader).toHaveCount(0);
  }

  async fillName(firstName: string, lastName: string) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
  }

  async fillPersonalDetails(details: PersonalDetails) {
    await this.nationality.choose(details.nationality);
    await this.maritalStatus.choose(details.maritalStatus);
    await this.dateOfBirth.fill(toUiDate(details.dateOfBirth));
  }

  async save() {
    const saved = this.page.waitForResponse(
      (r) => r.request().method() === 'PUT' && r.url().endsWith('/personal-details'),
    );
    await this.saveButton.click();
    await saved;
  }
}
