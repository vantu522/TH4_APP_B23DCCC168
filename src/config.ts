import { Platform } from 'react-native';

/**
 * Cấu hình hệ thống: BASE_URL, TIMEOUT, CACHE_TTL
 */
export const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

// Thời gian chờ tối đa khi gọi API (ms)
export const TIMEOUT = 10000;

// Thời gian sống của cache (5 phút)
export const CACHE_TTL = 5 * 60 * 1000;

export default {
  BASE_URL,
  TIMEOUT,
  CACHE_TTL,
};
