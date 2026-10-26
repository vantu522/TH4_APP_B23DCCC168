import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Assignment } from '../../api/types';
import StatusToggle from './StatusToggle';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatDate, isOverdue } from '../../utils/date';

interface AssignmentItemProps {
  assignment: Assignment;
  isPendingSync?: boolean;
  onPress: () => void;
  onToggleStatus: () => void;
}

export default function AssignmentItem({
  assignment,
  isPendingSync = false,
  onPress,
  onToggleStatus,
}: AssignmentItemProps) {
  const overdue =
    assignment.status === 'todo' && isOverdue(assignment.dueDate);

  return (
    <TouchableOpacity
      style={[styles.card, isPendingSync && styles.cardPendingSync]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {assignment.title}
          </Text>
          {isPendingSync && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>Chưa đồng bộ</Text>
            </View>
          )}
        </View>

        <StatusToggle
          status={assignment.status}
          isOverdue={overdue}
          onToggle={onToggleStatus}
        />
      </View>

      <Text style={styles.courseName}>
        Môn: {assignment.course?.name || `Mã #${assignment.courseId}`}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.dueDate, overdue && styles.dueDateOverdue]}>
          Hạn nộp: {formatDate(assignment.dueDate)}
        </Text>
        <Text style={styles.hint}>(Chạm trạng thái để đổi)</Text>
      </View>
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
  },
  cardPendingSync: {
    borderColor: '#ffc107',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  syncBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  syncBadgeText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
  },
  courseName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dueDateOverdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
