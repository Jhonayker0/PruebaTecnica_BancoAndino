import { Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AccessLogWithRelations, AccessRepository } from './access.repository';

@Injectable()
export class PrismaAccessRepository implements AccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findEmployeeSiteByEmployeeAndSite(employeeId: number, siteId: number) {
    return this.prisma.employeeSite.findUnique({
      where: {
        employeeId_siteId: {
          employeeId,
          siteId,
        },
      },
      include: {
        employee: true,
        site: true,
      },
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

  findHistory(filters?: { employeeId?: number; siteId?: number; from?: Date; to?: Date }): Promise<AccessLogWithRelations[]> {
    return this.prisma.accessLog.findMany({
      where: {
        ...(filters?.employeeId || filters?.siteId || filters?.from || filters?.to
          ? {
              employeeSite: {
                ...(filters?.employeeId ? { employeeId: filters.employeeId } : {}),
                ...(filters?.siteId ? { siteId: filters.siteId } : {}),
              },
              ...(filters?.from || filters?.to
                ? {
                    occurredAt: {
                      ...(filters?.from ? { gte: filters.from } : {}),
                      ...(filters?.to ? { lte: filters.to } : {}),
                    },
                  }
                : {}),
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
