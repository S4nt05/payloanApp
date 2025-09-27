import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Circle, Path, G } from 'react-native-svg'; 
import { theme } from '@/utils/theme';

interface Point { x: number; y: number; }

interface ChartData {
    labels: string[];
    datasets: { data: number[] }[];
}

interface Props {
  data: ChartData;
  type: 'bar' | 'line';
  chartColor: string;
}

const WIDTH = 320; 
const HEIGHT = 180;
const PADDING = 20;
const FONT_SIZE = 10; // Tamaño de fuente para las etiquetas

// Función para generar la curva suave (Catmull-Rom Spline)
const getSmoothPath = (points: Point[], tension: number = 0.4): string => {
    if (points.length < 2) {
        if (points.length === 1) return `M${points[0].x},${points[0].y}`;
        return '';
    }

    const path = [];
    const first = points[0];
    path.push(`M${first.x},${first.y}`);

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i > 0 ? i - 1 : i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        // Calcular los puntos de control C1 y C2
        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;

        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

        // Comando C (control1, control2, end)
        path.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
    }

    return path.join(' ');
};


export default function AdvancedChart({ data, type, chartColor }: Props){
  
  const rawData = data.datasets[0]?.data || [];
  const safeData = rawData.filter(v => typeof v === 'number' && v >= 0);
  
  // Usamos dummy data [1] si no hay datos para evitar fallos de renderizado
  const displayData = safeData.length === 0 ? [1] : safeData;
  const numDataPoints = displayData.length;
  const labels = data.labels.slice(0, numDataPoints);
  
  const max = Math.max(...displayData);
  const chartHeight = HEIGHT - PADDING * 2;
  const chartWidth = WIDTH - PADDING * 2;
  
  // Cálculo de dimensiones
  const stepX = chartWidth / (numDataPoints - 1 || 1);
  const barW = (chartWidth / numDataPoints) * 0.6;
  const barGap = (chartWidth / numDataPoints) * 0.2;

  if (safeData.length === 0 && rawData.length > 0) {
      // Caso de data no válida o vacía
      return (
          <View style={{width: WIDTH, height: HEIGHT, ...styles.noDataContainer}}>
              <Text style={styles.noDataText}>No hay datos válidos para mostrar.</Text>
          </View>
      );
  }

  // 1. Calcular coordenadas
  const coordinates = displayData.map((v, i) => {
    // Escalar el valor Y
    const y = chartHeight - (v / max) * chartHeight; 
    // Calcular la posición X
    const x = PADDING + (type === 'line' 
      ? i * stepX 
      : i * (barW + barGap) + barW / 2 + barGap);
    return { x, y: y + PADDING };
  });

  // 2. Generar el comando d para LineChart
  let pathD = '';
  if (type === 'line') {
      if (numDataPoints > 1) {
          // Usar la curva suave para líneas
          pathD = getSmoothPath(coordinates); 
      } else if (numDataPoints === 1) {
          // Punto simple si solo hay 1 dato
          pathD = `M${coordinates[0].x},${coordinates[0].y}`;
      }
  }


  // Líneas de referencia (eje Y)
  const referenceLines = [0, 0.5, 1].map(ratio => {
    const y = PADDING + chartHeight * ratio;
    return (
      <Line
        key={`ref-${ratio}`}
        x1={PADDING}
        y1={y}
        x2={WIDTH}
        y2={y}
        stroke="#E5E7EB"
        strokeDasharray="3, 3"
        strokeWidth="1"
      />
    );
  });

  return (
    <View>
      <Svg width={WIDTH} height={HEIGHT}>
        <G y={0}>
            {referenceLines}
            
            {/* Eje X */}
            <Line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH} y2={HEIGHT - PADDING} stroke="#E5E7EB" strokeWidth="1" />

            {/* Renderizado de Barras */}
            {type === 'bar' && displayData.map((v, i) => {
              const h = (v / max) * chartHeight;
              const x = PADDING + i * (barW + barGap) + barGap;
              return (
                <Rect 
                  key={i} 
                  x={x} 
                  y={HEIGHT - PADDING - h} 
                  width={barW} 
                  height={h} 
                  rx={4} 
                  fill={chartColor}
                />
              );
            })}

            {/* Renderizado de Línea (Path con curva suave) */}
            {type === 'line' && coordinates.length > 0 && (
                <>
                    <Path
                        d={pathD} // Comando d de la curva suave
                        fill="none"
                        stroke={chartColor}
                        strokeWidth="3"
                    />
                    {/* Dots */}
                    {coordinates.map((p, i) => (
                       <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke={chartColor} strokeWidth="2" />
                    ))}
                </>
            )}
        </G>
      </Svg>
      
      {/* Etiquetas del Eje X (Fuera del SVG) */}
      <View style={styles.labelRow}>
        {labels.map((label, i) => (
          <Text key={i} style={[styles.label, { width: chartWidth / numDataPoints }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16
  },
  noDataText: {
    color: '#9CA3AF',
    fontSize: 14,
    padding: PADDING,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: PADDING,
    marginTop: -10,
  },
  label: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: '#6B7280'
  }
});
