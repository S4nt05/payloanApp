import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Text, Button } from "react-native-paper";
import {
  BarChart,
  LineChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";
import { theme } from "@/utils/theme";
import { getDashBoard } from "@/services/dashboard";
import { getPayments } from "@/services/payments";
import ResponsiveContainer from "@/components/ResponsiveContainer";

const screenWidth = Dimensions.get("window").width - 30;

// Interfaces para las respuestas de la API
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface DashboardStats {
  totalLoans: number;
  totalActiveLoans: number;
  amountLoaned: number;
  amountPaymentReceived: number;
}

interface StatsPaymentLoan {
  year: number;
  month: string;
  monthNumber: number;
  amountLoaned: number;
  amountPaymentReceived: number;
}

interface PaymentDto {
  paymentId?: number;
  loanId: number;
  amount: number;
  paymentDate: string;
  method?: string;
  status?: "Pending" | "Completed" | "Failed";
  comment?: string;
  userCreated?: string;
  dateCreated?: string;
}

interface DashboardResponse {
  dashboardStats: DashboardStats;
  statsPaymentLoan: StatsPaymentLoan[];
  recentLoans: any[];
}

// Helper para formatear moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

// Helper para obtener nombre del mes abreviado
const getMonthName = (monthNumber: number) => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[monthNumber - 1] || `M${monthNumber}`;
};

// Helper para obtener los últimos 12 meses
const getLast12Months = () => {
  const months = [];
  const date = new Date();

  for (let i = 11; i >= 0; i--) {
    const tempDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push({
      year: tempDate.getFullYear(),
      monthNumber: tempDate.getMonth() + 1,
      monthName: getMonthName(tempDate.getMonth() + 1),
    });
  }

  return months;
};

