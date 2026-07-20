import { httpClient } from './httpClient';

export type SiteStatus = 'ACTIVE' | 'INACTIVE';

export interface SitePayload {
  siteCode: string;
  name: string;
  city: string;
  country: string;
  address: string;
  status?: SiteStatus;
}

export interface UpdateSitePayload extends Partial<SitePayload> {}

export interface ChangeSiteStatusPayload {
  status: SiteStatus;
}

export const sitesApi = {
  findAll(search?: string) {
    return httpClient.get('/sites', { params: { search } });
  },

  findOne(id: number) {
    return httpClient.get(`/sites/${id}`);
  },

  create(payload: SitePayload) {
    return httpClient.post('/sites', payload);
  },

  update(id: number, payload: UpdateSitePayload) {
    return httpClient.patch(`/sites/${id}`, payload);
  },

  changeStatus(id: number, payload: ChangeSiteStatusPayload) {
    return httpClient.patch(`/sites/${id}/status`, payload);
  },
};
