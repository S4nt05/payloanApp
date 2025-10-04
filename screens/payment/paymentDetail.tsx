import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; 
import { getPaymentById, getPaymentsByLoan } from '@/services/payments';
import { theme } from '@/utils/theme';
import { NumberFormatCurrency } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentDetail() {
    const route: any = useRoute();
    const navigation: any = useNavigation();
    const id = Number(route.params?.id); 

    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || isNaN(id)) {
             setLoading(false);
             return; 
        }

        (async () => {
            setLoading(true);
            try {
                const payment = await getPaymentById(id);
                setPayment(payment);

            } catch (e) {
                console.error("Error al cargar detalle del pago:", e);
                Alert.alert('Error', 'No se pudo cargar el detalle del pago. Por favor, inténtelo de nuevo.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

    if (!payment || isNaN(id)) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Pago con ID #{id} no encontrado o ID inválido.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver a la lista</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalles del pago</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del pago</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Monto</Text>
            <Text style={styles.value}>{NumberFormatCurrency(payment.amount, payment.currencyCode)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Saldo anterior</Text>
            <Text style={styles.value}>{NumberFormatCurrency(payment.totalAmountLoan, payment.currencyCode)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Saldo actual</Text>
            <Text style={styles.value}>{NumberFormatCurrency(payment.newPrincipalAmount, payment.currencyCode)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Método de pago</Text>
            <Text style={styles.value}>{payment.paymentMethodId == 1 ? 'Efectivo' : 'Transferencia'}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{payment.dateCreated}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>No. Recibo</Text>
            <Text style={styles.value}>{payment.receiptNumber}</Text>
          </View>

          {payment.notes ? (
            <>
              <View style={styles.separator} />
              <View style={styles.rowTop}>
                <Text style={styles.label}>Comentarios</Text>
                <Text style={styles.value}>{payment.notes}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.card}> 
          <Text style={styles.cardTitle}>Vinculación</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Préstamo</Text>
            <Text style={styles.value}>{payment.loanId ? `#${payment.loanId}` : '-'}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{payment.customerName}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      marginTop: 40,
      backgroundColor: theme.colors.background,
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F3F8',
      backgroundColor: theme.colors.background,
    },
    backButton: {
      padding: 8,
      marginRight: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    container: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E6E9F0',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    rowTop: {
      flexDirection: 'column',
      paddingVertical: 10,
    },
    label: {
      color: '#475569',
      fontSize: 13,
      maxWidth: '55%',
    },
    value: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'right',
    },
    separator: {
      height: 1,
      backgroundColor: '#F1F3F8',
      marginVertical: 2,
    },
    empty: {
      textAlign: 'center',
      marginTop: 20,
      color: '#475569',
    },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: theme.colors.text, fontSize: 16, textAlign: 'center' },
    backButtonText: { color: theme.colors.primary, fontWeight: 'bold' }
  });