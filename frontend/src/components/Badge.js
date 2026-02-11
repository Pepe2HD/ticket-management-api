import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

const STATUS_MAP = {
  ABERTO: colors.statusOpen,
  EM_ANDAMENTO: colors.statusProgress,
  RESOLVIDO: colors.statusResolved
};

const PRIORITY_MAP = {
  BAIXA: colors.success,
  MEDIA: colors.warning,
  ALTA: colors.danger
};

const formatBadgeLabel = (value) => {
  if (!value) {
    return '';
  }
  return String(value).replace(/_/g, ' ');
};

export function StatusBadge({ value }) {
  const tint = STATUS_MAP[value] || colors.slate;
  return (
    <View style={[styles.badge, { borderColor: tint }]}
    >
      <Text style={[styles.text, { color: tint }]}>{formatBadgeLabel(value)}</Text>
    </View>
  );
}

export function PriorityBadge({ value }) {
  const tint = PRIORITY_MAP[value] || colors.slate;
  return (
    <View style={[styles.badge, { borderColor: tint }]}
    >
      <Text style={[styles.text, { color: tint }]}>{formatBadgeLabel(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  text: {
    fontSize: 11,
    fontWeight: '700'
  }
});
