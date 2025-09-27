// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';

// // NOTA: En un proyecto real de React Native, estas líneas estarían activas:
// // import { BarChart, LineChart } from 'react-native-chart-kit';
// // import { Card } from 'react-native-paper'; 
// // Aquí simulamos su estructura con componentes nativos (View/Text)
// import { theme } from '@/utils/theme';
// import { getDashBoard } from '@/services/dashboard';

// // --- UTILS Y CONSTANTES ---

// const screenWidth = Dimensions.get('window').width;
// const CHART_WIDTH = screenWidth - 32; // 16px padding * 2 = 32px
// const CHART_INNER_WIDTH = screenWidth - 64; // (Padding 16 * 2) + gap 8 * 2 

// // Formato de datos estándar de react-native-chart-kit
// interface ChartData {
//     labels: string[];
//     datasets: { data: number[] }[];
// }

// const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat('es-CO', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0,
//     }).format(value);
// };

// // --- DATA DUMMY (FALLBACK) ---

// const CHART_LABELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
// const DUMMY_LINE_DATA = [500, 900, 700, 1100]; // Pagos por semana
// const DUMMY_BAR_DATA = [1200, 900, 1500, 1300, 1600, 1800]; // Ingresos por mes

// // --- INTERFACES DE ESTADO ---

// interface DashboardStats {
//   amountLoaned: number; // Saldo Total
//   amountPaymentReceived: number;
//   totalLoans: number; // Clientes (simulado)
//   totalActiveLoans: number; // Préstamos Activos
//   lastPayment: number; // Último Pago (simulado)
// }

// // AÑADIDO: Definición de la interfaz DashboardState
// interface DashboardState {
//     stats: DashboardStats;
//     chartLine: ChartData;
//     chartBar: ChartData;
//     chartType: 'line' | 'bar'; // Nuevo estado para el tipo de gráfico
// }

// const INITIAL_STATS: DashboardStats = {
//   amountLoaned: 12500,
//   amountPaymentReceived: 0,
//   totalLoans: 128,
//   totalActiveLoans: 44,
//   lastPayment: 1200,
// };

// const INITIAL_STATE: DashboardState = {
//     stats: INITIAL_STATS,
//     chartLine: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ data: DUMMY_LINE_DATA }] },
//     chartBar: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datasets: [{ data: DUMMY_BAR_DATA }] },
//     chartType: 'line',
// };

// // --- COMPONENTE SIMULADO DE GRÁFICO (Reemplazando react-native-chart-kit) ---
// // CORRECCIÓN: Se cambia 'config' por 'chartConfig' para que coincida con la prop pasada.
// const ChartPlaceholder = ({ title, data, chartConfig, type, height, width, bezier }: any) => {
//     const chartTitle = type === 'line' 
//         ? `GRÁFICO DE LÍNEA (Bezier: ${bezier ? 'Sí' : 'No'})` 
//         : 'GRÁFICO DE BARRA';
    
//     // Verificación segura para el color, ya que era el punto de fallo
//     const chartColorDisplay = chartConfig && chartConfig.color 
//         ? chartConfig.color(1) 
//         : '#FF6F61'; // Color por defecto si la configuración es nula
        
//     return (
//         <View style={styles.chartCard}>
//             <Text style={styles.cardTitle}>{title}</Text>
//             <View style={styles.cardContent}>
//                 <View style={{ width: "100%", height: height + 20, overflow: "hidden", backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
//                     <Text style={{color: '#6B7280', fontWeight: '500'}}>{chartTitle}</Text>
//                     <Text style={{color: '#6B7280', fontSize: 10}}>Datos: {data.datasets[0].data.join(', ')}</Text>
//                     {/* CORRECCIÓN: Uso de chartColorDisplay, eliminando el riesgo de acceso a propiedad de undefined */}
//                     <Text style={{color: '#6B7280', fontSize: 10}}>Color: {chartColorDisplay}</Text>
//                 </View>
//             </View>
//         </View>
//     );
// };


