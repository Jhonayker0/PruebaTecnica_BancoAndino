import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DuplicateEntityError, RestrictedEntityError } from '../../common/exceptions/repository-exceptions';
import { AssignmentsRepository } from './repositories/assignments.repository';
import { AssignEmployeeToSiteDto } from './dto/assign-employee-to-site.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly assignmentsRepository: AssignmentsRepository) {}

  async assignEmployeeToSite(assignEmployeeToSiteDto: AssignEmployeeToSiteDto) {
    try {
      return await this.assignmentsRepository.create(assignEmployeeToSiteDto.employeeId, assignEmployeeToSiteDto.siteId);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  findSitesByEmployee(employeeId: number) {
    return this.assignmentsRepository.findSitesByEmployee(employeeId);
  }

  findEmployeesBySite(siteId: number) {
    return this.assignmentsRepository.findEmployeesBySite(siteId);
  }

  async removeAssignment(id: number) {
    const assignment = await this.assignmentsRepository.findById(id);

    if (!assignment) {
      throw new NotFoundException(`Asignacion con id: ${id} no encontrada`);
    }

    try {
      return await this.assignmentsRepository.delete(id);
    } catch (error) {
      if (error instanceof RestrictedEntityError) {
        throw new ConflictException(error.message);
      }

      throw error instanceof Error ? error : new Error('Error inesperado al eliminar la asignación');
    }
  }

  private handleRepositoryError(error: unknown): never {
    if (error instanceof DuplicateEntityError) {
      throw new ConflictException('Empleado ya asignado a la sede');
    }

    if (error instanceof Error && error.message === 'Empleado o sede no encontrado') {
      throw new NotFoundException('Empleado o sede no encontrado');
    }

    throw error instanceof Error ? error : new Error('Error inesperado al procesar la asignación');
  }
}
