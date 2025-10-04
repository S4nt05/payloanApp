import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getPayments } from "@/services/payments";
import { theme } from "@/utils/theme";
import { useDebounce } from "@/hooks/useDebounce";
import PaymentCard from "@/components/PaymentCard";

export default function PaymentIndex({ navigation }: any) {
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);

    const pageRef = useRef(1);
    const totalRef = useRef(0);
    const isFetchingRef = useRef(false);

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔑 paymentData: Depende solo de dq para el reset y usa refs para la paginación.
    const paymentData = useCallback(async (reset = false) => {
        const pageToFetch = reset ? 1 : pageRef.current;
        
        // 🛑 Lógica de Límite (Verificamos si ya cargamos el total, usando el ref del total)
        if (!reset && items.length >= totalRef.current && totalRef.current > 0) {
            setLoading(false); 
            return;
        }

        if (isFetchingRef.current) return;
        
        isFetchingRef.current = true;
        // Solo mostramos el loader inicial o si estamos reseteando
        if (reset) {
            setLoading(true);
        }
            try {
            const r = await getPayments(); 

            const rawList = Array.isArray(r) ? r : [];
            
            // 🔑 NUEVO FILTRO: Eliminar elementos null/undefined/inválidos en rawList
            const cleanedList = rawList.filter((item: { loanId: any; }) => item && item.loanId);

            // Deduplicación simple para el lote actual (basado en la lista ya limpia)
            const uniqueList = cleanedList.filter((loan: { loanId: any; }, index: any, self: any[]) =>
                index === self.findIndex((t) => (t.loanId === loan.loanId))
            );

            const apiTotal = totalRef.current;
            totalRef.current = apiTotal;
            
            // USANDO CALLBACK: Aseguramos la unicidad de los IDs en el estado final
            setItems(prevItems => {
                const listToProcess = reset ? uniqueList : [...prevItems, ...uniqueList];
                const ids = new Set();
                
                // Aseguramos que solo procesamos objetos con loanId
                return listToProcess.filter((item: { loanId: unknown; }) => {
                    // 🔑 Filtro de seguridad doble: solo elementos válidos
                    if (!item || !item.loanId) return false; 
                    
                    if (ids.has(item.loanId)) return false;
                    ids.add(item.loanId);
                    return true;
                });
            });

            // Si obtuvimos ítems, avanzamos la página
            if (rawList.length > 0) {
                pageRef.current = pageToFetch + 1;
            }

        } catch (e) {
        console.error("Error fetching loans:", e);
        } finally {
            isFetchingRef.current = false;
            setLoading(false); // 🔑 Aquí se garantiza que siempre se desactiva el loading
        }
    }, [dq]); // 🔑 DEPENDENCIAS: ¡SOLO dq! (Ya no items.length)

    // 2. useEffect para la BÚSQUEDA y Carga Inicial
    useEffect(() => {
        pageRef.current = 1;
        totalRef.current = 0;
        setItems([]);
        paymentData(true);
    }, [dq, paymentData]); // paymentData se agrega aquí para que el hook sepa cuándo se actualiza

    // 3. Renderizado Condicional del ActivityIndicator (para la carga inicial)
    if (loading && items.length === 0) {
        return <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1, marginTop: 40 }} />;
    }

    // 4. Componente principal
    return (
        <View style={styles.container}>
            {/* Header y Botón Nuevo */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pagos</Text>
            </View>

            {/* Input de Búsqueda */}
            <TextInput
                placeholder="Buscar cliente, ID..."
                style={styles.search}
                value={q}
                onChangeText={setQ}
            />

            <FlatList
                data={items}
                keyExtractor={(i: any) => String(i.loanId)}
                renderItem={({ item }) => {
                    // 🔑 VERIFICACIÓN CRÍTICA: Si item es null o undefined, no renderizamos nada.
                    if (!item) {
                        return null;
                    }
                    
                    return (
                        <PaymentCard
                            item={item}
                            onPress={()=>navigation.navigate('PaymentDetail', { id: item.paymentId })}
                        />
                    );
                }}
                // Paginación al final
                onEndReached={() => {
                    // Solo cargamos más si no estamos ya cargando
                    if (!isFetchingRef.current) paymentData(false)
                }}
                onEndReachedThreshold={0.5}
                // Loader en el pie de página
                ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} /> : null}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron pagos.</Text>}
            />

            <Pressable style={styles.fab} onPress={() => navigation.navigate('LoanCreatePayment')} accessibilityLabel="Crear pago">
                <Ionicons name="add" size={28} color={theme.colors.background} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: 40, padding: 16, backgroundColor: theme.colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.primary },
    newButton: { backgroundColor: theme.colors.secondary, padding: 10, borderRadius: 8 },
    search: { marginTop: 12, padding: 10, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 10, borderWidth:1, borderColor:theme.colors.border },
    emptyText: { textAlign: 'center', marginTop: 20, color: theme.colors.text },
    fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});