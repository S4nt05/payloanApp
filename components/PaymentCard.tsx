// src/components/LoanCard.tsx (CORREGIDO)
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCurrency } from '@/utils/format';
import { theme } from '@/utils/theme';

export default function PaymentCard({ item, onPress }: any){

  // 🔑 BARRERA DE SEGURIDAD: Si item es null o undefined, regresamos null y evitamos el crash.
  if (!item) {
      console.warn("PaymentCard recibió un item nulo.");
      return null;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.title}>{item.customerName ?? `Cliente #${item.customerId}`}</Text>
        <Text style={styles.sub}># Pago: {item.paymentId} </Text>
        <Text style={styles.sub}>Método: {item.paymentMethod}</Text>
      </View>
      <View style={{alignItems:'flex-end', justifyContent:'center'}}>
        <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
        <Text style={styles.balance}>$ {formatCurrency(item.newPrincipalBalance)}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor: theme.colors.surface, padding:14, borderRadius:12, marginVertical:8, borderWidth:1, borderColor: theme.colors.border, flexDirection:'row', justifyContent:'space-between' },
  title:{ fontSize:17, fontWeight:'700', color: theme.colors.text },
  sub:{ color:'#6c757d', marginTop:6 },
  amount:{ fontSize:17, fontWeight:'800', color: theme.colors.danger },
  balance:{ fontSize:14, fontWeight:'500',marginTop:6, color: '#6c757d' },
  statusText: {fontSize: 12, fontWeight: '700'},
});