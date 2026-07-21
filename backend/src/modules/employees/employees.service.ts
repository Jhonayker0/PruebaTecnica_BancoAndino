import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DuplicateEntityError } from '../../common/exceptions/repository-exceptions';
import { EmployeesRepository } from './repositories/employees.repository';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      return await this.employeesRepository.create({
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
      });
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  findAll(search?: string) {
    return this.employeesRepository.findMany(search);
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findById(id);

    if (!employee) {
      throw new NotFoundException(`Empleado con id ${id} no encontrado`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.ensureEmployeeExists(id);

    try {
      return await this.employeesRepository.update(id, {
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
      });
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  async changeStatus(id: number, changeEmployeeStatusDto: ChangeEmployeeStatusDto) {
    await this.ensureEmployeeExists(id);

    return this.employeesRepository.update(id, {
      status: changeEmployeeStatusDto.status,
    });
  }

  private async ensureEmployeeExists(id: number): Promise<void> {
    const employeeExists = await this.employeesRepository.existsById(id);

    if (!employeeExists) {
      throw new NotFoundException(`Empleado con id ${id} no encontrado`);
    }
  }

  private handleRepositoryError(error: unknown): never {
    if (error instanceof DuplicateEntityError) {
      throw new ConflictException('El empleado ya existe con el mismo valor único');
    }

    throw error instanceof Error ? error : new Error('Error inesperado en el repositorio de empleados');
  }
}
