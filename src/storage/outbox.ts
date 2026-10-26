import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys';

/**
 * Cấu trúc mục trong hàng đợi Outbox theo đúng yêu cầu đề bài:
 * { id, method, url, body, createdAt }
 */
export interface OutboxItem {
  id: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' | string;
  url: string;
  body?: any;
  createdAt: string; // ISO 8601
}

let memoryQueue: OutboxItem[] = [];

/**
 * Lấy tất cả các mục trong hàng đợi Outbox từ AsyncStorage
 */
export const getAll = async (): Promise<OutboxItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX_QUEUE);
    if (!raw) return memoryQueue;
    const parsed: OutboxItem[] = JSON.parse(raw);
    memoryQueue = parsed;
    return parsed;
  } catch {
    return memoryQueue;
  }
};

/**
 * Thêm một thao tác vào hàng đợi ngoại tuyến khi offline
 * Dạng bắt buộc: { id, method, url, body, createdAt }
 */
export const enqueue = async (
  item: Omit<OutboxItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<OutboxItem> => {
  const newItem: OutboxItem = {
    id: item.id || `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    method: item.method,
    url: item.url,
    body: item.body,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const current = await getAll();
  const updated = [...current, newItem];
  memoryQueue = updated;

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX_QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.log('[Outbox] Đã lưu vào hàng đợi RAM');
  }

  return newItem;
};

/**
 * Xóa một mục khỏi hàng đợi Outbox sau khi đồng bộ thành công
 */
export const remove = async (id: string): Promise<void> => {
  const current = await getAll();
  const updated = current.filter((item) => item.id !== id);
  memoryQueue = updated;

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX_QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.log('[Outbox] Đã cập nhật hàng đợi RAM');
  }
};

/**
 * Xóa toàn bộ hàng đợi
 */
export const clear = async (): Promise<void> => {
  memoryQueue = [];
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.OUTBOX_QUEUE);
  } catch {}
};

/**
 * Lấy danh sách ID của các đối tượng đang có thao tác chờ đồng bộ
 */
export const getPendingEntityIds = async (): Promise<string[]> => {
  const items = await getAll();
  const ids: string[] = [];

  for (const item of items) {
    // Trích xuất ID từ URL dạng /assignments/:id hoặc body.id
    const parts = item.url.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'assignments' && lastPart !== 'students') {
      ids.push(lastPart);
    }
    if (item.body && item.body.id) {
      ids.push(String(item.body.id));
    }
  }

  return ids;
};

/**
 * Kiểm tra xem một ID thực thể (ví dụ ID bài tập) có đang nằm trong hàng đợi chờ đồng bộ không
 */
export const isPendingSync = async (entityId: string): Promise<boolean> => {
  const items = await getAll();
  return items.some(
    (item) =>
      item.url.endsWith(`/${entityId}`) ||
      (item.body && String(item.body.id) === String(entityId))
  );
};

export default {
  enqueue,
  getAll,
  remove,
  clear,
  getPendingEntityIds,
  isPendingSync,
};
