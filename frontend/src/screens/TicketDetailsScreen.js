import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import ScreenContainer from '../components/ScreenContainer';
import Timeline from '../components/Timeline';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const palette = {
  softGreen: '#F1F8F4',
  mediumGreen: '#4CAF50',
  darkGreen: '#1B5E20',
  white: '#FFFFFF',
  mutedText: '#6B7280',
  borderSoft: '#E3EFE7'
};

const formatDate = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  return date.toLocaleString();
};

export default function TicketDetailsScreen({ route, navigation }) {
  const { token, user, isAdmin } = useAuth();
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const isDeleted = Boolean(ticket?.deleted_at);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/tickets/${ticketId}`, { token });
      setTicket(result?.data || result);
    } catch (err) {
      setError(err?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [token, ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerLeft: () => (
        <Pressable onPress={() => navigation.popToTop()} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<   '}</Text>
        </Pressable>
      )
    });
  }, [navigation]);

  const statusValue = ticket?.status?.value || ticket?.status;
  const isResolved = statusValue === 'RESOLVIDO';
  const canEdit = Boolean(
    ticket &&
      statusValue === 'ABERTO' &&
      (isAdmin || ticket.solicitante?.id === user?.id || ticket.responsavel?.id === user?.id)
  );

  const canDelete = Boolean(
    ticket &&
      (isAdmin || ticket.solicitante?.id === user?.id) &&
      !ticket.deleted_at
  );

  const handleDelete = () => {
    if (!canDelete) {
      return;
    }

    Alert.alert(
      'Excluir ticket',
      'Tem certeza que deseja excluir este ticket?',
      [
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError('');
            try {
              await apiFetch(`/tickets/${ticketId}`, {
                method: 'DELETE',
                token
              });
              navigation.popToTop();
            } catch (err) {
              setError(err?.message || 'Failed to delete ticket');
            } finally {
              setDeleting(false);
            }
          }
        },
        { text: 'Nao', style: 'cancel' }
      ]
    );
  };

  return (
    <ScreenContainer contentStyle={styles.screen}>
      {loading ? (
        <View style={styles.loading}> 
          <ActivityIndicator size="large" color={palette.mediumGreen} />
          <Text style={styles.loadingText}>Carregando ticket...</Text>
        </View>
      ) : error ? (
        <EmptyState title="Não foi possível carregar" subtitle={error} />
      ) : ticket ? (
        <>
          {isDeleted ? (
            <>
              <View style={[styles.card, styles.deletedCard]}>
                <Text style={styles.sectionTitle}>Ticket excluido</Text>
                <Text style={styles.deletedTitle}>{ticket.titulo}</Text>
                <Text style={styles.deletedMeta}>Excluido em: {formatDate(ticket.deleted_at)}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Historico</Text>
                <Timeline items={ticket.status_history || []} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.badgesRow}>
                  <View style={styles.badges}>
                    <StatusBadge value={ticket.status} />
                    <PriorityBadge value={ticket.prioridade} />
                  </View>
                </View>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>{ticket.titulo}</Text>
                </View>
                <Text style={styles.subtitle}>Detalhes do ticket e atividade</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Descricao</Text>
                <Text style={styles.description}>{ticket.descricao}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Detalhes</Text>
                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Solicitante</Text>
                    <Text style={styles.metaValue}>{ticket.solicitante?.name || 'N/A'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Responsavel</Text>
                    <Text style={styles.metaValue}>{ticket.responsavel?.name || 'Nao atribuido'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Criado em</Text>
                    <Text style={styles.metaValue}>{formatDate(ticket.created_at)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Resolvido em</Text>
                    <Text style={styles.metaValue}>{formatDate(ticket.resolved_at)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionsBlock}>
                <AppButton
                  label={canEdit ? 'Editar ticket' : 'Edicao desativada'}
                  onPress={() => navigation.navigate('TicketEdit', { ticketId })}
                  disabled={!canEdit}
                  containerStyle={styles.primaryAction}
                  labelStyle={styles.primaryActionText}
                />
                {isAdmin ? (
                  <AppButton
                    label="Alterar status"
                    variant="ghost"
                    onPress={() => navigation.navigate('TicketStatus', { ticketId, currentStatus: statusValue })}
                    disabled={isResolved}
                    containerStyle={[
                      styles.secondaryAction,
                      isResolved && styles.secondaryActionDisabled
                    ]}
                    labelStyle={[
                      styles.secondaryActionText,
                      isResolved && styles.secondaryActionTextDisabled
                    ]}
                  />
                ) : null}
                <AppButton
                  label={deleting ? 'Excluindo...' : 'Excluir ticket'}
                  variant="ghost"
                  onPress={handleDelete}
                  disabled={!canDelete || deleting}
                  containerStyle={styles.deleteAction}
                  labelStyle={styles.deleteActionText}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Historico de status</Text>
                <Timeline items={ticket.status_history || []} />
              </View>
            </>
          )}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: palette.softGreen
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm
  },
  loadingText: {
    color: palette.mutedText,
    fontSize: 14
  },
  header: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#0B3D0B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  headerRow: {
    marginBottom: spacing.xs
  },
  title: {
    ...typography.title,
    color: palette.darkGreen,
    flex: 1
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 13
  },
  badgesRow: {
    marginBottom: spacing.sm,
    alignItems: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4
  },
  backArrow: {
    fontSize: 22,
    color: palette.darkGreen,
    marginTop: -2
  },
  backLabel: {
    color: palette.darkGreen,
    fontSize: 14,
    fontWeight: '600'
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#0B3D0B',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: palette.mutedText,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.darkGreen,
    marginBottom: spacing.sm
  },
  description: {
    ...typography.body,
    color: colors.slate
  },
  metaGrid: {
    gap: spacing.md
  },
  metaItem: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderSoft
  },
  metaLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: palette.mutedText,
    marginBottom: spacing.xs
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink
  },
  actionsBlock: {
    gap: spacing.sm
  },
  primaryAction: {
    backgroundColor: palette.mediumGreen,
    borderColor: palette.mediumGreen,
    borderRadius: 18,
    paddingVertical: spacing.md,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  primaryActionText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryAction: {
    borderColor: palette.mediumGreen,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: spacing.md,
    backgroundColor: '#E9F6EE'
  },
  secondaryActionText: {
    color: palette.darkGreen,
    fontWeight: '700'
  },
  secondaryActionDisabled: {
    borderColor: colors.border,
    backgroundColor: '#EEF2EE'
  },
  secondaryActionTextDisabled: {
    color: colors.muted
  },
  deleteAction: {
    borderColor: colors.danger,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: spacing.md,
    backgroundColor: '#FDECEC'
  },
  deleteActionText: {
    color: colors.danger,
    fontWeight: '700'
  },
  deletedCard: {
    borderColor: '#E8C9C9',
    borderWidth: 1,
    backgroundColor: '#F9F0F0'
  },
  deletedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs
  },
  deletedMeta: {
    color: colors.slate,
    fontSize: 13
  }
});
