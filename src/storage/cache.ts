import AsyncStorage from '@react-native-async-storage/async-storage';

// Bộ nhớ đệm RAM dự phòng
const memoryStore = new Map<string, string>();

export interface CacheEntry<T> {
  data: T;
  savedAt: string; // Chuỗi thời điểm lưu ISO 8601
}

/**
 * Lưu kết quả vào AsyncStorage kèm thời điểm lưu: { data, savedAt }
 */
export const setCache = async <T = any>(
  key: string,
  data: T
): Promise<void> => {
  try {
    const entry: CacheEntry<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(entry);
    memoryStore.set(key, json);
    await AsyncStorage.setItem(key, json);
  } catch (err) {
    console.log(`[Cache] Lưu vào RAM cho khóa "${key}"`);
  }
};

/**
 * Lấy dữ liệu và thời điểm lưu { data, savedAt } từ Cache
 */
export const getCacheWithMeta = async <T = any>(
  key: string
): Promise<CacheEntry<T> | null> => {
  try {
    let raw = await AsyncStorage.getItem(key);
    if (!raw) {
      raw = memoryStore.get(key) || null;
    }
    if (!raw) return null;

    const parsed: CacheEntry<T> = JSON.parse(raw);
    return parsed;
  } catch {
    const mem = memoryStore.get(key);
    if (mem) {
      try {
        return JSON.parse(mem);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Lấy chỉ dữ liệu data từ Cache
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  const entry = await getCacheWithMeta<T>(key);
  return entry ? entry.data : null;
};

/**
 * Lấy thời điểm cập nhật lần cuối
 */
export const getLastSavedAt = async (key: string): Promise<string | null> => {
  const entry = await getCacheWithMeta(key);
  return entry ? entry.savedAt : null;
};

/**
 * Xóa cache
 */
export const removeCache = async (key: string): Promise<void> => {
  memoryStore.delete(key);
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export default {
  setCache,
  getCache,
  getCacheWithMeta,
  getLastSavedAt,
  removeCache,
};
