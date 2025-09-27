import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { createCustomer, getCustomerById, updateCustomer } from "@/services/customers";
import { theme } from "@/utils/theme";
import {CustomerDto,ReferenceDto} from '@/types/api';
type FormValues = CustomerDto;
// Esquema de validación para todos los campos del formulario
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("El nombre es requerido."),
  firstLastname: Yup.string().required("El apellido es requerido."),
  personalPhone: Yup.string().required("El teléfono es requerido."),
  email: Yup.string().email("Email inválido."),
  identification: Yup.string(),
});

export default function ClientEditScreen({ route, navigation }: any) {
  const { id } = route?.params || {}; // Extrae el ID de los parámetros
  const initialCustomer: FormValues = {
    firstName: "", secondName: "", firstLastname: "", secondLastname: "",
    identification: "", personalPhone: "", email: "", personalAddress: "",
    workAddress: "", workPhone: "", workplace: "",
    // Si CustomerDto tiene otros campos REQUERIDOS, incluir aquí como null o valor inicial.
  } as FormValues; // Usamos un cast inicial si FormValues es CustomerDto y tiene required.
  
  const [initialValues, setInitialValues] = useState<FormValues>(initialCustomer);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Efecto para cargar datos del cliente si existe un ID
  useEffect(() => {
    async function loadCustomer() {
      if (id) {
        setIsLoading(true);
        try {
          const response = await getCustomerById(id);
          if (response?.data) {
            setInitialValues(response.data); // Asigna los datos de la API al estado inicial
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
    
    // 🔑 AFIRMACIÓN DE TIPO (Type Assertion): 
    // Le decimos a TypeScript que el objeto `values` es un CustomerDto, 
    // ya que pasó la validación de Yup y contiene todos los campos necesarios.
    const customerData: CustomerDto = values as CustomerDto;

    try {
      if (id) {
        // Asegúrate de que tu updateCustomer acepta el ID y el DTO
        await updateCustomer(id, customerData); 
        Alert.alert("Éxito", "Cliente actualizado.");
      } else {
        await createCustomer(customerData);
        Alert.alert("Éxito", "Cliente creado.");
      }
      navigation.goBack();
    } catch (e: any) {
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
        {id ? "Editar Cliente" : "Crear Cliente"}
      </Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // 🔑 Habilita la recarga del formulario con los nuevos valores
      >
        {({ handleChange, handleBlur, handleSubmit, values, isSubmitting, errors, touched }) => (
          <>
            <TextInput
              placeholder="Primer Nombre"
              style={styles.input}
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
            />
            {errors.firstName && touched.firstName && <Text style={styles.err}>{errors.firstName}</Text>}
            <TextInput
              placeholder="Segundo Nombre (opcional)"
              style={styles.input}
              value={values.secondName}
              onChangeText={handleChange('secondName')}
            />
            <TextInput
              placeholder="Primer Apellido"
              style={styles.input}
              value={values.firstLastname}
              onChangeText={handleChange('firstLastname')}
              onBlur={handleBlur('firstLastname')}
            />
            {errors.firstLastname && touched.firstLastname && <Text style={styles.err}>{errors.firstLastname}</Text>}
            <TextInput
              placeholder="Segundo Apellido (opcional)"
              style={styles.input}
              value={values.secondLastname}
              onChangeText={handleChange('secondLastname')}
            />
            <TextInput
              placeholder="Identificación"
              style={styles.input}
              value={values.identification}
              onChangeText={handleChange('identification')}
            />
            <TextInput
              placeholder="Teléfono Personal"
              keyboardType="phone-pad"
              style={styles.input}
              value={values.personalPhone}
              onChangeText={handleChange('personalPhone')}
              onBlur={handleBlur('personalPhone')}
            />
            {errors.personalPhone && touched.personalPhone && <Text style={styles.err}>{errors.personalPhone}</Text>}
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            {errors.email && touched.email && <Text style={styles.err}>{errors.email}</Text>}
            <TextInput
              placeholder="Dirección Personal"
              style={styles.input}
              value={values.personalAddress}
              onChangeText={handleChange('personalAddress')}
            />
            <TextInput
              placeholder="Lugar de Trabajo"
              style={styles.input}
              value={values.workplace}
              onChangeText={handleChange('workplace')}
            />
            <TextInput
              placeholder="Dirección de Trabajo"
              style={styles.input}
              value={values.workAddress}
              onChangeText={handleChange('workAddress')}
            />
            <TextInput
              placeholder="Teléfono del Trabajo"
              keyboardType="phone-pad"
              style={styles.input}
              value={values.workPhone}
              onChangeText={handleChange('workPhone')}
            />

            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {id ? "Actualizar" : "Guardar"}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    color: theme.colors.primary,
    textAlign: "center",
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