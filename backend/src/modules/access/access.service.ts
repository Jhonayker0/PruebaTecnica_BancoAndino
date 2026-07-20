import { Injectable, NotFoundException } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { AccessRepository, AccessLogWithRelations } from './repositories/access.repository';
import { RegisterAccessDto } from './dto/register-access.dto';

@Injectable()
export class AccessService {
  constructor(private readonly accessRepository: AccessRepository) {}

  registerEntry(registerAccessDto: RegisterAccessDto) {
    return this.registerMovement(registerAccessDto, MovementType.ENTRY);
  }

  registerExit(registerAccessDto: RegisterAccessDto) {
    return this.registerMovement(registerAccessDto, MovementType.EXIT);
  }

  async findHistory(employeeId?: number, siteId?: number) {
    const accessLogs = await this.accessRepository.findHistory(employeeId, siteId);

    return accessLogs.map((log) => ({
      id: log.id,
      movementType: log.movementType,
      occurredAt: log.occurredAt,
      employeeSite: log.employeeSite,
      employee: log.employeeSite.employee,
      site: log.employeeSite.site,
    }));
  }

  async getCurrentOccupancy() {
    const latestMovements = await this.getLatestMovements();
    const activeMovements = latestMovements.filter((movement) => movement.movementType === MovementType.ENTRY);

    const groupedBySite = activeMovements.reduce<Map<number, OccupancyGroup>>(
      (accumulator, movement) => {
        const current: OccupancyGroup = accumulator.get(movement.siteId) ?? {
          site: movement.site,
          employees: [] as AccessState[],
        };

        current.employees.push(movement);
        accumulator.set(movement.siteId, current);
        return accumulator;
      },
      new Map(),
    );

    return Array.from(groupedBySite.values()).map((group) => ({
      site: group.site,
      totalEmployees: group.employees.length,
      employees: group.employees.map((employeeMovement) => ({
        employeeId: employeeMovement.employeeId,
        employeeSiteId: employeeMovement.employeeSiteId,
        employee: employeeMovement.employee,
        enteredAt: employeeMovement.occurredAt,
      })),
    }));
  }

  async findEmployeesWithoutExit() {
    const latestMovements = await this.getLatestMovements();

    return latestMovements
      .filter((movement) => movement.movementType === MovementType.ENTRY)
      .map((movement) => ({
        employeeId: movement.employeeId,
        employeeSiteId: movement.employeeSiteId,
        site: movement.site,
        employee: movement.employee,
        enteredAt: movement.occurredAt,
      }));
  }

  private async registerMovement(registerAccessDto: RegisterAccessDto, movementType: MovementType) {
    const employeeSite = await this.accessRepository.findEmployeeSiteByEmployeeAndSite(
      registerAccessDto.employeeId,
      registerAccessDto.siteId,
    );

    if (!employeeSite) {
      throw new NotFoundException('Employee is not assigned to the selected site');
    }

    return this.accessRepository.createMovement(employeeSite.id, movementType);
  }

  private async getLatestMovements(): Promise<AccessState[]> {
    const latestLogs = await this.accessRepository.findLatestMovements();

    return latestLogs.map((log) => ({
      employeeSiteId: log.employeeSiteId,
      employeeId: log.employeeSite.employeeId,
      siteId: log.employeeSite.siteId,
      movementType: log.movementType,
      occurredAt: log.occurredAt,
      employee: {
        id: log.employeeSite.employee.id,
        employeeCode: log.employeeSite.employee.employeeCode,
        firstName: log.employeeSite.employee.firstName,
        lastName: log.employeeSite.employee.lastName,
        documentNumber: log.employeeSite.employee.documentNumber,
        status: log.employeeSite.employee.status,
        levelAccess: log.employeeSite.employee.levelAccess,
      },
      site: {
        id: log.employeeSite.site.id,
        siteCode: log.employeeSite.site.siteCode,
        name: log.employeeSite.site.name,
        city: log.employeeSite.site.city,
        country: log.employeeSite.site.country,
        status: log.employeeSite.site.status,
      },
    }));
  }
}

type AccessState = {
  employeeSiteId: number;
  employeeId: number;
  siteId: number;
  movementType: MovementType;
  occurredAt: Date;
  employee: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    status: string;
    levelAccess: string;
  };
  site: {
    id: number;
    siteCode: string;
    name: string;
    city: string;
    country: string;
    status: string;
  };
};

type OccupancyGroup = {
  site: AccessState['site'];
  employees: AccessState[];
};
