import { MovementType, Prisma } from '@prisma/client';

export type EmployeeSiteWithRelations = Prisma.EmployeeSiteGetPayload<{
  include: {
    employee: true;
    site: true;
  };
}>;

export type AccessLogWithRelations = Prisma.AccessLogGetPayload<{
  include: {
    employeeSite: {
      include: {
        employee: true;
        site: true;
      };
    };
  };
}>;

export abstract class AccessRepository {
  abstract findEmployeeSiteByEmployeeAndSite(employeeId: number, siteId: number): Promise<EmployeeSiteWithRelations | null>;
  abstract createMovement(employeeSiteId: number, movementType: MovementType): Promise<AccessLogWithRelations>;
  abstract findHistory(filters?: {
    employeeId?: number;
    siteId?: number;
    from?: Date;
    to?: Date;
  }): Promise<AccessLogWithRelations[]>;
  abstract findLatestMovements(): Promise<AccessLogWithRelations[]>;
}
