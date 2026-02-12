import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

export default function SelectChips({ label, options, value, onChange }) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          const disabled = option.disabled || false;
          return (
            <Pressable
              key={option.value}
              onPress={() => !disabled && onChange(option.value)}
              style={[
                styles.chip,
                active && styles.chipActive,
                disabled && styles.chipDisabled
              ]}
              disabled={disabled}
            >
              <Text style={[
                styles.chipText,
                active && styles.chipTextActive,
                disabled && styles.chipTextDisabled
              ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  chipDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5
  },
  chipText: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 12
  },
  chipTextActive: {
    color: colors.canvas
  },
  chipTextDisabled: {
    color: '#9CA3AF'
  }
});
