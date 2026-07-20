import { httpClient } from './httpClient';

export interface RegisterAccessPayload {
  employeeId: number;
  siteId: number;
}

export const accessApi = {
  registerEntry(payload: RegisterAccessPayload) {
    return httpClient.post('/access/entry', payload);
  },

  registerExit(payload: RegisterAccessPayload) {
    return httpClient.post('/access/exit', payload);
  },

  findHistory(params?: { employeeId?: number; siteId?: number }) {
    return httpClient.get('/access/history', { params });
  },

  getCurrentOccupancy() {
    return httpClient.get('/access/occupancy');
  },

  findEmployeesWithoutExit() {
    return httpClient.get('/access/without-exit');
  },
};
