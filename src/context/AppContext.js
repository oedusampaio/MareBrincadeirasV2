import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchProducts,
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from '../services/api';
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
  getEnderecosByCliente,
  createEndereco,
  updateEndereco,
  deleteEndereco,
  setEnderecoPrincipal,
  getPedidosComItensByCliente,
} from '../services/database';

const AppContext = createContext();

function normalizeBackendProduct(p) {
  return {
    id: String(p.id),
    name: p.name || p.nome,
    description: p.description || p.descricao,
    categoryId: p.category || p.categoria,
    value: (p.priceInCents || p.precoEmCentavos || 0) / 100,
    oldValue: (p.oldPriceInCents || p.precoAntigoEmCentavos || 0) / 100,
    discount: p.discount ?? p.desconto ?? 0,
    quantity: p.stock ?? p.estoque ?? 0,
    ageRange: p.ageRange || p.faixaEtaria || '',
    image: p.image || p.imagem || '',
    isFavorite: false,
    feedbacks: [],
  };
}

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
  profilePhoto: null,
  enderecos: [],
  cards: [],
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
      const product = state.products.find((p) => p.id === action.payload.productId);
      const stock = product?.quantity ?? 999;
      if (stock <= 0) return state;
      const existing = state.cart.find((i) => i.productId === action.payload.productId);
      if (existing) {
        if (existing.quantidade >= stock) return state;
        return { ...state, cart: state.cart.map((i) => i.productId === action.payload.productId ? { ...i, quantidade: i.quantidade + 1 } : i) };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantidade: 1, selecionado: true }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.productId !== action.payload) };
    case 'UPDATE_CART_QTY': {
      const product = state.products.find((p) => p.id === action.payload.productId);
      const stock = product?.quantity ?? 999;
      return { ...state, cart: state.cart.map((i) => i.productId === action.payload.productId ? { ...i, quantidade: Math.min(stock, Math.max(1, i.quantidade + action.payload.delta)) } : i) };
    }
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
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : state.user };
    case 'SET_ENDERECOS':
      return { ...state, enderecos: action.payload };
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const cartReady = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const { Platform } = require('react-native');
        if (Platform.OS === 'web') {
          try {
            const data = await fetchProducts();
            dispatch({ type: 'SET_PRODUCTS', payload: data.products.map(normalizeBackendProduct) });
          } catch (e) {
            console.warn('[AppContext] Backend indisponível na web:', e.message);
          }
          try {
            const session = await AsyncStorage.getItem('@mare_session');
            if (session) dispatch({ type: 'LOGIN', payload: JSON.parse(session) });
          } catch {}
          dispatch({ type: 'SET_DB_READY' });
          return;
        }
        await initDatabase();
        await recarregarTudo();
        try {
          const session = await AsyncStorage.getItem('@mare_session');
          if (session) {
            const parsed = JSON.parse(session);
            if (parsed.isAdmin) {
              dispatch({ type: 'LOGIN', payload: parsed });
            } else if (parsed.user?.email) {
              const exists = await getClienteByEmail(parsed.user.email);
              if (exists) {
                dispatch({ type: 'LOGIN', payload: { user: exists, isAdmin: false } });
              } else {
                await AsyncStorage.removeItem('@mare_session');
              }
            }
          }
        } catch {}
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

    if (produtos.length === 0) {
      try {
        const data = await fetchProducts();
        dispatch({ type: 'SET_PRODUCTS', payload: data.products.map(normalizeBackendProduct) });
      } catch (e) {
        console.warn('[AppContext] Backend indisponível para produtos:', e.message);
      }
    } else {
    dispatch({
      type: 'SET_PRODUCTS',
      payload: produtos.map((p) => ({
        ...p,
        id: String(p.id), // garante que o id é sempre string, igual ao mockData
        name: p.nome,
        description: p.descricao,
        categoryId: p.categoria, // categoria do banco é o nome (ex: "Lego"), filtro usa nome também
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
    }

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
        const profilePhoto = await AsyncStorage.getItem('profilePhoto');
        const cards = await AsyncStorage.getItem('cards');
        if (cart) dispatch({ type: 'RESTORE_CART', payload: JSON.parse(cart) });
        if (favorites) dispatch({ type: 'RESTORE_FAVORITES', payload: JSON.parse(favorites) });
        if (profilePhoto) dispatch({ type: 'SET_PROFILE_PHOTO', payload: profilePhoto });
        if (cards) dispatch({ type: 'SET_CARDS', payload: JSON.parse(cards) });
      } catch (e) {}
      cartReady.current = true;
    })();
  }, []);

  // Sync carrinho com backend (fire-and-forget)
  useEffect(() => {
    if (!cartReady.current) return;
    const syncCart = async () => {
      try {
        await apiClearCart();
        await Promise.all(
          state.cart.map((i) => apiAddToCart(Number(i.productId), i.quantidade))
        );
      } catch {}
    };
    syncCart();
  }, [state.cart]);

  const showToast = (message, type = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  };

  const login = async (email, password) => {
    if (email === 'admin@mare.com' && password === 'admin123') {
      const payload = { user: { id: 'admin', name: 'Administrador', email }, isAdmin: true };
      dispatch({ type: 'LOGIN', payload });
      try { await AsyncStorage.setItem('@mare_session', JSON.stringify(payload)); } catch {}
      return { success: true, isAdmin: true };
    }
    try {
      const cliente = await getClienteByEmail(email);
      if (cliente && cliente.senha === password) {
        const payload = { user: cliente, isAdmin: false };
        dispatch({ type: 'LOGIN', payload });
        try { await AsyncStorage.setItem('@mare_session', JSON.stringify(payload)); } catch {}
        return { success: true, isAdmin: false };
      }
    } catch (e) {}
    return { success: false };
  };

  const logout = async () => {
    try { await apiClearCart(); } catch {}
    try { await AsyncStorage.removeItem('@mare_session'); } catch {}
    dispatch({ type: 'LOGOUT' });
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
    dispatch({ type: 'UPDATE_USER', payload: { nome, name: nome, cpf, telefone, email } });
    await recarregarTudo();
  };

  const dbUpdateProfilePhoto = async (uri) => {
    await AsyncStorage.setItem('profilePhoto', uri || '');
    dispatch({ type: 'SET_PROFILE_PHOTO', payload: uri });
  };

  const dbGetEnderecos = async (clienteId) => {
    try {
      const { Platform } = require('react-native');
      if (Platform.OS === 'web') return [];
      const list = await getEnderecosByCliente(clienteId);
      dispatch({ type: 'SET_ENDERECOS', payload: list });
      return list;
    } catch (e) {
      return [];
    }
  };

  const dbCreateEndereco = async (clienteId, cep, rua, numero, complemento, bairro, cidade, estado) => {
    const novo = await createEndereco(clienteId, cep, rua, numero, complemento, bairro, cidade, estado);
    await dbGetEnderecos(clienteId);
    return novo;
  };

  const dbUpdateEndereco = async (id, clienteId, cep, rua, numero, complemento, bairro, cidade, estado) => {
    await updateEndereco(id, cep, rua, numero, complemento, bairro, cidade, estado);
    await dbGetEnderecos(clienteId);
  };

  const dbDeleteEndereco = async (id, clienteId) => {
    await deleteEndereco(id);
    await dbGetEnderecos(clienteId);
  };

  const dbSetEnderecoPrincipal = async (id, clienteId) => {
    await setEnderecoPrincipal(id, clienteId);
    await dbGetEnderecos(clienteId);
  };

  const dbSaveCards = async (cards) => {
    await AsyncStorage.setItem('cards', JSON.stringify(cards));
    dispatch({ type: 'SET_CARDS', payload: cards });
  };

  const dbGetMeusPedidos = async (clienteId) => {
    try {
      const { Platform } = require('react-native');
      if (Platform.OS === 'web') return [];
      return await getPedidosComItensByCliente(clienteId);
    } catch (e) {
      return [];
    }
  };

  const dbDeleteCliente = async (id) => {
    await deleteCliente(id);
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const dbCreatePedido = async (clienteId, clienteNome, total, formaPagamento, itens, observacao, status) => {
    const id = await createPedido(clienteId, clienteNome, total, formaPagamento, itens, observacao, status);
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
      state, dispatch, showToast, login, logout, cartCount, cartSubtotal,
      recarregarTudo,
      dbCreateProduto, dbUpdateProduto, dbDeleteProduto,
      dbCreateCliente, dbUpdateCliente, dbDeleteCliente,
      dbCreatePedido, dbUpdatePedidoStatus,
      dbUpdateProfilePhoto,
      dbGetEnderecos, dbCreateEndereco, dbUpdateEndereco, dbDeleteEndereco, dbSetEnderecoPrincipal,
      dbSaveCards,
      dbGetMeusPedidos,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
