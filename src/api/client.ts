import axios, { AxiosRequestConfig, Method } from 'axios';
import { BASE_URL, TIMEOUT } from '../config';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(
        `[API Error ${error.response.status}] ${error.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      console.warn('[API Network Error] Không thể kết nối tới server:', error.message);
    } else {
      console.warn('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Hàm request chuẩn: request(method, url, body)
 */
export const request = async <T = any>(
  method: Method | string,
  url: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await axiosInstance({
    method: method as Method,
    url,
    data: body,
    ...config,
  });
  return response.data;
};

// Gắn hàm request và các method vào client
const client = {
  ...axiosInstance,
  request,
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config),
};

export default client;
