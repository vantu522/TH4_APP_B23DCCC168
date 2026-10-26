import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import outbox, { OutboxItem } from '../storage/outbox';
import { request } from '../api/client';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  setOnlineStatus: (status: boolean) => void;
  refreshPendingCount: () => Promise<number>;
}

const SyncContext = createContext<SyncContextType>({
  isOnline: true,
  pendingCount: 0,
  syncNow: async () => {},
  checkConnection: async () => true,
  setOnlineStatus: () => {},
  refreshPendingCount: async () => 0,
});

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshPendingCount = useCallback(async (): Promise<number> => {
    const items = await outbox.getAll();
    setPendingCount(items.length);
    return items.length;
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Gọi nhẹ endpoint /students/1 với timeout ngắn để kiểm tra kết nối server
      await request('GET', '/students/1', undefined, { timeout: 3000 });
      setIsOnline(true);
      return true;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  const syncNow = useCallback(async (): Promise<void> => {
    const items: OutboxItem[] = await outbox.getAll();
    if (items.length === 0) return;

    const online = await checkConnection();
    if (!online) return;

    for (const item of items) {
      try {
        await request(item.method, item.url, item.body);
        await outbox.remove(item.id);
      } catch (err) {
        console.warn(`[Sync] Đồng bộ mục ${item.id} thất bại, giữ lại hàng đợi`);
      }
    }

    await refreshPendingCount();
  }, [checkConnection, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();
    checkConnection();
  }, [refreshPendingCount, checkConnection]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        syncNow,
        checkConnection,
        setOnlineStatus: setIsOnline,
        refreshPendingCount,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
export default SyncContext;
