import { Controller, Get } from '@nestjs/common';
import { TypeDoc } from '@prisma/client';

interface DocumentTypeCatalogItem {
  value: TypeDoc;
  label: string;
}

const DOCUMENT_TYPE_LABELS: Record<TypeDoc, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PAS: 'Pasaporte',
  CIP: 'CIP',
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
}