import React from 'react';
import { StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import { formatLastUpdated } from '../../utils/date';

interface LastUpdatedTextProps {
  timestamp?: string;
  prefix?: string;
}

export default function LastUpdatedText({
  timestamp,
  prefix = 'Cập nhật lần cuối: ',
}: LastUpdatedTextProps) {
  if (!timestamp) return null;

  return (
    <Text style={styles.text}>
      {prefix}
      {formatLastUpdated(timestamp)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
