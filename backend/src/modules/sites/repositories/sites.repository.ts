import { Prisma, Site } from '@prisma/client';

export type SiteWithAssignments = Prisma.SiteGetPayload<{
  include: {
    employeeSites: true;
  };
}>;

export abstract class SitesRepository {
  abstract create(data: Prisma.SiteCreateInput): Promise<Site>;
  abstract findMany(search?: string): Promise<SiteWithAssignments[]>;
  abstract findById(id: number): Promise<SiteWithAssignments | null>;
  abstract existsById(id: number): Promise<boolean>;
  abstract update(id: number, data: Prisma.SiteUpdateInput): Promise<Site>;
}