// // --- COMPONENTE PRINCIPAL DEL DASHBOARD ---

// export default function Dashboard() {
//     // Inicializa el estado con el tipo de gráfico por defecto
//     const [state, setState] = useState<DashboardState>(INITIAL_STATE);
//     const [loading, setLoading] = useState(true);
    
//     const primary = '#FF6F61';
//     const secondary = '#1E2A38';

//     // Función simulada para manejar el cambio de tipo de gráfico
//     const handleChartTypeChange = (newType: 'line' | 'bar') => {
//         setState(prev => ({ ...prev, chartType: newType }));
//     };

//     const mapToChartData = (dataArray: number[], labels: string[]): ChartData => {
//       const numPoints = dataArray.length;
//       return {
//           labels: labels.slice(0, numPoints),
//           datasets: [{ data: dataArray.slice(0, numPoints) }]
//       };
//     };

//     const mapLoanToClientCount = (totalLoans: number): number => {
//       return Math.floor(totalLoans * 0.8);
//     }
    
//     useEffect(() => {
//         const fetchStats = async () => {
//           setLoading(true);
          
//           // 1. INICIALIZACIÓN SEGURA
//           let apiDashboardStats: any = {};
//           let apiPaymentsList: any[] = [];
//           // La bandera errorOccurred se mantiene para la depuración, pero no afecta la lógica de fallback de los gráficos/KPIs.
//           let errorOccurred = false; 

//           try {
//             const p = await getDashBoard();

//             // 2. EXTRACCIÓN BLINDADA
//             apiDashboardStats = p?.data?.dashboardStats || {};
            
//             const rawPaymentsList = p?.data?.statsPaymentLoan;
//             apiPaymentsList = Array.isArray(rawPaymentsList) ? rawPaymentsList : [];
            
//           } catch (e) {
//             console.error('La llamada al API falló por completo, usando datos de ejemplo:', e);
//             errorOccurred = true;
//           } finally {
//             // 3. LÓGICA UNIFICADA Y FALLBACK
            
//             // --- CÁLCULO DE KPIS ---
//             // CORRECCIÓN: Se usa Nullish Coalescing (??) para que 0 (cero) sea un valor válido
//             // y solo caiga al fallback si la propiedad es estrictamente null o undefined.
//             const amountLoaned = apiDashboardStats.amountLoaned ?? INITIAL_STATS.amountLoaned;
//             const amountPaymentReceived = apiDashboardStats.amountPaymentReceived ?? INITIAL_STATS.amountPaymentReceived;
//             const totalActiveLoans = apiDashboardStats.totalActiveLoans ?? INITIAL_STATS.totalActiveLoans;
//             const totalLoans = apiDashboardStats.totalLoans ?? INITIAL_STATS.totalLoans;
            
//             const finalStats: DashboardStats = {
//                 amountLoaned: amountLoaned,
//                 amountPaymentReceived: amountPaymentReceived,
//                 totalActiveLoans: totalActiveLoans,
                
//                 totalLoans: mapLoanToClientCount(totalLoans), 

//                 // Cálculo seguro de lastPayment
//                 lastPayment: (amountPaymentReceived > 0 && totalLoans > 0) 
//                     ? amountPaymentReceived / totalLoans 
//                     : INITIAL_STATS.lastPayment,
//             };

//             // --- PROCESAMIENTO DE DATOS DE GRÁFICOS Y FALLBACK ---
            
//             // Los pagos se mapean y filtran. Si apiPaymentsList es [] (array vacío), este array será vacío.
//             const paymentsDataFromApi = apiPaymentsList
//                 .map((item: any) => item?.amount || 0)
//                 .filter(amount => amount > 0);

//             // Se usa la longitud del array para decidir si usar la data del API o la dummy.
//             // Si el API devolvió data válida, se usa. Si devolvió [] o data insuficiente, se usa la dummy.

