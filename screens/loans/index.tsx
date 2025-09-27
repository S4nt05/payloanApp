// // src/screens/loans/index.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   TextInput,
// } from "react-native";
// import { getLoans } from "@/services/loans";
// import { theme } from "@/utils/theme";
// import { useRouter } from "expo-router";
// import LoanCard from "@/components/LoanCard";

// export default function LoansIndex() {
//   const [q, setQ] = useState("");
//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const r = await getLoans({ q });
//         console.log("useEffect :",r);
//         setItems(r.items || r);
//       } catch (e) {
//         console.error("Error fetching loans:", e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [q]);

//   if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

//   return (
//     <View
//       style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}
//     >
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "700",
//             color: theme.colors.primary,
//           }}
//         >
//           Préstamos
//         </Text>
//         <TouchableOpacity
//           style={{
//             backgroundColor: theme.colors.secondary,
//             padding: 10,
//             borderRadius: 8,
//           }}
//           onPress={() => router.push("/loans/create")}
//         >
//           <Text style={{ color: "#fff" }}>Nuevo</Text>
//         </TouchableOpacity>
//       </View>

//       <TextInput
//         placeholder="Buscar cliente, ID..."
//         style={{
//           marginTop: 12,
//           padding: 10,
//           backgroundColor: "#fff",
//           borderRadius: 8,
//         }}
//         value={q}
//         onChangeText={setQ}
//       />

//       <FlatList
//         data={items}
//         keyExtractor={(i: any) => String(i.loanId)}
//         renderItem={({ item }) => (
//           <LoanCard
//             item={item}
//             onPress={() => router.push(`/loans/${item.loanId}`)}
//           />
//         )}
//       />
//     </View>
//   );
// }
// src/screens/loans/index.tsx (VERSION FINAL CORREGIDA)
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
// import { getLoans } from "@/services/loans";
// import { theme } from "@/utils/theme";
// import LoanCard from "@/components/LoanCard";
// import { useDebounce } from "@/hooks/useDebounce"; // Hook asumido

// export default function LoansIndex({ navigation }:any) {
//     const [q, setQ] = useState("");
//     const dq = useDebounce(q, 400);

//     // 🔑 Refs para aislar el estado y controlar el loop
//     const pageRef = useRef(1);
//     const totalRef = useRef(0);
//     const isFetchingRef = useRef(false);

//     const [items, setItems] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     const loadData = useCallback(async (reset = false) => {
//         const pageToFetch = reset ? 1 : pageRef.current;
        
//         // 🛑 Lógica de Límite sin depender de items.length en useCallback
//         // Leemos la longitud actual del estado directamente (usando items del closure inicial)
//         if (!reset && items.length >= totalRef.current && totalRef.current > 0) {
//             return;
//         }

//         // 🛑 Evitar llamadas concurrentes
//         if (isFetchingRef.current) return;
        
//         isFetchingRef.current = true;
//         if (items.length === 0 || !reset) {
//              setLoading(true);
//         }

//         try {
//             const r = await getLoans({ page: pageToFetch, q: dq }); 
            
//             const rawList = Array.isArray(r?.data) ? r.data : [];
//             const uniqueList = rawList.filter((loan: { loanId: any; }, index: any, self: any[]) =>
//                 index === self.findIndex((t) => (t.loanId === loan.loanId))
//             );

//             const apiTotal = r?.total || totalRef.current;
//             totalRef.current = apiTotal;
            
//             // 🔑 USAMOS EL CALLBACK DE SETSTATE: 
//             // Esto permite que loadData no necesite ser una dependencia
//             // setItems(prevItems => (reset ? uniqueList : [...prevItems, ...uniqueList]));
//             setItems(prevItems => {
//                 if (reset) {
//                     // Si es reset, solo usamos la nueva lista
//                     return uniqueList;
//                 } else {
//                     // Si no es reset, combinamos prevItems con uniqueList y DEDUPLICAMOS TODO
//                     const combinedList = [...prevItems, ...uniqueList];
//                     const ids = new Set();
//                     console.log("index - combinedList:", combinedList);
//                     return combinedList.filter(item => {
//                         if (ids.has(item.loanId)) {
//                             return false;
//                         }
//                         ids.add(item.loanId);
//                         return true;
//                     });
//                 }
//             });

//             if (uniqueList.length > 0) {
//                 pageRef.current = pageToFetch + 1;
//             } else if (reset) {
//                 pageRef.current = 2; 
//             }

//         } catch (e) {
//             console.error("Error fetching loans:", e);
//         } finally {
//             isFetchingRef.current = false;
//             setLoading(false);
//         }
//     }, [dq]); // 🔑 LA CLAVE: ¡SOLO dq! (y cualquier otra prop/ref externa esencial)

//     // 2. useEffect para la BÚSQUEDA y Carga Inicial
//     useEffect(() => {
//         pageRef.current = 1;
//         totalRef.current = 0;
//         setItems([]);
//         loadData(true);
//     }, [dq, loadData]);
//     // 3. Renderizado Condicional del ActivityIndicator
//     if (loading && items.length === 0) {
//         return <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1, marginTop: 40 }} />;
//     }

//     return (
//         <View style={styles.container}>
//             {/* Header y Botón Nuevo */}
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Préstamos</Text>
//                 <TouchableOpacity style={styles.newButton} 
//                 // onPress={() => router.push("LoanCreate")}
//                 onPress={()=>navigation.navigate('LoanCreate')}
//                 >
//                     <Text style={{ color: "#fff" }}>Nuevo</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Input de Búsqueda */}
//             <TextInput
//                 placeholder="Buscar cliente, ID..."
//                 style={styles.search}
//                 value={q}
//                 onChangeText={setQ}
//             />

