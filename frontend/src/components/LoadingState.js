import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

export default function LoadingState({ message = 'Loading' }) {
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" color={colors.ink} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    padding: spacing.lg
  },
  text: {
    marginTop: spacing.md,
    color: colors.muted
  }
});
