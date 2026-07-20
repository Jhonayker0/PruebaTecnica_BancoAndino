import { httpClient } from './httpClient';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED';
export type TypeDoc = 'CC' | 'CE' | 'PAS' | 'CIP';
export type LevelAccess = 'STANDARD' | 'RESTRICTED' | 'TOTAL' | 'INTERNAL_VISITOR' | 'SUPERUSER';

export interface EmployeePayload {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  typeDoc: TypeDoc;
  documentNumber: string;
  status?: EmployeeStatus;
  email?: string;
  phone?: string;
  biostarId: string;
  levelAccess: LevelAccess;
}

export interface UpdateEmployeePayload extends Partial<EmployeePayload> {}

export interface ChangeEmployeeStatusPayload {
  status: EmployeeStatus;
}

export const employeesApi = {
  findAll(search?: string) {
    return httpClient.get('/employees', { params: { search } });
  },

  findOne(id: number) {
    return httpClient.get(`/employees/${id}`);
  },

  create(payload: EmployeePayload) {
    return httpClient.post('/employees', payload);
  },

  update(id: number, payload: UpdateEmployeePayload) {
    return httpClient.patch(`/employees/${id}`, payload);
  },

  changeStatus(id: number, payload: ChangeEmployeeStatusPayload) {
    return httpClient.patch(`/employees/${id}/status`, payload);
  },
};
