import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';

interface SyncBadgeProps {
  count: number;
}

export default function SyncBadge({ count }: SyncBadgeProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
