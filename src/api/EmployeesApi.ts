import type { APIRequestContext } from '@playwright/test';
import type { Employee } from '@data/employee';

const endpoint = '/web/index.php/api/v2/pim/employees';

export class EmployeesApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(employee: Employee): Promise<number> {
    const response = await this.request.post(endpoint, { data: employee });
    if (!response.ok()) {
      throw new Error(`Creating employee failed: ${response.status()} ${await response.text()}`);
    }
    const body: { data: { empNumber: number } } = await response.json();
    return body.data.empNumber;
  }

  async delete(empNumbers: number[]) {
    const response = await this.request.delete(endpoint, { data: { ids: empNumbers } });
    // 404 means none of them exist anymore, e.g. the test deleted the employee itself
    if (!response.ok() && response.status() !== 404) {
      throw new Error(`Deleting employees failed: ${response.status()} ${await response.text()}`);
    }
  }
}