// Error Boundary para gráficos
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error) };
  }

  componentDidCatch(error: any, info: any) {
    console.warn("Chart render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.chartErrorBox}>
          <Text style={styles.chartErrorTitle}>Gráfico no disponible</Text>
          <Text style={styles.chartErrorMsg}>
            {this.state.message?.slice(0, 120) ?? "Error de renderizado"}
          </Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

export default function DashboardScreen({ navigation }: any) {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [statsPaymentLoan, setStatsPaymentLoan] = useState<StatsPaymentLoan[]>(
    []
  );
  const [paymentsData, setPaymentsData] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [altView, setAltView] = useState(false);

  // Cargar datos del dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos del dashboard
      const dashboardResponse =
        (await getDashBoard()) as ApiResponse<DashboardResponse>;
      if (dashboardResponse?.success && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data.dashboardStats);
        setStatsPaymentLoan(dashboardResponse.data.statsPaymentLoan || []);
      }

      // Cargar datos de pagos - CORREGIDO
      // Cargar datos de pagos - YA RETORNA PaymentDto[] DIRECTAMENTE
      const paymentsResponse = await getPayments();
      if (paymentsResponse && Array.isArray(paymentsResponse)) {
        setPaymentsData(paymentsResponse);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico de préstamos (BarChart) - Últimos 12 meses
  const loansChartData = React.useMemo(() => {
    const last12Months = getLast12Months();

    // Crear mapa de datos existentes para búsqueda rápida
    const existingDataMap = new Map();
    statsPaymentLoan.forEach((item) => {
      const key = `${item.year}-${item.monthNumber}`;
      existingDataMap.set(key, item.amountLoaned);
    });

    // Para cada mes de los últimos 12 meses, obtener el dato o 0 si no existe
    const data = last12Months.map((month) => {
      const key = `${month.year}-${month.monthNumber}`;
      return existingDataMap.get(key) || 0;
    });

    const labels = last12Months.map((month) => month.monthName);

    return {
      labels,
      datasets: [{ data }],
    };
  }, [statsPaymentLoan]);

  // Preparar datos para el gráfico de pagos (LineChart) - Últimos 12 meses
  const paymentsChartData = React.useMemo(() => {
    const last12Months = getLast12Months();

    // Crear mapa de datos existentes para búsqueda rápida
    const existingDataMap = new Map();
    statsPaymentLoan.forEach((item) => {
      const key = `${item.year}-${item.monthNumber}`;
      existingDataMap.set(key, item.amountPaymentReceived);
    });

    // Para cada mes de los últimos 12 meses, obtener el dato o 0 si no existe
    const data = last12Months.map((month) => {
      const key = `${month.year}-${month.monthNumber}`;
      return existingDataMap.get(key) || 0;
    });

    const labels = last12Months.map((month) => month.monthName);

    return {
      labels,
      datasets: [{ data }],
    };
  }, [statsPaymentLoan]);

  // Preparar datos para el gráfico de distribución (PieChart)
  const distributionChartData = React.useMemo(() => {
    if (!dashboardData) {
      return [
        {
          name: "Activos",
          population: 0,
          color: theme.colors.primary,
          legendFontColor: "#333",
          legendFontSize: 12,
        },
        {
          name: "Finalizados",
          population: 0,
          color: "#FFC107",
          legendFontColor: "#333",
          legendFontSize: 12,
        },
      ];
    }

    const activeLoans = dashboardData.totalActiveLoans;
    const completedLoans = Math.max(
      0,
      dashboardData.totalLoans - dashboardData.totalActiveLoans
    );

    return [
      {
        name: "Activos",
        population: activeLoans,
        color: theme.colors.primary,
        legendFontColor: "#333",
        legendFontSize: 12,
      },
      {
        name: "Finalizados",
        population: completedLoans,
        color: "#FFC107",
        legendFontColor: "#333",
        legendFontSize: 12,
      },
    ];
  }, [dashboardData]);

  const progressChartData = React.useMemo(() => {
    if (!dashboardData) {
      return { labels: ["Cobrado", "Pendiente"], data: [0, 0] };
    }

    const totalLoaned = dashboardData.amountLoaned;
    const totalReceived = dashboardData.amountPaymentReceived;
    const pending = Math.max(0, totalLoaned - totalReceived);

    const collectedRatio = totalLoaned > 0 ? totalReceived / totalLoaned : 0;
    const pendingRatio = totalLoaned > 0 ? pending / totalLoaned : 0;

    return {
      labels: ["Cobrado", "Pendiente"],
      data: [collectedRatio, pendingRatio],
    };
  }, [dashboardData]);

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#f8f9fb",
    backgroundGradientTo: "#f8f9fb",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(53, 63, 84, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ResponsiveContainer
      safeArea={true}   // ✅ Usa SafeAreaView
      withScroll={true} // ✅ Usa ScrollView
      noScroll={false}  // ✅ No tiene FlatList interno
      padding="4%"      // ✅ Responsive por defecto
      maxWidth="100%"   // ✅ O "98%" para pequeños márgenes
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Panel Financiero</Text>

          {/* KPIs */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Monto Prestado Total</Text>
              <Text style={styles.kpiValue}>
                {dashboardData
                  ? formatCurrency(dashboardData.amountLoaned)
                  : formatCurrency(0)}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Pagos Recibidos</Text>
              <Text style={styles.kpiValue}>
                {dashboardData
                  ? formatCurrency(dashboardData.amountPaymentReceived)
                  : formatCurrency(0)}
              </Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Préstamos</Text>
              <Text style={styles.kpiValue}>
                {dashboardData?.totalLoans || 0}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Préstamos Activos</Text>
              <Text style={styles.kpiValue}>
                {dashboardData?.totalActiveLoans || 0}
              </Text>
            </View>
          </View>

          {!altView ? (
            <>
              <Text style={styles.sectionTitle}>
                Préstamos Mensuales (Últimos 12 meses)
              </Text>
              <ChartErrorBoundary>
                <BarChart
                  data={loansChartData}
                  width={screenWidth}
                  height={220}
                  fromZero
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.3, // 🔹 Ajustá entre 0.3 y 1.0
                  }}
                  style={styles.chart}
                  // withInnerLines={false}
                  showBarTops={false}
                  withVerticalLabels={true}
                  verticalLabelRotation={0}
                  segments={4}
                />
              </ChartErrorBoundary>

              <Text style={styles.sectionTitle}>
                Pagos Mensuales (Últimos 12 meses)
              </Text>
              <ChartErrorBoundary>
                <LineChart
                  data={paymentsChartData}
                  width={screenWidth}
                  height={220}
                  fromZero
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </ChartErrorBoundary>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Distribución de Préstamos</Text>
              <ChartErrorBoundary>
                <PieChart
                  data={distributionChartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </ChartErrorBoundary>

              <Text style={styles.sectionTitle}>Avance de Cobranzas</Text>
              <ChartErrorBoundary>
                <ProgressChart
                  data={progressChartData}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </ChartErrorBoundary>
            </>
          )}

          <Button
            mode="outlined"
            textColor={theme.colors.secondary}
            style={styles.toggleButton}
            onPress={() => setAltView(!altView)}
          >
            {altView ? "Ver gráficos de Préstamos/Pagos" : "Ver otros gráficos"}
          </Button>

          {/* Espacio extra para evitar que los botones queden tapados */}
          <View style={styles.bottomSpacing}>
            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor="#fff"
                style={styles.primaryAction}
                onPress={() => navigation.navigate("LoanCreate")}
              >
                Crear Préstamo
              </Button>
              <Button
                mode="outlined"
                textColor={theme.colors.secondary}
                style={styles.secondaryAction}
                onPress={() => navigation.navigate("LoanCreatePayment")}
              >
                Registrar Pago
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  // {
  //   flex: 1,
  //   backgroundColor: '#F8F9FA',
  // },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    color: theme.colors.text,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
    color: theme.colors.text,
    fontWeight: "600",
  },
  chart: {
    borderRadius: 16,
    marginBottom: 20,
  },
  toggleButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
    paddingVertical: 5,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryAction: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    paddingVertical: 6,
  },
  secondaryAction: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 6,
  },
  chartErrorBox: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  chartErrorTitle: {
    fontWeight: "700",
    color: "#111827",
  },
  chartErrorMsg: {
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 10,
    fontSize: 12,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  kpiValue: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 20,
    marginTop: 4,
  },
  bottomSpacing: {
    marginBottom: 20,
  },
});
