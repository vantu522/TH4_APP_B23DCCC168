import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingSyncCount?: number;
  onSync?: () => void;
  lastSavedAt?: string;
}

export default function OfflineBanner({
  isOnline,
  pendingSyncCount = 0,
  onSync,
}: OfflineBannerProps) {
  // Khi online và không có thay đổi chờ đồng bộ -> không cần hiển thị banner chiếm chỗ
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  const isOffline = !isOnline;

  return (
    <View style={[styles.container, isOffline ? styles.offlineBox : styles.pendingBox]}>
      <View style={styles.contentRow}>
        <View style={styles.iconWrapper}>
          {isOffline ? (
            <WifiOff size={18} color={colors.textSecondary} />
          ) : (
            <AlertTriangle size={18} color={colors.textSecondary} />
          )}
        </View>

        <View style={styles.textWrapper}>
          {isOffline ? (
            <>
              <Text style={styles.boldOfflineText}>Bạn đang offline</Text>
              <Text style={styles.subText}>
                {pendingSyncCount > 0
                  ? `Có ${pendingSyncCount} thay đổi đang lưu trong hàng đợi outbox`
                  : 'Dữ liệu hiển thị từ bộ nhớ đệm (Cache)'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.pendingTitleText}>Đã có kết nối mạng</Text>
              <Text style={styles.subText}>
                Có {pendingSyncCount} thay đổi chưa đồng bộ lên máy chủ
              </Text>
            </>
          )}
        </View>

        {isOnline && pendingSyncCount > 0 && onSync && (
          <TouchableOpacity style={styles.syncBtn} onPress={onSync} activeOpacity={0.8}>
            <RefreshCw size={12} color={colors.white} style={styles.btnIcon} />
            <Text style={styles.syncBtnText}>Đồng bộ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  offlineBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  pendingBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  textWrapper: {
    flex: 1,
  },
  boldOfflineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },
  pendingTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
  },
  subText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  btnIcon: {
    marginRight: 4,
  },
  syncBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
