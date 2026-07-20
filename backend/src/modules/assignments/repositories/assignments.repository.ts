import { Prisma } from '@prisma/client';

export type AssignmentWithRelations = Prisma.EmployeeSiteGetPayload<{
  include: {
    employee: true;
    site: true;
  };
}>;

export abstract class AssignmentsRepository {
  abstract create(employeeId: number, siteId: number): Promise<AssignmentWithRelations>;
  abstract findSitesByEmployee(employeeId: number): Promise<AssignmentWithRelations[]>;
  abstract findEmployeesBySite(siteId: number): Promise<AssignmentWithRelations[]>;
  abstract findById(id: number): Promise<AssignmentWithRelations | null>;
  abstract delete(id: number): Promise<void>;
}
