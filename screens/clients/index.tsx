import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { fetchCustomers } from "@/services/customers";
import CustomerCard from "@/components/CustomerCard";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomerDto } from "@/types/api";

export default function ClientsIndex({ navigation }: any) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Evita cargar varias veces al hacer scroll rápido
  const isFetchingRef = useRef(false);

  const load = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current || (!hasMore && !reset)) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const nextPage = reset ? 1 : page;
        const res = await fetchCustomers({ page: nextPage, q });
        const list = res.data ?? [];
        setHasMore(list.length > 0);

        setItems((prevItems) => {
          let newItems = reset ? list : [...prevItems, ...list];
          // Filtra duplicados por id
          const seen = new Set();
          newItems = newItems.filter((item) => {
            if (!item || !item.id) return false;
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          return newItems;
        });

        if (!reset) setPage(nextPage + 1);
        else setPage(2);
      } catch (e) {
        // Manejo de error opcional
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [page, q, hasMore]
  );

  // Buscar o refrescar
  useEffect(() => {
    load(true);
  }, [q]);

  // Carga inicial
  useEffect(() => {
    if (items.length === 0 && !isFetchingRef.current) {
      load(true);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
      </View>
      <TextInput
        placeholder="Buscar..."
        style={styles.search}
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CustomerCard
            item={item}
            onPress={() => navigation.navigate("ClientDetail", { id: item.id })}
          />
        )}
        onEndReached={() => load()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
      />
      {/* Botón flotante para agregar clientes */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("ClientEdit")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 12,
    paddingTop: 32,
  },
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  search: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
