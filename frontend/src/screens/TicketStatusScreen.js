import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleChange = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmChange = async () => {
    setShowConfirmModal(false);
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
      setError(err?.message || 'Falha ao alterar o status');
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (statusValue) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === statusValue);
    return option?.label || statusValue;
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

  // Define hierarquia de status: ABERTO < EM_ANDAMENTO < RESOLVIDO
  const statusOrder = { ABERTO: 0, EM_ANDAMENTO: 1, RESOLVIDO: 2 };
  const currentStatusValue = currentStatus?.value || currentStatus;
  const currentOrder = statusOrder[currentStatusValue] ?? 0;

  // Apenas permite avançar no status, não retroceder
  const availableOptions = STATUS_OPTIONS.map(option => ({
    ...option,
    disabled: statusOrder[option.value] < currentOrder
  }));

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Troca de Status do Ticket</Text>
        <Text style={styles.subtitle}>Atualize o estado atual deste ticket.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Atual: {currentLabel}</Text>
        <SelectChips
          label="Novo status"
          options={availableOptions}
          value={status}
          onChange={setStatus}
        />
        {showResolved ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Ótimo! Este ticket será marcado como resolvido.</Text>
          </View>
        ) : null}
        {showCanceled ? (
          <View style={styles.dangerBanner}>
            <Text style={styles.dangerText}>Esta alteração cancelará o ticket.</Text>
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
              <Text style={styles.primaryButtonText}>Atualizando...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Salvar status</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Mudança de Status</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja alterar o status de{' '}
              <Text style={styles.modalHighlight}>{getStatusLabel(currentStatusValue)}</Text>
              {' '}para{' '}
              <Text style={styles.modalHighlight}>{getStatusLabel(status)}</Text>?
            </Text>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonCancel,
                  pressed && styles.modalButtonCancelPressed
                ]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  pressed && styles.modalButtonConfirmPressed
                ]}
                onPress={handleConfirmChange}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  modalContainer: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.darkGreen,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  modalHighlight: {
    fontWeight: '700',
    color: palette.mediumGreen
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center'
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  modalButtonCancelPressed: {
    backgroundColor: '#E5E7EB'
  },
  modalButtonConfirm: {
    backgroundColor: palette.mediumGreen,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  modalButtonConfirmPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  modalButtonTextCancel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600'
  },
  modalButtonTextConfirm: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700'
  }
});
