import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../navigation/routes';
import GradeRow from '../../components/grade/GradeRow';
import GpaSummary from '../../components/grade/GpaSummary';
import FilterChips from '../../components/common/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import { calculateAverageGpa } from '../../utils/gpa';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function GradeListScreen({ navigation }: any) {
  const { grades, courses, fetchGrades, fetchCourses } = useAppStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('Tất cả');

  const loadData = async () => {
    try {
      setError(null);
      await Promise.all([fetchGrades(), fetchCourses()]);
      if (grades.length === 0) {
        // Kiểm tra sau khi fetch
        const fetched = await fetchGrades();
        if (!fetched || fetched.length === 0) {
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra Mock API.');
        }
      }
    } catch {
      if (grades.length === 0) {
        setError('Đã xảy ra lỗi khi tải kết quả học tập.');
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

  // Tính GPA và tín chỉ tích lũy theo học kỳ được lọc
  const gpaStats = useMemo(() => {
    return calculateAverageGpa(filteredGrades, courses);
  }, [filteredGrades, courses]);

  // Trạng thái 1: Đang tải
  if (loading && grades.length === 0) {
    return <LoadingView message="Đang tải kết quả học tập..." />;
  }

  // Trạng thái 4: Lỗi kèm nút thử lại
  if (error && grades.length === 0) {
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

  return (
    <View style={styles.container}>
      {/* Bộ lọc theo học kỳ */}
      <View style={styles.filterSection}>
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

      {/* Trạng thái 2: Có dữ liệu & Trạng thái 3: Danh sách rỗng & A4: Kéo để làm mới */}
      <FlatList
        data={filteredGrades}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <GpaSummary
            gpa4={gpaStats.gpa4}
            avg10={gpaStats.avg10}
            accumulatedCredits={gpaStats.accumulatedCredits}
            totalCredits={gpaStats.totalCredits}
            count={gpaStats.count}
            semesterTitle={selectedSemester}
          />
        }
        renderItem={({ item }) => (
          <GradeRow
            grade={item}
            onPress={() =>
              navigation.navigate(ROUTES.GRADE_DETAIL, { id: item.id })
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
            message="Chưa có kết quả học tập cho học kỳ này"
            subMessage="Điểm số sẽ được cập nhật sau khi kết thúc môn học"
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
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
});
