import axios, { type AxiosInstance } from 'axios';

import { DICTIONARY_API_URL, HTTP_TIMEOUT_MS } from '@/core/config/constants';

export const httpClient: AxiosInstance = axios.create({
  baseURL: DICTIONARY_API_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});
