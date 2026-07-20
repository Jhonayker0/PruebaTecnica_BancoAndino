import { httpClient } from './httpClient';

export interface AssignEmployeeToSitePayload {
  employeeId: number;
  siteId: number;
}

export const assignmentsApi = {
  assignEmployeeToSite(payload: AssignEmployeeToSitePayload) {
    return httpClient.post('/assignments', payload);
  },

  findSitesByEmployee(employeeId: number) {
    return httpClient.get(`/assignments/employees/${employeeId}/sites`);
  },

  findEmployeesBySite(siteId: number) {
    return httpClient.get(`/assignments/sites/${siteId}/employees`);
  },

  removeAssignment(id: number) {
    return httpClient.delete(`/assignments/${id}`);
  },
};
