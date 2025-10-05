import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getCustomerById } from "@/services/customers";
import { theme } from "@/utils/theme";

// Tipos base para Reference y Customer (para claridad)
type Reference = {
  id?: number; // <-- Agregado para usar como key única si existe
  firstName: string;
  firstLastname: string;
  personalPhone: string;
  workplace: string;
  email: string | null;
  // ... otros campos
};

type CustomerData = {
  firstName: string;
  firstLastname: string;
  email: string | null;
  personalPhone: string | null;
  personalAddress: string | null;
  workplace: string | null;
  workPhone: string | null;
  secondName: string | null;
  secondLastname: string | null;
  // Anidado para document
  document: {
    identification: string | null;
    documentTypeId: number;
    // ...
  };
  reference: Reference[]; // Lista de referencias
  // ... otros campos
};

export default function ClientDetail({ route, navigation }: any) {
  const id = route?.params?.id || route?.params?.query?.id;

  // Usaremos CustomerData o null
  const [data, setData] = useState<CustomerData | null>(null);
  const [tab, setTab] = useState<"datos" | "refs" | "document">("datos");

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const r = await getCustomerById(Number(id));
        if (r && r.data) {
          setData(r.data);
        } else {
          Alert.alert("Error", "Respuesta de API inválida.");
        }
      } catch (e) {
        Alert.alert("Error", "No se pudo cargar la información del cliente.");
      }
    })();
  }, [id]);

  if (!data)
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Cargando...</Text>
      </View>
    );

  const client = data;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {client.firstName} {client.firstLastname}
      </Text>
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("datos")}
          style={[styles.tab, tab === "datos" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "datos" && styles.tabTextActive]}
          >
            Datos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("refs")}
          style={[styles.tab, tab === "refs" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "refs" && styles.tabTextActive]}
          >
            Referencias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("document")}
          style={[styles.tab, tab === "document" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "document" && styles.tabTextActive]}
          >
            Documentos
          </Text>
        </TouchableOpacity>
      </View>

      {/* --------------------- TAB: DATOS PERSONALES --------------------- */}
      {tab === "datos" && (
        <View style={styles.tabContent}>
          <DataField
            label="Nombre Completo"
            value={`${client.firstName || ""} ${client.secondName || ""} ${
              client.firstLastname || ""
            } ${client.secondLastname || ""}`}
          />
          <DataField
            label="Identificación"
            value={client.document?.identification || "N/A"}
          />
          <DataField
            label="Tel. Personal"
            value={client.personalPhone || "N/A"}
          />
          <DataField label="Email" value={client.email || "N/A"} />
          <DataField
            label="Dirección Personal"
            value={client.personalAddress || "N/A"}
          />
          <DataField
            label="Lugar de Trabajo"
            value={client.workplace || "N/A"}
          />
          <DataField label="Tel. Trabajo" value={client.workPhone || "N/A"} />

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("ClientEdit", { id })}
          >
            <Text style={styles.editButtonText}>Editar Cliente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --------------------- TAB: REFERENCIAS --------------------- */}
      {tab === "refs" && (
        <View style={styles.tabContent}>
          {(client.reference || []).length === 0 ? (
            <Text style={styles.noDataText}>
              No hay referencias registradas.
            </Text>
          ) : (
            (client.reference || []).map((ref: Reference, idx: number) => (
              <ReferenceCard
                key={ref.id ?? idx} // <-- Usa id si existe, si no el índice
                reference={ref}
              />
            ))
          )}
        </View>
      )}

      {/* --------------------- TAB: Documents (Placeholder) --------------------- */}
      {tab === "document" && (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>
            Aquí se mostrará la lista de documentos del cliente.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// --------------------- COMPONENTES ATÓMICOS ---------------------

const DataField = ({ label, value }: { label: string; value: string }) => (
  <View style={localStyles.dataFieldContainer}>
    <Text style={localStyles.dataFieldLabel}>{label}:</Text>
    <Text style={localStyles.dataFieldValue}>{value}</Text>
  </View>
);

const ReferenceCard: React.FC<{ reference: Reference }> = ({ reference }) => (
  <View style={localStyles.referenceCard}>
    <Text style={localStyles.referenceName}>
      {reference.firstName} {reference.firstLastname}
    </Text>
    <Text style={localStyles.referenceDetail}>
      Teléfono: {reference.personalPhone || "N/A"}
    </Text>
    <Text style={localStyles.referenceDetail}>
      Trabajo: {reference.workplace || "N/A"}
    </Text>
  </View>
);

// --------------------- ESTILOS ---------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 32, // margen superior para separar del status bar
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    padding: 16,
    color: theme.colors.primary,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tab: { paddingVertical: 10, paddingHorizontal: 15, marginRight: 15 },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.secondary,
  },
  tabText: { fontSize: 16, color: theme.colors.text, fontWeight: "500" },
  tabTextActive: { color: theme.colors.primary, fontWeight: "700" },
  tabContent: { padding: 16 },
  editButton: {
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  editButtonText: {
    color: theme.colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
  noDataText: {
    fontStyle: "italic",
    color: theme.colors.text,
    marginTop: 10,
  },
});

// Estilos locales para los subcomponentes
const localStyles = StyleSheet.create({
  dataFieldContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dataFieldLabel: {
    fontWeight: "600",
    width: 150,
    color: theme.colors.text,
  },
  dataFieldValue: {
    flex: 1,
    color: theme.colors.text,
  },
  referenceCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  referenceName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
    color: theme.colors.primary,
  },
  referenceDetail: {
    fontSize: 14,
    color: theme.colors.text,
  },
});
