import { httpClient } from './httpClient';

export type TypeDoc = 'CC' | 'CE' | 'PAS' | 'CIP';

export interface DocumentTypeOption {
  value: TypeDoc;
  label: string;
}

export const catalogsApi = {
  findDocumentTypes() {
    return httpClient.get<DocumentTypeOption[]>('/catalogs/document-types');
  },
};