import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Grade } from '../../api/types';
import { toLetter } from '../../utils/gpa';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface GradeRowProps {
  grade: Grade;
  onPress: () => void;
}

export default function GradeRow({ grade, onPress }: GradeRowProps) {
  const displayLetter = grade.letter || toLetter(grade.total);
  const isFailed = displayLetter === 'F' || (typeof grade.total === 'number' && grade.total < 4.0);
  const credits = grade.course?.credits ?? 3;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.courseName} numberOfLines={1}>
          {grade.course?.name || `Môn học #${grade.courseId}`}
        </Text>
        <View style={[styles.letterBadge, isFailed && styles.letterBadgeFailed]}>
          <Text style={[styles.letterText, isFailed && styles.letterTextFailed]}>
            {displayLetter}
          </Text>
        </View>
      </View>

      <Text style={styles.courseCode}>
        Mã môn: {grade.course?.code || grade.courseId} • {credits} tín chỉ • {grade.semester}
      </Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreVal}>{grade.attendance}</Text>
          <Text style={styles.scoreLbl}>Chuyên cần (10%)</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreVal}>{grade.midterm}</Text>
          <Text style={styles.scoreLbl}>Giữa kỳ (30%)</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreVal}>{grade.final}</Text>
          <Text style={styles.scoreLbl}>Cuối kỳ (60%)</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreVal, isFailed ? styles.failedVal : styles.totalVal]}>
            {grade.total}
          </Text>
          <Text style={[styles.scoreLbl, isFailed ? styles.failedLbl : styles.totalLbl]}>
            Tổng kết
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  courseCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  letterBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  letterBadgeFailed: {
    backgroundColor: '#fee2e2',
  },
  letterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  letterTextFailed: {
    color: colors.danger,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scoreLbl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  totalVal: {
    color: colors.success,
  },
  totalLbl: {
    color: colors.success,
    fontWeight: '600',
  },
  failedVal: {
    color: colors.danger,
  },
  failedLbl: {
    color: colors.danger,
    fontWeight: '600',
  },
});
