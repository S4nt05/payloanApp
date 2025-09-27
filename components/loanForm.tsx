// // src/components/LoanForm.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { theme } from '@/utils/theme';
// import { formatCurrency } from '@/utils/format';
// import { getLoans } from '@/services/loans';
// import { fetchCustomers } from '@/services/customers';
// import { CatalogItem } from '@/types/api';
// import api from '@/services/api';

// type Props = {
//   initial?: any;
//   onSubmit: (values: any) => Promise<void>;
//   submitting?: boolean;
// };

// const LoanSchema = Yup.object().shape({
//   customerId: Yup.number().required('Selecciona cliente'),
//   loanAmount: Yup.number().moreThan(0, 'Debe ser mayor a 0').required('Requerido'),
//   term: Yup.number().integer().min(1,'Min 1').required('Requerido'),
//   interestRate: Yup.number().min(0).required('Requerido'),
//   comment: Yup.string().required('Comentario requerido'),
// });

// export default function LoanForm({ initial, onSubmit, submitting }: Props) {
//   const [frequencies, setFrequencies] = useState<CatalogItem[]>([]);
//   const [calcTypes, setCalcTypes] = useState<CatalogItem[]>([]);
//   const [showDate, setShowDate] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const f = await api.get('/api/Catalogs/GetFrequencyPayment');
//         const c = await api.get('/api/Catalogs/GetCalculationTypeLoan');
//         setFrequencies(f.data || []);
//         setCalcTypes(c.data || []);
//       } catch (e) {
//         // ignore
//       }
//     })();
//   }, []);

//   return (
//     <Formik
//       initialValues={{
//         customerId: initial?.customerId ?? null,
//         loanAmount: initial?.loanAmount ?? '',
//         term: initial?.term ?? 1,
//         interestRate: initial?.interestRate ?? 0,
//         paymentFrequencyId: initial?.paymentFrequencyId ?? null,
//         calculationTypeLoanId: initial?.calculationTypeLoanId ?? null,
//         disbursementDate: initial?.disbursementDate ?? new Date().toISOString(),
//         firstDayPay: initial?.firstDayPay ?? null,
//         comment: initial?.comment ?? '',
//       }}
//       validationSchema={LoanSchema}
//       onSubmit={onSubmit}
//     >
//       {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
//         <View style={styles.form}>
//           <Text style={styles.label}>Cliente</Text>
//           <TouchableOpacity style={styles.selector} onPress={() => {
//             // abrir modal de búsqueda de clientes (implementar en pantalla padre)
//             setFieldValue('openCustomerPicker', true);
//           }}>
//             <Text>{values.customerId ? `ID: ${values.customerId}` : 'Seleccionar cliente...'}</Text>
//           </TouchableOpacity>

//           <Text style={styles.label}>Monto</Text>
//           <TextInput
//             keyboardType="numeric"
//             value={String(values.loanAmount)}
//             onChangeText={(t) => {
//               const num = t.replace(/[^0-9.]/g, '');
//               setFieldValue('loanAmount', num);
//             }}
//             style={styles.input}
//             placeholder="0.00"
//           />
//           {/* {errors.loanAmount && touched.loanAmount && <Text style={styles.err}>{errors.loanAmount}</Text>} */}
//           {errors.loanAmount && touched.loanAmount && (<Text style={styles.err}>{errors.loanAmount as string}</Text>)}
//           <View style={styles.row}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.label}>Plazo (meses)</Text>
//               <TextInput keyboardType="numeric" style={styles.input} value={String(values.term)} onChangeText={handleChange('term')} />
//             </View>
//             <View style={{ width: 12 }} />
//             <View style={{ flex: 1 }}>
//               <Text style={styles.label}>Interés %</Text>
//               <TextInput keyboardType="numeric" style={styles.input} value={String(values.interestRate)} onChangeText={handleChange('interestRate')} />
//             </View>
//           </View>

