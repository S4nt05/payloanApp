import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
        <AuthProvider>
        <AppNavigator />
     </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
