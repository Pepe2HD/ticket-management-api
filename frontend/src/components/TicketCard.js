import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { PriorityBadge, StatusBadge } from './Badge';

export default function TicketCard({ ticket, onPress }) {
  const isDeleted = Boolean(ticket.deleted_at);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, isDeleted && styles.deletedCard, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{ticket.titulo}</Text>
        {isDeleted ? (
          <Text style={styles.deletedBadge}>Excluido</Text>
        ) : (
          <StatusBadge value={ticket.status} />
        )}
      </View>
      <View style={styles.metaRow}>
        <PriorityBadge value={ticket.prioridade} />
        <Text style={styles.metaText}>
          Dono: {ticket.solicitante?.name || 'Não atribuído'}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          Responsável: {ticket.responsavel?.name || 'Não atribuído'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  deletedCard: {
    borderColor: '#E4D4D4',
    backgroundColor: '#F7F1F1'
  },
  pressed: {
    opacity: 0.9
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  title: {
    ...typography.section,
    color: colors.ink,
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  metaText: {
    color: colors.slate,
    fontSize: 12
  },
  deletedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    borderColor: '#E4B4B4',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  }
});
