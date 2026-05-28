const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { MercadoPagoConfig, Preference } = require('mercadopago');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO — Produtos da Mare Brincadeiras
// Estes produtos espelham o mockData.js do app.
// No futuro, isso pode vir de um banco de dados.
// ═══════════════════════════════════════════════════════════════
const catalog = [
  {
    id: 1,
    nome: 'Casa de Atividades Montessori - Emoticon',
    descricao: 'Casa de atividades inspirada na metodologia Montessori com luzes interativas, engrenagens móveis e xilofone.',
    categoria: 'Montessori',
    precoEmCentavos: 19990,
    precoAntigoEmCentavos: 29990,
    desconto: 33,
    estoque: 8,
    faixaEtaria: '1-3 anos',
    imagem: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80',
  },
  {
    id: 2,
    nome: 'Conjunto de Chocalhos de Madeira',
    descricao: 'Conjunto com 5 chocalhos artesanais de madeira natural, sons únicos em cada peça.',
    categoria: 'Montessori',
    precoEmCentavos: 8990,
    precoAntigoEmCentavos: 11990,
    desconto: 25,
    estoque: 12,
    faixaEtaria: '0-1 ano',
    imagem: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80',
  },
  {
    id: 3,
    nome: 'Urso de Pelúcia Gigante',
    descricao: 'Urso macio e fofinho, 70cm de altura, ideal para presentear.',
    categoria: 'Pelúcias',
    precoEmCentavos: 14990,
    precoAntigoEmCentavos: 19990,
    desconto: 25,
    estoque: 15,
    faixaEtaria: '0+ anos',
    imagem: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&q=80',
  },
  {
    id: 4,
    nome: 'Jogo de Xadrez Educativo',
    descricao: 'Xadrez em madeira com peças coloridas e manual de aprendizado para crianças.',
    categoria: 'Jogos de tabuleiro',
    precoEmCentavos: 7990,
    precoAntigoEmCentavos: 9990,
    desconto: 20,
    estoque: 20,
    faixaEtaria: '6+ anos',
    imagem: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&q=80',
  },
  {
    id: 5,
    nome: 'Kit LEGO Classic 500 peças',
    descricao: 'Set clássico com 500 peças coloridas para construções livres e criativas.',
    categoria: 'Lego',
    precoEmCentavos: 24990,
    precoAntigoEmCentavos: 29990,
    desconto: 17,
    estoque: 10,
    faixaEtaria: '4+ anos',
    imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 6,
    nome: 'Boneca Bebê Reborn',
    descricao: 'Boneca com aparência realista, acompanha roupinhas e acessórios.',
    categoria: 'Bonecas',
    precoEmCentavos: 18990,
    precoAntigoEmCentavos: 24990,
    desconto: 24,
    estoque: 7,
    faixaEtaria: '3+ anos',
    imagem: 'https://images.unsplash.com/photo-1613861614393-f2a5eb3c0f64?w=400&q=80',
  },
  {
    id: 7,
    nome: 'Carrinho de Controle Remoto',
    descricao: 'Carrinho esportivo com controle remoto 2.4GHz, alcance de até 50m.',
    categoria: 'Carrinhos',
    precoEmCentavos: 12990,
    precoAntigoEmCentavos: 15990,
    desconto: 19,
    estoque: 14,
    faixaEtaria: '6+ anos',
    imagem: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80',
  },
  {
    id: 8,
    nome: 'Bola de Futebol Infantil',
    descricao: 'Bola tamanho 3, ideal para crianças, borracha resistente e colorida.',
    categoria: 'Ar livre',
    precoEmCentavos: 4990,
    precoAntigoEmCentavos: 6990,
    desconto: 29,
    estoque: 25,
    faixaEtaria: '3+ anos',
    imagem: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&q=80',
  },
];

// Serialização para a API (mantém campos em PT e EN para compatibilidade)
function toApiProduct(p) {
  return {
    id: p.id,
    // PT
    nome: p.nome,
    descricao: p.descricao,
    categoria: p.categoria,
    precoEmCentavos: p.precoEmCentavos,
    precoAntigoEmCentavos: p.precoAntigoEmCentavos,
    desconto: p.desconto,
    estoque: p.estoque,
    faixaEtaria: p.faixaEtaria,
    imagem: p.imagem,
    // EN alias (facilita integração futura)
    name: p.nome,
    description: p.descricao,
    category: p.categoria,
    priceInCents: p.precoEmCentavos,
    oldPriceInCents: p.precoAntigoEmCentavos,
    discount: p.desconto,
    stock: p.estoque,
    ageRange: p.faixaEtaria,
    image: p.imagem,
  };
}

// ═══════════════════════════════════════════════════════════════
// CARRINHO (in-memory, por userId via header x-user-id)
// ═══════════════════════════════════════════════════════════════
const carts = {};

