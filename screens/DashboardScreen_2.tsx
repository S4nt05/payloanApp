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