//             // Line Chart: Usa API data (si tiene al menos 4 puntos) o DUMMY data
//             const finalLineData = paymentsDataFromApi.length >= 4 
//                 ? paymentsDataFromApi.slice(0, 4) 
//                 : DUMMY_LINE_DATA; 

//             // Bar Chart: Usa API data (si tiene al menos 6 puntos) o DUMMY data
//             const finalBarData = paymentsDataFromApi.length >= 6
//                 ? paymentsDataFromApi.slice(0, 6)
//                 : DUMMY_BAR_DATA;

//             setState(prev => ({
//                 ...prev,
//                 stats: finalStats,
//                 chartLine: mapToChartData(finalLineData, ['S1', 'S2', 'S3', 'S4']), 
//                 chartBar: mapToChartData(finalBarData, ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']),
//             }));

//             setLoading(false);
//           }
//         };
//         fetchStats();
//     }, []);

//     if (loading) {
//         return (
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size="large" color={theme.colors.primary} />
//             <Text style={{ marginTop: 10, color: theme.colors.text }}>Cargando panel de control...</Text>
//           </View>
//         );
//     }

//     // --- CONFIGURACIONES PARA CHART-KIT (Manteniendo la estructura solicitada) ---
//     const lineChartConfig = {
//         backgroundColor: '#FFFFFF',
//         backgroundGradientFrom: '#FFFFFF',
//         backgroundGradientTo: '#FFFFFF',
//         decimalPlaces: 0,
//         color: (o: number = 1) => `rgba(30, 42, 56, ${o})`, // secondary color
//         labelColor: (o: number = 1) => `rgba(107,114,128, ${o})`,
//         propsForDots: { r: '4', strokeWidth: '2', stroke: secondary }
//     };

//     const barChartConfig = {
//         backgroundColor: '#FFFFFF',
//         backgroundGradientFrom: '#FFFFFF',
//         backgroundGradientTo: '#FFFFFF',
//         decimalPlaces: 0,
//         color: (o: number = 1) => `rgba(255, 111, 97, ${o})`, // primary color
//         labelColor: (o: number = 1) => `rgba(107,114,128, ${o})`,
//     };

//     const stats = state.stats;

//     // Se decide qué gráfico se renderiza en la primera tarjeta (Pagos por Semana)
//     const ChartComponent = state.chartType === 'line' 
//         ? (
//             // Simula LineChart
//             <ChartPlaceholder
//                 title="Pagos por Semana"
//                 data={state.chartLine}
//                 type="line"
//                 width={CHART_INNER_WIDTH}
//                 height={200}
//                 yAxisLabel="$"
//                 chartConfig={lineChartConfig}
//                 bezier // Propiedad clave para la curva suave
//                 style={{ borderRadius: 12 }}
//             />
//         ) : (
//             // Simula BarChart
//             <ChartPlaceholder
//                 title="Pagos por Semana"
//                 data={state.chartLine} // Usa los mismos datos para demostrar el cambio de tipo
//                 type="bar"
//                 width={CHART_INNER_WIDTH}
//                 height={200}
//                 yAxisLabel="$"
//                 chartConfig={barChartConfig} // Usamos config de barra, ya que BarChart se ve mejor en este color
//                 style={{ borderRadius: 12 }}
//                 showBarTops={false} yAxisSuffix={''}
//             />
//         );

//     return (
//         <ScrollView style={styles.container}>
//             <Text style={{ ...styles.title, color: theme.colors.text }}>Dashboard Financiero</Text>
            
//             {/* KPIs (Simulando Card de react-native-paper) */}
//             <View style={styles.kpiRow}>
//                 <View style={styles.kpiCard}>
//                     <View style={styles.cardContent}>
//                         <Text style={styles.kpiLabel}>Saldo Total</Text>
//                         <Text style={styles.kpiValue}>{formatCurrency(stats.amountLoaned)}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.kpiCard}>
//                     <View style={styles.cardContent}>
//                         <Text style={styles.kpiLabel}>Último Pago</Text>
//                         <Text style={styles.kpiValue}>{formatCurrency(stats.lastPayment)}</Text>
//                     </View>
//                 </View>
//             </View>

