import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Variable para almacenar la función de logout
let logoutHandler: (() => void) | null = null;

// Función para registrar el handler de logout
export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};
const extra = Constants.expoConfig?.extra ?? {};
const api = axios.create({
  baseURL: extra.API_BASE_URL || 'https://api.example.com',
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Interceptor de respuesta para manejar HTTP 401
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("🚀 ~ 401 Unauthorized error:", error.response.status);
      
      // Limpiar el token del almacenamiento
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
        console.warn('Error clearing SecureStore:', e);
      }
      
      // Llamar al handler de logout si está disponible
      if (logoutHandler) {
        logoutHandler();
      }
      
      // Rechazar la promesa con un error más descriptivo
      return Promise.reject(new Error('Unauthorized: Session expired'));
    }
    return Promise.reject(error);
  }
);

export default api;