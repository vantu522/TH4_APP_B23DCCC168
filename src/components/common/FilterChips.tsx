import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export interface FilterOption {
  key: string;
  label: string;
  badge?: number;
}

interface FilterChipsProps {
  options: (string | FilterOption)[];
  selected: string;
  onSelect: (key: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={options}
        keyExtractor={(item) => (typeof item === 'string' ? item : item.key)}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => {
          const key = typeof item === 'string' ? item : item.key;
          const label = typeof item === 'string' ? item : item.label;
          const badge = typeof item === 'object' ? item.badge : undefined;
          const isSelected = selected === key;

          return (
            <TouchableOpacity
              style={[styles.chip, isSelected && styles.selectedChip]}
              onPress={() => onSelect(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                {label}
              </Text>
              {typeof badge === 'number' && badge > 0 ? (
                <View
                  style={[
                    styles.badge,
                    isSelected ? styles.selectedBadge : styles.unselectedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected ? styles.selectedBadgeText : styles.unselectedBadgeText,
                    ]}
                  >
                    {badge}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  scroll: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedChipText: {
    color: colors.white,
    fontWeight: '700',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  selectedBadge: {
    backgroundColor: colors.white,
  },
  unselectedBadge: {
    backgroundColor: colors.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectedBadgeText: {
    color: colors.primary,
  },
  unselectedBadgeText: {
    color: colors.textSecondary,
  },
});