//             <View style={styles.kpiRow}>
//                 <View style={styles.kpiCard}>
//                     <View style={styles.cardContent}>
//                         <Text style={styles.kpiLabel}>Clientes</Text>
//                         <Text style={styles.kpiValue}>{stats.totalLoans}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.kpiCard}>
//                     <View style={styles.cardContent}>
//                         <Text style={styles.kpiLabel}>Préstamos Activos</Text>
//                         <Text style={styles.kpiValue}>{stats.totalActiveLoans}</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Línea/Barra: pagos por semana (Selector de Gráfico) */}
//             <View style={{ marginTop: 12, marginBottom: 8, paddingHorizontal: 4 }}>
//                 <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Pagos por Semana (Selector)</Text>
//                 <View style={styles.chartSelector}>
//                     <View 
//                         onTouchEnd={() => handleChartTypeChange('line')} 
//                         style={[styles.chartTypeButton, state.chartType === 'line' && { backgroundColor: secondary }]}
//                     >
//                         <Text style={[styles.chartTypeButtonText, state.chartType === 'line' && { color: '#FFFFFF' }]}>Gráfico de Línea</Text>
//                     </View>
//                     <View 
//                         onTouchEnd={() => handleChartTypeChange('bar')} 
//                         style={[styles.chartTypeButton, state.chartType === 'bar' && { backgroundColor: secondary }]}
//                     >
//                         <Text style={[styles.chartTypeButtonText, state.chartType === 'bar' && { color: '#FFFFFF' }]}>Gráfico de Barra</Text>
//                     </View>
//                 </View>
//             </View>

//             <View style={styles.chartCard}>
//                 <Text style={styles.cardTitle}>Pagos por Semana (Gráfico)</Text>
//                 <View style={styles.cardContent}>
//                     <View style={{ width: "100%", height: 220, overflow: "hidden" }}>
//                         {ChartComponent}
//                     </View>
//                 </View>
//             </View>

//             {/* Barras: ingresos por mes (Fijo, usando sintaxis de BarChart) */}
//             <View style={styles.chartCard}>
//                 <Text style={styles.cardTitle}>Ingresos por Mes</Text>
//                 <View style={styles.cardContent}>
//                     <View style={{ width: "100%", height: 220, overflow: "scroll" }}>
//                         <ChartPlaceholder
//                             title="Ingresos por Mes"
//                             data={state.chartBar}
//                             type="bar"
//                             width={CHART_INNER_WIDTH}
//                             height={220}
//                             yAxisLabel="$"
//                             chartConfig={barChartConfig}
//                             style={{ borderRadius: 12 }}
//                             showBarTops={false} yAxisSuffix={''}
//                         />
//                     </View>
//                 </View>
//             </View>
            
