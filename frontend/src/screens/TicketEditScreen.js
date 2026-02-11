import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import ScreenContainer from '../components/ScreenContainer';
import { PRIORITY_OPTIONS } from '../constants/options';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const palette = {
  softGreen: '#E8F5E9',
  mediumGreen: '#4CAF50',
  darkGreen: '#1B5E20',
  softGreenInput: '#F1FAF2',
  borderGreen: '#C8E6C9',
  white: '#FFFFFF',
  mutedText: '#6B7280'
};

export default function TicketEditScreen({ route, navigation }) {
  const { token } = useAuth();
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('BAIXA');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await apiFetch(`/tickets/${ticketId}`, { token });
        const data = result?.data || result;
        setTicket(data);
        setTitulo(data.titulo || '');
        setDescricao(data.descricao || '');
        setPrioridade(data.prioridade || 'BAIXA');
      } catch (err) {
        setError(err?.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId, token]);

  const handleSave = async () => {
    if (!ticket || ticket.status !== 'ABERTO') return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        titulo,
        descricao,
        prioridade
      };

      await apiFetch(`/tickets/${ticketId}`, {
        method: 'PUT',
        token,
        body: payload
      });

      navigation.replace('TicketDetails', { ticketId });
    } catch (err) {
      setError(err?.message || 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer contentStyle={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.mediumGreen} />
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isEditable = ticket?.status === 'ABERTO';

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Edição de Ticket</Text>
        <Text style={styles.subtitle}>Atualize as informações e mantenha o ticket em andamento.</Text>
      </View>

      <View style={styles.card}>
        {!isEditable ? (
          <View style={styles.locked}>
            <Text style={styles.lockedText}>Este ticket não está aberto. A edição está desativada.</Text>
          </View>
        ) : null}
        <FormField
          label="Título"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Título do ticket"
          containerStyle={styles.field}
          labelStyle={styles.fieldLabel}
          inputStyle={[styles.input, focusedField === 'titulo' && styles.inputFocused]}
          onFocus={() => setFocusedField('titulo')}
          onBlur={() => setFocusedField('')}
        />
        <FormField
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição do problema"
          multiline
          containerStyle={styles.field}
          labelStyle={styles.fieldLabel}
          inputStyle={[styles.input, styles.descriptionInput, focusedField === 'descricao' && styles.inputFocused]}
          onFocus={() => setFocusedField('descricao')}
          onBlur={() => setFocusedField('')}
        />

        <View style={styles.segmentedBlock}>
          <Text style={styles.fieldLabel}>Prioridade</Text>
          <View style={styles.segmentedControl}>
            {PRIORITY_OPTIONS.map((option) => {
              const isActive = prioridade === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPrioridade(option.value)}
                  style={({ pressed }) => [
                    styles.segment,
                    isActive && styles.segmentActive,
                    pressed && !isActive && styles.segmentPressed
                  ]}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
          (!isEditable || saving) && styles.primaryButtonDisabled
        ]}
        onPress={handleSave}
        disabled={!isEditable || saving}
      >
        {saving ? (
          <ActivityIndicator color={palette.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Save changes</Text>
        )}
      </Pressable>
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
    marginBottom: spacing.sm
  },
  title: {
    fontSize: 28,
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
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  field: {
    marginBottom: spacing.md
  },
  fieldLabel: {
    color: palette.darkGreen
  },
  input: {
    backgroundColor: palette.softGreenInput,
    borderRadius: 16,
    borderColor: palette.borderGreen,
    borderWidth: 1.5,
    color: colors.ink
  },
  inputFocused: {
    borderColor: palette.darkGreen
  },
  descriptionInput: {
    height: 150
  },
  segmentedBlock: {
    marginBottom: spacing.md
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: palette.softGreenInput,
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.borderGreen
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    alignItems: 'center'
  },
  segmentActive: {
    backgroundColor: palette.mediumGreen
  },
  segmentPressed: {
    backgroundColor: '#DFF0E1'
  },
  segmentText: {
    color: palette.darkGreen,
    fontWeight: '600'
  },
  segmentTextActive: {
    color: palette.white
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  locked: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FDBA74',
    marginBottom: spacing.md
  },
  lockedText: {
    color: colors.ink,
    fontSize: 13
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: palette.mediumGreen,
    borderRadius: 20,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: '#1B5E20',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
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
  }
});
