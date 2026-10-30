import { test, expect } from '@fixtures/test';
import { Toast } from '@components/Toast';
import { buildEmployee, uniqueEmployeeId } from '@data/employee';

test.describe('Search employees', () => {
  test.beforeEach(async ({ employeeListPage }) => {
    await employeeListPage.goto();
  });

  test(
    'shows no records for an unknown Employee Id',
    { tag: '@regression' },
    async ({ page, employeeListPage }) => {
      await employeeListPage.searchById(uniqueEmployeeId());

      await expect(new Toast(page).message).toHaveText('No Records Found');
      await expect(employeeListPage.table.recordsInfo).toHaveText('No Records Found');
      await expect(employeeListPage.table.rows).toHaveCount(0);
    },
  );

  test(
    'shows no records for an unknown name',
    { tag: '@regression' },
    async ({ page, employeeListPage }) => {
      await employeeListPage.searchByName(buildEmployee().lastName);

      await expect(new Toast(page).message).toHaveText('No Records Found');
      await expect(employeeListPage.table.recordsInfo).toHaveText('No Records Found');
      await expect(employeeListPage.table.rows).toHaveCount(0);
    },
  );

  test(
    'reset clears the filters and shows all employees',
    { tag: '@regression' },
    async ({ createdEmployee, employeeListPage }) => {
      const table = employeeListPage.table;

      await employeeListPage.searchByName(createdEmployee.lastName);
      await expect(table.rows).toHaveCount(1);
      await expect(table.rowWith(createdEmployee.employeeId)).toHaveCount(1);

      await employeeListPage.reset();

      await expect(employeeListPage.employeeName).toHaveValue('');
      await expect(employeeListPage.employeeId).toHaveValue('');
      await expect(table.recordsInfo).toHaveText(/\(\d+\) Records Found/);
      await expect.poll(() => table.rows.count()).toBeGreaterThan(1);
    },
  );
});