//             {/* CTA's (simulados) */}
//              <View style={{ marginTop: 16, marginBottom: 20, gap: 10 }}>
//                 <View style={{...styles.button, backgroundColor: primary }}>
//                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Crear Préstamo</Text>
//                 </View>
//                 <View style={{...styles.button, borderColor: secondary, borderWidth: 1 }}>
//                     <Text style={{color: secondary, fontWeight: 'bold'}}>Registrar Pago</Text>
//                 </View>
//              </View>
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
//     loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
//     title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
//     kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
//     kpiCard: { 
//       flex: 1, 
//       borderRadius: 16, 
//       backgroundColor: '#FFFFFF',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 3, 
//     },
//     cardContent: { padding: 16 },
//     cardTitle: { 
//         fontSize: 18, 
//         fontWeight: '600', 
//         paddingHorizontal: 16,
//         paddingTop: 16,
//         color: '#111827'
//     },
//     kpiLabel: { color: '#6B7280', fontSize: 14 },
//     kpiValue: { color: '#111827', fontWeight: '700', fontSize: 28, marginTop: 4 },
//     chartCard: { 
//         borderRadius: 16, 
//         marginTop: 12, 
//         overflow: "hidden",
//         backgroundColor: '#FFFFFF',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     button: {
//       padding: 14,
//       borderRadius: 12,
//       alignItems: 'center',
//     },
//     // Nuevos estilos para el selector de gráfico
//     chartSelector: {
//         flexDirection: 'row',
//         marginTop: 8,
//         borderRadius: 8,
//         overflow: 'hidden',
//         borderColor: '#D1D5DB',
//         borderWidth: 1,
//     },
//     chartTypeButton: {
//         flex: 1,
//         paddingVertical: 8,
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         borderRightWidth: 1,
//         borderRightColor: '#D1D5DB',
//     },
//     chartTypeButtonText: {
//         fontWeight: '600',
//         fontSize: 14,
//         color: '#1E2A38',
//     }
// });
// =============================
// src/screens/Dashboard.tsx
// =============================
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
// import { theme } from '@/utils/theme';
// import { getDashBoard } from '@/services/dashboard';

// // --- CONSTANTES DE DIMENSIONES ---
// const screenWidth = Dimensions.get('window').width;
// const CHART_WIDTH = screenWidth - 32; 
// const CHART_INNER_WIDTH = screenWidth - 64; 

// // --- FORMATOS Y UTILS ---
// interface ChartData {
//   labels: string[];
//   datasets: { data: number[] }[];
// }

// const formatCurrency = (value: number) => {
//   return new Intl.NumberFormat('es-CO', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 0,
//   }).format(value);
// };

// // --- DATA DUMMY (fallback) ---
// const DUMMY_LINE_DATA = [500, 900, 700, 1100];
// const DUMMY_BAR_DATA = [1200, 900, 1500, 1300, 1600, 1800];

// // --- INTERFACES ---
// interface DashboardStats {
//   amountLoaned: number;
//   amountPaymentReceived: number;
//   totalLoans: number;
//   totalActiveLoans: number;
//   lastPayment: number;
// }

// interface DashboardState {
//   stats: DashboardStats;
//   chartLine: ChartData;
//   chartBar: ChartData;
//   chartType: 'line' | 'bar';
// }

// // --- ESTADOS INICIALES ---
// const INITIAL_STATS: DashboardStats = {
//   amountLoaned: 12500,
//   amountPaymentReceived: 0,
//   totalLoans: 128,
//   totalActiveLoans: 44,
//   lastPayment: 1200,
// };

// const INITIAL_STATE: DashboardState = {
//   stats: INITIAL_STATS,
//   chartLine: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ data: DUMMY_LINE_DATA }] },
//   chartBar: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datasets: [{ data: DUMMY_BAR_DATA }] },
//   chartType: 'line',
// };

// // --- PLACEHOLDER DE CHART ---
// const ChartPlaceholder = ({ title, data, chartConfig, type, height, width, bezier }: any) => {
//   const chartTitle = type === 'line'
//     ? `Gráfico de Línea (Bezier: ${bezier ? 'Sí' : 'No'})`
//     : 'Gráfico de Barra';

//   const chartColorDisplay = chartConfig?.color ? chartConfig.color(1) : '#FF6F61';
  
//   return (
//     <View style={styles.chartCard}>
//       <Text style={styles.cardTitle}>{title}</Text>
//       <View style={styles.cardContent}>
//         <View style={{
//           width: "100%",
//           height: height + 20,
//           overflow: "hidden",
//           backgroundColor: '#F0F0F0',
//           justifyContent: 'center',
//           alignItems: 'center',
//           borderRadius: 12
//         }}>
//           <Text style={{ color: '#6B7280', fontWeight: '500' }}>{chartTitle}</Text>
//           <Text style={{ color: '#6B7280', fontSize: 10 }}>
//             Datos: {data.datasets[0].data.join(', ')}
//           </Text>
//           <Text style={{ color: '#6B7280', fontSize: 10 }}>
//             Color: {chartColorDisplay}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// // --- COMPONENTE PRINCIPAL ---
// export default function Dashboard() {
//   const [state, setState] = useState<DashboardState>(INITIAL_STATE);
//   const [loading, setLoading] = useState(true);

