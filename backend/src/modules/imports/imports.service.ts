import { BadRequestException, Injectable } from '@nestjs/common';
import { LevelAccess, Status, TypeDoc } from '@prisma/client';
import * as XLSX from 'xlsx';
import { AssignmentsRepository } from '../assignments/repositories/assignments.repository';
import { EmployeeWithSites, EmployeesRepository } from '../employees/repositories/employees.repository';
import { SiteWithAssignments as SiteRecord, SitesRepository } from '../sites/repositories/sites.repository';
import { DuplicateEntityError } from '../../common/exceptions/repository-exceptions';

interface UploadedExcelFile {
  originalname: string;
  buffer: Buffer;
}

interface ImportLogItem {
  row: number;
  identifier: string;
  detail: string;
}

interface ImportRejectItem {
  row: number;
  identifier: string;
  reason: string;
}

interface ImportSummary {
  created: ImportLogItem[];
  updated: ImportLogItem[];
  skipped: ImportLogItem[];
  rejected: ImportRejectItem[];
}

export interface ImportResult {
  sites: ImportSummary;
  employees: ImportSummary;
  assignments: ImportSummary;
}

interface SheetRow {
  rowNumber: number;
  values: Record<string, string>;
}

interface SiteInput {
  siteCode: string;
  name: string;
  city: string;
  country: string;
  address: string;
  status: Status;
}

interface EmployeeInput {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  typeDoc: TypeDoc;
  documentNumber: string;
  status: Status;
  email?: string;
  phone?: string;
  biostarId: string;
  levelAccess: LevelAccess;
}

const REQUIRED_SITE_FIELDS = ['codigo_sede', 'nombre_sede', 'ciudad', 'pais', 'direccion'] as const;
const REQUIRED_EMPLOYEE_FIELDS = [
  'codigo_empleado',
  'primer_nombre',
  'primer_apellido',
  'tipo_doc',
  'numero_documento',
  'estado',
  'id_biostar',
  'nivel_acceso',
] as const;

