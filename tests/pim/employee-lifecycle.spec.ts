import { test, expect } from '@fixtures/test';
import { Toast } from '@components/Toast';
import { buildEmployee, buildPersonalDetails } from '@data/employee';
import { toUiDate } from '@pages/EmployeeDetailsPage';

test(
  'admin can create, find, edit and verify an employee',
  { tag: '@smoke' },
  async ({ page, addEmployeePage, employeeListPage, employeeDetailsPage, deleteAfterTest }) => {
    const employee = buildEmployee();
    const updated = buildEmployee({ employeeId: employee.employeeId });
    const details = buildPersonalDetails();
    const toast = new Toast(page);

    await test.step('create employee', async () => {
      await addEmployeePage.goto();
      await addEmployeePage.fillForm(employee);
      deleteAfterTest(await addEmployeePage.save());

      await expect(toast.message).toHaveText('Successfully Saved');
      await employeeDetailsPage.waitUntilLoaded();
      await expect(employeeDetailsPage.employeeId).toHaveValue(employee.employeeId);
    });

    await test.step('find employee by id', async () => {
      await employeeListPage.goto();
      await employeeListPage.searchById(employee.employeeId);

      const table = employeeListPage.table;
      await expect(table.rows).toHaveCount(1);
      const row = table.rowWith(employee.employeeId);
      await expect(await table.cell(row, 'First (& Middle) Name')).toHaveText(employee.firstName);
      await expect(await table.cell(row, 'Last Name')).toHaveText(employee.lastName);
    });

    await test.step('open employee details', async () => {
      await employeeListPage.openEmployee(employeeListPage.table.rowWith(employee.employeeId));
      await employeeDetailsPage.waitUntilLoaded();

      await expect(employeeDetailsPage.firstName).toHaveValue(employee.firstName);
      await expect(employeeDetailsPage.lastName).toHaveValue(employee.lastName);
    });

    await test.step('edit name and personal details', async () => {
      await employeeDetailsPage.fillName(updated.firstName, updated.lastName);
      await employeeDetailsPage.fillPersonalDetails(details);
      await employeeDetailsPage.save();

      await expect(toast.message).toHaveText('Successfully Updated');
    });

    await test.step('changes are saved after reload', async () => {
      await page.reload();
      await employeeDetailsPage.waitUntilLoaded();

      await expect(employeeDetailsPage.firstName).toHaveValue(updated.firstName);
      await expect(employeeDetailsPage.lastName).toHaveValue(updated.lastName);
      await expect(employeeDetailsPage.nationality.value).toHaveText(details.nationality);
      await expect(employeeDetailsPage.maritalStatus.value).toHaveText(details.maritalStatus);
      await expect(employeeDetailsPage.dateOfBirth).toHaveValue(toUiDate(details.dateOfBirth));
    });

    await test.step('updated name is shown in the employee list', async () => {
      await employeeListPage.goto();
      await employeeListPage.searchById(employee.employeeId);

      const row = employeeListPage.table.rowWith(employee.employeeId);
      await expect(await employeeListPage.table.cell(row, 'Last Name')).toHaveText(
        updated.lastName,
      );
    });
  },
);
