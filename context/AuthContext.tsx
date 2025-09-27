import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginService, signupService } from '@/services/auth'; // asegúrate que la ruta exista (tsconfig paths)
import { getProfile } from '@/services/user';

type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('token');
        const u = await SecureStore.getItemAsync('user');
        if (t != null) setToken(t);
        if (u != null) {
          try {
            setUser(JSON.parse(u));
          } catch (err) {
            // si el JSON está corrupto, limpiamos para evitar futuros crashes
            console.warn('SecureStore: stored user JSON invalid, clearing store for user key', err);
            await SecureStore.deleteItemAsync('user');
          }
        }
      } catch (err) {
        console.warn('SecureStore read error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // LOGIN: usa loginService y guarda string correctamente en SecureStore
  const login = async (userName: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginService({ userName, password });
      // Normalmente el backend devuelve { token, user } — adaptamos por seguridad
      const receivedToken = data?.data?.token ?? data?.data?.token ?? null;
      const receivedUser = data?.data?.user ?? data?.data ?? null;
      
      if (!receivedToken) throw new Error('No se recibió token desde el servidor.');

      // SecureStore solo acepta strings -> convertimos explícitamente
      await SecureStore.setItemAsync('token', String(receivedToken));
      await SecureStore.setItemAsync('user', JSON.stringify(receivedUser));

      setToken(String(receivedToken));
      setUser(receivedUser);
    } catch (err) {
      // re-lanzamos para que la UI pueda mostrar error (o manejes aquí)
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: any) => {
    setLoading(true);
    try {
      await signupService(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (err) {
      console.warn('SecureStore delete error', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const p = await getProfile();
      setUser(p);
      await SecureStore.setItemAsync('user', JSON.stringify(p));
    } catch (err) {
      console.warn('refreshProfile error', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
