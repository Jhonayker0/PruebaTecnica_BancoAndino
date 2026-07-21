import { httpClient } from './httpClient';

export interface RegisterAccessPayload {
  employeeId: number;
  siteId: number;
}

export interface AccessHistoryFilter {
  siteId?: number;
  from?: string;
  to?: string;
}

export const accessApi = {
  registerEntry(payload: RegisterAccessPayload) {
    return httpClient.post('/access/entry', payload);
  },

  registerExit(payload: RegisterAccessPayload) {
    return httpClient.post('/access/exit', payload);
  },

  findHistory(params?: AccessHistoryFilter) {
    return httpClient.get('/access/history', { params });
  },

  exportHistory(params?: AccessHistoryFilter) {
    return httpClient.get('/access/history/export', {
      params,
      responseType: 'blob',
    });
  },

  getCurrentOccupancy() {
    return httpClient.get('/access/occupancy');
  },

  findEmployeesWithoutExit() {
    return httpClient.get('/access/without-exit');
  },
};
