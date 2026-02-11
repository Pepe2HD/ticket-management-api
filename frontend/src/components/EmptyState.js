import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

export default function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 13
  }
});
