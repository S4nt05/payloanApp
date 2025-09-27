// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useAuth } from '../context/AuthContext';
// import LoginScreen from '@/screens/login';
// import DashboardScreen from '../screens/DashboardScreen';
// import ClientsIndex from '../screens/clients/index';
// import ClientDetail from '../screens/clients/ClientDetail';
// import ClientEditScreen from '../screens/clients/ClientEditScreen';
// import LoansIndex from '../screens/loans/index';
// import LoanCreateScreen from '../screens/loans/create';
// import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
// import PaymentCreate from '../screens/payment/paymentCreate';
// import { Ionicons } from '@expo/vector-icons';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ color, size }) => {
//           const name =
//             route.name === 'Dashboard'
//               ? 'home-outline'
//               : route.name === 'Clients'
//               ? 'people-outline'
//               : route.name === 'Loans'
//               ? 'card-outline'
//               : 'cash-outline';

//           return <Ionicons name={name as any} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="Dashboard" component={DashboardScreen} />
//       <Tab.Screen name="Clients" component={ClientsIndex} />
//       <Tab.Screen name="Loans" component={LoansIndex} />
//       {/* <Tab.Screen name="Loans" component={LoansScreen} />
//       <Tab.Screen name="Payments" component={PaymentsScreen} /> */}
//     </Tab.Navigator>
//   );
// }

// export default function AppNavigator() {
//   const { user, loading } = useAuth();

// //                  if (loading) return <LoadingIndicator />;

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           <>
//           <Stack.Screen name="Main" component={MainTabs} />
//             <Stack.Screen name="ClientDetail" component={ClientDetail} />
//             <Stack.Screen name="ClientEdit" component={ClientEditScreen} />
//             <Stack.Screen name="LoanCreate" component={LoanCreateScreen} />
//             <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
//             <Stack.Screen name="LoanCreatePayment" component={PaymentCreate} />
//             </>
//         ) : (
//           <>
//             <Stack.Screen name="Login" component={LoginScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '@/screens/login';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsIndex from '../screens/clients/index';
import ClientDetail from '../screens/clients/ClientDetail';
import ClientEditScreen from '../screens/clients/ClientEditScreen';
import LoansIndex from '../screens/loans/index';
import LoanCreateScreen from '../screens/loans/create';
import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
import PaymentCreate from '../screens/payment/paymentCreate';
import LogoutButton from '../components/LogoutButton'; 
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let name: string = '';
          switch (route.name) {
            case 'Dashboard':
              name = 'home-outline';
              break;
            case 'Clients':
              name = 'people-outline';
              break;
            case 'Loans':
              name = 'card-outline';
              break;
            case 'Logout':
              name = 'exit-outline';
              break;
            default:
              name = 'cash-outline';
          }
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clients" component={ClientsIndex} />
      <Tab.Screen name="Loans" component={LoansIndex} />
      {/* Tab solo para cerrar sesión */}
      <Tab.Screen
        name="Logout"
        component={View} // Componente dummy, no importa
        options={{
          tabBarButton: () => <LogoutButton />, // aquí se renderiza nuestro botón real
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // puedes poner un loading indicator

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ClientDetail" component={ClientDetail} />
            <Stack.Screen name="ClientEdit" component={ClientEditScreen} />
            <Stack.Screen name="LoanCreate" component={LoanCreateScreen} />
            <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
            <Stack.Screen name="LoanCreatePayment" component={PaymentCreate} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
