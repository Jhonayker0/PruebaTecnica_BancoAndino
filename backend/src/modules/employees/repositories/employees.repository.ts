import { Employee, Prisma } from '@prisma/client';

export type EmployeeWithSites = Prisma.EmployeeGetPayload<{
  include: {
    employeeSites: {
      include: {
        site: true;
      };
    };
  };
}>;

export abstract class EmployeesRepository {
  abstract create(data: Prisma.EmployeeCreateInput): Promise<Employee>;
  abstract findMany(search?: string): Promise<EmployeeWithSites[]>;
  abstract findById(id: number): Promise<EmployeeWithSites | null>;
  abstract existsById(id: number): Promise<boolean>;
  abstract update(id: number, data: Prisma.EmployeeUpdateInput): Promise<Employee>;
}
