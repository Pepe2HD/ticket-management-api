import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import ScreenContainer from '../components/ScreenContainer';
import TicketCard from '../components/TicketCard';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants/options';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const ALL_OPTION = { label: 'Todos', value: '' };

const palette = {
  greenDark: colors.primary,
  greenMid: colors.accent,
  greenSoft: colors.accentSoft,
  greenTint: colors.background,
  textMuted: colors.textSecondary,
  white: colors.card
};

const DropdownField = ({ label, value, options, isOpen, onToggle, onSelect }) => {
  const selected = options.find((option) => option.value === value) || options[0];
  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable onPress={onToggle} style={styles.dropdownControl}>
        <Text style={styles.dropdownValue}>{selected.label}</Text>
        <Text style={styles.dropdownChevron}>v</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default function TicketsListScreen({ navigation }) {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch('/tickets', {
        token,
        params: {
          status,
          prioridade: priority,
          q: debouncedSearch
        }
      });
      setTickets(result?.data || []);
    } catch (err) {
      setError(err?.message || 'Falha ao carregar os tickets');
    } finally {
      setLoading(false);
    }
  }, [token, status, priority, debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  useEffect(() => {
    loadTickets();
  }, [status, priority, debouncedSearch, loadTickets]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          <Text style={styles.profileInitial}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      )
    });
  }, [navigation, user?.name]);

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingWrap}>
              <Text style={styles.waveEmoji}>👋</Text>
              <View>
                <Text style={styles.greetingText}>Olá!</Text>
                <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
              </View>
            </View>
            {tickets.length > 0 && (
              <View style={styles.ticketBadgeWrap}>
                <Text style={styles.ticketBadgeLabel}>Tickets</Text>
                <View style={styles.ticketBadge}>
                  <Feather name="inbox" size={16} color={palette.white} />
                  <Text style={styles.ticketCount}>{tickets.length}</Text>
                </View>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>
            Gerencie seus tickets de forma eficiente
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.filters}>
        <View style={styles.searchBlock}>
          <Text style={styles.dropdownLabel}>Busca</Text>
          <View style={styles.searchInputWrap}>
            <Feather name="search" size={16} color={palette.textMuted} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Pesquisar por titulo ou descricao..."
              placeholderTextColor={palette.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchTerm ? (
              <Pressable onPress={() => setSearchTerm('')} style={styles.clearButton}>
                <Feather name="x-circle" size={16} color={palette.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={styles.filtersRow}>
          <View style={[styles.filterHalf, statusOpen && styles.filterActive]}>
            <DropdownField
              label="Status"
              options={[ALL_OPTION, ...STATUS_OPTIONS]}
              value={status}
              isOpen={statusOpen}
              onToggle={() => {
                setStatusOpen((prev) => !prev);
                setPriorityOpen(false);
              }}
              onSelect={(next) => {
                setStatus(next);
                setStatusOpen(false);
              }}
            />
          </View>
          <View style={[styles.filterHalf, priorityOpen && styles.filterActive]}>
            <DropdownField
              label="Prioridade"
              options={[ALL_OPTION, ...PRIORITY_OPTIONS]}
              value={priority}
              isOpen={priorityOpen}
              onToggle={() => {
                setPriorityOpen((prev) => !prev);
                setStatusOpen(false);
              }}
              onSelect={(next) => {
                setPriority(next);
                setPriorityOpen(false);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.primaryAction}>
          <AppButton label="Novo ticket" onPress={() => navigation.navigate('TicketCreate')} />
        </View>
        <Pressable onPress={loadTickets} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={18} color={palette.greenDark} />
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={palette.greenMid} />
          <Text style={styles.loading}>Carregando tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <EmptyState title="Nenhum ticket" subtitle="Crie um ticket para começar." />
      ) : (
        <View style={styles.list}>
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket.id })}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    borderRadius: 24,
    marginBottom: spacing.lg,
    shadowColor: palette.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  header: {
    padding: spacing.xl,
    gap: spacing.md
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  greetingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  waveEmoji: {
    fontSize: 32,
    lineHeight: 32
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5
  },
  userName: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs
  },
  ticketBadgeWrap: {
    alignItems: 'center',
    gap: 4
  },
  ticketBadgeLabel: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)'
  },
  ticketCount: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  },
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.greenMid,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInitial: {
    color: colors.canvas,
    fontWeight: '700'
  },
  filters: {
    gap: spacing.sm
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  filterHalf: {
    flex: 1,
    zIndex: 1
  },
  filterActive: {
    zIndex: 10
  },
  searchBlock: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  searchInputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ccebdb',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: palette.greenDark,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  searchInput: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 14,
    flex: 1
  },
  clearButton: {
    padding: 2
  },
  dropdownWrap: {
    gap: spacing.xs,
    position: 'relative',
    zIndex: 1
  },
  dropdownLabel: {
    ...typography.label,
    color: palette.textMuted
  },
  dropdownControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper
  },
  dropdownValue: {
    color: colors.ink,
    fontWeight: '600'
  },
  dropdownChevron: {
    color: palette.textMuted,
    fontWeight: '700'
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    zIndex: 1000
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dropdownItemText: {
    color: colors.ink
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center', 
    marginTop: 1,
    marginBottom: spacing.xs  
  },
  primaryAction: {
    flex: 1
  },
  list: {
    gap: spacing.md
  },
  error: {
    color: colors.danger
  },
  loadingWrap: {
    alignItems: 'center',
    gap: spacing.xs
  },
  loading: {
    color: palette.textMuted
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  refreshIcon: {
    color: palette.greenDark,
    fontWeight: '700'
  }
});