function buildCartResponse(userId) {
  const items = carts[userId] || [];
  const enriched = items.map((item) => {
    const product = catalog.find((p) => p.id === item.produtoId);
    const preco = product?.precoEmCentavos ?? 0;
    const subtotal = preco * item.quantidade;
    return {
      produtoId: item.produtoId,
      nome: product?.nome ?? `Produto ${item.produtoId}`,
      imagem: product?.imagem ?? '',
      precoEmCentavos: preco,
      quantidade: item.quantidade,
      subtotalEmCentavos: subtotal,
      estoque: product?.estoque ?? 0,
    };
  });

  const totalEmCentavos = enriched.reduce((acc, i) => acc + i.subtotalEmCentavos, 0);

  return { itens: enriched, totalEmCentavos };
}

// ═══════════════════════════════════════════════════════════════
// ROTAS
// ═══════════════════════════════════════════════════════════════

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      app: 'Mare Brincadeiras API',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Produtos ──────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { categoria, page = 1, limit = 20 } = req.query;
  let result = catalog.map(toApiProduct);

  if (categoria) {
    result = result.filter((p) =>
      p.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = result.slice(start, start + parseInt(limit));

  res.json({
    success: true,
    data: {
      products: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.length,
        totalPages: Math.ceil(result.length / parseInt(limit)),
      },
    },
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = catalog.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { message: 'Produto não encontrado' },
    });
  }
  res.json({ success: true, data: toApiProduct(product) });
});

// ── Carrinho ──────────────────────────────────────────────────
app.get('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  res.json({ success: true, data: buildCartResponse(userId) });
});

app.post('/api/cart/items', (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  const produtoId = Number(req.body.produtoId ?? req.body.productId);
  const quantidade = Number(req.body.quantidade ?? req.body.quantity ?? 1);

  if (!produtoId || quantidade <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'produtoId e quantidade são obrigatórios' },
    });
  }

  if (!carts[userId]) carts[userId] = [];

  const existing = carts[userId].find((i) => i.produtoId === produtoId);
  if (existing) {
    existing.quantidade += quantidade;
  } else {
    carts[userId].push({ produtoId, quantidade });
  }

  res.json({ success: true, data: buildCartResponse(userId) });
});

app.put('/api/cart/items/:productId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  const produtoId = parseInt(req.params.productId);
  const quantidade = Number(req.body.quantidade ?? req.body.quantity);

  if (!carts[userId]) carts[userId] = [];
  const item = carts[userId].find((i) => i.produtoId === produtoId);
  if (item) item.quantidade = quantidade;

  res.json({ success: true, data: buildCartResponse(userId) });
});

app.delete('/api/cart/items/:productId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  if (carts[userId]) {
    carts[userId] = carts[userId].filter(
      (i) => i.produtoId !== parseInt(req.params.productId)
    );
  }
  res.json({ success: true, data: buildCartResponse(userId) });
});

app.delete('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  carts[userId] = [];
  res.json({ success: true, data: buildCartResponse(userId) });
});

// ── Pagamento — Mercado Pago ──────────────────────────────────
app.post('/api/payments/mercadopago', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'guest';
  const cart = buildCartResponse(userId);

  if (!cart.itens.length) {
    return res.status(400).json({
      success: false,
      error: { message: 'Carrinho vazio. Adicione produtos antes de pagar.' },
    });
  }

  const accessToken =
    process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

  // ── Modo LIVE (token configurado) ──
  if (accessToken && !accessToken.startsWith('TEST-xxx')) {
    console.info('[MP] Modo live — token configurado.');
    try {
      const mpClient = new MercadoPagoConfig({ accessToken });
      const preferenceClient = new Preference(mpClient);

      const preferenceBody = {
        items: cart.itens.map((item) => ({
          id: String(item.produtoId),
          title: item.nome,
          quantity: item.quantidade,
          currency_id: 'BRL',
          unit_price: Number((item.precoEmCentavos / 100).toFixed(2)),
        })),
        external_reference: `mare_${userId}_${Date.now()}`,
        metadata: {
          userId: String(userId),
          totalEmCentavos: cart.totalEmCentavos,
        },
        // Customize seu back_url se quiser deep-link de retorno no app:
        // back_urls: { success: 'marebrincadeiras://pagamento/sucesso', failure: '...' },
      };

      const preference = await preferenceClient.create({ body: preferenceBody });
      const initPoint = preference?.init_point || preference?.sandbox_init_point;

      if (!initPoint) {
        return res.status(502).json({
          success: false,
          error: { message: 'Mercado Pago não retornou a URL de pagamento.' },
        });
      }

      return res.json({
        success: true,
        data: {
          initPoint,
          preferenceId: preference?.id,
          provider: 'mercadopago',
          mode: 'live',
          totalEmCentavos: cart.totalEmCentavos,
        },
      });
    } catch (err) {
      console.error('[MP] Erro ao criar preferência:', err);
      return res.status(502).json({
        success: false,
        error: { message: err?.message || 'Falha ao criar preferência no Mercado Pago.' },
      });
    }
  }

  // ── Modo MOCK (sem token real configurado) ──
  console.info('[MP] Modo mock — configure MERCADOPAGO_ACCESS_TOKEN no .env para ativar.');
  const mockUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mare_mock_${Date.now()}`;

  return res.json({
    success: true,
    data: {
      initPoint: mockUrl,
      provider: 'mercadopago',
      mode: 'mock',
      totalEmCentavos: cart.totalEmCentavos,
    },
  });
});

module.exports = app;
