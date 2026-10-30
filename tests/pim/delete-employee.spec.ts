import { test, expect } from '@fixtures/test';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Toast } from '@components/Toast';

test.describe('Delete employee', () => {
  test.beforeEach(async ({ createdEmployee, employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchById(createdEmployee.employeeId);
  });

  test(
    'admin can delete an employee',
    { tag: '@regression' },
    async ({ page, createdEmployee, employeeListPage }) => {
      const table = employeeListPage.table;
      const dialog = new ConfirmDialog(page);

      await table.deleteButton(table.rowWith(createdEmployee.employeeId)).click();
      await expect(dialog.title).toHaveText('Are you Sure?');
      await dialog.confirmDelete();

      await expect(new Toast(page).message).toHaveText('Successfully Deleted');
      await expect(table.rows).toHaveCount(0);

      await employeeListPage.goto();
      await employeeListPage.searchById(createdEmployee.employeeId);
      await expect(table.recordsInfo).toHaveText('No Records Found');
      await expect(table.rows).toHaveCount(0);
    },
  );

  test(
    'cancelling deletion keeps the employee',
    { tag: '@regression' },
    async ({ page, createdEmployee, employeeListPage }) => {
      const table = employeeListPage.table;
      const dialog = new ConfirmDialog(page);

      await table.deleteButton(table.rowWith(createdEmployee.employeeId)).click();
      await dialog.cancel();

      await expect(dialog.root).toBeHidden();
      await expect(table.rowWith(createdEmployee.employeeId)).toHaveCount(1);

      await employeeListPage.goto();
      await employeeListPage.searchById(createdEmployee.employeeId);
      await expect(table.rowWith(createdEmployee.employeeId)).toHaveCount(1);
    },
  );
});