//             <FlatList
//                 data={items}
//                 keyExtractor={(i: any) => String(i.loanId)}
//                 renderItem={({ item }) => (
//                     <LoanCard
//                         item={item}
//                         // onPress={() => router.push(`/loans/${item.loanId}`)}
//                         onPress={()=>navigation.navigate('LoanDetail', { id: item.loanId })}
//                     />
//                 )}
//                 // Paginación al final
//                 onEndReached={() => loadData()}
//                 onEndReachedThreshold={0.5}
//                 // Loader en el pie de página
//                 ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} /> : null}
//                 ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron préstamos.</Text>}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
//     header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//     headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.primary },
//     newButton: { backgroundColor: theme.colors.secondary, padding: 10, borderRadius: 8 },
//     search: { marginTop: 12, padding: 10, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 10, borderWidth:1, borderColor:theme.colors.border },
//     emptyText: { textAlign: 'center', marginTop: 20, color: theme.colors.text }
// });
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { getLoans } from "@/services/loans";
import { theme } from "@/utils/theme";
import LoanCard from "@/components/LoanCard";
import { useDebounce } from "@/hooks/useDebounce";

export default function LoansIndex({ navigation }: any) {
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);

    const pageRef = useRef(1);
    const totalRef = useRef(0);
    const isFetchingRef = useRef(false);

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔑 loadData: Depende solo de dq para el reset y usa refs para la paginación.
    const loadData = useCallback(async (reset = false) => {
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

        // try {
        //     const r = await getLoans({ page: pageToFetch, q: dq }); 
        //     console.log("useEffect :",r);
        //     const rawList = Array.isArray(r?.data) ? r.data : [];
            
        //     // Deduplicación simple para el lote actual (si la API devolvió duplicados)
        //     const uniqueList = rawList.filter((loan: { loanId: any; }, index: any, self: any[]) =>
        //         index === self.findIndex((t) => (t.loanId === loan.loanId))
        //     );

        //     const apiTotal = r?.total || totalRef.current;
        //     totalRef.current = apiTotal;
            
        //     // 🔑 USANDO CALLBACK: Aseguramos la unicidad de los IDs en el estado final
        //     setItems(prevItems => {
        //         const listToProcess = reset ? uniqueList : [...prevItems, ...uniqueList];
        //         const ids = new Set();
                
        //         return listToProcess.filter((item: { loanId: unknown; }) => {
        //             if (ids.has(item.loanId)) return false;
        //             ids.add(item.loanId);
        //             return true;
        //         });
        //     });

        //     // Si obtuvimos ítems, avanzamos la página
        //     if (rawList.length > 0) {
        //         pageRef.current = pageToFetch + 1;
        //     }

        // } catch (e) {
            try {
            const r = await getLoans(); 
            
            const rawList = Array.isArray(r?.data) ? r.data : [];
            
            // 🔑 NUEVO FILTRO: Eliminar elementos null/undefined/inválidos en rawList
            const cleanedList = rawList.filter((item: { loanId: any; }) => item && item.loanId);

            // Deduplicación simple para el lote actual (basado en la lista ya limpia)
            const uniqueList = cleanedList.filter((loan: { loanId: any; }, index: any, self: any[]) =>
                index === self.findIndex((t) => (t.loanId === loan.loanId))
            );

            const apiTotal = r?.total || totalRef.current;
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
        loadData(true);
    }, [dq, loadData]); // loadData se agrega aquí para que el hook sepa cuándo se actualiza

    // 3. Renderizado Condicional del ActivityIndicator (para la carga inicial)
    if (loading && items.length === 0) {
        return <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1, marginTop: 40 }} />;
    }

    // 4. Componente principal
    return (
        <View style={styles.container}>
            {/* Header y Botón Nuevo */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Préstamos</Text>
                <TouchableOpacity style={styles.newButton} 
                    onPress={()=>navigation.navigate('LoanCreate')}
                >
                    <Text style={{ color: "#fff" }}>Nuevo</Text>
                </TouchableOpacity>
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
                // renderItem={({ item }) => (
                //     <LoanCard
                //         item={item}
                //         // Asegúrate de que LoanCard maneje datos faltantes con ?. (customerName)
                //         onPress={()=>navigation.navigate('LoanDetail', { id: item.loanId })}
                //     />
                // )}
                renderItem={({ item }) => {
                    // 🔑 VERIFICACIÓN CRÍTICA: Si item es null o undefined, no renderizamos nada.
                    if (!item) {
                        return null;
                    }
                    
                    return (
                        <LoanCard
                            item={item}
                            onPress={()=>navigation.navigate('LoanDetail', { id: item.loanId })}
                        />
                    );
                }}
                // Paginación al final
                onEndReached={() => {
                    // Solo cargamos más si no estamos ya cargando
                    if (!isFetchingRef.current) loadData(false)
                }}
                onEndReachedThreshold={0.5}
                // Loader en el pie de página
                ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} /> : null}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron préstamos.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.primary },
    newButton: { backgroundColor: theme.colors.secondary, padding: 10, borderRadius: 8 },
    search: { marginTop: 12, padding: 10, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 10, borderWidth:1, borderColor:theme.colors.border },
    emptyText: { textAlign: 'center', marginTop: 20, color: theme.colors.text }
});