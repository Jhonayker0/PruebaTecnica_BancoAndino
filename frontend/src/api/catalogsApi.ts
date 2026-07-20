import { httpClient } from './httpClient';

export type TypeDoc = 'CC' | 'CE' | 'PAS' | 'CIP';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED';

export interface CatalogOption<T extends string = string> {
  value: T;
  label: string;
}

export type DocumentTypeOption = CatalogOption<TypeDoc>;
export type StatusOption = CatalogOption<EmployeeStatus>;

export const catalogsApi = {
  findDocumentTypes() {
    return httpClient.get<DocumentTypeOption[]>('/catalogs/document-types');
  },

  findStatusTypes() {
    return httpClient.get<StatusOption[]>('/catalogs/status-types');
  },
};