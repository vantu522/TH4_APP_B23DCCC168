import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface GpaSummaryProps {
  gpa4: number;
  avg10: number;
  accumulatedCredits?: number;
  totalCredits?: number;
  count: number;
  semesterTitle?: string;
}

export default function GpaSummary({
  gpa4,
  avg10,
  accumulatedCredits = 0,
  totalCredits = 0,
  count,
  semesterTitle,
}: GpaSummaryProps) {
  return (
    <View style={styles.card}>
      {semesterTitle ? (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết quả: {semesterTitle}</Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.val}>{gpa4.toFixed(2)}</Text>
          <Text style={styles.lbl}>GPA (Hệ 4)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.val}>{avg10.toFixed(1)}</Text>
          <Text style={styles.lbl}>Điểm TB (Hệ 10)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={[styles.val, styles.creditVal]}>{accumulatedCredits}</Text>
          <Text style={styles.lbl}>TC tích lũy</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.val}>{count}</Text>
          <Text style={styles.lbl}>Số môn</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  val: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  creditVal: {
    color: colors.success,
  },
  lbl: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
