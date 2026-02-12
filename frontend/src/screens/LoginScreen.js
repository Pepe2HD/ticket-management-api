import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground
} from 'react-native';
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
      <ImageBackground
        source={require('../../assets/login.png')}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        

        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Ticket Desk</Text>
          <Text style={styles.subtitle}>Faça login para gerenciar seus tickets</Text>
           <View style={styles.card}>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="exemplo@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              iconName="mail"
              iconColor={palette.greenDark}
              containerStyle={styles.field}
              labelStyle={styles.label}
              inputContainerStyle={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputContainerFocused
              ]}
              inputStyle={styles.inputText}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
            />
            <FormField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              secureTextEntry
              iconName="lock"
              iconColor={palette.greenDark}
              containerStyle={styles.field}
              labelStyle={styles.label}
              inputContainerStyle={[
                styles.inputContainer,
                focusedField === 'password' && styles.inputContainerFocused
              ]}
              inputStyle={styles.inputText}
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
      </ImageBackground>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    backgroundColor: palette.greenTint
  },
  background: {
    flex: 1
  },
  backgroundImage: {
    opacity: 1,
    width: '100%',
    height: '100%'
  },
  title: {
    ...typography.title,
    fontSize: 45,
    color: palette.white,
    fontWeight: '800',
    fontFamily: 'System',
    letterSpacing: 1.5,
    marginTop: spacing.xxl + spacing.xxl + spacing.xxl + spacing.md,
    textAlign: 'center',
    color: 'black'
  },
  subtitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl + spacing.xl + spacing.xl,
    color: 'rgb(0, 0, 0)',
    fontSize: 19,
    textAlign: 'center',
    fontWeight:'600'
  },
  cardWrap: {
    marginTop: -28,
    paddingHorizontal: spacing.lg
  },
  card: {
    borderRadius: 26,
    padding: spacing.lg,
    shadowColor: '#09251b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    backgroundColor: 'rgba(181, 233, 201, 0.95)'
  },
  field: {
    marginBottom: spacing.lg
  },
  label: {
    ...typography.label,
    color: palette.textMuted,
    letterSpacing: 0.6
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(27, 94, 32, 0.25)',
    borderWidth: 1,
    borderRadius: 18
  },
  inputContainerFocused: {
    borderColor: palette.greenDark,
    borderWidth: 1.5
  },
  inputText: {
    fontSize: 15,
    color: palette.textPrimary
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
