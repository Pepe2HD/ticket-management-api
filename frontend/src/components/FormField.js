import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  iconName,
  iconColor,
  iconSize,
  inputContainerStyle,
  containerStyle,
  labelStyle,
  inputStyle,
  ...rest
}) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      {iconName ? (
        <View
          style={[
            styles.inputRow,
            multiline && styles.inputRowMultiline,
            inputContainerStyle
          ]}
        >
          <Feather
            name={iconName}
            size={iconSize || 18}
            color={iconColor || colors.muted}
            style={styles.icon}
          />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            style={[
              styles.inputWithIcon,
              multiline && styles.multiline,
              inputStyle
            ]}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            {...rest}
          />
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, multiline && styles.multiline, inputStyle]}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          {...rest}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md
  },
  label: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
    backgroundColor: colors.input
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.input
  },
  inputRowMultiline: {
    alignItems: 'flex-start'
  },
  icon: {
    marginRight: spacing.sm
  },
  inputWithIcon: {
    flex: 1,
    color: colors.ink,
    paddingVertical: 0
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top'
  }
});
