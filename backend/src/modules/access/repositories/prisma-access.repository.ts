import { Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AccessLogWithRelations, AccessRepository } from './access.repository';

@Injectable()
export class PrismaAccessRepository implements AccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findEmployeeSiteByEmployeeAndSite(employeeId: number, siteId: number): Promise<{ id: number } | null> {
    return this.prisma.employeeSite.findUnique({
      where: {
        employeeId_siteId: {
          employeeId,
          siteId,
        },
      },
      select: { id: true },
    });
  }

  async createMovement(employeeSiteId: number, movementType: MovementType): Promise<AccessLogWithRelations> {
    return this.prisma.accessLog.create({
      data: {
        employeeSiteId,
        movementType,
      },
      include: {
        employeeSite: {
          include: {
            employee: true,
            site: true,
          },
        },
      },
    });
  }

  findHistory(employeeId?: number, siteId?: number): Promise<AccessLogWithRelations[]> {
    return this.prisma.accessLog.findMany({
      where: {
        ...(employeeId || siteId
          ? {
              employeeSite: {
                ...(employeeId ? { employeeId } : {}),
                ...(siteId ? { siteId } : {}),
              },
            }
          : {}),
      },
      include: {
        employeeSite: {
          include: {
            employee: true,
            site: true,
          },
        },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  findLatestMovements(): Promise<AccessLogWithRelations[]> {
    return this.prisma.accessLog.findMany({
      distinct: ['employeeSiteId'],
      orderBy: [
        { employeeSiteId: 'asc' },
        { occurredAt: 'desc' },
      ],
      include: {
        employeeSite: {
          include: {
            employee: true,
            site: true,
          },
        },
      },
    });
  }
}
