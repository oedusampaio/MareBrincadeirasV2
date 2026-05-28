/**
 * src/services/api.js
 *
 * Camada de comunicação do app com o backend Mare Brincadeiras.
 *
 * ─── CONFIGURAÇÃO ───────────────────────────────────────────────
 *  • Desenvolvimento local (celular físico via Expo Go):
 *      Troque 'localhost' pelo IP da sua máquina na rede Wi-Fi.
 *      Ex: http://192.168.1.42:3000
 *
 *  • Emulador Android:
 *      Use http://10.0.2.2:3000
 *
 *  • Emulador iOS / Expo Web:
 *      http://localhost:3000
 * ────────────────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ── URL Base ─────────────────────────────────────────────────────
// Troque pelo IP da sua máquina se estiver usando celular físico
// Para deploy: substitua pela URL do servidor (ex: https://sua-api.railway.app)
// Para desenvolvimento local com celular físico: use o IP da máquina (ex: http://192.168.1.x:3000)
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BASE_URL = `http://${LOCAL_HOST}:3000`;

// ── Helpers ───────────────────────────────────────────────────────
async function getUserId() {
  try {
    const stored = await AsyncStorage.getItem('@mare_user_id');
    return stored || 'guest';
  } catch {
    return 'guest';
  }
}

async function baseHeaders() {
  const userId = await getUserId();
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
}

async function request(path, options = {}) {
  const headers = await baseHeaders();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Erro desconhecido na API');
    }
    return json.data;
  } catch (err) {
    // Re-throw com contexto para facilitar debug
    throw new Error(`[API] ${path}: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Health
// ═══════════════════════════════════════════════════════════════
export async function checkHealth() {
  return request('/health');
}

// ═══════════════════════════════════════════════════════════════
// Produtos
// ═══════════════════════════════════════════════════════════════
export async function fetchProducts({ categoria, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (categoria) params.set('categoria', categoria);
  return request(`/api/products?${params}`);
}

export async function fetchProductById(id) {
  return request(`/api/products/${id}`);
}

// ═══════════════════════════════════════════════════════════════
// Carrinho
// ═══════════════════════════════════════════════════════════════
export async function fetchCart() {
  return request('/api/cart');
}

export async function addToCart(produtoId, quantidade = 1) {
  return request('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ produtoId, quantidade }),
  });
}

export async function updateCartItem(produtoId, quantidade) {
  return request(`/api/cart/items/${produtoId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantidade }),
  });
}

export async function removeFromCart(produtoId) {
  return request(`/api/cart/items/${produtoId}`, { method: 'DELETE' });
}

export async function clearCart() {
  return request('/api/cart', { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════
// Pagamento — Mercado Pago
// ═══════════════════════════════════════════════════════════════
/**
 * Cria uma preferência de pagamento no Mercado Pago.
 * Retorna { initPoint, preferenceId, provider, mode, totalEmCentavos }
 * Use o initPoint para abrir no WebView ou Linking.openURL.
 */
export async function createMercadoPagoPayment() {
  return request('/api/payments/mercadopago', { method: 'POST' });
}