//   const primary = '#FF6F61';
//   const secondary = '#1E2A38';

//   const handleChartTypeChange = (newType: 'line' | 'bar') => {
//     setState(prev => ({ ...prev, chartType: newType }));
//   };

//   const mapToChartData = (dataArray: number[], labels: string[]): ChartData => ({
//     labels: labels.slice(0, dataArray.length),
//     datasets: [{ data: dataArray.slice(0, dataArray.length) }]
//   });

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoading(true);
//       let apiDashboardStats: any = {};
//       let apiPaymentsList: any[] = [];

//       try {
//         const p = await getDashBoard();
//         apiDashboardStats = p?.data?.dashboardStats || {};
//         apiPaymentsList = Array.isArray(p?.data?.statsPaymentLoan) ? p.data.statsPaymentLoan : [];
//       } catch (e) {
//         console.error('Error al cargar Dashboard:', e);
//       } finally {
//         const amountLoaned = apiDashboardStats.amountLoaned ?? INITIAL_STATS.amountLoaned;
//         const amountPaymentReceived = apiDashboardStats.amountPaymentReceived ?? INITIAL_STATS.amountPaymentReceived;
//         const totalActiveLoans = apiDashboardStats.totalActiveLoans ?? INITIAL_STATS.totalActiveLoans;
//         const totalLoans = apiDashboardStats.totalLoans ?? INITIAL_STATS.totalLoans;

//         const finalStats: DashboardStats = {
//           amountLoaned,
//           amountPaymentReceived,
//           totalActiveLoans,
//           totalLoans,
//           lastPayment: (amountPaymentReceived > 0 && totalLoans > 0)
//             ? amountPaymentReceived / totalLoans
//             : INITIAL_STATS.lastPayment,
//         };

//         const paymentsData = apiPaymentsList.map((i: any) => i?.amount || 0).filter((a: number) => a > 0);
//         const finalLineData = paymentsData.length >= 4 ? paymentsData.slice(0, 4) : DUMMY_LINE_DATA;
//         const finalBarData = paymentsData.length >= 6 ? paymentsData.slice(0, 6) : DUMMY_BAR_DATA;

//         setState({
//           stats: finalStats,
//           chartLine: mapToChartData(finalLineData, ['S1', 'S2', 'S3', 'S4']),
//           chartBar: mapToChartData(finalBarData, ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']),
//           chartType: 'line',
//         });
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//         <Text style={{ marginTop: 10, color: theme.colors.text }}>Cargando panel de control...</Text>
//       </View>
//     );
//   }

//   const stats = state.stats;


//   return (
//     <ScrollView style={styles.container}>
//       <Text style={{ ...styles.title, color: theme.colors.text }}>Dashboard Financiero</Text>

