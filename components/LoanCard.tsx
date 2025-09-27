// src/components/LoanCard.tsx (CORREGIDO)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCurrency } from '@/utils/format';
import { theme } from '@/utils/theme';

export default function LoanCard({ item, onPress }: any){

  // 🔑 BARRERA DE SEGURIDAD: Si item es null o undefined, regresamos null y evitamos el crash.
  if (!item) {
      console.warn("LoanCard recibió un item nulo.");
      return null;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        {/* Usamos encadenamiento opcional para la seguridad, aunque la barrera es la principal protección. */}
        <Text style={styles.title}>{item.customerName ?? `Cliente #${item.customerId}`}</Text>
        <Text style={styles.sub}>ID: {item.loanId} • Plazo: {item.term} meses</Text>
      </View>
      <View style={{alignItems:'flex-end'}}>
        <Text style={styles.amount}>{formatCurrency(item.loanAmount)}</Text>
        {/* Nota: Usar !!item.loanStatus para asegurar que siempre sea un booleano si la API lo envía como 0/1/null */}
        <Text style={{color:'#6c757d'}}>{item.loanStatus ? 'Activo' : 'Cerrado'}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor: theme.colors.surface, padding:14, borderRadius:12, marginVertical:8, borderWidth:1, borderColor: theme.colors.border, flexDirection:'row', justifyContent:'space-between' },
  title:{ fontSize:16, fontWeight:'700', color: theme.colors.text },
  sub:{ color:'#6c757d', marginTop:6 },
  amount:{ fontSize:16, fontWeight:'800' }
});