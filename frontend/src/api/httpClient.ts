import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Unexpected API error';

    return Promise.reject(new Error(message));
  },
);
