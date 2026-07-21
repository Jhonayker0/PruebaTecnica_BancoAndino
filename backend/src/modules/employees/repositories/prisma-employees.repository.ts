import { Injectable } from '@nestjs/common';
import { Employee, Prisma, TypeDoc } from '@prisma/client';
import { DuplicateEntityError } from '../../../common/exceptions/repository-exceptions';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmployeeWithSites, EmployeesRepository } from './employees.repository';

@Injectable()
export class PrismaEmployeesRepository implements EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    try {
      return await this.prisma.employee.create({ data });
    } catch (error) {
      this.handlePrismaError(error, 'El empleado ya existe con un valor único repetido');
    }
  }

  async findMany(search?: string): Promise<EmployeeWithSites[]> {
    return this.prisma.employee.findMany({
      where: search
        ? {
            OR: [
              { employeeCode: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { documentNumber: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { id: 'desc' },
      include: {
        employeeSites: {
          include: {
            site: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<EmployeeWithSites | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeSites: {
          include: {
            site: true,
          },
        },
      },
    });
  }

  async findByEmployeeCode(employeeCode: string): Promise<EmployeeWithSites | null> {
    return this.prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        employeeSites: {
          include: {
            site: true,
          },
        },
      },
    });
  }

  async findByTypeDocAndDocumentNumber(typeDoc: TypeDoc, documentNumber: string): Promise<EmployeeWithSites | null> {
    return this.prisma.employee.findUnique({
      where: {
        typeDoc_documentNumber: {
          typeDoc,
          documentNumber,
        },
      },
      include: {
        employeeSites: {
          include: {
            site: true,
          },
        },
      },
    });
  }

  async existsById(id: number): Promise<boolean> {
    const employee = await this.prisma.employee.findUnique({ where: { id }, select: { id: true } });
    return Boolean(employee);
  }

  async update(id: number, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, 'El empleado ya existe con un valor único repetido');
    }
  }

  private handlePrismaError(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateEntityError(message);
    }

    throw error instanceof Error ? error : new Error('Error no esperado de Prisma');
  }
}
