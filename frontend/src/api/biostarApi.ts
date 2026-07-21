import { httpClient } from './httpClient';

export interface BiostarSuccessResponse {
  success: true;
  message: string;
}

export interface BiostarLoginPayload {
  documentNumber: string;
  password: string;
}

export interface BiostarLogoutPayload {
  documentNumber: string;
}

export interface BiostarSyncUserPayload {
  employeeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  status: string;
}

export interface BiostarSyncDoorPayload {
  siteId: number;
  siteCode: string;
  name: string;
  status: string;
}

export interface BiostarSyncItem {
  operation: 'create' | 'update';
  identifier: string;
  label: string;
  message: string;
}

export interface BiostarSyncBucket {
  created: number;
  updated: number;
  items: BiostarSyncItem[];
}

export interface BiostarSyncReport {
  success: true;
  message: string;
  users: BiostarSyncBucket;
  doors: BiostarSyncBucket;
}

export const biostarApi = {
  login(payload: BiostarLoginPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/auth/login', payload);
  },

  logout(payload: BiostarLogoutPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/auth/logout', payload);
  },

  createUser(payload: BiostarSyncUserPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/users/create', payload);
  },

  updateUser(payload: BiostarSyncUserPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/users/update', payload);
  },

  createDoor(payload: BiostarSyncDoorPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/doors/create', payload);
  },

  updateDoor(payload: BiostarSyncDoorPayload) {
    return httpClient.post<BiostarSuccessResponse>('/biostar/doors/update', payload);
  },

  syncAll() {
    return httpClient.post<BiostarSyncReport>('/biostar/sync');
  },
};
