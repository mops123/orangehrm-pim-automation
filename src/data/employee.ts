import { faker } from '@faker-js/faker';

export type Employee = {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
};

export type PersonalDetails = {
  nationality: string;
  maritalStatus: string;
  dateOfBirth: string;
};

const NAME_MAX_LENGTH = 30;

export const nationalities = ['Canadian', 'German', 'Irish', 'Polish', 'Ukrainian'];
export const maritalStatuses = ['Single', 'Married', 'Other'];

export function uniqueEmployeeId(): string {
  return `QA${faker.string.numeric(8)}`;
}

export function buildEmployee(overrides: Partial<Employee> = {}): Employee {
  const lastName = `${faker.person.lastName()}${faker.string.alpha({ length: 5, casing: 'lower' })}`;

  return {
    firstName: faker.person.firstName(),
    middleName: '',
    lastName: lastName.slice(0, NAME_MAX_LENGTH),
    employeeId: uniqueEmployeeId(),
    ...overrides,
  };
}

export function buildPersonalDetails(overrides: Partial<PersonalDetails> = {}): PersonalDetails {
  const birthDate = faker.date.birthdate({ mode: 'age', min: 20, max: 60 });

  return {
    nationality: faker.helpers.arrayElement(nationalities),
    maritalStatus: faker.helpers.arrayElement(maritalStatuses),
    dateOfBirth: birthDate.toISOString().slice(0, 10),
    ...overrides,
  };
}

export function fullName(employee: Employee): string {
  return [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ');
}
