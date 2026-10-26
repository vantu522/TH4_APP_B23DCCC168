import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Course } from '../../api/types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{course.code}</Text>
        </View>
        <Text style={styles.credits}>{course.credits} tín chỉ</Text>
      </View>
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.lecturer}>Giảng viên: {course.lecturer}</Text>
      {course.semester ? (
        <Text style={styles.semester}>Học kỳ: {course.semester}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  credits: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  lecturer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  semester: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