@Injectable()
export class ImportsService {
  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly sitesRepository: SitesRepository,
    private readonly assignmentsRepository: AssignmentsRepository,
  ) {}

  async importExcel(file: UploadedExcelFile): Promise<ImportResult> {
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('El archivo debe ser .xlsx');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
    const siteSheetName = this.findSheet(workbook, ['sede', 'sedes']);
    const employeeSheetName = this.findSheet(workbook, ['empleado', 'empleados']);

    if (!siteSheetName) {
      throw new BadRequestException('No se encontró la hoja Sede o Sedes');
    }

    if (!employeeSheetName) {
      throw new BadRequestException('No se encontró la hoja Empleados');
    }

    const result: ImportResult = {
      sites: this.createEmptySummary(),
      employees: this.createEmptySummary(),
      assignments: this.createEmptySummary(),
    };

    const siteRows = this.readSheetRows(workbook, siteSheetName);
    const employeeRows = this.readSheetRows(workbook, employeeSheetName);

    const siteCache = new Map<string, SiteRecord>();
    const employeeCache = new Map<string, EmployeeWithSites>();
    const importedEmployeeKeys = new Set<string>();

    for (const row of siteRows) {
      const site = await this.processSiteRow(row, result);
      if (site) {
        siteCache.set(this.normalizeKey(site.siteCode), site);
      }
    }

    for (const row of employeeRows) {
      const employee = await this.processEmployeeRow(row, result, importedEmployeeKeys, employeeCache);
      if (!employee) {
        continue;
      }

      employeeCache.set(this.buildEmployeeKey(employee.typeDoc, employee.documentNumber), employee);

      const site = await this.resolveEmployeeSite(row.values.sede, siteCache);
      if (!site) {
        result.assignments.rejected.push({
          row: row.rowNumber,
          identifier: this.buildEmployeeIdentifier(row.values),
          reason: this.buildMissingSiteReason(row.values.sede),
        });
        continue;
      }

      await this.processAssignmentRow(row, employee, site, result);
    }

    return result;
  }

  private createEmptySummary(): ImportSummary {
    return {
      created: [],
      updated: [],
      skipped: [],
      rejected: [],
    };
  }

  private findSheet(workbook: XLSX.WorkBook, acceptedNames: string[]): string | null {
    const normalizedAcceptedNames = acceptedNames.map((name) => this.normalizeKey(name));
    return workbook.SheetNames.find((sheetName) => normalizedAcceptedNames.includes(this.normalizeKey(sheetName))) ?? null;
  }

  private readSheetRows(workbook: XLSX.WorkBook, sheetName: string): SheetRow[] {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    }) as unknown[][];

    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0].map((header) => this.normalizeKey(String(header)));
    const result: SheetRow[] = [];

    for (let index = 1; index < rows.length; index += 1) {
      const rawRow = rows[index];
      const values: Record<string, string> = {};

      headers.forEach((header, headerIndex) => {
        values[header] = this.normalizeCellValue(String(rawRow[headerIndex] ?? ''));
      });

      if (Object.values(values).some((value) => value.length > 0)) {
        result.push({ rowNumber: index + 1, values });
      }
    }

    return result;
  }

  private async processSiteRow(row: SheetRow, result: ImportResult): Promise<SiteRecord | null> {
    const missingFields = this.findMissingFields(row.values, REQUIRED_SITE_FIELDS);
    const identifier = row.values.codigo_sede || this.makeRowIdentifier('site', row.rowNumber);

    if (missingFields.length > 0) {
      result.sites.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
      });
      return null;
    }

    let input: SiteInput;
    try {
      input = {
        siteCode: row.values.codigo_sede,
        name: row.values.nombre_sede,
        city: row.values.ciudad,
        country: row.values.pais,
        address: row.values.direccion,
        status: this.mapSiteStatus(row.values.activa),
      };
    } catch (error) {
      result.sites.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: error instanceof Error ? error.message : 'No se pudo interpretar la sede',
      });
      return null;
    }

    const existingSite = await this.sitesRepository.findBySiteCode(input.siteCode);
    if (!existingSite) {
      try {
        await this.sitesRepository.create({
          siteCode: input.siteCode,
          name: input.name,
          city: input.city,
          country: input.country,
          address: input.address,
          status: input.status,
        });
      } catch (error) {
        result.sites.rejected.push({
          row: row.rowNumber,
          identifier,
          reason: error instanceof DuplicateEntityError ? error.message : 'No se pudo crear la sede',
        });
        return null;
      }

      const createdSite = await this.sitesRepository.findBySiteCode(input.siteCode);
      if (!createdSite) {
        throw new Error('No se pudo leer la sede creada');
      }

      result.sites.created.push({
        row: row.rowNumber,
        identifier: input.siteCode,
        detail: input.name,
      });
      return createdSite;
    }

    if (this.compareSite(existingSite, input)) {
      result.sites.skipped.push({
        row: row.rowNumber,
        identifier: input.siteCode,
        detail: 'Registro idéntico',
      });
      return existingSite;
    }

    try {
      await this.sitesRepository.update(existingSite.id, {
        name: input.name,
        city: input.city,
        country: input.country,
        address: input.address,
        status: input.status,
      });
    } catch (error) {
      result.sites.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: error instanceof DuplicateEntityError ? error.message : 'No se pudo actualizar la sede',
      });
      return existingSite;
    }

    const updatedSite = await this.sitesRepository.findBySiteCode(input.siteCode);
    if (!updatedSite) {
      throw new Error('No se pudo leer la sede actualizada');
    }

    result.sites.updated.push({
      row: row.rowNumber,
      identifier: input.siteCode,
      detail: input.name,
    });
    return updatedSite;
  }

  private async processEmployeeRow(
    row: SheetRow,
    result: ImportResult,
    importedEmployeeKeys: Set<string>,
    employeeCache: Map<string, EmployeeWithSites>,
  ): Promise<EmployeeWithSites | null> {
    const identifier = this.buildEmployeeIdentifier(row.values);
    let parsedTypeDoc: TypeDoc;

    try {
      parsedTypeDoc = this.mapTypeDoc(row.values.tipo_doc);
    } catch (error) {
      result.employees.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: error instanceof Error ? error.message : 'No se pudo interpretar el tipo de documento',
      });
      return null;
    }

    const employeeKey = this.buildEmployeeKey(parsedTypeDoc, row.values.numero_documento);
    const existingEmployee = employeeCache.get(employeeKey) ?? (await this.employeesRepository.findByTypeDocAndDocumentNumber(parsedTypeDoc, row.values.numero_documento));

    if (!this.canIdentifyEmployee(row.values)) {
      result.employees.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: `Faltan campos obligatorios: ${this.findMissingFields(row.values, REQUIRED_EMPLOYEE_FIELDS).join(', ')}`,
      });
      return null;
    }

    let input: EmployeeInput;
    try {
      input = this.buildEmployeeInput(row.values, parsedTypeDoc);
    } catch (error) {
      result.employees.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: error instanceof Error ? error.message : 'No se pudo interpretar el empleado',
      });
      return existingEmployee;
    }

    if (importedEmployeeKeys.has(employeeKey)) {
      if (existingEmployee) {
        result.employees.skipped.push({
          row: row.rowNumber,
          identifier,
          detail: 'Registro duplicado dentro del archivo',
        });
      }
      return existingEmployee;
    }

    const employeeCodeCollision = await this.employeesRepository.findByEmployeeCode(input.employeeCode);
    if (employeeCodeCollision && (!existingEmployee || employeeCodeCollision.id !== existingEmployee.id)) {
      result.employees.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: `El código de empleado ${input.employeeCode} ya existe`,
      });
      return existingEmployee;
    }

    if (!existingEmployee) {
      try {
        await this.employeesRepository.create({
          employeeCode: input.employeeCode,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          secondLastName: input.secondLastName,
          typeDoc: input.typeDoc,
          documentNumber: input.documentNumber,
          status: input.status,
          email: input.email,
          phone: input.phone,
          biostarId: input.biostarId,
          levelAccess: input.levelAccess,
        });
      } catch (error) {
        result.employees.rejected.push({
          row: row.rowNumber,
          identifier,
          reason: error instanceof DuplicateEntityError ? error.message : 'No se pudo crear el empleado',
        });
        return null;
      }

      const createdEmployee = await this.employeesRepository.findByTypeDocAndDocumentNumber(input.typeDoc, input.documentNumber);
      if (!createdEmployee) {
        throw new Error('No se pudo leer el empleado creado');
      }

      result.employees.created.push({
        row: row.rowNumber,
        identifier,
        detail: `${input.firstName} ${input.lastName}`,
      });
      importedEmployeeKeys.add(employeeKey);
      return createdEmployee;
    }

    if (this.compareEmployee(existingEmployee, input)) {
      result.employees.skipped.push({
        row: row.rowNumber,
        identifier,
        detail: 'Registro idéntico',
      });
      importedEmployeeKeys.add(employeeKey);
      return existingEmployee;
    }

    try {
      await this.employeesRepository.update(existingEmployee.id, {
        employeeCode: input.employeeCode,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        secondLastName: input.secondLastName,
        status: input.status,
        email: input.email,
        phone: input.phone,
        biostarId: input.biostarId,
        levelAccess: input.levelAccess,
      });
    } catch (error) {
      result.employees.rejected.push({
        row: row.rowNumber,
        identifier,
        reason: error instanceof DuplicateEntityError ? error.message : 'No se pudo actualizar el empleado',
      });
      return existingEmployee;
    }

    const updatedEmployee = await this.employeesRepository.findByTypeDocAndDocumentNumber(input.typeDoc, input.documentNumber);
    if (!updatedEmployee) {
      throw new Error('No se pudo leer el empleado actualizado');
    }

    result.employees.updated.push({
      row: row.rowNumber,
      identifier,
      detail: `${input.firstName} ${input.lastName}`,
    });
    importedEmployeeKeys.add(employeeKey);
    return updatedEmployee;
  }

  private async processAssignmentRow(
    row: SheetRow,
    employee: EmployeeWithSites,
    site: SiteRecord,
    result: ImportResult,
  ): Promise<void> {
    const identifier = `${employee.employeeCode} -> ${site.siteCode}`;
    const existingAssignment = await this.assignmentsRepository.findByEmployeeIdAndSiteId(employee.id, site.id);

    if (existingAssignment) {
      result.assignments.skipped.push({
        row: row.rowNumber,
        identifier,
        detail: 'La asignación ya existía',
      });
      return;
    }

    await this.assignmentsRepository.create(employee.id, site.id);
    result.assignments.created.push({
      row: row.rowNumber,
      identifier,
      detail: `${employee.firstName} ${employee.lastName} / ${site.name}`,
    });
  }

  private async resolveEmployeeSite(rawSite: string, siteCache: Map<string, SiteRecord>): Promise<SiteRecord | null> {
    const normalized = this.normalizeKey(rawSite);
    if (!normalized) {
      return null;
    }

    const directSite = siteCache.get(normalized);
    if (directSite) {
      return directSite;
    }

    const aliasCode = this.resolveSiteAlias(normalized);
    if (aliasCode) {
      const aliasSite = siteCache.get(this.normalizeKey(aliasCode)) ?? (await this.sitesRepository.findBySiteCode(aliasCode));
      if (aliasSite) {
        siteCache.set(this.normalizeKey(aliasSite.siteCode), aliasSite);
        return aliasSite;
      }
    }

    for (const site of siteCache.values()) {
      const candidates = [site.siteCode, site.name, site.city].map((candidate) => this.normalizeKey(candidate));
      if (candidates.includes(normalized)) {
        return site;
      }
    }

    return null;
  }

  private resolveSiteAlias(normalizedSiteValue: string): string | null {
    const aliases: Record<string, string> = {
      bogota: 'BOG-CD',
      'bogota_d_c': 'BOG-CD',
      'bogota_dc': 'BOG-CD',
      'bogota_d_c_': 'BOG-CD',
      'bogota_d_c__': 'BOG-CD',
    };

    return aliases[normalizedSiteValue] ?? null;
  }

  private buildEmployeeInput(values: Record<string, string>, typeDoc: TypeDoc): EmployeeInput {
    return {
      employeeCode: values.codigo_empleado,
      firstName: values.primer_nombre,
      middleName: values.segundo_nombre || undefined,
      lastName: values.primer_apellido,
      secondLastName: values.segundo_apellido || undefined,
      typeDoc,
      documentNumber: values.numero_documento,
      status: this.mapStatus(values.estado),
      email: values.email || undefined,
      phone: values.telefono || undefined,
      biostarId: values.id_biostar,
      levelAccess: this.mapLevelAccess(values.nivel_acceso),
    };
  }

  private compareSite(existingSite: SiteRecord, input: SiteInput): boolean {
    return (
      this.normalizeKey(existingSite.siteCode) === this.normalizeKey(input.siteCode) &&
      this.normalizeKey(existingSite.name) === this.normalizeKey(input.name) &&
      this.normalizeKey(existingSite.city) === this.normalizeKey(input.city) &&
      this.normalizeKey(existingSite.country) === this.normalizeKey(input.country) &&
      this.normalizeKey(existingSite.address) === this.normalizeKey(input.address) &&
      existingSite.status === input.status
    );
  }

  private compareEmployee(existingEmployee: EmployeeWithSites, input: EmployeeInput): boolean {
    return (
      this.normalizeKey(existingEmployee.employeeCode) === this.normalizeKey(input.employeeCode) &&
      this.normalizeKey(existingEmployee.firstName) === this.normalizeKey(input.firstName) &&
      this.normalizeKey(existingEmployee.middleName ?? '') === this.normalizeKey(input.middleName ?? '') &&
      this.normalizeKey(existingEmployee.lastName) === this.normalizeKey(input.lastName) &&
      this.normalizeKey(existingEmployee.secondLastName ?? '') === this.normalizeKey(input.secondLastName ?? '') &&
      existingEmployee.typeDoc === input.typeDoc &&
      this.normalizeKey(existingEmployee.documentNumber) === this.normalizeKey(input.documentNumber) &&
      existingEmployee.status === input.status &&
      this.normalizeKey(existingEmployee.email ?? '') === this.normalizeKey(input.email ?? '') &&
      this.normalizeKey(existingEmployee.phone ?? '') === this.normalizeKey(input.phone ?? '') &&
      this.normalizeKey(existingEmployee.biostarId ?? '') === this.normalizeKey(input.biostarId) &&
      existingEmployee.levelAccess === input.levelAccess
    );
  }

  private buildEmployeeIdentifier(values: Record<string, string>): string {
    return this.buildEmployeeKey(values.tipo_doc, values.numero_documento) || values.codigo_empleado || 'empleado-sin-identificador';
  }

  private buildEmployeeKey(typeDoc: string | TypeDoc, documentNumber: string): string {
    return `${this.normalizeKey(typeDoc)}|${this.normalizeKey(documentNumber)}`;
  }

  private findMissingFields(values: Record<string, string>, requiredFields: readonly string[]): string[] {
    return requiredFields.filter((field) => !this.normalizeCellValue(values[field]));
  }

  private canIdentifyEmployee(values: Record<string, string>): boolean {
    return Boolean(this.normalizeCellValue(values.tipo_doc) && this.normalizeCellValue(values.numero_documento));
  }

  private mapTypeDoc(value: string): TypeDoc {
    const normalized = this.normalizeKey(value);
    const aliases: Record<string, TypeDoc> = {
      cc: 'CC',
      ce: 'CE',
      pas: 'PAS',
      pasaporte: 'PAS',
      cip: 'CIP',
    };
    const resolved = aliases[normalized];
    if (!resolved) {
      throw new Error(`Tipo de documento no válido. ${value}`);
    }
    return resolved;
  }

  private mapStatus(value: string): Status {
    const normalized = this.normalizeKey(value);
    const aliases: Record<string, Status> = {
      activo: 'ACTIVE',
      a: 'ACTIVE',
      inactivo: 'INACTIVE',
      retirado: 'RETIRED',
    };
    const resolved = aliases[normalized];
    if (!resolved) {
      throw new Error(`Estado no válido. ${value}`);
    }
    return resolved;
  }

  private mapLevelAccess(value: string): LevelAccess {
    const normalized = this.normalizeKey(value);
    const aliases: Record<string, LevelAccess> = {
      estandar: 'STANDARD',
      standard: 'STANDARD',
      restringido: 'RESTRICTED',
      restricted: 'RESTRICTED',
      total: 'TOTAL',
      visitante_interno: 'INTERNAL_VISITOR',
      interno_visitante: 'INTERNAL_VISITOR',
      internal_visitor: 'INTERNAL_VISITOR',
      superusuario: 'SUPERUSER',
      superuser: 'SUPERUSER',
    };
    const resolved = aliases[normalized];
    if (!resolved) {
      throw new Error(`Nivel de acceso no válido. ${value}`);
    }
    return resolved;
  }

  private mapSiteStatus(value: string): Status {
    const normalized = this.normalizeKey(value);
    if (['si', 's', 'activo', 'activa', '1', 'true', 'yes', 'y'].includes(normalized)) {
      return 'ACTIVE';
    }
    if (['no', 'n', 'inactivo', 'inactiva', '0', 'false'].includes(normalized)) {
      return 'INACTIVE';
    }
    throw new Error(`Estado de sede no válido. ${value}`);
  }

  private normalizeKey(value: string | undefined | null): string {
    return this.normalizeCellValue(value)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  }

  private normalizeCellValue(value: string | undefined | null): string {
    return String(value ?? '').trim();
  }

  private makeRowIdentifier(entity: 'site' | 'employee', rowNumber: number): string {
    return `${entity}-fila-${rowNumber}`;
  }

  private buildMissingSiteReason(siteValue: string): string {
    const normalized = this.normalizeCellValue(siteValue);
    return normalized ? `La sede "${normalized}" no existe en el catálogo importado` : 'No se encontró una sede en la fila';
  }
}
