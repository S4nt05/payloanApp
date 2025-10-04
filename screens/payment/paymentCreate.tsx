import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Alert, TouchableOpacity, TextInputProps, TextInput } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; 
import { createPayment } from '@/services/payments';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/utils/theme';

const Schema = Yup.object().shape({
 amount: Yup.number().moreThan(0,'Debe ser mayor a 0').required('Requerido'),
 paymentDate: Yup.string().required('Requerido'),
});

export default function PaymentCreate() {
 const params = useLocalSearchParams();
 const loanId = Number(params.id);
 const router = useRouter();
 const [dateShow, setDateShow] = useState(false);
 return (
  <SafeAreaView style={{flex: 1, marginTop: 40, padding: 16, backgroundColor: theme.colors.background}}>
   <Text style={{fontSize:20, fontWeight:'700', color: theme.colors.primary}}>Nuevo pago</Text>
   <Formik
    initialValues={{ loanId, amount:'', paymentDate: new Date().toISOString(), comentary:'', paymentMethodId: 1, isPartialPayment: 0, userCreated: '' }}
    validationSchema={Schema}
    onSubmit={async (values,{setSubmitting})=>{
     try{
      await createPayment({
       ...values,
       amount: Number(values.amount),
       loanId
      });
      Alert.alert('Éxito','Pago registrado');
      router.back();
     }catch(e:any){
      Alert.alert('Error', e.response?.data?.message || 'No se pudo crear el pago');
     }finally{ setSubmitting(false); }
    }}
   >
    {({ handleChange, handleSubmit, values, isSubmitting, setFieldValue }) => {
            // 🔑 Función para manejar la selección de fecha y actualizar Formik
            const handleConfirmDate = (date: Date) => {
                setFieldValue('paymentDate', date.toISOString());
                setDateShow(false);
            };

            return (
                <>
                    <Text style={{marginTop:12}}>Monto</Text>
                    <TextInputStyled value={String(values.amount)} onChangeText={handleChange('amount')} placeholder="0.00" keyboardType="numeric" />

                    <Text style={{marginTop:8}}>Fecha de pago</Text>
                    <TouchableOpacity 
                        style={[styles.selector, styles.disabledSelector]} 
                        onPress={()=> setDateShow(true)}
                        disabled={true}
                    >
                      <Text style={styles.disabledText}>{new Date().toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {/* 🔑 NUEVO COMPONENTE: Eliminamos headerTextIOS */}
                    {/* <DateTimePickerModal
                        isVisible={dateShow} 
                        mode="date"
                        date={new Date(values.paymentDate)} 
                        onConfirm={handleConfirmDate} 
                        onCancel={() => setDateShow(false)} 
                    /> */}

                    <Text style={{marginTop:8}}>Comentario (Opcional)</Text>
                    <TextInputStyled 
                        value={values.comentary} 
                        onChangeText={handleChange('comentary')} 
                        placeholder="Añade una nota a este pago..." 
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting}>
                        <Text style={{color:'#fff'}}>{isSubmitting ? 'Guardando...' : 'Registrar Pago'}</Text>
                    </TouchableOpacity>
                </>
            );
        }}
   </Formik>
  </SafeAreaView>
 );
}

export function TextInputStyled(props: TextInputProps) {
 return (
  <TextInput
   style={styles.input}
   placeholderTextColor="#999"
   {...props}
  />
 );
}

const styles = StyleSheet.create({
 selector:{ padding:12, backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor: theme.colors.border },
 disabledSelector:{ backgroundColor:'#f5f5f5', borderColor:'#ddd', opacity:0.6 },
 disabledText:{ color:'#999' },
 button:{ marginTop:14, backgroundColor: theme.colors.primary, padding:14, borderRadius:10, alignItems:'center' }
, input: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  borderRadius: 8,
  marginVertical: 5,
  backgroundColor: '#fff',
  minHeight: 80,
  height: 80,
 },
});