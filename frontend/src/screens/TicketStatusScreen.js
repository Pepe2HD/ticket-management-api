import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import ScreenContainer from '../components/ScreenContainer';
import SelectChips from '../components/SelectChips';
import { STATUS_OPTIONS } from '../constants/options';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const palette = {
  softGreen: '#F2F9F4',
  mediumGreen: '#4CAF50',
  darkGreen: '#1B5E20',
  white: '#FFFFFF',
  mutedText: '#6B7280',
  borderSoft: '#E3EFE7',
  successSoft: '#E6F6EA',
  dangerSoft: '#FDECEA',
  dangerText: '#B42318'
};

export default function TicketStatusScreen({ route, navigation }) {
  const { token, user, isAdmin } = useAuth();
  const { ticketId, currentStatus } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState(currentStatus?.value || currentStatus || 'ABERTO');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentStatus) {
      setStatus(currentStatus?.value || currentStatus);
    }
  }, [currentStatus]);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const result = await apiFetch(`/tickets/${ticketId}`, { token });
        setTicket(result?.data || result);
      } catch (err) {
        setTicket(null);
      }
    };

    if (ticketId && token) {
      loadTicket();
    }
  }, [ticketId, token]);

  const handleChange = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { status };
      const shouldAssign =
        status === 'EM_ANDAMENTO' &&
        isAdmin &&
        !ticket?.responsavel?.id &&
        user?.id;

      if (shouldAssign) {
        payload.responsavel_id = user.id;
      }

      await apiFetch(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        token,
        body: payload
      });
      navigation.replace('TicketDetails', { ticketId });
    } catch (err) {
      setError(err?.message || 'Failed to change status');
    } finally {
      setSaving(false);
    }
  };

  const currentLabel =
    ticket?.status?.label ||
    ticket?.status?.value ||
    currentStatus?.label ||
    currentStatus?.value ||
    currentStatus ||
    '---';
  const showResolved = status === 'RESOLVIDO';
  const showCanceled = status === 'CANCELADO';

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Change Ticket Status</Text>
        <Text style={styles.subtitle}>Update the current state of this ticket.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Current: {currentLabel}</Text>
        <SelectChips
          label="New status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        {showResolved ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Great! This ticket will be marked as resolved.</Text>
          </View>
        ) : null}
        {showCanceled ? (
          <View style={styles.dangerBanner}>
            <Text style={styles.dangerText}>This change will cancel the ticket.</Text>
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            saving && styles.primaryButtonDisabled
          ]}
          onPress={handleChange}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color={palette.white} />
              <Text style={styles.primaryButtonText}>Updating...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Save status</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: palette.softGreen
  },
  header: {
    marginBottom: spacing.sm
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.darkGreen,
    marginBottom: spacing.xs
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 14,
    lineHeight: 20
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#0B3D0B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palette.mutedText,
    marginBottom: spacing.sm
  },
  successBanner: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: palette.successSoft
  },
  successText: {
    color: palette.darkGreen,
    fontSize: 13,
    fontWeight: '600'
  },
  dangerBanner: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: palette.dangerSoft
  },
  dangerText: {
    color: palette.dangerText,
    fontSize: 13,
    fontWeight: '600'
  },
  field: {
    marginBottom: spacing.xs
  },
  noteInput: {
    minHeight: 120
  },
  helperText: {
    color: palette.mutedText,
    fontSize: 12
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm
  },
  footer: {
    marginTop: spacing.lg
  },
  primaryButton: {
    backgroundColor: palette.mediumGreen,
    borderRadius: 20,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: '#1B5E20',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  primaryButtonDisabled: {
    backgroundColor: '#C7D7C9',
    shadowOpacity: 0,
    elevation: 0
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  }
});