//       {/* KPIs */}
//       <View style={styles.kpiRow}>
//         <View style={styles.kpiCard}>
//           <View style={styles.cardContent}>
//             <Text style={styles.kpiLabel}>Monto Prestado Total</Text>
//             <Text style={styles.kpiValue}>{formatCurrency(stats.amountLoaned)}</Text>
//           </View>
//         </View>
//         <View style={styles.kpiCard}>
//           <View style={styles.cardContent}>
//             <Text style={styles.kpiLabel}>Último Pago</Text>
//             <Text style={styles.kpiValue}>{formatCurrency(stats.lastPayment)}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.kpiRow}>
//         <View style={styles.kpiCard}>
//           <View style={styles.cardContent}>
//             <Text style={styles.kpiLabel}>Clientes</Text>
//             <Text style={styles.kpiValue}>{stats.totalLoans}</Text>
//           </View>
//         </View>
//         <View style={styles.kpiCard}>
//           <View style={styles.cardContent}>
//             <Text style={styles.kpiLabel}>Préstamos Activos</Text>
//             <Text style={styles.kpiValue}>{stats.totalActiveLoans}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Selector de gráfico */}          
//       <View style={{ marginTop: 12, marginBottom: 8, paddingHorizontal: 4 }}>
//         <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Pagos por Semana (Selector)</Text>
//         <View style={styles.chartSelector}>
//           <View
//             onTouchEnd={() => handleChartTypeChange('line')}
//             style={[styles.chartTypeButton, state.chartType === 'line' && { backgroundColor: secondary }]}
//           >
//             <Text style={[styles.chartTypeButtonText, state.chartType === 'line' && { color: '#FFFFFF' }]}>Línea</Text>
//           </View>
//           <View
//             onTouchEnd={() => handleChartTypeChange('bar')}
//             style={[styles.chartTypeButton, state.chartType === 'bar' && { backgroundColor: secondary }]}
//           >
//             <Text style={[styles.chartTypeButtonText, state.chartType === 'bar' && { color: '#FFFFFF' }]}>Barras</Text>
//           </View>
//         </View>
//       </View>

//       {/* Gráfico dinámico */}
//       <ChartPlaceholder
//         title="Pagos por Semana"
//         data={state.chartLine}
//         type={state.chartType}
//         width={CHART_INNER_WIDTH}
//         height={200}
//         chartConfig={{ color: () => state.chartType === 'line' ? secondary : primary }}
//         bezier={state.chartType === 'line'}
//       />

