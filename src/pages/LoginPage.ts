import type { Locator, Page } from '@playwright/test';
import { inputGroup } from '@components/inputGroup';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    // labels aren't linked to inputs in OrangeHRM, so placeholders are the stable hook
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.error = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  fieldError(field: 'Username' | 'Password') {
    return inputGroup(this.page, field).locator('.oxd-input-field-error-message');
  }
}
