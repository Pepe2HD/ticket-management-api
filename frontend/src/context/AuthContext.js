import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'tm.api.session';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setIsLoading(false);
          return;
        }

        const session = JSON.parse(raw);
        if (session?.token) {
          setToken(session.token);
          const me = await apiFetch('/me', { token: session.token });
          setUser(me?.data || me);
        }
      } catch (error) {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (email, password) => {
    const payload = await apiFetch('/login', {
      method: 'POST',
      body: { email, password }
    });

    const nextToken = payload?.token;
    const nextUser = payload?.user?.data || payload?.user;

    setToken(nextToken);
    setUser(nextUser);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, user: nextUser })
    );

    return nextUser;
  };

  const logout = async () => {
    if (token) {
      try {
        await apiFetch('/logout', { method: 'POST', token });
      } catch (error) {
        // ignore network errors on logout
      }
    }

    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAdmin: Boolean(user?.is_admin),
      isLoading,
      login,
      logout,
      setUser
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