//           <Text style={styles.label}>Frecuencia de pago</Text>
//           <View style={styles.selector}>
//             <TouchableOpacity onPress={() => {
//               // picker simple inline
//               const next = frequencies[0];
//               if (next) setFieldValue('paymentFrequencyId', next.id);
//             }}>
//               <Text>{frequencies.find(f => f.id === values.paymentFrequencyId)?.name ?? 'Seleccionar frecuencia'}</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.label}>Tipo de cálculo</Text>
//           <View style={styles.selector}>
//             <TouchableOpacity onPress={() => {
//               const next = calcTypes[0];
//               if (next) setFieldValue('calculationTypeLoanId', next.id);
//             }}>
//               <Text>{calcTypes.find(c => c.id === values.calculationTypeLoanId)?.name ?? 'Seleccionar tipo'}</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.label}>Fecha desembolso</Text>
//           <TouchableOpacity style={styles.selector} onPress={() => setShowDate(true)}>
//             <Text>{values.disbursementDate ? new Date(values.disbursementDate).toLocaleDateString() : 'Seleccionar fecha'}</Text>
//           </TouchableOpacity>
//           {showDate && (
//             <DateTimePicker
//               value={values.disbursementDate ? new Date(values.disbursementDate) : new Date()}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={(_, d) => {
//                 setShowDate(false);
//                 if (d) setFieldValue('disbursementDate', d.toISOString());
//               }}
//             />
//           )}

//           <Text style={styles.label}>Comentario</Text>
//           <TextInput style={[styles.input, { height: 90 }]} multiline value={values.comment} onChangeText={handleChange('comment')} />

//           <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()} disabled={submitting}>
//             {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar préstamo</Text>}
//           </TouchableOpacity>
//         </View>
//       )}
//     </Formik>
//   );
// }

// const styles = StyleSheet.create({
//   form: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
//   label: { color: theme.colors.text, marginBottom: 6, fontWeight: '600' },
//   input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
//   selector: { padding: 12, borderRadius: 8, backgroundColor: '#fafafa', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
//   row: { flexDirection: 'row' },
//   err: { color: 'red', marginBottom: 8 },
//   submit: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
//   submitText: { color: '#fff', fontWeight: '700' }
// });
// src/components/LoanForm.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
// 🛑 ELIMINAR: import DateTimePicker from '@react-native-community/datetimepicker'; 
// 🔑 AÑADIR: La librería puramente JS
import DateTimePickerModal from 'react-native-modal-datetime-picker'; 
import { theme } from '@/utils/theme';
import { formatCurrency } from '@/utils/format';
import { getLoans } from '@/services/loans';
import { fetchCustomers } from '@/services/customers';
import { CatalogItem } from '@/types/api';
import api from '@/services/api';

type Props = {
 initial?: any;
 onSubmit: (values: any) => Promise<void>;
 submitting?: boolean;
};

const LoanSchema = Yup.object().shape({
 customerId: Yup.number().required('Selecciona cliente'),
 loanAmount: Yup.number().moreThan(0, 'Debe ser mayor a 0').required('Requerido'),
 term: Yup.number().integer().min(1,'Min 1').required('Requerido'),
 interestRate: Yup.number().min(0).required('Requerido'),
 comment: Yup.string().required('Comentario requerido'),
});


