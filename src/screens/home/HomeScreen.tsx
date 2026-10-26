import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BookOpen,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../navigation/routes';
import ScreenContainer from '../../components/common/ScreenContainer';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import { formatDate } from '../../utils/date';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function HomeScreen({ navigation }: any) {
  const {
    student,
    courses,
    assignments,
    fetchStudent,
    fetchCourses,
    fetchAssignments,
    pendingSyncIds,
    lastSavedAt,
    isOnline,
  } = useAppStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const pendingSyncCount = pendingSyncIds.length;

  const loadData = async () => {
    try {
      setError(null);
      await Promise.all([fetchStudent('1'), fetchCourses(), fetchAssignments()]);
    } catch {
      if (!student && courses.length === 0) {
        setError('Không thể tải dữ liệu trang chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !student && courses.length === 0) {
    return <LoadingView message="Đang nạp dữ liệu trang chủ..." />;
  }

  if (error && !student && courses.length === 0) {
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

  // Lọc bài tập đến hạn trong 7 ngày tới
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingAssignments = assignments.filter((item) => {
    if (!item.dueDate) return false;
    const due = new Date(item.dueDate);
    return due >= now && due <= sevenDaysLater;
  });

  const isStudentPendingSync = pendingSyncIds.some((id) => id === '1' || id === student?.id);

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {/* Banner thông tin sinh viên */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.studentName}>
              {student?.fullName || 'Đang tải thông tin...'}
            </Text>
            {isStudentPendingSync && (
              <View style={styles.profilePendingBadge}>
                <Text style={styles.profilePendingText}>Chưa đồng bộ</Text>
              </View>
            )}
          </View>
          <Text style={styles.studentCode}>
            Mã SV: {student?.studentCode || '---'} • Lớp: {student?.className || '---'}
          </Text>
          <Text style={styles.studentMajor}>{student?.major || ''}</Text>
        </View>
      </View>

      {/* Thẻ thống kê số thay đổi chưa đồng bộ và trạng thái Cache */}
      <View style={styles.statusRow}>
        <View style={styles.statusBox}>
          <Text style={styles.statusBoxLabel}>Thay đổi chưa đồng bộ</Text>
          <Text
            style={[
              styles.statusBoxValue,
              pendingSyncCount > 0 ? styles.valueWarning : styles.valueSuccess,
            ]}
          >
            {pendingSyncCount}
          </Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusBoxLabel}>Trạng thái kết nối</Text>
          <Text
            style={[
              styles.statusBoxValue,
              isOnline ? styles.valueSuccess : styles.valueDanger,
            ]}
          >
            {isOnline ? 'Online (Mock API)' : 'Offline (Cache)'}
          </Text>
        </View>
      </View>

      {/* B2: Khi offline, hiển thị dòng "Cập nhật lần cuối: 14:32, 26/10/2026" */}
      {!isOnline && (
        <View style={styles.lastUpdatedBox}>
          <LastUpdatedText timestamp={lastSavedAt.student || lastSavedAt.courses} />
        </View>
      )}

      {/* Danh sách môn đang học */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BookOpen size={18} color={colors.textSecondary} />
          <Text style={styles.sectionTitle}> Môn đang học ({courses.length})</Text>
        </View>
        {courses.length === 0 ? (
          <EmptyState message="Chưa có môn học nào" />
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.cardItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(ROUTES.COURSE_DETAIL, { id: course.id })}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{course.code}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{course.name}</Text>
                <Text style={styles.cardSub}>
                  {course.credits} tín chỉ • Giảng viên: {course.lecturer}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Bài tập đến hạn trong 7 ngày tới */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={colors.textSecondary} />
          <Text style={styles.sectionTitle}>
            {' '}Bài tập đến hạn trong 7 ngày ({upcomingAssignments.length})
          </Text>
        </View>
        {upcomingAssignments.length === 0 ? (
          <EmptyState
            message="Không có bài tập nào đến hạn trong 7 ngày tới"
          />
        ) : (
          upcomingAssignments.map((assignment) => {
            const isPending =
              pendingSyncIds.includes(assignment.id) || assignment.id.startsWith('temp-');

            return (
              <TouchableOpacity
                key={assignment.id}
                style={[styles.cardItem, isPending && styles.cardPendingItem]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(ROUTES.ASSIGNMENT_DETAIL, { id: assignment.id })
                }
              >
                <View
                  style={[
                    styles.statusIndicator,
                    assignment.status === 'done' ? styles.statusDone : styles.statusTodo,
                  ]}
                />
                <View style={styles.cardContent}>
                  <View style={styles.assignmentTitleRow}>
                    <Text style={styles.cardTitle}>{assignment.title}</Text>
                    {isPending && (
                      <View style={styles.itemPendingBadge}>
                        <Text style={styles.itemPendingBadgeText}>Chưa đồng bộ</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardSub}>
                    Hạn nộp: {formatDate(assignment.dueDate)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 8,
  },
  profilePendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  profilePendingText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: 'bold',
  },
  studentCode: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  studentMajor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  statusBox: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBoxLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusBoxValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  valueSuccess: {
    color: colors.success,
  },
  valueWarning: {
    color: colors.warning,
  },
  valueDanger: {
    color: colors.danger,
  },
  lastUpdatedBox: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPendingItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  statusTodo: {
    backgroundColor: colors.warning,
  },
  statusDone: {
    backgroundColor: colors.success,
  },
  cardContent: {
    flex: 1,
  },
  assignmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemPendingBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemPendingBadgeText: {
    fontSize: 10,
    color: '#b45309',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