//       {/* Gráfico fijo de ingresos */}
//       <ChartPlaceholder
//         title="Ingresos por Mes"
//         data={state.chartBar}
//         type="bar"
//         width={CHART_INNER_WIDTH}
//         height={220}
//         chartConfig={{ color: () => primary }}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
//   title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
//   kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
//   kpiCard: {
//     flex: 1,
//     borderRadius: 16,
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardContent: { padding: 16 },
//   cardTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, color: '#111827' },
//   kpiLabel: { color: '#6B7280', fontSize: 14 },
//   kpiValue: { color: '#111827', fontWeight: '700', fontSize: 28, marginTop: 4 },
//   chartCard: {
//     borderRadius: 16,
//     marginTop: 12,
//     overflow: "hidden",
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   chartSelector: {
//     flexDirection: 'row',
//     marginTop: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//     borderColor: '#D1D5DB',
//     borderWidth: 1,
//   },
//   chartTypeButton: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRightWidth: 1,
//     borderRightColor: '#D1D5DB',
//   },
//   chartTypeButtonText: { fontWeight: '600', fontSize: 14, color: '#1E2A38' },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { theme } from '@/utils/theme';
import { getDashBoard } from '@/services/dashboard';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 32;

interface ChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

interface DashboardStats {
  amountLoaned: number;
  amountPaymentReceived: number;
  totalLoans: number;
  totalActiveLoans: number;
  lastPayment: number;
}

const DUMMY_LINE_DATA = [500, 900, 700, 1100];
const DUMMY_BAR_DATA = [1200, 900, 1500, 1300, 1600, 1800];

const INITIAL_STATS: DashboardStats = {
  amountLoaned: 12500,
  amountPaymentReceived: 0,
  totalLoans: 128,
  totalActiveLoans: 44,
  lastPayment: 1200,
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [lineChart, setLineChart] = useState<ChartData>({
    labels: ['S1', 'S2', 'S3', 'S4'],
    datasets: [{ data: DUMMY_LINE_DATA }],
  });
  const [barChart, setBarChart] = useState<ChartData>({
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{ data: DUMMY_BAR_DATA }],
  });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const mapToChartData = (dataArray: number[], labels: string[]): ChartData => ({
    labels: labels.slice(0, dataArray.length),
    datasets: [{ data: dataArray.slice(0, dataArray.length) }],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getDashBoard();
        const apiStats = res?.data?.dashboardStats || {};
        const apiPayments = Array.isArray(res?.data?.statsPaymentLoan)
          ? res.data.statsPaymentLoan
          : [];

        // KPIs
        const finalStats: DashboardStats = {
          amountLoaned: apiStats.amountLoaned ?? INITIAL_STATS.amountLoaned,
          amountPaymentReceived:
            apiStats.amountPaymentReceived ?? INITIAL_STATS.amountPaymentReceived,
          totalActiveLoans:
            apiStats.totalActiveLoans ?? INITIAL_STATS.totalActiveLoans,
          totalLoans: apiStats.totalLoans ?? INITIAL_STATS.totalLoans,
          lastPayment:
            apiStats.amountPaymentReceived && apiStats.totalLoans
              ? apiStats.amountPaymentReceived / apiStats.totalLoans
              : INITIAL_STATS.lastPayment,
        };
        setStats(finalStats);

        // Charts
        const paymentsData = apiPayments
          .map((i: any) => i?.amount || 0)
          .filter((a: number) => a > 0);

        const finalLineData =
          paymentsData.length >= 4 ? paymentsData.slice(0, 4) : DUMMY_LINE_DATA;
        const finalBarData =
          paymentsData.length >= 6 ? paymentsData.slice(0, 6) : DUMMY_BAR_DATA;

        setLineChart(mapToChartData(finalLineData, ['S1', 'S2', 'S3', 'S4']));
        setBarChart(
          mapToChartData(finalBarData, ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'])
        );
      } catch (err) {
        console.error('Error Dashboard:', err);
        // fallback dummy
        setStats(INITIAL_STATS);
        setLineChart({
          labels: ['S1', 'S2', 'S3', 'S4'],
          datasets: [{ data: DUMMY_LINE_DATA }],
        });
        setBarChart({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{ data: DUMMY_BAR_DATA }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.text }}>
          Cargando panel de control...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Financiero</Text>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Monto Prestado Total</Text>
          <Text style={styles.kpiValue}>{formatCurrency(stats.amountLoaned)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Último Pago</Text>
          <Text style={styles.kpiValue}>{formatCurrency(stats.lastPayment)}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Clientes</Text>
          <Text style={styles.kpiValue}>{stats.totalLoans}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Préstamos Activos</Text>
          <Text style={styles.kpiValue}>{stats.totalActiveLoans}</Text>
        </View>
      </View>

      {/* Selector */}
      <View style={styles.chartSelector}>
        <Text
          onPress={() => setChartType('line')}
          style={[
            styles.chartTypeButton,
            chartType === 'line' && styles.chartTypeActive,
          ]}
        >
          Línea
        </Text>
        <Text
          onPress={() => setChartType('bar')}
          style={[
            styles.chartTypeButton,
            chartType === 'bar' && styles.chartTypeActive,
          ]}
        >
          Barras
        </Text>
      </View>

      {/* Chart dinámico */}
      {chartType === 'line' ? (
        <LineChart
          data={lineChart}
          width={CHART_WIDTH}
          height={220}
          yAxisLabel="" // 👈 requerido
          yAxisSuffix="k"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <BarChart
          data={barChart}
          width={CHART_WIDTH}
          height={220}
          yAxisLabel="" // 👈 requerido
          yAxisSuffix="k"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          }}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10, color: '#111827' },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiLabel: { color: '#6B7280', fontSize: 14 },
  kpiValue: { color: '#111827', fontWeight: '700', fontSize: 20, marginTop: 4 },
  chartSelector: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#1E2A38',
    fontWeight: '600',
  },
  chartTypeActive: {
    backgroundColor: '#1E2A38',
    color: '#FFFFFF',
  },
  chart: { marginVertical: 8, borderRadius: 16 },
});
