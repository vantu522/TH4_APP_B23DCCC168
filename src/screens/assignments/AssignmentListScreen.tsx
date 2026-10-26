import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../navigation/routes';
import FilterChips, { FilterOption } from '../../components/common/FilterChips';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import { isOverdue } from '../../utils/date';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function AssignmentListScreen({ navigation }: any) {
  const {
    assignments,
    fetchAssignments,
    fetchCourses,
    updateAssignmentStatus,
    pendingSyncIds,
    lastSavedAt,
    isOnline,
  } = useAppStore();

  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setError(null);
      await Promise.all([fetchAssignments(), fetchCourses()]);
    } catch {
      if (assignments.length === 0) {
        setError('Đã xảy ra lỗi khi tải danh sách bài tập.');
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
  if (loading && assignments.length === 0) {
    return <LoadingView message="Đang tải danh sách bài tập..." />;
  }

  // Trạng thái 4: Lỗi kèm nút thử lại
  if (error && assignments.length === 0) {
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

  const filteredAssignments = assignments.filter((item) => {
    const overdue = item.status === 'todo' && isOverdue(item.dueDate);
    if (filter === 'todo') return item.status === 'todo' && !overdue;
    if (filter === 'done') return item.status === 'done';
    if (filter === 'overdue') return overdue;
    return true; // 'all'
  });

  const filterOptions: FilterOption[] = [
    { key: 'all', label: 'Tất cả', badge: assignments.length },
    {
      key: 'todo',
      label: 'Chưa xong',
      badge: assignments.filter((a) => a.status === 'todo' && !isOverdue(a.dueDate)).length,
    },
    {
      key: 'done',
      label: 'Đã xong',
      badge: assignments.filter((a) => a.status === 'done').length,
    },
    {
      key: 'overdue',
      label: 'Quá hạn',
      badge: assignments.filter((a) => a.status === 'todo' && isOverdue(a.dueDate)).length,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <FilterChips
          options={filterOptions}
          selected={filter}
          onSelect={setFilter}
        />
        {/* B2: Khi offline, hiển thị dòng "Cập nhật lần cuối: 14:32, 26/10/2026" */}
        {!isOnline && (
          <View style={styles.lastUpdatedContainer}>
            <LastUpdatedText timestamp={lastSavedAt.assignments} />
          </View>
        )}
      </View>

      {/* A3 & A4: FlatList với đủ 4 trạng thái và kéo để làm mới */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // B3: Kiểm tra xem mục có đang trong hàng đợi outbox chưa đồng bộ không
          const isPending =
            pendingSyncIds.includes(item.id) || item.id.startsWith('temp-');

          return (
            <AssignmentItem
              assignment={item}
              isPendingSync={isPending}
              onPress={() =>
                navigation.navigate(ROUTES.ASSIGNMENT_DETAIL, { id: item.id })
              }
              onToggleStatus={() => {
                // A6: Cập nhật lạc quan (optimistic update) khi đổi trạng thái bài tập
                const newStatus = item.status === 'done' ? 'todo' : 'done';
                updateAssignmentStatus(item.id, newStatus);
              }}
            />
          );
        }}
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
            message="Không có bài tập nào"
            subMessage="Bạn đã hoàn thành hết hoặc chưa có bài tập trong mục này"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(ROUTES.ASSIGNMENT_FORM)}
      >
        <Plus size={26} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterWrapper: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastUpdatedContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
