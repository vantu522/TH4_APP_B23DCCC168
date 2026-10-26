import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Grade } from '../../api/types';
import { toGpa4, toLetter } from '../../utils/gpa';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function GradeDetailScreen({ route, navigation }: any) {
  const { id } = route?.params || {};
  const { getGradeById, courses } = useAppStore();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrade = async () => {
      setLoading(true);
      if (id) {
        const found = await getGradeById(id);
        if (found) {
          // Gắn course nếu chưa có
          const course = found.course || courses.find((c) => c.id === found.courseId);
          const enriched = { ...found, course };
          setGrade(enriched);
          // Đặt tiêu đề header là tên môn học
          navigation.setOptions({
            title: course?.name || `Chi tiết điểm môn học`,
          });
        }
      }
      setLoading(false);
    };

    loadGrade();
  }, [id, courses]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!grade) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin điểm</Text>
      </View>
    );
  }

  const letter = toLetter(grade.total);
  const gpa4 = toGpa4(grade.total);
  const isFailed = letter === 'F' || grade.total < 4.0;
  const credits = grade.course?.credits ?? 3;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.banner}>
          <Text style={styles.courseName}>
            {grade.course?.name || `Môn học #${grade.courseId}`}
          </Text>
          <Text style={styles.courseCode}>
            Mã môn: {grade.course?.code || grade.courseId} • {credits} tín chỉ • Học kỳ: {grade.semester}
          </Text>
        </View>

        <View style={styles.letterSection}>
          <View style={[styles.letterCircle, isFailed && styles.letterCircleFailed]}>
            <Text style={[styles.letterText, isFailed && styles.letterTextFailed]}>
              {letter}
            </Text>
          </View>
          <Text style={styles.totalScoreText}>Điểm tổng kết: {grade.total} / 10</Text>
          <Text style={styles.gpa4Text}>
            Quy đổi hệ 4: <Text style={styles.gpa4Highlight}>{gpa4.toFixed(1)}</Text> / 4.0
          </Text>
          <Text style={styles.formulaText}>
            (Công thức: 10% Chuyên cần + 30% Giữa kỳ + 60% Cuối kỳ)
          </Text>
          {isFailed && (
            <View style={styles.failedAlert}>
              <Text style={styles.failedAlertText}>
                ⚠️ Điểm F: Không đạt môn học và không tính vào số tín chỉ tích lũy.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Bảng điểm thành phần</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>1. Điểm Chuyên cần (10%)</Text>
            <Text style={styles.scoreValue}>{grade.attendance}</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>2. Điểm Giữa kỳ (30%)</Text>
            <Text style={styles.scoreValue}>{grade.midterm}</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>3. Điểm Cuối kỳ (60%)</Text>
            <Text style={styles.scoreValue}>{grade.final}</Text>
          </View>

          <View style={[styles.scoreRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, isFailed && styles.failedColor]}>
              Tổng kết học phần (Hệ 10)
            </Text>
            <Text style={[styles.totalValue, isFailed && styles.failedColor]}>
              {grade.total}
            </Text>
          </View>

          <View style={[styles.scoreRow, styles.subRow]}>
            <Text style={styles.scoreLabel}>Điểm chữ</Text>
            <Text style={[styles.scoreValue, isFailed && styles.failedColor]}>
              {letter}
            </Text>
          </View>

          <View style={[styles.scoreRow, styles.subRow]}>
            <Text style={styles.scoreLabel}>Điểm quy đổi hệ 4</Text>
            <Text style={[styles.scoreValue, isFailed && styles.failedColor]}>
              {gpa4.toFixed(1)}
            </Text>
          </View>

          <View style={[styles.scoreRow, styles.subRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.scoreLabel}>Số tín chỉ tích lũy ghi nhận</Text>
            <Text style={[styles.scoreValue, isFailed && styles.failedColor]}>
              {isFailed ? '0 tín chỉ (Điểm F)' : `${credits} tín chỉ`}
            </Text>
          </View>
        </View>
      </View>
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  banner: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  courseCode: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  letterSection: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  letterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterCircleFailed: {
    backgroundColor: '#fee2e2',
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  letterTextFailed: {
    color: colors.danger,
  },
  totalScoreText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gpa4Text: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpa4Highlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  formulaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  failedAlert: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  failedAlertText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    paddingTop: 12,
  },
  subRow: {
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  failedColor: {
    color: colors.danger,
  },
});
