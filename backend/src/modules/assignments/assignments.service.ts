import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DuplicateEntityError } from '../../common/exceptions/repository-exceptions';
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
      throw new NotFoundException(`Assignment with id ${id} not found`);
    }

    return this.assignmentsRepository.delete(id);
  }

  private handleRepositoryError(error: unknown): never {
    if (error instanceof DuplicateEntityError) {
      throw new ConflictException('Employee is already assigned to this site');
    }

    if (error instanceof Error && error.message === 'Employee or site not found') {
      throw new NotFoundException('Employee or site not found');
    }

    throw error instanceof Error ? error : new Error('Unexpected repository error');
  }
}
