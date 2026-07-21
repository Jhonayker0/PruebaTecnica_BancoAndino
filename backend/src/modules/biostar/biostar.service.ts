import { BadRequestException, Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { SitesRepository } from '../sites/repositories/sites.repository';
import {
  BioStarAuthLoginRequest,
  BioStarAuthLogoutRequest,
  BioStarDoorPayload,
  BioStarSuccessResponse,
  BioStarSyncBucket,
  BioStarSyncItem,
  BioStarSyncReport,
  BioStarUserPayload,
} from './biostar.types';

@Injectable()
export class BiostarService {
  private readonly syncedUsers = new Set<string>();
  private readonly syncedDoors = new Set<string>();

  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly sitesRepository: SitesRepository,
  ) {}

  login(payload: BioStarAuthLoginRequest): BioStarSuccessResponse {
    this.ensureDocumentPasswordMatch(payload.documentNumber, payload.password);

    return {
      success: true,
      message: 'Success',
    };
  }

  logout(payload: BioStarAuthLogoutRequest): BioStarSuccessResponse {
    if (!payload.documentNumber.trim()) {
      throw new BadRequestException('El número de documento es obligatorio para el logout');
    }

    return {
      success: true,
      message: 'Success',
    };
  }

  createUser(payload: BioStarUserPayload): BioStarSuccessResponse {
    this.syncedUsers.add(this.buildUserKey(payload.documentNumber));
    return this.success(`Usuario ${payload.documentNumber} sincronizado en BioStar`);
  }

  updateUser(payload: BioStarUserPayload): BioStarSuccessResponse {
    this.syncedUsers.add(this.buildUserKey(payload.documentNumber));
    return this.success(`Usuario ${payload.documentNumber} actualizado en BioStar`);
  }

  createDoor(payload: BioStarDoorPayload): BioStarSuccessResponse {
    this.syncedDoors.add(this.buildDoorKey(payload.siteCode));
    return this.success(`Puerta ${payload.siteCode} sincronizada en BioStar`);
  }

  updateDoor(payload: BioStarDoorPayload): BioStarSuccessResponse {
    this.syncedDoors.add(this.buildDoorKey(payload.siteCode));
    return this.success(`Puerta ${payload.siteCode} actualizada en BioStar`);
  }

  async syncAll(): Promise<BioStarSyncReport> {
    const employees = await this.employeesRepository.findMany();
    const sites = await this.sitesRepository.findMany();

    const userBucket = this.createEmptyBucket();
    const doorBucket = this.createEmptyBucket();

    for (const employee of employees) {
      const payload: BioStarUserPayload = {
        employeeId: employee.id,
        documentNumber: employee.documentNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        status: employee.status,
      };

      const item = this.syncUser(payload);
      userBucket.items.push(item);
      if (item.operation === 'update') {
        userBucket.updated += 1;
      } else {
        userBucket.created += 1;
      }
    }

    for (const site of sites) {
      const payload: BioStarDoorPayload = {
        siteId: site.id,
        siteCode: site.siteCode,
        name: site.name,
        status: site.status,
      };

      const item = this.syncDoor(payload);
      doorBucket.items.push(item);
      if (item.operation === 'update') {
        doorBucket.updated += 1;
      } else {
        doorBucket.created += 1;
      }
    }

    return {
      success: true,
      message: `Sincronización completada: ${employees.length} usuarios y ${sites.length} puertas procesados`,
      users: userBucket,
      doors: doorBucket,
    };
  }

  private ensureDocumentPasswordMatch(documentNumber: string, password: string): void {
    if (!documentNumber.trim() || !password.trim()) {
      throw new BadRequestException('Usuario y contraseña son obligatorios');
    }

    if (documentNumber.trim() !== password.trim()) {
      throw new BadRequestException('Usuario o contraseña inválidos');
    }
  }

  private success(message: string): BioStarSuccessResponse {
    return {
      success: true,
      message: 'Success'.concat(message ? `: ${message}` : ''),
    };
  }

  private syncUser(payload: BioStarUserPayload): BioStarSyncItem {
    const key = this.buildUserKey(payload.documentNumber);
    const isUpdate = this.syncedUsers.has(key);

    if (isUpdate) {
      this.updateUser(payload);
    } else {
      this.createUser(payload);
    }

    return {
      operation: isUpdate ? 'update' : 'create',
      identifier: payload.documentNumber,
      label: `${payload.firstName} ${payload.lastName}`,
      message: isUpdate
        ? `Usuario ${payload.documentNumber} actualizado en BioStar`
        : `Usuario ${payload.documentNumber} sincronizado en BioStar`,
    };
  }

  private syncDoor(payload: BioStarDoorPayload): BioStarSyncItem {
    const key = this.buildDoorKey(payload.siteCode);
    const isUpdate = this.syncedDoors.has(key);

    if (isUpdate) {
      this.updateDoor(payload);
    } else {
      this.createDoor(payload);
    }

    return {
      operation: isUpdate ? 'update' : 'create',
      identifier: payload.siteCode,
      label: payload.name,
      message: isUpdate
        ? `Puerta ${payload.siteCode} actualizada en BioStar`
        : `Puerta ${payload.siteCode} sincronizada en BioStar`,
    };
  }

  private createEmptyBucket(): BioStarSyncBucket {
    return {
      created: 0,
      updated: 0,
      items: [],
    };
  }

  private buildUserKey(documentNumber: string): string {
    return documentNumber.trim();
  }

  private buildDoorKey(siteCode: string): string {
    return siteCode.trim();
  }
}
