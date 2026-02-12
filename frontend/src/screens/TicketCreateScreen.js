import React, { useEffect, useRef, useState } from 'react';
import { Animated, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function TicketCreateScreen({ navigation }) {
  const { token } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('BAIXA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const TITULO_MAX = 120;
  const DESCRICAO_MAX = 500;

  // Animações para cada prioridade
  const scaleAnims = useRef({
    BAIXA: new Animated.Value(1),
    MEDIA: new Animated.Value(1),
    ALTA: new Animated.Value(1)
  }).current;

  const handlePriorityChange = (newPriority) => {
    // Anima o botão clicado com bounce
    Animated.sequence([
      Animated.timing(scaleAnims[newPriority], {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnims[newPriority], {
        toValue: 1,
        friction: 4,
        tension: 150,
        useNativeDriver: true
      })
    ]).start();

    setPrioridade(newPriority);
  };

  useEffect(() => {
    // Garante que todos os botões não selecionados voltem ao tamanho normal
    PRIORITY_OPTIONS.forEach((option) => {
      if (prioridade !== option.value) {
        Animated.spring(scaleAnims[option.value], {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true
        }).start();
      }
    });
  }, [prioridade]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        titulo,
        descricao,
        prioridade
      };

      const result = await apiFetch('/tickets', {
        method: 'POST',
        token,
        body: payload
      });

      const created = result?.data || result;
      navigation.replace('TicketDetails', { ticketId: created.id });
    } catch (err) {
      setError(err?.message || 'Falha ao criar o ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Ticket</Text>
        <Text style={styles.subtitle}>Descreva o problema e defina a prioridade para começar o acompanhamento.</Text>
      </View>

      <View style={styles.card}>
        <View>
          <FormField
            label="Título"
            value={titulo}
            onChangeText={(text) => {
              if (text.length <= TITULO_MAX) {
                setTitulo(text);
              }
            }}
            placeholder="Título curto do ticket"
            containerStyle={styles.field}
            labelStyle={styles.fieldLabel}
            inputStyle={[styles.input, focusedField === 'titulo' && styles.inputFocused]}
            onFocus={() => setFocusedField('titulo')}
            onBlur={() => setFocusedField('')}
            maxLength={TITULO_MAX}
          />
          <Text style={[
            styles.charCounter,
            titulo.length > TITULO_MAX * 0.9 && styles.charCounterWarning,
            titulo.length === TITULO_MAX && styles.charCounterLimit
          ]}>
            {titulo.length}/{TITULO_MAX}
          </Text>
        </View>
        
        <FormField
          label="Descrição"
          value={descricao}
          onChangeText={(text) => {
            if (text.length <= DESCRICAO_MAX) {
              setDescricao(text);
            }
          }}
          placeholder="Descreva o problema"
          multiline
          containerStyle={styles.field}
          labelStyle={styles.fieldLabel}
          inputStyle={[styles.input, styles.descriptionInput, focusedField === 'descricao' && styles.inputFocused]}
          onFocus={() => setFocusedField('descricao')}
          onBlur={() => setFocusedField('')}
          maxLength={DESCRICAO_MAX}
        />

        <View style={styles.segmentedBlock}>
          <Text style={styles.fieldLabel}>Prioridade</Text>
          <View style={styles.segmentedControl}>
            {PRIORITY_OPTIONS.map((option) => {
              const isActive = prioridade === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handlePriorityChange(option.value)}
                  style={styles.segmentPressable}
                >
                  <Animated.View
                    style={[
                      styles.segment,
                      isActive && styles.segmentActive,
                      {
                        transform: [{ scale: scaleAnims[option.value] }]
                      }
                    ]}
                  >
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {option.label}
                    </Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={palette.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Criar ticket</Text>
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
  charCounter: {
    fontSize: 12,
    color: palette.mutedText,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'right',
    fontWeight: '500'
  },
  charCounterWarning: {
    color: '#F59E0B'
  },
  charCounterLimit: {
    color: '#EF4444',
    fontWeight: '600'
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
  segmentPressable: {
    flex: 1
  },
  segment: {
    paddingVertical: spacing.sm,
    borderRadius: 14,
    alignItems: 'center'
  },
  segmentActive: {
    backgroundColor: palette.mediumGreen,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
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
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  }
});
