import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export const DAYS_OF_WEEK = [
  { dayIndex: 2, label: 'Thứ 2', short: 'T2' },
  { dayIndex: 3, label: 'Thứ 3', short: 'T3' },
  { dayIndex: 4, label: 'Thứ 4', short: 'T4' },
  { dayIndex: 5, label: 'Thứ 5', short: 'T5' },
  { dayIndex: 6, label: 'Thứ 6', short: 'T6' },
  { dayIndex: 7, label: 'Thứ 7', short: 'T7' },
  { dayIndex: 8, label: 'Chủ nhật', short: 'CN' },
];

interface DaySelectorProps {
  selectedDay: number;
  onSelectDay: (dayIndex: number) => void;
}

export default function DaySelector({ selectedDay, onSelectDay }: DaySelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {DAYS_OF_WEEK.map((item) => {
          const isSelected = item.dayIndex === selectedDay;
          return (
            <TouchableOpacity
              key={item.dayIndex}
              style={[styles.dayButton, isSelected && styles.selectedDayButton]}
              onPress={() => onSelectDay(item.dayIndex)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {item.short}
              </Text>
              <Text style={[styles.dayLabel, isSelected && styles.selectedDayLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedDayText: {
    color: colors.white,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedDayLabel: {
    color: colors.primaryLight,
  },
});
