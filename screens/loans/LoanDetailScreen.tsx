// // src/screens/loans/[id].tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { getLoanById, getLoanBalanceById } from '@/services/loans';
// import { getPaymentsByLoan } from '@/services/payments';
// import { theme } from '@/utils/theme';
// import { formatCurrency } from '@/utils/format';

// export default function LoanDetailScreen() {
//   const params = useLocalSearchParams();
//   const id = Number(params.id);
//   const router = useRouter();
//   const [loan, setLoan] = useState<any>(null);
//   const [payments, setPayments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const l = await getLoanById(id);
//         // console.log("LoanDetailScreen - Loan:", l);
//         setLoan(l);
//         const p = await getPaymentsByLoan(id);
//         setPayments(p || []);
//       } catch (e) {
//         Alert.alert('Error', 'No se pudo cargar el préstamo');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id]);

//   if (loading) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator/></View>;
//    if (!loan) {
//       return (
//          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
//              <Text style={{color: theme.colors.text}}>Error: Préstamo no encontrado.</Text>
//              <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
//                 <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>Volver a la lista</Text>
//              </TouchableOpacity>
//          </View>
//       );
//    }
//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>{loan.customerName ?? `Préstamo #${loan.loanId}`}</Text>
//       <View style={styles.summaryRow}>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Monto</Text>
//           <Text style={styles.cardValue}>{formatCurrency(loan.loanAmount ?? 0)}</Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Saldo</Text>
//           <Text style={styles.cardValue}>{formatCurrency(loan.outstandingBalance ?? 0)}</Text>
//         </View>
//       </View>

//       <View style={{marginTop:12}}>
//         <Text style={{fontWeight:'700', marginBottom:8}}>Pagos</Text>
//         <FlatList
//           data={payments}
//           keyExtractor={(i)=>String(i.paymentId)}
//           renderItem={({item})=>(
//             <View style={styles.paymentRow}>
//               <View>
//                 <Text style={{fontWeight:'600'}}>{formatCurrency(item.amount)}</Text>
//                 <Text style={{color:'#6c757d'}}>{new Date(item.paymentDate).toLocaleDateString()}</Text>
//               </View>
//               <Text style={{color:item.status==='Completed'?'green':'orange'}}>{item.status}</Text>
//             </View>
//           )}
//           ListEmptyComponent={<Text style={{color:'#6c757d'}}>No hay pagos registrados</Text>}
//         />
//       </View>

//       <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:16}}>
//         <TouchableOpacity style={styles.action} onPress={()=>router.push(`/loans/${id}/payments/CreatePayment`)}>
//           <Text style={{color:'#fff'}}>Crear pago</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.action, {backgroundColor: theme.colors.secondary}]} onPress={()=>router.push(`/loans/${id}/edit`)}>
//           <Text style={{color:'#fff'}}>Editar préstamo</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container:{ flex:1, padding:16, backgroundColor: theme.colors.background },
//   header:{ fontSize:20, color: theme.colors.primary, fontWeight:'700', marginBottom:8 },
//   summaryRow:{ flexDirection:'row', justifyContent:'space-between' },
//   card:{ backgroundColor: theme.colors.surface, padding:12, borderRadius:10, width:'48%', borderWidth:1, borderColor: theme.colors.border },
//   cardTitle:{ color: theme.colors.text },
//   cardValue:{ fontSize:18, fontWeight:'800', marginTop:6 },
//   paymentRow:{ flexDirection:'row', justifyContent:'space-between', padding:12, backgroundColor:'#fff', borderRadius:8, marginBottom:8, borderWidth:1, borderColor:theme.colors.border },
//   action:{ backgroundColor: theme.colors.primary, padding:14, borderRadius:10, alignItems:'center', width:'48%' }
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
// Usamos hooks estándar de React Navigation
import { useRoute, useNavigation } from '@react-navigation/native'; 
import { getLoanById, getLoanBalanceById } from '@/services/loans';
import { getPaymentsByLoan } from '@/services/payments';
import { theme } from '@/utils/theme';
import { formatCurrency } from '@/utils/format';

