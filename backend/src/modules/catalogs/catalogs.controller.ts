import { Controller, Get } from '@nestjs/common';
import { Status, TypeDoc } from '@prisma/client';

interface DocumentTypeCatalogItem {
  value: TypeDoc;
  label: string;
}

interface StatusCatalogItem {
  value: Status;
  label: string;
}

const DOCUMENT_TYPE_LABELS: Record<TypeDoc, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PAS: 'Pasaporte',
  CIP: 'CIP',
};

const STATUS_LABELS: Record<Status, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  RETIRED: 'Retirado',
};

@Controller('catalogs')
export class CatalogsController {
  @Get('document-types')
  findDocumentTypes(): DocumentTypeCatalogItem[] {
    return Object.values(TypeDoc).map((value) => ({
      value,
      label: DOCUMENT_TYPE_LABELS[value],
    }));
  }

  @Get('status-types')
  findStatusTypes(): StatusCatalogItem[] {
    return Object.values(Status).map((value) => ({
      value,
      label: STATUS_LABELS[value],
    }));
  }
}