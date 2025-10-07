import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from "@/services/customers";
import { getCountries, getDocumentTypes } from "@/services/catalogs";
import { theme } from "@/utils/theme";
import { CustomerDto, ReferenceDto, CatalogItem } from "@/types/api";
type FormValues = CustomerDto;

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("El nombre es requerido."),
  firstLastname: Yup.string().required("El apellido es requerido."),
  personalPhone: Yup.string().required("El teléfono es requerido."),
  email: Yup.string().email("Email inválido."),
});

export default function ClientEditScreen({ route, navigation }: any) {
  const { id } = route?.params || {};
  const initialCustomer: FormValues = {
    firstName: "",
    secondName: "",
    firstLastname: "",
    secondLastname: "",
    identification: "",
    personalPhone: "",
    email: "",
    personalAddress: "",
    workAddress: "",
    workPhone: "",
    workplace: "",
    countryId: undefined,
    state: "Activo",
    document: {
      documentId: undefined,
      documentTypeId: undefined,
      identification: "",
      file: undefined,
    },
    references: [
      { firstName: "", firstLastname: "", personalPhone: "", workplace: "" },
    ],
  } as FormValues;

  const [initialValues, setInitialValues] =
    useState<FormValues>(initialCustomer);
  const [isLoading, setIsLoading] = useState(false);

  // Catálogos
  const [countries, setCountries] = useState<CatalogItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<CatalogItem[]>([]);

  useEffect(() => {
    getCountries().then(setCountries);
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  useEffect(() => {
    async function loadCustomer() {
      if (id) {
        setIsLoading(true);
        try {
          const response = await getCustomerById(id);
          if (response?.data) {
            setInitialValues(response.data);
          }
        } catch (e) {
          Alert.alert("Error", "No se pudo cargar la información del cliente.");
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadCustomer();
  }, [id]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    const customerData: CustomerDto = values as CustomerDto;
    try {
      if (id) {
        await updateCustomer(id, customerData);
        Alert.alert("Éxito", "Cliente actualizado.");
      } else {
        await createCustomer(customerData);
        Alert.alert("Éxito", "Cliente creado.");
      }
      navigation.goBack();
    } catch (e: any) {
      console.log("Error al crear cliente:", e);
      Alert.alert("Error", e.response?.data?.message || "Ocurrió un error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (id && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando datos del cliente...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {id ? "Editar Cliente" : "Nuevo Cliente"}
      </Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          isSubmitting,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              placeholder="Primer Nombre"
              style={styles.input}
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
            />
            {errors.firstName && touched.firstName && (
              <Text style={styles.err}>{errors.firstName}</Text>
            )}
            <TextInput
              placeholder="Segundo Nombre (opcional)"
              style={styles.input}
              value={values.secondName}
              onChangeText={handleChange("secondName")}
            />
            <TextInput
              placeholder="Primer Apellido"
              style={styles.input}
              value={values.firstLastname}
              onChangeText={handleChange("firstLastname")}
              onBlur={handleBlur("firstLastname")}
            />
            {errors.firstLastname && touched.firstLastname && (
              <Text style={styles.err}>{errors.firstLastname}</Text>
            )}
            <TextInput
              placeholder="Segundo Apellido (opcional)"
              style={styles.input}
              value={values.secondLastname}
              onChangeText={handleChange("secondLastname")}
            />
            {/* País */}
            <Text style={{ marginTop: 10, marginBottom: 4, fontWeight: "600" }}>
              País
            </Text>
            {Platform.OS === "android" ? (
              <Picker
                selectedValue={values.countryId}
                onValueChange={(v) => setFieldValue("countryId", v)}
                style={styles.input}
              >
                <Picker.Item label="Selecciona país" value={undefined} />
                {countries.map((c) => (
                  <Picker.Item key={c.id} label={c.name} value={c.id} />
                ))}
              </Picker>
            ) : (
              <TextInput
                placeholder="País"
                style={styles.input}
                value={
                  countries.find((c) => c.id === values.countryId)?.name || ""
                }
                editable={false}
              />
            )}
            <TextInput
              placeholder="Identificación"
              style={styles.input}
              value={values.identification}
              onChangeText={handleChange("identification")}
            />
            <TextInput
              placeholder="Teléfono Personal"
              keyboardType="phone-pad"
              style={styles.input}
              value={values.personalPhone}
              onChangeText={handleChange("personalPhone")}
              onBlur={handleBlur("personalPhone")}
            />
            {errors.personalPhone && touched.personalPhone && (
              <Text style={styles.err}>{errors.personalPhone}</Text>
            )}
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            {errors.email && touched.email && (
              <Text style={styles.err}>{errors.email}</Text>
            )}
            <TextInput
              placeholder="Dirección Personal"
              style={styles.input}
              value={values.personalAddress}
              onChangeText={handleChange("personalAddress")}
            />
            <TextInput
              placeholder="Lugar de Trabajo"
              style={styles.input}
              value={values.workplace}
              onChangeText={handleChange("workplace")}
            />
            <TextInput
              placeholder="Dirección de Trabajo"
              style={styles.input}
              value={values.workAddress}
              onChangeText={handleChange("workAddress")}
            />
            <TextInput
              placeholder="Teléfono del Trabajo"
              keyboardType="phone-pad"
              style={styles.input}
              value={values.workPhone}
              onChangeText={handleChange("workPhone")}
            />
            {/* Tipo de documento */}
            <Text style={{ marginTop: 10, marginBottom: 4, fontWeight: "600" }}>
              Tipo de documento
            </Text>
            {Platform.OS === "android" ? (
              <Picker
                selectedValue={values.document?.documentTypeId}
                onValueChange={(v) =>
                  setFieldValue("document", {
                    ...values.document,
                    documentTypeId: v,
                  })
                }
                style={styles.input}
              >
                <Picker.Item label="Selecciona tipo" value={undefined} />
                {documentTypes.map((dt) => (
                  <Picker.Item
                    key={dt.id}
                    label={dt.description || dt.name}
                    value={dt.id}
                  />
                ))}
              </Picker>
            ) : (
              <TextInput
                placeholder="Tipo de documento"
                style={styles.input}
                value={
                  documentTypes.find(
                    (dt) => dt.id === values.document?.documentTypeId
                  )?.description || ""
                }
                editable={false}
              />
            )}
            <TextInput
              placeholder="Número de documento"
              style={styles.input}
              value={values.document?.identification ?? ""}
              onChangeText={(v) =>
                setFieldValue("document", {
                  ...values.document,
                  identification: v,
                })
              }
            />
            {/* Adjuntar archivo */}
            <TouchableOpacity
              style={[
                styles.input,
                {
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "row",
                },
              ]}
              onPress={async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  type: ["application/pdf", "image/*"],
                  copyToCacheDirectory: true,
                  multiple: false,
                });
                if (result.assets && result.assets.length > 0) {
                  const file = result.assets[0];
                  setFieldValue("document", {
                    ...values.document,
                    file: {
                      uri: file.uri,
                      name: file.name,
                      type: file.mimeType || "application/octet-stream",
                    },
                  });
                }
              }}
            >
              <Text>
                {values.document?.file?.name
                  ? `Archivo: ${values.document.file.name}`
                  : "Seleccionar archivo (PDF o imagen)"}
              </Text>
            </TouchableOpacity>
            {/* Referencia personal */}
            <Text style={{ marginTop: 16, fontWeight: "bold" }}>
              Referencia personal
            </Text>
            <TextInput
              placeholder="Nombre referencia"
              style={styles.input}
              value={values.references?.[0]?.firstName ?? ""}
              onChangeText={(v) => {
                const refs = values.references ? [...values.references] : [{}];
                refs[0] = { ...refs[0], firstName: v };
                setFieldValue("references", refs);
              }}
            />
            <TextInput
              placeholder="Apellido referencia"
              style={styles.input}
              value={values.references?.[0]?.firstLastname ?? ""}
              onChangeText={(v) => {
                const refs = values.references ? [...values.references] : [{}];
                refs[0] = { ...refs[0], firstLastname: v };
                setFieldValue("references", refs);
              }}
            />
            <TextInput
              placeholder="Celular referencia"
              style={styles.input}
              value={values.references?.[0]?.personalPhone ?? ""}
              onChangeText={(v) => {
                const refs = values.references ? [...values.references] : [{}];
                refs[0] = { ...refs[0], personalPhone: v };
                setFieldValue("references", refs);
              }}
            />
            <TextInput
              placeholder="Lugar de trabajo referencia"
              style={styles.input}
              value={values.references?.[0]?.workplace ?? ""}
              onChangeText={(v) => {
                const refs = values.references ? [...values.references] : [{}];
                refs[0] = { ...refs[0], workplace: v };
                setFieldValue("references", refs);
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {id ? "Actualizar Cliente" : "Crear Cliente"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    color: theme.colors.primary,
    textAlign: "left",
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  err: {
    color: theme.colors.danger,
    marginBottom: 10,
    marginTop: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
});
