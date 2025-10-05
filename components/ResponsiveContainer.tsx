// // components/ResponsiveContainer.tsx
// import React from 'react';
// import {
//   View,
//   ScrollView,
//   StyleSheet,
//   SafeAreaView,
//   Dimensions,
//   StatusBar,
//   Platform,
// } from 'react-native';

// interface ResponsiveContainerProps {
//   children: React.ReactNode;
//   backgroundColor?: string;
//   withScroll?: boolean;
//   padding?: number;
//   safeArea?: boolean; // ✅ Controla si usa SafeAreaView
//   noScroll?: boolean; // ✅ Para componentes con FlatList interno
// }

// const { height: screenHeight } = Dimensions.get('window');

// const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
//   children,
//   backgroundColor = '#F8F9FA',
//   withScroll = true,
//   padding = 15,
//   safeArea = true, // ✅ Por defecto sí usa SafeArea
//   noScroll = false, // ✅ Para evitar ScrollView con FlatList
// }) => {
//   const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  
//   // ✅ Contenedor principal sin SafeAreaView interno
//   const Container = safeArea ? SafeAreaView : View;
  
//   const containerStyle = {
//     flex: 1,
//     backgroundColor,
//     paddingTop: safeArea ? 0 : statusBarHeight + 10, // ✅ Solo si NO usa SafeArea
//   };

//   const contentContainer = {
//     paddingTop: padding,
//     paddingBottom: padding - 15,
//     flexGrow: noScroll ? 1 : 0,
//   };

//   // ✅ CASO 1: Componente con FlatList interno - SIN ScrollView
//   if (noScroll) {
//     return (
//       <Container style={containerStyle}>
//         <View style={[styles.container, contentContainer]}>
//           {children}
//         </View>
//       </Container>
//     );
//   }

//   // ✅ CASO 2: Componente normal - CON ScrollView
//   if (withScroll) {
//     return (
//       <Container style={containerStyle}>
//         <ScrollView
//           style={styles.scrollView}
//           contentContainerStyle={contentContainer}
//           showsVerticalScrollIndicator={false}
//         >
//           {children}
//         </ScrollView>
//       </Container>
//     );
//   }

//   // ✅ CASO 3: Sin scroll
//   return (
//     <Container style={containerStyle}>
//       <View style={contentContainer}>
//         {children}
//       </View>
//     </Container>
//   );
// };

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
// });

// export default ResponsiveContainer;

// /*
// Ejemplo de uso para LoanDetailsScreen
//     <ResponsiveContainer 
//       safeArea={true}    // ✅ Usa SafeAreaView  
//       withScroll={false} // ❌ NO ScrollView
//       noScroll={true}    // ✅ TIENE FlatList interno
//       padding={40}       // ✅ Si quedan muy abajos los bonotes subir con padding segun screen
//     >
//       //En este mismo componetne se debe validar que hay dos pagos que dan error
//       //creo que debe ser algun problema de data el error es:
//       // ERROR  Error al cargar detalle del préstamo: [AxiosError: Request failed with status code 404]
// */
// components/ResponsiveContainer.tsx
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  withScroll?: boolean;
  padding?: number | string; // ✅ Ahora acepta porcentajes
  safeArea?: boolean;
  noScroll?: boolean;
  maxWidth?: number | string; // ✅ Ancho máximo opcional
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  backgroundColor = '#F8F9FA',
  withScroll = true,
  padding = '5%', // ✅ Por defecto en porcentaje
  safeArea = true,
  noScroll = false,
  maxWidth = '100%', // ✅ Por defecto ancho completo
}) => {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  
  // ✅ Función para convertir a píxeles
  const normalizeSize = (size: number | string): number => {
    if (typeof size === 'number') return size;
    if (typeof size === 'string' && size.includes('%')) {
      const percentage = parseFloat(size) / 100;
      return SCREEN_WIDTH * percentage;
    }
    return 16; // default
  };

  const normalizedPadding = normalizeSize(padding);
  const normalizedMaxWidth = normalizeSize(maxWidth);

  const Container = safeArea ? SafeAreaView : View;
  
  const containerStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeArea ? 0 : statusBarHeight + normalizeSize(2.5), // ✅ 2.5%
  };

  const contentContainer = {
    padding: normalizedPadding,
    paddingBottom: normalizedPadding/2, // ✅ 10% extra abajo
    flexGrow: noScroll ? 1 : 0,
    maxWidth: normalizedMaxWidth,
    alignSelf: normalizedMaxWidth < SCREEN_WIDTH ? 'center' : 'stretch' as 'center' | 'stretch',
  };

  // ✅ CASO 1: Componente con FlatList interno - SIN ScrollView
  if (noScroll) {
    return (
      <Container style={containerStyle}>
        <View style={[styles.container, contentContainer]}>
          {children}
        </View>
      </Container>
    );
  }

  // ✅ CASO 2: Componente normal - CON ScrollView
  if (withScroll) {
    return (
      <Container style={containerStyle}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Container>
    );
  }

  // ✅ CASO 3: Sin scroll
  return (
    <Container style={containerStyle}>
      <View style={contentContainer}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default ResponsiveContainer;
/*
Ejemplo de uso para LoanDetailsScreen
    <ResponsiveContainer 
      safeArea={true}    // ✅ Usa SafeAreaView  
      withScroll={false} // ❌ NO ScrollView
      noScroll={true}    // ✅ TIENE FlatList interno
      padding="10%"       // ✅ Si quedan muy abajos los bonotes subir con padding segun screen
    >
      //En este mismo componetne se debe validar que hay dos pagos que dan error
      //creo que debe ser algun problema de data el error es:
      // ERROR  Error al cargar detalle del préstamo: [AxiosError: Request failed with status code 404]
*/