export default function LoanDetailScreen() {
    // 🔑 Reemplazamos useLocalSearchParams por useRoute
    const route: any = useRoute();
    // 🔑 Reemplazamos useRouter por useNavigation
    const navigation: any = useNavigation();
    
    // 🔑 Leemos el 'id' del parámetro de la ruta
    const id = Number(route.params?.id); 
    
    const [loan, setLoan] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validación temprana si el ID es inválido. Esto evita la llamada a la API si id es NaN/0.
        if (!id || isNaN(id)) {
             setLoading(false);
             return; 
        }

        (async () => {
            setLoading(true);
            try {
                const l = await getLoanById(id);
                setLoan(l);
                const p = await getPaymentsByLoan(id);
                setPayments(p || []);

                console.log("getLoanById - item:", l);
                console.log("getPaymentsByLoan - item:", p);
            } catch (e) {
                console.error("Error al cargar detalle del préstamo:", e);
                Alert.alert('Error', 'No se pudo cargar el préstamo. Por favor, inténtelo de nuevo.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // 1. Loader inicial
    if (loading) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

    // 2. 🔑 Validación de Préstamo No Encontrado/Fallido
    if (!loan || isNaN(id)) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Préstamo con ID #{id} no encontrado o ID inválido.</Text>
                {/* 🔑 USAMOS navigation.goBack() */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver a la lista</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. Renderizado principal
    return (
        <SafeAreaView style={styles.container}>
            {/* Es seguro acceder a loan.customerName aquí */}
            <Text style={styles.header}>{loan.customerName ?? `Préstamo #${loan.data.loanId}`}</Text>
            
            {/* Resumen del Préstamo */}
            <View style={styles.summaryRow}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Monto</Text>
                    <Text style={styles.cardValue}>{formatCurrency(loan.data.loanAmount ?? 0)}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Saldo</Text>
                    <Text style={styles.cardValue}>{formatCurrency(loan.data.outstandingBalance ?? 0)}</Text>
                </View>
            </View>

            {/* Lista de Pagos */}
            <View style={{marginTop:12, flex:1}}>
                <Text style={{fontWeight:'700', marginBottom:8}}>Pagos</Text>
                <FlatList
                    data={payments}
                    keyExtractor={(i)=>String(i.paymentId)}
                    renderItem={({item})=>(
                        <View style={styles.paymentRow}>
                            <View>
                                <Text style={{fontWeight:'600'}}>{formatCurrency(item.amount)}</Text>
                                <Text style={{color:'#6c757d'}}>{new Date(item.paymentDate).toLocaleDateString()}</Text>
                            </View>
                            <Text style={{color:item.status==='Completed'?'green':'orange'}}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{color:'#6c757d'}}>No hay pagos registrados</Text>}
                />
            </View>

            {/* Botones de Acción */}
            <View style={styles.actionRow}>
                {/* 🔑 USAMOS navigation.navigate con el nombre de tu screen */}
                <TouchableOpacity style={styles.action} onPress={()=>navigation.navigate('LoanCreatePayment', { id: id })}>
                    <Text style={styles.actionText}>Crear pago</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.action, {backgroundColor: theme.colors.secondary}]} onPress={()=>navigation.navigate('LoanCreate', { id: id })}>
                    <Text style={styles.actionText}>Editar préstamo</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{ flex:1, padding:16, backgroundColor: theme.colors.background },
    header:{ fontSize:20, color: theme.colors.primary, fontWeight:'700', marginBottom:8 },
    summaryRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom: 12 },
    card:{ backgroundColor: theme.colors.surface, padding:12, borderRadius:10, width:'48%', borderWidth:1, borderColor: theme.colors.border },
    cardTitle:{ color: theme.colors.text },
    cardValue:{ fontSize:18, fontWeight:'800', marginTop:6 },
    paymentRow:{ flexDirection:'row', justifyContent:'space-between', padding:12, backgroundColor:'#fff', borderRadius:8, marginBottom:8, borderWidth:1, borderColor:theme.colors.border },
    actionRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:16 },
    action:{ backgroundColor: theme.colors.primary, padding:14, borderRadius:10, alignItems:'center', width:'48%' },
    actionText: { color: '#fff', fontWeight: 'bold' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: theme.colors.text, fontSize: 16, textAlign: 'center' },
    backButton: { marginTop: 20, backgroundColor: theme.colors.surface, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.primary },
    backButtonText: { color: theme.colors.primary, fontWeight: 'bold' }
});