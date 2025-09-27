import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/utils/theme';

const LoginSchema = Yup.object().shape({
  userName: Yup.string().required('Requerido'),
  password: Yup.string().required('Requerido'),
});

export default function LoginScreen(){
  const { login } = useAuth();
  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>Iniciar sesión</Text>
      <Formik
        initialValues={{ userName:'', password:'' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await login(values.userName, values.password);
          } catch (e:any) {
            Alert.alert('Error', e.response?.data?.message || e.message || 'Error en login');
          } finally { setSubmitting(false); }
        }}
      >{({ handleChange, handleBlur, handleSubmit, values, isSubmitting, errors, touched }) => (
        <>
          <TextInput placeholder="Usuario" style={styles.input} onChangeText={handleChange('userName')} onBlur={handleBlur('userName')} value={values.userName} testID="input-username" />
          {errors.userName && touched.userName ? <Text style={styles.err}>{errors.userName}</Text> : null}
          <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} testID="input-password" />
          {errors.password && touched.password ? <Text style={styles.err}>{errors.password}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting} testID="button-login">
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </>
      )}
      </Formik>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:theme.colors.background, padding:20, justifyContent:'center' },
  title:{ fontSize:24, color:theme.colors.primary, marginBottom:20, textAlign:'center' },
  input:{ backgroundColor:theme.colors.surface, padding:12, borderRadius:8, marginBottom:10, borderWidth:1, borderColor:theme.colors.border },
  button:{ backgroundColor:theme.colors.primary, padding:14, borderRadius:8, alignItems:'center' },
  buttonText:{ color:'#fff', fontWeight:'600' },
  err:{ color:'red', marginBottom:8 }
});
