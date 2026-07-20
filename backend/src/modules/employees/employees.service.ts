import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee
      .create({
        data: {
          employeeCode: createEmployeeDto.employeeCode,
          firstName: createEmployeeDto.firstName,
          middleName: createEmployeeDto.middleName,
          lastName: createEmployeeDto.lastName,
          secondLastName: createEmployeeDto.secondLastName,
          typeDoc: createEmployeeDto.typeDoc,
          documentNumber: createEmployeeDto.documentNumber,
          status: createEmployeeDto.status ?? Status.ACTIVE,
          email: createEmployeeDto.email,
          phone: createEmployeeDto.phone,
          biostarId: createEmployeeDto.biostarId,
          levelAccess: createEmployeeDto.levelAccess,
        },
      })
      .catch((error: unknown) => this.handlePrismaError(error));
  }

  findAll(search?: string) {
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

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeSites: {
          include: {
            site: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.ensureEmployeeExists(id);

    return this.prisma.employee
      .update({
        where: { id },
        data: {
          employeeCode: updateEmployeeDto.employeeCode,
          firstName: updateEmployeeDto.firstName,
          middleName: updateEmployeeDto.middleName,
          lastName: updateEmployeeDto.lastName,
          secondLastName: updateEmployeeDto.secondLastName,
          typeDoc: updateEmployeeDto.typeDoc,
          documentNumber: updateEmployeeDto.documentNumber,
          status: updateEmployeeDto.status,
          email: updateEmployeeDto.email,
          phone: updateEmployeeDto.phone,
          biostarId: updateEmployeeDto.biostarId,
          levelAccess: updateEmployeeDto.levelAccess,
        },
      })
      .catch((error: unknown) => this.handlePrismaError(error));
  }

  async changeStatus(id: number, changeEmployeeStatusDto: ChangeEmployeeStatusDto) {
    await this.ensureEmployeeExists(id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        status: changeEmployeeStatusDto.status,
      },
    });
  }

  private async ensureEmployeeExists(id: number): Promise<void> {
    const employee = await this.prisma.employee.findUnique({ where: { id }, select: { id: true } });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Employee already exists with the same unique value');
    }

    throw error instanceof Error ? error : new Error('Unexpected Prisma error');
  }
}
