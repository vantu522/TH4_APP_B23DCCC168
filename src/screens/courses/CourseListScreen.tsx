import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../navigation/routes';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import CourseCard from '../../components/course/CourseCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function CourseListScreen({ navigation }: any) {
  const { courses, fetchCourses, lastSavedAt, isOnline } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('Tất cả');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setError(null);
      const data = await fetchCourses();
      if (!data && courses.length === 0) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra Mock API.');
      }
    } catch (err: any) {
      if (courses.length === 0) {
        setError('Đã xảy ra lỗi khi tải danh sách môn học.');
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
  if (loading && courses.length === 0) {
    return <LoadingView message="Đang tải danh sách môn học..." />;
  }

  // Trạng thái 4: Lỗi kèm nút thử lại
  if (error && courses.length === 0) {
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

  const semesters = [
    'Tất cả',
    ...Array.from(new Set(courses.map((c) => c.semester).filter(Boolean))),
  ];

  // Tìm kiếm và lọc vẫn hoạt động bình thường kể cả khi offline
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase());
    const matchesSemester =
      selectedSemester === 'Tất cả' || course.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerControls}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm mã hoặc tên môn học..."
        />
        <FilterChips
          options={semesters.map((s) => ({
            key: s,
            label: s,
            badge:
              s === 'Tất cả'
                ? courses.length
                : courses.filter((c) => c.semester === s).length,
          }))}
          selected={selectedSemester}
          onSelect={setSelectedSemester}
        />

        {/* B2: Khi offline, hiển thị dòng "Cập nhật lần cuối: 14:32, 26/10/2026" */}
        {!isOnline && (
          <View style={styles.lastUpdatedWrapper}>
            <LastUpdatedText timestamp={lastSavedAt.courses} />
          </View>
        )}
      </View>

      {/* A3: 4 trạng thái trên FlatList */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate(ROUTES.COURSE_DETAIL, { id: item.id })
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
            message="Không tìm thấy môn học nào"
            subMessage="Hãy thử tìm kiếm với từ khóa khác hoặc chọn học kỳ khác"
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
  headerControls: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastUpdatedWrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
});
