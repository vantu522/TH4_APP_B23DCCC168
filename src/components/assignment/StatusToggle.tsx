import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';
import colors from '../../theme/colors';

interface StatusToggleProps {
  status: 'todo' | 'done';
  isOverdue?: boolean;
  onToggle: () => void;
}

export default function StatusToggle({
  status,
  isOverdue = false,
  onToggle,
}: StatusToggleProps) {
  const isDone = status === 'done';

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        isDone
          ? styles.badgeDone
          : isOverdue
          ? styles.badgeOverdue
          : styles.badgeTodo,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {isDone ? (
        <CheckCircle2 size={13} color={colors.textSecondary} style={styles.icon} />
      ) : isOverdue ? (
        <AlertTriangle size={13} color={colors.textSecondary} style={styles.icon} />
      ) : (
        <Clock size={13} color={colors.textSecondary} style={styles.icon} />
      )}
      <Text
        style={[
          styles.text,
          isDone
            ? styles.textDone
            : isOverdue
            ? styles.textOverdue
            : styles.textTodo,
        ]}
      >
        {isDone ? 'Đã xong' : isOverdue ? 'Quá hạn' : 'Chưa xong'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  icon: {
    marginRight: 4,
  },
  badgeDone: {
    backgroundColor: colors.successLight,
  },
  badgeTodo: {
    backgroundColor: colors.warningLight,
  },
  badgeOverdue: {
    backgroundColor: colors.dangerLight,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textDone: {
    color: colors.successText,
  },
  textTodo: {
    color: colors.warningText,
  },
  textOverdue: {
    color: colors.dangerText,
  },
});
