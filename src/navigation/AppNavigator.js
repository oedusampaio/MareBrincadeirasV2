import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SIZES } from '../utils/theme';
import { useApp } from '../context/AppContext';
import {
  QuemSomosScreen,
  ContatoScreen,
  PoliticaPrivacidadeScreen,
} from '../screens/client/InfoScreens';

// ── Client Screens
import HomeScreen from '../screens/client/HomeScreen';
import ProductsScreen from '../screens/client/ProductsScreen';
import ProductDetailScreen from '../screens/client/ProductDetailScreen';
import {
  CarrinhoScreen,
  FavoritosScreen,
  LoginScreen,
  CadastroScreen,
  PerfilScreen,
  FinalizarScreen,
  PedidosScreen,
  ForgotPasswordScreen,
} from '../screens/client/ClientScreens';

// ── Admin Screens
import {
  AdminDashboardScreen,
  AdminProductsScreen,
  AdminCustomersScreen,
  AdminOrdersScreen,
  AdminCategoriesScreen,
  AdminReviewsScreen,
  AdminSalesScreen,
} from '../screens/admin/AdminScreens';
import DatabaseDebugScreen from '../screens/admin/DatabaseDebugScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { cartCount } = useApp();
  const tabs = [
    { name: 'HomeTab', icon: 'home', label: 'Início' },
    { name: 'ProductsTab', icon: 'grid', label: 'Produtos' },
    { name: 'CarrinhoTab', icon: 'cart', label: 'Carrinho', badge: cartCount },
    { name: 'FavoritosTab', icon: 'heart', label: 'Favoritos' },
    { name: 'PerfilTab', icon: 'person', label: 'Perfil' },
  ];

  return (
    <View style={tabStyles.bar}>
      {state.routes.map((route, i) => {
        const tab = tabs[i];
        const focused = state.index === i;
        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.item}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <View style={[tabStyles.iconWrap, focused && tabStyles.iconActive]}>
              <Ionicons
                name={focused ? tab?.icon : `${tab?.icon}-outline`}
                size={22}
                color={focused ? COLORS.white : COLORS.textMuted}
              />
              {tab?.badge > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{tab?.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ProductsTab" component={ProductsScreen} />
      <Tab.Screen name="CarrinhoTab" component={CarrinhoScreen} />
      <Tab.Screen name="FavoritosTab" component={FavoritosScreen} />
      <Tab.Screen name="PerfilTab" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Client screens (modal-style) */}
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Finalizar" component={FinalizarScreen} />
      <Stack.Screen name="Pedidos" component={PedidosScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="QuemSomos" component={QuemSomosScreen} />
      <Stack.Screen name="Contato" component={ContatoScreen} />
      <Stack.Screen name="PoliticaPrivacidade" component={PoliticaPrivacidadeScreen} />

      {/* Admin screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
      <Stack.Screen name="AdminCustomers" component={AdminCustomersScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
      <Stack.Screen name="AdminSales" component={AdminSalesScreen} />
      <Stack.Screen name="DatabaseDebug" component={DatabaseDebugScreen} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: {
    padding: 6, borderRadius: 20, position: 'relative',
  },
  iconActive: { backgroundColor: COLORS.primary },
  badge: {
    position: 'absolute', top: -3, right: -3,
    backgroundColor: COLORS.error, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
});
