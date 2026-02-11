import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormField from '../components/FormField';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const palette = {
  greenDark: '#1B5E20',
  greenMid: '#4CAF50',
  greenSoft: '#A8E6CF',
  greenTint: '#F4FBF7',
  greenInput: '#EAF7F1',
  textPrimary: '#0F1F18',
  textMuted: '#5B6B63',
  borderSoft: '#D7E6DD',
  errorSoft: '#C45151',
  white: '#FFFFFF'
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, translateAnim]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err?.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.screen}>
      <LinearGradient
        colors={[palette.greenSoft, palette.greenMid, palette.greenDark]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.title}>Ticket Desk</Text>
        <Text style={styles.subtitle}>Faça login para gerenciar seus tickets</Text>
      </LinearGradient>

      <Animated.View
        style={[
          styles.cardWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}
      >
        <View style={styles.card}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={styles.field}
            labelStyle={styles.label}
            inputStyle={[
              styles.input,
              focusedField === 'email' && styles.inputFocused
            ]}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
          />
          <FormField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            secureTextEntry
            containerStyle={styles.field}
            labelStyle={styles.label}
            inputStyle={[
              styles.input,
              focusedField === 'password' && styles.inputFocused
            ]}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField('')}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && !loading && styles.buttonPressed,
              loading && styles.buttonDisabled
            ]}
          >
            <LinearGradient
              colors={
                loading
                  ? [palette.greenSoft, palette.greenMid]
                  : [palette.greenMid, palette.greenDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    backgroundColor: palette.greenTint
  },
  hero: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  title: {
    ...typography.title,
    fontSize: 30,
    color: palette.white,
    letterSpacing: 0.6
  },
  subtitle: {
    marginTop: spacing.lg,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    textAlign: 'center'
  },
  cardWrap: {
    marginTop: -28,
    paddingHorizontal: spacing.lg
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 26,
    padding: spacing.lg,
    shadowColor: '#0B2A1F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6
  },
  field: {
    marginBottom: spacing.md
  },
  label: {
    ...typography.label,
    color: palette.textMuted,
    letterSpacing: 0.6
  },
  input: {
    backgroundColor: palette.greenInput,
    borderColor: palette.borderSoft,
    borderRadius: 16,
    height: 48
  },
  inputFocused: {
    borderColor: palette.greenDark,
    borderWidth: 1.5
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0B2A1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: palette.white,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3
  },
  buttonPressed: {
    opacity: 0.92
  },
  buttonDisabled: {
    opacity: 0.72
  },
  error: {
    color: palette.errorSoft,
    marginBottom: spacing.sm
  }
});
