// src/screens/loans/create.tsx
import React, { useState } from 'react';
import { View, SafeAreaView, Text, StyleSheet, Alert } from 'react-native';
import LoanForm from '@/components/loanForm';
import { createLoan } from '@/services/loans';
import { useRouter } from 'expo-router';
import { theme } from '@/utils/theme';

export default function LoanCreateScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createLoan(values);
      Alert.alert('Éxito', 'Préstamo creado correctamente');
      router.replace('/dashboard');
    } catch (e:any) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo crear el préstamo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crear Préstamo</Text>
      <LoanForm onSubmit={handleSubmit} submitting={submitting} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor: theme.colors.background },
  title: { fontSize:22, fontWeight:'700', color: theme.colors.primary, marginBottom:12 }
});
