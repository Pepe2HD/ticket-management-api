import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const palette = {
  greenDark: colors.primary,
  greenMid: colors.accent,
  greenSoft: colors.accentSoft,
  white: colors.card,
  textMuted: colors.textSecondary
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const name = user?.name || 'Usuário';
  const initial = name.charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[palette.greenSoft, palette.greenMid, palette.greenDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.roleHint}>
          {user?.is_admin ? 'Acesso administrador' : 'Acesso padrão'}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '---'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Função</Text>
          <Text style={styles.value}>{user?.is_admin ? 'Administrador' : 'Usuário'}</Text>
        </View>
      </View>

      <Pressable onPress={logout} style={({ pressed }) => [
        styles.logoutButton,
        pressed && styles.logoutPressed
      ]}>
        <LinearGradient
          colors={[palette.greenMid, palette.greenDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutGradient}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </LinearGradient>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    gap: spacing.xs
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: palette.white
  },
  name: {
    ...typography.title,
    color: palette.white
  },
  roleHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15
  },
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: palette.white,
    shadowColor: palette.greenDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4
  },
  row: {
    gap: spacing.xs
  },
  label: {
    ...typography.label,
    color: palette.textMuted
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  logoutButton: {
    marginTop: spacing.lg,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: palette.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4
  },
  logoutGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  logoutPressed: {
    opacity: 0.92
  }
});
