import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL,
  timeout: 60000,
});

httpClient.interceptors.request.use((config) => {
  const headers = config.headers;

  if (config.data instanceof FormData) {
    if (headers) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }

    return config;
  }

  if (config.data && headers && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Unexpected API error';

    return Promise.reject(new Error(message));
  },
);
