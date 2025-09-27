import React, { useState } from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { Alert } from 'react-native';
import api from '@/services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '@/utils/theme';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Llamada al endpoint real
              await api.post('/api/Auth/logout');
              // Invoca logout del contexto para limpiar storage y estado
              await logout();
            } catch (err) {
              console.warn('Logout error', err);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Button
      mode="outlined"
      icon="exit-to-app"
      onPress={handleLogout}
      buttonColor={theme.colors.secondary}
      textColor="#fff"
      loading={loading}
      style={{ margin: 10, borderRadius: 12 }}
    >
      Cerrar sesión
    </Button>
  );
};

export default LogoutButton;
