import { test as base } from '@playwright/test';
import { EmployeesApi } from '@api/EmployeesApi';
import { buildEmployee, type Employee } from '@data/employee';
import { AddEmployeePage } from '@pages/AddEmployeePage';
import { EmployeeDetailsPage } from '@pages/EmployeeDetailsPage';
import { EmployeeListPage } from '@pages/EmployeeListPage';

export type CreatedEmployee = Employee & { empNumber: number };

type PimFixtures = {
  addEmployeePage: AddEmployeePage;
  employeeListPage: EmployeeListPage;
  employeeDetailsPage: EmployeeDetailsPage;
  deleteAfterTest: (empNumber: number) => void;
  createdEmployee: CreatedEmployee;
};

export const test = base.extend<PimFixtures>({
  addEmployeePage: async ({ page }, use) => {
    await use(new AddEmployeePage(page));
  },
  employeeListPage: async ({ page }, use) => {
    await use(new EmployeeListPage(page));
  },
  employeeDetailsPage: async ({ page }, use) => {
    await use(new EmployeeDetailsPage(page));
  },
  deleteAfterTest: async ({ page }, use) => {
    const empNumbers: number[] = [];
    await use((empNumber) => {
      empNumbers.push(empNumber);
    });
    if (empNumbers.length > 0) {
      await new EmployeesApi(page.request).delete(empNumbers);
    }
  },
  createdEmployee: async ({ page, deleteAfterTest }, use) => {
    const employee = buildEmployee();
    const empNumber = await new EmployeesApi(page.request).create(employee);
    deleteAfterTest(empNumber);
    await use({ ...employee, empNumber });
  },
});

export { expect } from '@playwright/test';
