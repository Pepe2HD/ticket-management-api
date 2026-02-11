import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  containerStyle,
  labelStyle
}) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isGhost && styles.ghost,
        containerStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <View>
        <Text
          style={[
            styles.label,
            isPrimary && styles.primaryText,
            isGhost && styles.ghostText,
            labelStyle,
            disabled && styles.disabledText
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  pressed: {
    opacity: 0.85
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border
  },
  label: {
    fontSize: 14,
    fontWeight: '600'
  },
  primaryText: {
    color: colors.canvas
  },
  ghostText: {
    color: colors.ink
  },
  disabledText: {
    color: colors.muted
  }
});
