export type BioStarSuccessResponse = {
  success: true;
  message: string;
};

export type BioStarSyncOperation = 'create' | 'update';

export type BioStarSyncItem = {
  operation: BioStarSyncOperation;
  identifier: string;
  label: string;
  message: string;
};

export type BioStarSyncBucket = {
  created: number;
  updated: number;
  items: BioStarSyncItem[];
};

export type BioStarSyncReport = {
  success: true;
  message: string;
  users: BioStarSyncBucket;
  doors: BioStarSyncBucket;
};

export type BioStarAuthLoginRequest = {
  documentNumber: string;
  password: string;
};

export type BioStarAuthLogoutRequest = {
  documentNumber: string;
};

export type BioStarUserPayload = {
  employeeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  status: string;
};

export type BioStarDoorPayload = {
  siteId: number;
  siteCode: string;
  name: string;
  status: string;
};
