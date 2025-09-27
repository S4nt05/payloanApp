import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signupService } from '@/services/auth';
import { theme } from '@/utils/theme';

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2).required('Requerido'),
  email: Yup.string().email('Email inválido').required('Requerido'),
  userName: Yup.string().min(3).required('Requerido'),
  password: Yup.string().min(8,'Min 8').required('Requerido'),
});

export default function SignupScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Formik
        initialValues={{ name:'', email:'', userName:'', password:'' }}
        validationSchema={SignupSchema}
        onSubmit={async (values,{ setSubmitting }) => {
          try {
            await signupService(values);
            Alert.alert('Éxito','Cuenta creada');
          } catch (e:any) {
            Alert.alert('Error', e.response?.data?.message || 'Error al registrar');
          } finally { setSubmitting(false); }
        }}
      >{({ handleChange, handleBlur, handleSubmit, values, isSubmitting, errors, touched }) => (
        <>
          <TextInput placeholder="Nombre" style={styles.input} onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} />
          {errors.name && touched.name ? <Text style={styles.err}>{errors.name}</Text> : null}
          <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} />
          {errors.email && touched.email ? <Text style={styles.err}>{errors.email}</Text> : null}
          <TextInput placeholder="Usuario" style={styles.input} onChangeText={handleChange('userName')} onBlur={handleBlur('userName')} value={values.userName} />
          {errors.userName && touched.userName ? <Text style={styles.err}>{errors.userName}</Text> : null}
          <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} />
          {errors.password && touched.password ? <Text style={styles.err}>{errors.password}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </>
      )}</Formik>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:theme.colors.background, padding:20, justifyContent:'center' },
  title:{ fontSize:24, color:theme.colors.primary, marginBottom:20, textAlign:'center' },
  input:{ backgroundColor:theme.colors.surface, padding:12, borderRadius:8, marginBottom:10, borderWidth:1, borderColor:theme.colors.border },
  button:{ backgroundColor:theme.colors.secondary, padding:14, borderRadius:8, alignItems:'center' },
  buttonText:{ color:'#fff', fontWeight:'600' },
  err:{ color:'red', marginBottom:8 }
});