import { httpClient } from './httpClient';

export interface ImportLogItem {
  row: number;
  identifier: string;
  detail: string;
}

export interface ImportRejectItem {
  row: number;
  identifier: string;
  reason: string;
}

export interface ImportSummary {
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

export const importsApi = {
  uploadExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return httpClient.post<ImportResult>('/imports/excel', formData);
  },
};