/*
export default function LoanForm({ initial, onSubmit, submitting }: Props) {
 const [frequencies, setFrequencies] = useState<CatalogItem[]>([]);
 const [calcTypes, setCalcTypes] = useState<CatalogItem[]>([]);
 const [showDate, setShowDate] = useState(false);

 useEffect(() => {
  (async () => {
   try {
    const f = await api.get('/api/Catalogs/GetFrequencyPayment');
    const c = await api.get('/api/Catalogs/GetCalculationTypeLoan');
    setFrequencies(f.data || []);
    setCalcTypes(c.data || []);
   } catch (e) {
    // ignore
   }
  })();
 }, []);

 return (
  <Formik
   initialValues={{
    customerId: initial?.customerId ?? null,
    loanAmount: initial?.loanAmount ?? '',
    term: initial?.term ?? 1,
    interestRate: initial?.interestRate ?? 0,
    paymentFrequencyId: initial?.paymentFrequencyId ?? null,
    calculationTypeLoanId: initial?.calculationTypeLoanId ?? null,
    disbursementDate: initial?.disbursementDate ?? new Date().toISOString(),
    firstDayPay: initial?.firstDayPay ?? null,
    comment: initial?.comment ?? '',
   }}
   validationSchema={LoanSchema}
   onSubmit={onSubmit}
  >
   {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => {

            // 🔑 Función para manejar la selección de fecha y actualizar Formik
            const handleConfirmDate = (date: Date) => {
                setFieldValue('disbursementDate', date.toISOString());
                setShowDate(false);
            };

            return (
                <View style={styles.form}>
                    <Text style={styles.label}>Cliente</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => {
                        // abrir modal de búsqueda de clientes (implementar en pantalla padre)
                        setFieldValue('openCustomerPicker', true);
                    }}>
                        <Text>{values.customerId ? `ID: ${values.customerId}` : 'Seleccionar cliente...'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Monto</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(values.loanAmount)}
                        onChangeText={(t) => {
                            const num = t.replace(/[^0-9.]/g, '');
                            setFieldValue('loanAmount', num);
                        }}
                        style={styles.input}
                        placeholder="0.00"
                    />
                    {errors.loanAmount && touched.loanAmount && (<Text style={styles.err}>{errors.loanAmount as string}</Text>)}
                    
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Plazo (meses)</Text>
                            <TextInput keyboardType="numeric" style={styles.input} value={String(values.term)} onChangeText={handleChange('term')} />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Interés %</Text>
                            <TextInput keyboardType="numeric" style={styles.input} value={String(values.interestRate)} onChangeText={handleChange('interestRate')} />
                        </View>
                    </View>

                    <Text style={styles.label}>Frecuencia de pago</Text>
                    <View style={styles.selector}>
                        <TouchableOpacity onPress={() => {
                            // picker simple inline
                            const next = frequencies[0];
                            if (next) setFieldValue('paymentFrequencyId', next.id);
                        }}>
                            <Text>{frequencies?.find(f => f.id === values.paymentFrequencyId)?.name ?? 'Seleccionar frecuencia'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Tipo de cálculo</Text>
                    <View style={styles.selector}>
                        <TouchableOpacity onPress={() => {
                            const next = calcTypes[0];
                            if (next) setFieldValue('calculationTypeLoanId', next.id);
                        }}>
                            <Text>{calcTypes.find(c => c.id === values.calculationTypeLoanId)?.name ?? 'Seleccionar tipo'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Fecha desembolso</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowDate(true)}>
                        <Text>{values.disbursementDate ? new Date(values.disbursementDate).toLocaleDateString() : 'Seleccionar fecha'}</Text>
                    </TouchableOpacity>
                    
                    <DateTimePickerModal
                        isVisible={showDate}
                        mode="date"
                        // Asegúrate de que la fecha sea siempre un objeto Date válido
                        date={values.disbursementDate ? new Date(values.disbursementDate) : new Date()} 
                        onConfirm={handleConfirmDate}
                        onCancel={() => setShowDate(false)}
                    />

                    <Text style={styles.label}>Comentario</Text>
                    <TextInput style={[styles.input, { height: 90 }]} multiline value={values.comment} onChangeText={handleChange('comment')} />

                    <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()} disabled={submitting}>
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar préstamo</Text>}
                    </TouchableOpacity>
                </View>
            );
        }}
 </Formik>
 );
}
*/
export default function LoanForm({ initial, onSubmit, submitting }: Props) {
const [frequencies, setFrequencies] = useState<CatalogItem[]>([]);
const [calcTypes, setCalcTypes] = useState<CatalogItem[]>([]);
const [showDate, setShowDate] = useState(false);
useEffect(() => {
 (async () => {
 try {
  const f = await api.get('/api/Catalogs/GetFrequencyPayment');
  const c = await api.get('/api/Catalogs/GetCalculationTypeLoan');
  // 🔑 CRÍTICO: Asegurarse de que el valor sea SIEMPRE un array, incluso si la data es nula/undefined
  setFrequencies(Array.isArray(f.data) ? f.data : []);
  setCalcTypes(Array.isArray(c.data) ? c.data : []);
 } catch (e) {
  // En caso de error de API, las listas se mantienen como []
  console.error("Error al cargar catálogos:", e);
 }
 })();
}, []);
return (
 <Formik
 initialValues={{
  // ... (initialValues sin cambios)
  customerId: initial?.customerId ?? null,
  loanAmount: initial?.loanAmount ?? '',
  term: initial?.term ?? 1,
  interestRate: initial?.interestRate ?? 0,
  paymentFrequencyId: initial?.paymentFrequencyId ?? null,
  calculationTypeLoanId: initial?.calculationTypeLoanId ?? null,
  disbursementDate: initial?.disbursementDate ?? new Date().toISOString(),
  firstDayPay: initial?.firstDayPay ?? null,
  comment: initial?.comment ?? '',
 }}
 validationSchema={LoanSchema}
 onSubmit={onSubmit}
 >
 {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => {
   const handleConfirmDate = (date: Date) => {
    setFieldValue('disbursementDate', date.toISOString());
    setShowDate(false);
   };
   return (
    <View style={styles.form}>
    {/* ... (Otros campos sin cambios) */}
    
    <Text style={styles.label}>Frecuencia de pago</Text>
    <View style={styles.selector}>
     <TouchableOpacity onPress={() => {
      // picker simple inline
      const next = frequencies[0];
      if (next) setFieldValue('paymentFrequencyId', next.id);
     }}>
         {/* 🔑 USANDO ENCADENAMIENTO OPCIONAL (Aunque ya no es estrictamente necesario, es más seguro) */}
      <Text>{frequencies.find(f => f.id === values.paymentFrequencyId)?.name ?? 'Seleccionar frecuencia'}</Text>
     </TouchableOpacity>
    </View>
    <Text style={styles.label}>Tipo de cálculo</Text>
    <View style={styles.selector}>
     <TouchableOpacity onPress={() => {
      const next = calcTypes[0];
      if (next) setFieldValue('calculationTypeLoanId', next.id);
     }}>
     <Text>{calcTypes.find(c => c.id === values.calculationTypeLoanId)?.name ?? 'Seleccionar tipo'}</Text>
     </TouchableOpacity>
    </View>
    <Text style={styles.label}>Fecha desembolso</Text>
    <TouchableOpacity style={styles.selector} onPress={() => setShowDate(true)}>
    <Text>{values.disbursementDate ? new Date(values.disbursementDate).toLocaleDateString() : 'Seleccionar fecha'}</Text>
    </TouchableOpacity>
   
    <DateTimePickerModal
     isVisible={showDate}
     mode="date"
     date={values.disbursementDate ? new Date(values.disbursementDate) : new Date()} 
     onConfirm={handleConfirmDate}
     onCancel={() => setShowDate(false)}
    />
    {/* ... (Comentario y Submit sin cambios) */}
   </View>
   );
  }}
</Formik>
);
}

const styles = StyleSheet.create({
 form: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
 label: { color: theme.colors.text, marginBottom: 6, fontWeight: '600' },
 input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
 selector: { padding: 12, borderRadius: 8, backgroundColor: '#fafafa', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
 row: { flexDirection: 'row' },
 err: { color: 'red', marginBottom: 8 },
 submit: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
 submitText: { color: '#fff', fontWeight: '700' }
});