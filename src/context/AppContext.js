import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  getAllClientes,
  getAllProdutos,
  getAllPedidos,
  createCliente,
  updateCliente,
  deleteCliente,
  createProduto,
  updateProduto,
  deleteProduto,
  createPedido,
  updatePedidoStatus,
  getClienteByEmail,
} from '../services/database';

const AppContext = createContext();

const initialState = {
  user: null,
  isAdmin: false,
  cart: [],
  favorites: [],
  products: [],
  customers: [],
  orders: [],
  toast: null,
  dbReady: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DB_READY':
      return { ...state, dbReady: true };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload.user, isAdmin: action.payload.isAdmin };
    case 'LOGOUT':
      return { ...state, user: null, isAdmin: false, cart: [], favorites: [] };
    case 'ADD_TO_CART': {
      const existing = state.cart.find((i) => i.productId === action.payload.productId);
      if (existing) {
        return { ...state, cart: state.cart.map((i) => i.productId === action.payload.productId ? { ...i, quantidade: i.quantidade + 1 } : i) };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantidade: 1, selecionado: true }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.productId !== action.payload) };
    case 'UPDATE_CART_QTY':
      return { ...state, cart: state.cart.map((i) => i.productId === action.payload.productId ? { ...i, quantidade: Math.max(1, i.quantidade + action.payload.delta) } : i) };
    case 'TOGGLE_CART_ITEM':
      return { ...state, cart: state.cart.map((i) => i.productId === action.payload ? { ...i, selecionado: !i.selecionado } : i) };
    case 'SELECT_ALL_CART':
      return { ...state, cart: state.cart.map((i) => ({ ...i, selecionado: action.payload })) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'RESTORE_CART':
      return { ...state, cart: action.payload };
    case 'RESTORE_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'TOGGLE_FAVORITE': {
      const isFav = state.favorites.includes(action.payload);
      return { ...state, favorites: isFav ? state.favorites.filter((id) => id !== action.payload) : [...state.favorites, action.payload] };
    }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)) };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter((c) => c.id !== action.payload) };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map((o) => o.id === action.payload.id ? { ...o, status: action.payload.status } : o) };
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

  useEffect(() => {
    (async () => {
      try {
        // expo-sqlite só funciona no celular (iOS/Android)
        const { Platform } = require('react-native');
        if (Platform.OS === 'web') {
          console.warn('SQLite não disponível na web. Dados não serão persistidos.');
          dispatch({ type: 'SET_DB_READY' });
          return;
        }
        await initDatabase();
        await recarregarTudo();
        dispatch({ type: 'SET_DB_READY' });
      } catch (e) {
        console.error('Erro ao inicializar app:', e);
        dispatch({ type: 'SET_DB_READY' });
      }
    })();
  }, []);

  const recarregarTudo = async () => {
    const [clientes, produtos, pedidos] = await Promise.all([
      getAllClientes(),
      getAllProdutos(),
      getAllPedidos(),
    ]);
    dispatch({ type: 'SET_CUSTOMERS', payload: clientes });
    dispatch({
      type: 'SET_PRODUCTS',
      payload: produtos.map((p) => ({
        ...p,
        name: p.nome,
        description: p.descricao,
        categoryId: p.categoria,
        value: p.preco,
        oldValue: p.preco_antigo,
        discount: p.desconto,
        quantity: p.estoque,
        ageRange: p.faixa_etaria,
        image: p.imagem,
        isFavorite: false,
        feedbacks: [],
      })),
    });
    dispatch({
      type: 'SET_ORDERS',
      payload: pedidos.map((p) => ({
        ...p,
        customerName: p.cliente_nome || p.cliente_nome_db || 'Cliente',
        date: p.data,
        items: [],
      })),
    });
  };

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

  const login = async (email, password) => {
    if (email === 'admin@mare.com' && password === 'admin123') {
      dispatch({ type: 'LOGIN', payload: { user: { id: 'admin', name: 'Administrador', email }, isAdmin: true } });
      return { success: true, isAdmin: true };
    }
    try {
      const cliente = await getClienteByEmail(email);
      if (cliente && cliente.senha === password) {
        dispatch({ type: 'LOGIN', payload: { user: cliente, isAdmin: false } });
        return { success: true, isAdmin: false };
      }
    } catch (e) {}
    return { success: false };
  };

  const dbCreateProduto = async (dados) => {
    const novo = await createProduto(
      dados.name || dados.nome, dados.description || dados.descricao,
      dados.categoryId || dados.categoria, dados.value || dados.preco,
      dados.oldValue || dados.preco_antigo, dados.discount || dados.desconto,
      dados.quantity || dados.estoque, dados.ageRange || dados.faixa_etaria,
      dados.image || dados.imagem,
    );
    await recarregarTudo();
    return novo;
  };

  const dbUpdateProduto = async (id, dados) => {
    await updateProduto(
      id, dados.name || dados.nome, dados.description || dados.descricao,
      dados.categoryId || dados.categoria, dados.value || dados.preco,
      dados.oldValue || dados.preco_antigo, dados.discount || dados.desconto,
      dados.quantity || dados.estoque, dados.ageRange || dados.faixa_etaria,
      dados.image || dados.imagem,
    );
    await recarregarTudo();
  };

  const dbDeleteProduto = async (id) => {
    await deleteProduto(id);
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const dbCreateCliente = async (nome, cpf, telefone, email, endereco, senha) => {
    const novo = await createCliente(nome, cpf, telefone, email, endereco, senha);
    await recarregarTudo();
    return novo;
  };

  const dbUpdateCliente = async (id, nome, cpf, telefone, email, endereco) => {
    await updateCliente(id, nome, cpf, telefone, email, endereco);
    await recarregarTudo();
  };

  const dbDeleteCliente = async (id) => {
    await deleteCliente(id);
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const dbCreatePedido = async (clienteId, clienteNome, total, formaPagamento, itens, observacao) => {
    const id = await createPedido(clienteId, clienteNome, total, formaPagamento, itens, observacao);
    await recarregarTudo();
    return id;
  };

  const dbUpdatePedidoStatus = async (id, status) => {
    await updatePedidoStatus(id, status);
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
  };

  const cartCount = state.cart.reduce((sum, i) => sum + i.quantidade, 0);
  const cartSubtotal = state.cart
    .filter((i) => i.selecionado)
    .reduce((sum, i) => sum + (i.preco || i.value || 0) * i.quantidade, 0);

  return (
    <AppContext.Provider value={{
      state, dispatch, showToast, login, cartCount, cartSubtotal,
      recarregarTudo,
      dbCreateProduto, dbUpdateProduto, dbDeleteProduto,
      dbCreateCliente, dbUpdateCliente, dbDeleteCliente,
      dbCreatePedido, dbUpdatePedidoStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
