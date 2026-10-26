import { NativeModules } from 'react-native';

// Fallback an toàn nếu chưa kịp build lại APK sau khi cài gói native module
if (!NativeModules.RNCNetInfo) {
  console.warn(
    '[@react-native-community/netinfo] NativeModule.RNCNetInfo chưa được liên kết trong APK hiện tại. Sử dụng chế độ an toàn (Safe Fallback). Vui lòng chạy "npm run android" để kích hoạt Native Module.'
  );

  NativeModules.RNCNetInfo = {
    getCurrentState: async () => ({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
      details: { isConnectionExpensive: false },
    }),
    addListener: () => {},
    removeListeners: () => {},
  };
}

// Import NetInfo sau khi đã đảm bảo NativeModules.RNCNetInfo không bị null
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export type { NetInfoState, NetInfoSubscription };
export default NetInfo;
