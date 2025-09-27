import React, { useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { BarChart, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import api from '@/services/api';
import { theme } from '@/utils/theme';
import { getDashBoard } from '@/services/dashboard';
import { getPayments } from '@/services/payments';

const screenWidth = Dimensions.get('window').width - 30;

/**
 * Helpers robustos para sanear datos y labels
 */
const clamp = (n: number, min = -1e12, max = 1e12) => Math.max(min, Math.min(max, n));

const extractNumericFromValue = (v: any): number => {
  // null/undefined
  if (v === null || v === undefined) return 0;

  // number
  if (typeof v === 'number') {
    if (!isFinite(v) || isNaN(v)) return 0;
    return clamp(v);
  }

  // boolean
  if (typeof v === 'boolean') return v ? 1 : 0;

  // string: try to capture first numeric token (handles "1,234.56" or "1.234,56" poorly formatted)
  if (typeof v === 'string') {
    // Try simple parse first (handles normal numbers)
    const n1 = Number(v.replace(/\s/g, ''));
    if (!isNaN(n1) && isFinite(n1)) return clamp(n1);

    // Extract first numeric group (digits, optional decimal)
    const match = v.match(/-?\d+([.,]\d+)?/);
    if (match) {
      // normalize comma decimal to dot if present
      let token = match[0].replace(',', '.');
      const n2 = Number(token);
      if (!isNaN(n2) && isFinite(n2)) return clamp(n2);
    }

    // Otherwise it's a non-numeric string (e.g., path "M0,0 L-Infinity..."), return 0
    return 0;
  }

  // object/array: try common numeric keys, or recursive if it's a number-like wrapper
  if (typeof v === 'object') {
    // If array, try first few entries
    if (Array.isArray(v)) {
      for (let i = 0; i < Math.min(3, v.length); i++) {
        const val = extractNumericFromValue(v[i]);
        if (val !== 0) return val;
      }
      return 0;
    }

    // Try common fields
    const candidates = ['value', 'amount', 'total', 'y', 'data', 'count', 'sum'];
    for (const k of candidates) {
      if (k in v) {
        const val = extractNumericFromValue((v as any)[k]);
        if (val !== 0) return val;
      }
    }

    // Try toJSON or valueOf
    try {
      if (typeof (v as any).valueOf === 'function') {
        const prim = (v as any).valueOf();
        if (prim !== v) return extractNumericFromValue(prim);
      }
    } catch (e) {
      // ignore
    }

    return 0;
  }

  // fallback
  return 0;
};

const sanitizeDataArray = (input: any, fallback: number[]): number[] => {
  // If input is not array, return fallback
  if (!input || !Array.isArray(input) || input.length === 0) {
    return fallback.slice(); // copy
  }
  const out = input.map((x: any) => {
    const n = extractNumericFromValue(x);
    return Number.isFinite(n) ? n : 0;
  });
  // If all zeros (or weird), and fallback exists, optionally keep out — but returning out is fine
  return out.length > 0 ? out : fallback.slice();
};

const sanitizeLabels = (labels: any, dataLength: number): string[] => {
  if (labels && Array.isArray(labels) && labels.length >= dataLength) {
    // Convert to strings and trim
    return labels.slice(0, dataLength).map((l: any, i: number) => {
      try {
        if (l === null || l === undefined) return `#${i + 1}`;
        return String(l);
      } catch {
        return `#${i + 1}`;
      }
    });
  }
  // fallback generated labels
  return Array.from({ length: dataLength }, (_, i) => `S${i + 1}`);
};

/**
 * Small ErrorBoundary to prevent the whole app crashing when a chart render fails.
 * Shows a compact placeholder instead.
 */
class ChartErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error) };
  }
  componentDidCatch(error: any, info: any) {
    // You can log to a remote logger here if desired
    // console.warn('Chart render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.chartErrorBox}>
          <Text style={styles.chartErrorTitle}>Gráfico no disponible</Text>
          <Text style={styles.chartErrorMsg}>{this.state.message?.slice(0, 120) ?? 'Error de renderizado'}</Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

/**
 * DashboardScreen (archivo corregido)
 */
export default function DashboardScreen({ navigation }: any) {
  const [loanStatsRaw, setLoanStatsRaw] = useState<any>({ labels: null, values: null });
  const [paymentStatsRaw, setPaymentStatsRaw] = useState<any>(null);
  const [altView, setAltView] = useState(false);

  // safe dummies
  const FALLBACK_LOAN = { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'], data: [5, 7, 3, 6, 8] };
  const FALLBACK_PAYMENT = { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'], data: [1, 3, 2, 5, 4] };

  useEffect(() => {
    (async () => {
      try {
        // Fetch loans chart (may return different shapes)
        const resLoans = await getDashBoard();
        const loansChart = resLoans?.data?.dashboardStats ?? null;
        setLoanStatsRaw(loansChart ?? { labels: null, values: null });

        // Fetch payments list or stats
        const resPayments = await getPayments();
        
        setPaymentStatsRaw(resPayments ?? null);
      } catch (err) {
        // Keep raw nulls so sanitizer will use fallbacks
        setLoanStatsRaw({ labels: null, values: null });
        setPaymentStatsRaw(null);
      }
    })();
  }, []);

  // Derive sanitized arrays just before render
  const loansDataSan = React.useMemo(() => {
    const rawValues = loanStatsRaw?.values;
    const fallback = FALLBACK_LOAN.data;
    const data = sanitizeDataArray(rawValues, fallback);
    const labels = sanitizeLabels(loanStatsRaw?.labels, data.length);
    return { labels, data };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanStatsRaw]);

  const paymentsDataSan = React.useMemo(() => {
    // The payments endpoint may return array of objects with .amount or primitives
    const raw = paymentStatsRaw;
    const fallback = FALLBACK_PAYMENT;
    if (!raw) {
      return { labels: fallback.labels.slice(), data: fallback.data.slice() };
    }

    // If raw is an array of objects, try to derive numeric list:
    if (Array.isArray(raw) && raw.length > 0) {
      // try common numeric extraction
      const extracted = raw.slice(0, 12).map((it: any) => {
        // if object with amount/Value/total etc
        if (typeof it === 'object' && it !== null) {
          const candidates = ['amount', 'Amount', 'value', 'Value', 'total', 'Total', 'sum', 'Sum'];
          for (const k of candidates) {
            if (k in it) {
              const v = extractNumericFromValue((it as any)[k]);
              if (v !== 0) return v;
            }
          }
          // try numeric primitive inside object
          const prim = extractNumericFromValue(it);
          if (prim !== 0) return prim;
          return 0;
        }
        // primitive
        return extractNumericFromValue(it);
      });
      const data = sanitizeDataArray(extracted, fallback.data);
      const labels = sanitizeLabels(null, data.length);
      return { labels, data };
    }

    // If raw looks like object with stats array
    if (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).statsPaymentLoan)) {
      const arr = (raw as any).statsPaymentLoan;
      const data = sanitizeDataArray(arr.map((r: any) => extractNumericFromValue(r.amount ?? r.value ?? r)), fallback.data);
      const labels = sanitizeLabels(arr.map((_: any, i: number) => `S${i + 1}`), data.length);
      return { labels, data };
    }

    // Fallback: if raw is array-like of numbers
    if (Array.isArray(raw)) {
      const data = sanitizeDataArray(raw, fallback.data);
      const labels = sanitizeLabels(null, data.length);
      return { labels, data };
    }

    // last fallback
    return { labels: fallback.labels.slice(), data: fallback.data.slice() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatsRaw]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f8f9fb',
    backgroundGradientTo: '#f8f9fb',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(53, 63, 84, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(value);
};
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel Financiero</Text>
      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Monto Prestado Total</Text>
          <Text style={styles.kpiValue}>{formatCurrency(loanStatsRaw.amountLoaned)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Último Pago</Text>
          <Text style={styles.kpiValue}>{formatCurrency(loanStatsRaw.amountPaymentReceived)}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Clientes</Text>
          <Text style={styles.kpiValue}>{loanStatsRaw.totalLoans}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Préstamos Activos</Text>
          <Text style={styles.kpiValue}>{loanStatsRaw.totalActiveLoans}</Text>
        </View>
      </View>
      {!altView ? (
        <>
          <Text style={styles.sectionTitle}>Préstamos Mensuales</Text>

          <ChartErrorBoundary>
            <BarChart
              data={{ labels: loansDataSan.labels, datasets: [{ data: loansDataSan.data }] }}
              width={screenWidth}
              height={220}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ChartErrorBoundary>

          <Text style={styles.sectionTitle}>Pagos Mensuales</Text>

          <ChartErrorBoundary>
            <LineChart
              data={{ labels: paymentsDataSan.labels, datasets: [{ data: paymentsDataSan.data }] }}
              width={screenWidth}
              height={220}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ChartErrorBoundary>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Distribución de Clientes</Text>
          <ChartErrorBoundary>
            <PieChart
              data={[
                { name: 'Activos', population: 40, color: theme.colors.primary, legendFontColor: '#333', legendFontSize: 12 },
                { name: 'Morosos', population: 20, color: '#F44336', legendFontColor: '#333', legendFontSize: 12 },
                { name: 'Finalizados', population: 40, color: '#FFC107', legendFontColor: '#333', legendFontSize: 12 },
              ]}
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
              data={{ labels: ['Cobradas', 'Pendientes'], data: [0.7, 0.4] }}
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
        {altView ? 'Ver gráficos de Préstamos/Pagos' : 'Ver otros gráficos'}
      </Button>

      <View style={styles.actionsRow}>
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          textColor="#fff"
          style={styles.primaryAction}
          onPress={() => navigation.navigate('LoanCreate')}
        >
          Crear Préstamo
        </Button>
        <Button
          mode="outlined"
          textColor={theme.colors.secondary}
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('paymentCreate')}
        >
          Registrar Pago
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#F8F9FA' },
  header: { fontSize: 24, fontWeight: '800', marginBottom: 20, color: theme.colors.text },
  sectionTitle: { fontSize: 18, marginVertical: 10, color: theme.colors.text, fontWeight: '600' },
  chart: { borderRadius: 16, marginBottom: 20 },
  toggleButton: { borderRadius: 12, borderWidth: 1.5, marginBottom: 20, paddingVertical: 5 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  primaryAction: { flex: 1, marginRight: 8, borderRadius: 12, paddingVertical: 6 },
  secondaryAction: { flex: 1, marginLeft: 8, borderRadius: 12, borderWidth: 1.5, paddingVertical: 6 },
  chartErrorBox: { height: 160, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  chartErrorTitle: { fontWeight: '700', color: '#111827' },
  chartErrorMsg: { color: '#6B7280', marginTop: 6, textAlign: 'center', paddingHorizontal: 10, fontSize: 12 },
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
});
