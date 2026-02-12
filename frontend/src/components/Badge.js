import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

const STATUS_MAP = {
  ABERTO: colors.statusOpen,
  EM_ANDAMENTO: colors.statusProgress,
  RESOLVIDO: colors.statusResolved
};

const PRIORITY_MAP = {
  BAIXA: colors.priorityLow,
  MEDIA: colors.priorityMedium,
  ALTA: colors.priorityHigh
};

const normalizeBadge = (value) => {
  if (!value) {
    return { value: '', label: '' };
  }
  if (typeof value === 'object') {
    return {
      value: value.value || '',
      label: value.label || value.value || ''
    };
  }
  return { value, label: value };
};

const formatBadgeLabel = (value) => {
  if (!value) {
    return '';
  }
  const label = typeof value === 'object' ? value.label || value.value || '' : value;
  return String(label).replace(/_/g, ' ');
};

export function StatusBadge({ value }) {
  const { value: rawValue, label } = normalizeBadge(value);
  const tint = STATUS_MAP[rawValue] || colors.slate;
  return (
    <View style={[styles.badge, { borderColor: tint }]}
    >
      <Text style={[styles.text, { color: tint }]}>{formatBadgeLabel(label)}</Text>
    </View>
  );
}

export function PriorityBadge({ value }) {
  const { value: rawValue, label } = normalizeBadge(value);
  const tint = PRIORITY_MAP[rawValue] || colors.slate;
  return (
    <View style={[styles.badge, { borderColor: tint }]}
    >
      <Text style={[styles.text, { color: tint }]}>{formatBadgeLabel(label)}</Text>
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
