import { useSync } from '../context/SyncContext';

/**
 * Hook quản lý và kích hoạt đồng bộ hàng đợi Outbox
 */
export function useOutboxSync() {
  const { isOnline, pendingCount, syncNow, refreshPendingCount } = useSync();

  return {
    isOnline,
    pendingCount,
    syncNow,
    refreshPendingCount,
  };
}

export default useOutboxSync;
