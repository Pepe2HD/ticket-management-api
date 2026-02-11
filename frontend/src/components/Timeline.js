import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const formatDate = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  return date.toLocaleString();
};

export default function Timeline({ items }) {
  if (!items || items.length === 0) {
    return <Text style={styles.empty}>Sem histórico</Text>;
  }

  return (
    <View style={styles.wrapper}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.dot} />
          <View style={styles.card}>
            <Text style={styles.title}>
              {`${item.de?.label || item.de?.value || item.de || 'INÍCIO'} -> ${item.para?.label || item.para?.value || item.para}`}
            </Text>
            <Text style={styles.meta}>Por {item.user?.name || 'Sistema'}</Text>
            <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
    marginTop: 6
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper
  },
  title: {
    fontWeight: '700',
    color: colors.ink
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12
  },
  empty: {
    color: colors.muted,
    fontSize: 13
  }
});
