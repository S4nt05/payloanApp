// import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
// import { fetchCustomers } from '@/services/customers';
// import { useDebounce } from '@/hooks/useDebounce';
// import CustomerCard from '@/components/CustomerCard';
// import { theme } from '@/utils/theme';

// export default function ClientsIndex({ navigation }:any){
//   const [q, setQ] = useState('');
//   const dq = useDebounce(q, 400);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<any[]>([]);
//   const [total, setTotal] = useState(0);

//   const load = useCallback(async (reset=false) => {
//     try{
//       setLoading(true);
//       const p = reset ? 1 : page;
//       const r = await fetchCustomers({ page: p, q: dq });

//       console.log("fetchCustomers : ", r);
//       const list = r.items || r;
//       setTotal(r.total || list.length);
//       setItems(reset ? list : [...items, ...list]);
//       setPage(p + 1);
//     }catch(e){ console.warn(e); }
//     finally{ setLoading(false); }
//   }, [dq, page]);

//   useEffect(()=>{ setItems([]); setPage(1); load(true); }, [dq]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Clientes</Text>
//         <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('/clients/create')}>
//           <Text style={{color:'#fff'}}>Nuevo</Text>
//         </TouchableOpacity>
//       </View>
//       <TextInput placeholder="Buscar..." style={styles.search} value={q} onChangeText={setQ} />
//       <FlatList
//         data={items}
//         keyExtractor={(i)=>String(i.id)}
//         renderItem={({item})=> <CustomerCard item={item} onPress={()=>navigation.navigate('/clients/[id]', { id: item.id })} /> }
//         onEndReached={()=> load()}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={loading ? <ActivityIndicator/> : null}
//       />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container:{ flex:1, backgroundColor:theme.colors.background, padding:12 },
//   title:{ fontSize:20, fontWeight:'700', color:theme.colors.text },
//   header:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
//   button:{ backgroundColor:theme.colors.primary, padding:10, borderRadius:8 },
//   search:{ backgroundColor:theme.colors.surface, padding:10, borderRadius:8, marginVertical:10, borderWidth:1, borderColor:theme.colors.border }
// });

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { fetchCustomers } from '@/services/customers';
import { useDebounce } from '@/hooks/useDebounce';
import CustomerCard from '@/components/CustomerCard';
import { theme } from '@/utils/theme';

export default function ClientsIndex({ navigation }:any){
    const [q, setQ] = useState('');
    const dq = useDebounce(q, 400);
    
    // 🔑 1. AISLAMIENTO: Usamos useRef para el estado de la página
    const pageRef = useRef(1); 
    const totalRef = useRef(0); // También aislamos el total para la verificación de límite
    
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    // 🔑 USAMOS useRef para aislar todos los valores que NO deben causar re-renderizados
    const dqRef = useRef(dq); // Ref para el valor de búsqueda (dq)
    const isFetchingRef = useRef(false); // Ref para evitar llamadas concurrentes

const load = useCallback(async (reset = false) => {
        // 🛑 Evitar llamadas concurrentes
        if (isFetchingRef.current) return;
        
        isFetchingRef.current = true;
        setLoading(true);

        const pageToFetch = reset ? 1 : pageRef.current;
        const currentQuery = reset ? dqRef.current : dq; // Usar el dq más reciente en reset

        // 🛑 LÍMITE: Si ya cargamos todo y no es un reset, salimos.
        if (!reset && items.length >= totalRef.current && totalRef.current > 0) {
            isFetchingRef.current = false;
            setLoading(false);
            return;
        }

        try {
            const r = await fetchCustomers({ page: pageToFetch, q: currentQuery });

            const list = Array.isArray(r?.data) ? r.data : [];
            const apiTotal = r?.total || totalRef.current;

            totalRef.current = apiTotal;
            
            // Actualizamos items (usando la forma funcional para no depender de items en useCallback)
            setItems(prevItems => (reset ? list : [...prevItems, ...list]));
            
            // Avanza la página si hubo datos
            if (list.length > 0) {
                pageRef.current = pageToFetch + 1;
            } else if (reset) {
                pageRef.current = 2; // Si no hay resultados en pág 1, la siguiente será la 2 (vacía)
            }

        } catch (e) {
            console.warn("Error fetching customers:", e);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, [items.length]); // Dependencia mínima: solo para la lógica de límite de paginación

    // 2. useEffect para la Búsqueda (Monitorea dq y dispara el RESET)
    useEffect(() => {
        // Si el valor debounced ha cambiado, reseteamos la lista y cargamos la página 1
        if (dqRef.current !== dq) {
            dqRef.current = dq; // Actualizamos la referencia con el nuevo valor de búsqueda
            
            pageRef.current = 1;
            totalRef.current = 0;
            setItems([]); // Limpiar la lista para la nueva búsqueda
            
            // Llama a la carga con RESET
            load(true); 
        }
    }, [dq, load]); // Depende de dq (para el cambio) y loadData (para la ejecución)

    // 3. useEffect para la Carga Inicial
    useEffect(() => {
        // Carga inicial solo si la lista está vacía
        if (items.length === 0 && !isFetchingRef.current) {
             load(true);
        }
    }, []); // Se ejecuta solo una vez al montar el componente

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ClientEdit')}>
          <Text style={{color:'#fff'}}>Nuevo</Text>
        </TouchableOpacity>
      </View>
      <TextInput placeholder="Buscar..." style={styles.search} value={q} onChangeText={setQ} />
      <FlatList
        data={items}
        keyExtractor={(i)=>String(i.id)}
        renderItem={({item})=> <CustomerCard item={item} onPress={()=>navigation.navigate('ClientDetail', { id: item.id })} /> }
        onEndReached={()=> load()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator/> : null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
 container:{ flex:1, backgroundColor:theme.colors.background, padding:12 },
 title:{ fontSize:20, fontWeight:'700', color:theme.colors.text },
 header:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
 button:{ backgroundColor:theme.colors.primary, padding:10, borderRadius:8 },
 search:{ backgroundColor:theme.colors.surface, padding:10, borderRadius:8, marginVertical:10, borderWidth:1, borderColor:theme.colors.border }
});
