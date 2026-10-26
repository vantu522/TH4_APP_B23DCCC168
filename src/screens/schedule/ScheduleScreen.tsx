import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import DaySelector from '../../components/schedule/DaySelector';
import SessionCard from '../../components/schedule/SessionCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function ScheduleScreen({ navigation }: any) {
  const { sessions, fetchSessions, lastSavedAt, isOnline } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setError(null);
      const data = await fetchSessions();
      if (!data && sessions.length === 0) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra Mock API.');
      }
    } catch {
      if (sessions.length === 0) {
        setError('Đã xảy ra lỗi khi tải lịch học thời khóa biểu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Kéo để làm mới (A4)
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Trạng thái 1: Đang tải
  if (loading && sessions.length === 0) {
    return <LoadingView message="Đang tải thời khóa biểu..." />;
  }

  // Trạng thái 4: Lỗi kèm nút thử lại
  if (error && sessions.length === 0) {
    return (
      <ErrorView
        message={error}
        onRetry={() => {
          setLoading(true);
          loadData();
        }}
      />
    );
  }

  const daySessions = sessions.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <View style={styles.container}>
      <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {/* B2: Khi offline, hiển thị dòng "Cập nhật lần cuối: 14:32, 26/10/2026" */}
      {!isOnline && (
        <View style={styles.lastUpdatedWrapper}>
          <LastUpdatedText timestamp={lastSavedAt.sessions} />
        </View>
      )}

      {/* A3: 4 trạng thái trên FlatList */}
      <FlatList
        data={daySessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() =>
              navigation.navigate(ROUTES.SESSION_DETAIL, { id: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            message={`Không có lịch học cho Thứ ${selectedDay === 8 ? 'Chủ nhật' : selectedDay}`}
            subMessage="Bạn được nghỉ học hoặc không có tiết vào ngày này"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lastUpdatedWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
});
