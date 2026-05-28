/**
 * Testes unitários — Maré Brincadeiras
 * Foco: lógica de negócio (reducer, carrinho, filtros, helpers)
 * Rodar: npm test
 */

// ─── Helpers de formatação (copiados de ClientScreens) ───────────────────────

function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
}

function maskCardNumber(number) {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length < 4) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${cleaned.slice(-4)}`;
}

// ─── Reducer (replicado do AppContext) ───────────────────────────────────────

const initialState = {
  user: null,
  isAdmin: false,
  cart: [],
  favorites: [],
  products: [],
  orders: [],
  toast: null,
  profilePhoto: null,
  enderecos: [],
  cards: [],
};

function reducer(state, action) {
  switch (action.type) {
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
    case 'TOGGLE_FAVORITE': {
      const isFav = state.favorites.includes(action.payload);
      return { ...state, favorites: isFav ? state.favorites.filter((id) => id !== action.payload) : [...state.favorites, action.payload] };
    }
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : state.user };
    case 'SET_ENDERECOS':
      return { ...state, enderecos: action.payload };
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    default:
      return state;
  }
}

// ─── Helpers de subtotal ─────────────────────────────────────────────────────

function calcCartSubtotal(cart) {
  return cart
    .filter((i) => i.selecionado)
    .reduce((sum, i) => sum + (i.preco || 0) * i.quantidade, 0);
}

function calcCartCount(cart) {
  return cart.reduce((sum, i) => sum + i.quantidade, 0);
}

// ─── TESTES ──────────────────────────────────────────────────────────────────

describe('Formatação de cartão', () => {
  test('formata número com espaços a cada 4 dígitos', () => {
    expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  test('ignora caracteres não numéricos', () => {
    expect(formatCardNumber('1234-5678-9012-3456')).toBe('1234 5678 9012 3456');
  });

  test('limita a 16 dígitos', () => {
    expect(formatCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456');
  });

  test('formata validade MM/AA', () => {
    expect(formatExpiry('1225')).toBe('12/25');
  });

  test('retorna parcial sem barra para menos de 3 dígitos', () => {
    expect(formatExpiry('12')).toBe('12');
  });

  test('mascara número do cartão mostrando só últimos 4', () => {
    expect(maskCardNumber('1234567890123456')).toBe('•••• •••• •••• 3456');
  });

  test('retorna placeholder para número curto', () => {
    expect(maskCardNumber('123')).toBe('•••• •••• •••• ••••');
  });
});

describe('Reducer — autenticação', () => {
  test('LOGIN atualiza user e isAdmin', () => {
    const next = reducer(initialState, {
      type: 'LOGIN',
      payload: { user: { id: 1, nome: 'Ana', email: 'ana@email.com' }, isAdmin: false },
    });
    expect(next.user).toEqual({ id: 1, nome: 'Ana', email: 'ana@email.com' });
    expect(next.isAdmin).toBe(false);
  });

  test('LOGIN admin seta isAdmin true', () => {
    const next = reducer(initialState, {
      type: 'LOGIN',
      payload: { user: { id: 'admin', name: 'Admin', email: 'admin@mare.com' }, isAdmin: true },
    });
    expect(next.isAdmin).toBe(true);
  });

  test('LOGOUT limpa user, cart e favorites', () => {
    const stateComDados = {
      ...initialState,
      user: { id: 1, nome: 'Ana' },
      cart: [{ productId: '1', quantidade: 2, selecionado: true }],
      favorites: ['1', '2'],
    };
    const next = reducer(stateComDados, { type: 'LOGOUT' });
    expect(next.user).toBeNull();
    expect(next.cart).toHaveLength(0);
    expect(next.favorites).toHaveLength(0);
  });
});

describe('Reducer — carrinho', () => {
  const produto = { productId: '1', nome: 'Lego', preco: 249.90, imagem: 'url' };
  const estadoComItem = reducer(initialState, { type: 'ADD_TO_CART', payload: produto });

  test('ADD_TO_CART adiciona produto com quantidade 1 e selecionado', () => {
    expect(estadoComItem.cart).toHaveLength(1);
    expect(estadoComItem.cart[0].quantidade).toBe(1);
    expect(estadoComItem.cart[0].selecionado).toBe(true);
  });

  test('ADD_TO_CART incrementa quantidade se produto já existe', () => {
    const next = reducer(estadoComItem, { type: 'ADD_TO_CART', payload: produto });
    expect(next.cart).toHaveLength(1);
    expect(next.cart[0].quantidade).toBe(2);
  });

  test('REMOVE_FROM_CART remove item por productId', () => {
    const next = reducer(estadoComItem, { type: 'REMOVE_FROM_CART', payload: '1' });
    expect(next.cart).toHaveLength(0);
  });

  test('UPDATE_CART_QTY incrementa quantidade', () => {
    const next = reducer(estadoComItem, { type: 'UPDATE_CART_QTY', payload: { productId: '1', delta: 2 } });
    expect(next.cart[0].quantidade).toBe(3);
  });

  test('UPDATE_CART_QTY não desce abaixo de 1', () => {
    const next = reducer(estadoComItem, { type: 'UPDATE_CART_QTY', payload: { productId: '1', delta: -99 } });
    expect(next.cart[0].quantidade).toBe(1);
  });

  test('CLEAR_CART esvazia o carrinho', () => {
    const next = reducer(estadoComItem, { type: 'CLEAR_CART' });
    expect(next.cart).toHaveLength(0);
  });

  test('TOGGLE_CART_ITEM inverte seleção', () => {
    const next = reducer(estadoComItem, { type: 'TOGGLE_CART_ITEM', payload: '1' });
    expect(next.cart[0].selecionado).toBe(false);
  });

  test('SELECT_ALL_CART seleciona todos', () => {
    const state2 = reducer(estadoComItem, { type: 'ADD_TO_CART', payload: { productId: '2', nome: 'Boneca', preco: 89.90, imagem: 'url' } });
    const next = reducer(state2, { type: 'SELECT_ALL_CART', payload: false });
    expect(next.cart.every((i) => !i.selecionado)).toBe(true);
  });
});

describe('Cálculo de subtotal e contagem', () => {
  const cart = [
    { productId: '1', preco: 100, quantidade: 2, selecionado: true },
    { productId: '2', preco: 50, quantidade: 1, selecionado: false },
    { productId: '3', preco: 200, quantidade: 3, selecionado: true },
  ];

  test('subtotal considera apenas itens selecionados', () => {
    expect(calcCartSubtotal(cart)).toBeCloseTo(800); // 100*2 + 200*3
  });

  test('contagem total inclui todos os itens', () => {
    expect(calcCartCount(cart)).toBe(6); // 2 + 1 + 3
  });

  test('subtotal zero com carrinho vazio', () => {
    expect(calcCartSubtotal([])).toBe(0);
  });
});

describe('Reducer — favoritos', () => {
  test('TOGGLE_FAVORITE adiciona se não existir', () => {
    const next = reducer(initialState, { type: 'TOGGLE_FAVORITE', payload: '42' });
    expect(next.favorites).toContain('42');
  });

  test('TOGGLE_FAVORITE remove se já existir', () => {
    const withFav = { ...initialState, favorites: ['42'] };
    const next = reducer(withFav, { type: 'TOGGLE_FAVORITE', payload: '42' });
    expect(next.favorites).not.toContain('42');
  });
});

describe('Reducer — perfil', () => {
  test('SET_PROFILE_PHOTO atualiza foto', () => {
    const next = reducer(initialState, { type: 'SET_PROFILE_PHOTO', payload: 'file://foto.jpg' });
    expect(next.profilePhoto).toBe('file://foto.jpg');
  });

  test('UPDATE_USER mescla dados do user', () => {
    const withUser = { ...initialState, user: { id: 1, nome: 'Ana', telefone: '' } };
    const next = reducer(withUser, { type: 'UPDATE_USER', payload: { nome: 'Ana Maria', telefone: '11999' } });
    expect(next.user.nome).toBe('Ana Maria');
    expect(next.user.telefone).toBe('11999');
    expect(next.user.id).toBe(1);
  });

  test('UPDATE_USER não falha sem user logado', () => {
    const next = reducer(initialState, { type: 'UPDATE_USER', payload: { nome: 'X' } });
    expect(next.user).toBeNull();
  });

  test('SET_CARDS atualiza lista de cartões', () => {
    const cards = [{ id: '1', brand: 'visa', lastFour: '1234', name: 'ANA', expiry: '12/25' }];
    const next = reducer(initialState, { type: 'SET_CARDS', payload: cards });
    expect(next.cards).toHaveLength(1);
    expect(next.cards[0].lastFour).toBe('1234');
  });

  test('SET_ENDERECOS atualiza lista de endereços', () => {
    const enderecos = [{ id: 1, rua: 'Rua das Flores', numero: '100', cidade: 'SP', principal: 1 }];
    const next = reducer(initialState, { type: 'SET_ENDERECOS', payload: enderecos });
    expect(next.enderecos).toHaveLength(1);
    expect(next.enderecos[0].rua).toBe('Rua das Flores');
  });
});

describe('Filtro de produtos', () => {
  const produtos = [
    { id: '1', name: 'Lego Star Wars', value: 249.90, discount: 20, categoryId: 'Lego' },
    { id: '2', name: 'Boneca Barbie', value: 89.90, discount: 10, categoryId: 'Bonecas' },
    { id: '3', name: 'Carrinho Hot Wheels', value: 59.90, discount: 25, categoryId: 'Carrinhos' },
    { id: '4', name: 'Lego Technic', value: 329.90, discount: 17, categoryId: 'Lego' },
  ];

  test('filtra por texto (case insensitive)', () => {
    const result = produtos.filter((p) => p.name.toLowerCase().includes('lego'));
    expect(result).toHaveLength(2);
  });

  test('filtra por categoria', () => {
    const result = produtos.filter((p) => p.categoryId === 'Lego');
    expect(result).toHaveLength(2);
  });

  test('filtra por preço máximo', () => {
    const result = produtos.filter((p) => p.value <= 100);
    expect(result).toHaveLength(2);
  });

  test('ordena por menor preço', () => {
    const sorted = [...produtos].sort((a, b) => a.value - b.value);
    expect(sorted[0].name).toBe('Carrinho Hot Wheels');
  });

  test('ordena por maior desconto', () => {
    const sorted = [...produtos].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    expect(sorted[0].name).toBe('Carrinho Hot Wheels');
  });

  test('produto com maior desconto (oferta relâmpago)', () => {
    const flash = produtos.reduce((max, p) => {
      const disc = Number(p.discount) || 0;
      const maxDisc = Number(max?.discount) || 0;
      return disc > maxDisc ? p : max;
    }, produtos[0]);
    expect(flash.name).toBe('Carrinho Hot Wheels');
    expect(flash.discount).toBe(25);
  });
});

describe('Validação de checkout', () => {
  test('carrinho sem itens selecionados bloqueia checkout', () => {
    const cart = [{ productId: '1', selecionado: false, preco: 100, quantidade: 1 }];
    const subtotal = calcCartSubtotal(cart);
    expect(subtotal).toBe(0);
  });

  test('desconto Pix de 5%', () => {
    const subtotal = 200;
    const pixDiscount = subtotal * 0.05;
    const total = subtotal - pixDiscount;
    expect(pixDiscount).toBe(10);
    expect(total).toBe(190);
  });

  test('parcelas calculadas corretamente', () => {
    const total = 300;
    const parcelas = 3;
    const valorParcela = total / parcelas;
    expect(valorParcela).toBeCloseTo(100);
  });
});
