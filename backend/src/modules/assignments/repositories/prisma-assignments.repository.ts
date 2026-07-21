import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DuplicateEntityError } from '../../../common/exceptions/repository-exceptions';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignmentWithRelations, AssignmentsRepository } from './assignments.repository';

@Injectable()
export class PrismaAssignmentsRepository implements AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(employeeId: number, siteId: number): Promise<AssignmentWithRelations> {
    try {
      return await this.prisma.employeeSite.create({
        data: { employeeId, siteId },
        include: {
          employee: true,
          site: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'El empleado ya está asignado a esa sede');
    }
  }

  findSitesByEmployee(employeeId: number): Promise<AssignmentWithRelations[]> {
    return this.prisma.employeeSite.findMany({
      where: { employeeId },
      include: {
        employee: true,
        site: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findEmployeesBySite(siteId: number): Promise<AssignmentWithRelations[]> {
    return this.prisma.employeeSite.findMany({
      where: { siteId },
      include: {
        employee: true,
        site: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number): Promise<AssignmentWithRelations | null> {
    return this.prisma.employeeSite.findUnique({
      where: { id },
      include: {
        employee: true,
        site: true,
      },
    });
  }

  findByEmployeeIdAndSiteId(employeeId: number, siteId: number): Promise<AssignmentWithRelations | null> {
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

  async delete(id: number): Promise<void> {
    await this.prisma.employeeSite.delete({ where: { id } });
  }

  private handlePrismaError(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new DuplicateEntityError(message);
      }

      if (error.code === 'P2025') {
        throw new Error('Empleado o sede no encontrado para la asignación');
      }
    }

    throw error instanceof Error ? error : new Error('Error no esperado de Prisma');
  }
}
