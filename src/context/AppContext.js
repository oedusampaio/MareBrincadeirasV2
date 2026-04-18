import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { products as initialProducts, mockCustomers } from '../data/mockData';

const AppContext = createContext();

const initialState = {
  user: null,
  isAdmin: false,
  cart: [],
  favorites: [],
  products: initialProducts,
  customers: mockCustomers,
  orders: [],
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    // AUTH
    case 'LOGIN':
      return { ...state, user: action.payload.user, isAdmin: action.payload.isAdmin };
    case 'LOGOUT':
      return { ...state, user: null, isAdmin: false, cart: [], favorites: [] };

    // CART
    case 'ADD_TO_CART': {
      const existing = state.cart.find((i) => i.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantidade: i.quantidade + 1 }
              : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantidade: 1, selecionado: true }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.productId !== action.payload) };
    case 'UPDATE_CART_QTY':
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantidade: Math.max(1, i.quantidade + action.payload.delta) }
            : i
        ),
      };
    case 'TOGGLE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.productId === action.payload ? { ...i, selecionado: !i.selecionado } : i
        ),
      };
    case 'SELECT_ALL_CART':
      return { ...state, cart: state.cart.map((i) => ({ ...i, selecionado: action.payload })) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };

    // FAVORITES
    case 'TOGGLE_FAVORITE': {
      const isFav = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFav
          ? state.favorites.filter((id) => id !== action.payload)
          : [...state.favorites, action.payload],
        products: state.products.map((p) =>
          p.id === action.payload ? { ...p, isFavorite: !p.isFavorite } : p
        ),
      };
    }

    // PRODUCTS (admin)
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

    // CUSTOMERS (admin)
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter((c) => c.id !== action.payload) };

    // ORDERS
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };

    // TOAST
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist cart and favorites
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(state.cart));
    AsyncStorage.setItem('favorites', JSON.stringify(state.favorites));
  }, [state.cart, state.favorites]);

  useEffect(() => {
    (async () => {
      try {
        const cart = await AsyncStorage.getItem('cart');
        const favorites = await AsyncStorage.getItem('favorites');
        if (cart) dispatch({ type: 'RESTORE_CART', payload: JSON.parse(cart) });
        if (favorites) dispatch({ type: 'RESTORE_FAVORITES', payload: JSON.parse(favorites) });
      } catch (e) {}
    })();
  }, []);

  const showToast = (message, type = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  };

  const login = (email, password) => {
    // Admin hardcoded
    if (email === 'admin@mare.com' && password === 'admin123') {
      dispatch({ type: 'LOGIN', payload: { user: { id: 'admin', name: 'Administrador', email }, isAdmin: true } });
      return { success: true, isAdmin: true };
    }
    const customer = state.customers.find((c) => c.email === email && c.password === password);
    if (customer) {
      dispatch({ type: 'LOGIN', payload: { user: customer, isAdmin: false } });
      return { success: true, isAdmin: false };
    }
    return { success: false };
  };

  const cartCount = state.cart.reduce((sum, i) => sum + i.quantidade, 0);
  const cartSubtotal = state.cart
    .filter((i) => i.selecionado)
    .reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast, login, cartCount, cartSubtotal }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
