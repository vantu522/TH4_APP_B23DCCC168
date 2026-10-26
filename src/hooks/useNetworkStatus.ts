import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '../utils/safeNetInfo';
import { useAppStore } from '../store/useAppStore';
import { BASE_URL } from '../config';

/**
 * Custom hook theo dõi trạng thái mạng theo yêu cầu B1 & B4:
 * - Dùng @react-native-community/netinfo
 * - Theo dõi trạng thái online/offline
 * - Tự động kích hoạt đồng bộ khi có mạng trở lại (B4)
 * - Tích hợp cơ chế kiểm tra dự phòng nếu chưa build APK
 */
export function useNetworkStatus() {
  const { isOnline: storeOnline, setOnlineStatus, syncPendingActions, pendingSyncIds } =
    useAppStore();
  const [isOnline, setIsOnline] = useState<boolean>(storeOnline);
  const wasOfflineRef = useRef<boolean>(!storeOnline);

  useEffect(() => {
    let isMounted = true;

    const handleConnectionChange = (connected: boolean) => {
      if (!isMounted) return;
      setIsOnline(connected);
      setOnlineStatus(connected);

      // B4: Tự động đồng bộ khi có mạng trở lại
      if (connected && wasOfflineRef.current) {
        console.log('[Network] Mạng đã kết nối trở lại, bắt đầu tự động đồng bộ hàng đợi Outbox');
        wasOfflineRef.current = false;
        syncPendingActions();
      } else if (!connected) {
        wasOfflineRef.current = true;
      }
    };

    // 1. Lắng nghe sự thay đổi mạng từ NetInfo
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
        handleConnectionChange(connected);
      });
    } catch (err) {
      console.warn('[NetInfo] Không thể đăng ký listener native:', err);
    }

    // 2. Lấy trạng thái mạng ban đầu
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
        handleConnectionChange(connected);
      })
      .catch(() => {
        if (isMounted) {
          setIsOnline(storeOnline);
        }
      });

    // 3. Polling nhẹ nhàng dự phòng (kiểm tra ping server mỗi 6 giây)
    const interval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${BASE_URL}/students/1`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          handleConnectionChange(true);
        } else {
          handleConnectionChange(false);
        }
      } catch {
        handleConnectionChange(false);
      }
    }, 6000);

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [setOnlineStatus, syncPendingActions, storeOnline]);

  return {
    isOnline,
    pendingSyncCount: pendingSyncIds.length,
  };
}

export default useNetworkStatus;
