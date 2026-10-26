import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Session } from '../../api/types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

export default function SessionCard({ session, onPress }: SessionCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.timeBox}>
        <Text style={styles.startTime}>{session.startTime}</Text>
        <Text style={styles.timeDivider}>-</Text>
        <Text style={styles.endTime}>{session.endTime}</Text>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.courseName}>
          {session.course?.name || `Môn học #${session.courseId}`}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.roomText}>Phòng: {session.room}</Text>
          {session.course?.code && (
            <Text style={styles.codeText}>• {session.course.code}</Text>
          )}
        </View>
        {session.note ? (
          <Text style={styles.noteText} numberOfLines={1}>
            Ghi chú: {session.note}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  timeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
    minWidth: 70,
  },
  startTime: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  timeDivider: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 12,
  },
  endTime: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  contentBox: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  codeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  noteText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
