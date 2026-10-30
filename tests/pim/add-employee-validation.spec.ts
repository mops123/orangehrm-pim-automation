import { test, expect } from '@fixtures/test';
import type { Page } from '@playwright/test';
import { buildEmployee } from '@data/employee';

function trackCreateRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/v2/pim/employees')) {
      requests.push(request.url());
    }
  });
  return requests;
}

test.describe('Add Employee validation', () => {
  test.beforeEach(async ({ addEmployeePage }) => {
    await addEmployeePage.goto();
  });

  for (const [title, value] of [
    ['empty', ''],
    ['whitespace only', '   '],
  ]) {
    test(
      `requires first and last name (${title})`,
      { tag: '@regression' },
      async ({ page, addEmployeePage }) => {
        const createRequests = trackCreateRequests(page);

        await addEmployeePage.firstName.fill(value);
        await addEmployeePage.lastName.fill(value);
        await addEmployeePage.saveButton.click();

        await expect(addEmployeePage.fieldError(addEmployeePage.firstName)).toHaveText('Required');
        await expect(addEmployeePage.fieldError(addEmployeePage.lastName)).toHaveText('Required');
        await expect(addEmployeePage.fieldError(addEmployeePage.middleName)).toBeHidden();
        await expect(page).toHaveURL(/addEmployee/);
        expect(createRequests).toHaveLength(0);
      },
    );
  }

  test(
    'limits name and Employee Id length',
    { tag: '@regression' },
    async ({ page, addEmployeePage }) => {
      const createRequests = trackCreateRequests(page);

      await addEmployeePage.firstName.fill('a'.repeat(31));
      await addEmployeePage.middleName.fill('a'.repeat(31));
      await addEmployeePage.lastName.fill('a'.repeat(31));
      await addEmployeePage.employeeId.fill('1'.repeat(11));
      await addEmployeePage.saveButton.click();

      for (const field of [
        addEmployeePage.firstName,
        addEmployeePage.middleName,
        addEmployeePage.lastName,
      ]) {
        await expect(addEmployeePage.fieldError(field)).toHaveText(
          'Should not exceed 30 characters',
        );
      }
      await expect(addEmployeePage.fieldError(addEmployeePage.employeeId)).toHaveText(
        'Should not exceed 10 characters',
      );
      await expect(page).toHaveURL(/addEmployee/);
      expect(createRequests).toHaveLength(0);
    },
  );

  for (const [title, toId] of [
    ['same case', (id: string) => id],
    ['different case', (id: string) => id.toLowerCase()],
  ] as const) {
    test(
      `rejects a duplicate Employee Id (${title})`,
      { tag: '@regression' },
      async ({ page, createdEmployee, addEmployeePage }) => {
        const createRequests = trackCreateRequests(page);

        await addEmployeePage.fillForm(
          buildEmployee({ employeeId: toId(createdEmployee.employeeId) }),
        );
        await addEmployeePage.saveButton.click();

        await expect(addEmployeePage.fieldError(addEmployeePage.employeeId)).toHaveText(
          'Employee Id already exists',
        );
        await expect(page).toHaveURL(/addEmployee/);
        expect(createRequests).toHaveLength(0);
      },
    );
  }
});
