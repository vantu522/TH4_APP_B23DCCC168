import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Edit3, BarChart2, Mail, Phone, Award } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../navigation/routes';
import GpaSummary from '../../components/grade/GpaSummary';
import GradeRow from '../../components/grade/GradeRow';
import InfoRow from '../../components/profile/InfoRow';
import AppButton from '../../components/common/AppButton';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import FilterChips from '../../components/common/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import { calculateAverageGpa } from '../../utils/gpa';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function ProfileScreen({ navigation }: any) {
  const {
    student,
    grades,
    courses,
    fetchStudent,
    fetchGrades,
    fetchCourses,
    pendingSyncIds,
    lastSavedAt,
    isOnline,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('Tất cả');

  const loadData = async () => {
    await Promise.all([
      fetchStudent('1'),
      fetchGrades(),
      fetchCourses(),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Danh sách các học kỳ duy nhất để đưa vào bộ lọc
  const semesters = useMemo(() => {
    const list = Array.from(new Set(grades.map((g) => g.semester).filter(Boolean)));
    return ['Tất cả', ...list];
  }, [grades]);

  // Gắn thông tin course vào grade nếu chưa có
  const enrichedGrades = useMemo(() => {
    return grades.map((g) => ({
      ...g,
      course: g.course || courses.find((c) => c.id === g.courseId),
    }));
  }, [grades, courses]);

  // Lọc danh sách điểm theo học kỳ
  const filteredGrades = useMemo(() => {
    if (selectedSemester === 'Tất cả') {
      return enrichedGrades;
    }
    return enrichedGrades.filter((g) => g.semester === selectedSemester);
  }, [enrichedGrades, selectedSemester]);

  // Tính toán GPA hệ 4 có trọng số và tổng số tín chỉ tích lũy
  const gpaStats = useMemo(() => {
    return calculateAverageGpa(filteredGrades, courses);
  }, [filteredGrades, courses]);

  const isStudentPendingSync = pendingSyncIds.some(
    (id) => id === '1' || id === student?.id
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{student?.fullName || 'Sinh viên'}</Text>
          {isStudentPendingSync && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>Chưa đồng bộ</Text>
            </View>
          )}
        </View>
        <Text style={styles.code}>Mã SV: {student?.studentCode || '---'}</Text>
      </View>

      {/* B2: Khi offline, hiển thị dòng Cập nhật lần cuối */}
      {!isOnline && (
        <View style={styles.lastUpdatedBox}>
          <LastUpdatedText timestamp={lastSavedAt.student} />
        </View>
      )}

      {/* PHẦN C: KẾT QUẢ HỌC TẬP & GPA */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Award size={18} color={colors.primary} />
          <Text style={styles.sectionMainTitle}>Kết quả học tập</Text>
        </View>
        <Text style={styles.sectionSubCount}>
          {filteredGrades.length} môn
        </Text>
      </View>

      {/* Bộ lọc theo học kỳ */}
      <View style={styles.filterWrapper}>
        <FilterChips
          options={semesters.map((s) => ({
            key: s,
            label: s,
            badge:
              s === 'Tất cả'
                ? grades.length
                : grades.filter((g) => g.semester === s).length,
          }))}
          selected={selectedSemester}
          onSelect={setSelectedSemester}
        />
      </View>

      {/* Thẻ tóm tắt GPA & Tín chỉ tích lũy */}
      <GpaSummary
        gpa4={gpaStats.gpa4}
        avg10={gpaStats.avg10}
        accumulatedCredits={gpaStats.accumulatedCredits}
        totalCredits={gpaStats.totalCredits}
        count={gpaStats.count}
        semesterTitle={selectedSemester}
      />

      {/* Danh sách điểm các môn học theo học kỳ */}
      <View style={styles.gradeListContainer}>
        {filteredGrades.length === 0 ? (
          <EmptyState
            message="Chưa có kết quả học tập cho học kỳ này"
            subMessage="Điểm số sẽ được cập nhật sau khi hoàn thành kỳ học"
          />
        ) : (
          filteredGrades.map((item) => (
            <GradeRow
              key={item.id}
              grade={item}
              onPress={() =>
                navigation.navigate(ROUTES.GRADE_DETAIL, { id: item.id })
              }
            />
          ))
        )}
      </View>

      {/* Thông tin chi tiết sinh viên */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <InfoRow label="Lớp sinh hoạt" value={student?.className} />
        <InfoRow label="Chuyên ngành" value={student?.major} />
        <InfoRow
          label="Email"
          value={student?.email}
          icon={<Mail size={14} color={colors.textSecondary} />}
        />
        <InfoRow
          label="Số điện thoại"
          value={student?.phone}
          icon={<Phone size={14} color={colors.textSecondary} />}
        />
      </View>

      {/* Các nút hành động */}
      <AppButton
        title="Chỉnh sửa thông tin cá nhân"
        onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
        icon={<Edit3 size={18} color={colors.white} />}
        style={styles.actionBtn}
      />

      <AppButton
        title="Xem trang bảng điểm riêng"
        variant="outline"
        onPress={() => navigation.navigate(ROUTES.GRADE_LIST)}
        icon={<BarChart2 size={18} color={colors.textSecondary} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  syncBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  syncBadgeText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
  },
  code: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lastUpdatedBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sectionSubCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterWrapper: {
    marginVertical: spacing.xs,
  },
  gradeListContainer: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
});
