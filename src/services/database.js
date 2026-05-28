import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// expo-sqlite não suporta web — use o Expo Go no celular
const db = Platform.OS !== 'web' ? SQLite.openDatabaseSync('marebrincadeiras.db') : null;

const notWeb = () => { if (Platform.OS === 'web') throw new Error('SQLite não disponível na web. Use Expo Go no celular.'); };

// ─────────────────────────────────────────────
// Inicialização e seed de dados
// ─────────────────────────────────────────────

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        senha TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        categoria TEXT,
        preco REAL NOT NULL,
        preco_antigo REAL,
        desconto INTEGER DEFAULT 0,
        estoque INTEGER DEFAULT 0,
        faixa_etaria TEXT,
        imagem TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        cliente_nome TEXT,
        total REAL NOT NULL,
        forma_pagamento TEXT,
        status TEXT DEFAULT 'Aguardando pagamento',
        observacao TEXT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      );

      CREATE TABLE IF NOT EXISTS pedido_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        nome_produto TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
        FOREIGN KEY (produto_id) REFERENCES produtos(id)
      );

      CREATE TABLE IF NOT EXISTS enderecos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        cep TEXT,
        rua TEXT NOT NULL,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        principal INTEGER DEFAULT 0,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      );

      CREATE TABLE IF NOT EXISTS config (
        chave TEXT PRIMARY KEY,
        valor TEXT
      );
    `);

    await inserirDadosIniciais();
    console.log('✅ Banco Maré Brincadeiras inicializado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
};

const inserirDadosIniciais = async () => {
  try {
    const seeded = await db.getFirstAsync("SELECT valor FROM config WHERE chave = 'seeded_v1'");
    if (seeded) return;

    await db.runAsync('DELETE FROM pedido_itens');
    await db.runAsync('DELETE FROM pedidos');
    await db.runAsync('DELETE FROM clientes');
    await db.runAsync('DELETE FROM produtos');
    await db.runAsync('DELETE FROM config');
    await db.runAsync("DELETE FROM sqlite_sequence WHERE name IN ('clientes', 'produtos', 'pedidos', 'pedido_itens')");

    // 5 clientes
    await db.execAsync(`
      INSERT INTO clientes (nome, cpf, telefone, email, endereco, senha) VALUES
        ('Ana Clara Rodrigues', '111.222.333-44', '(11) 98888-1234', 'ana.clara@email.com', 'Rua das Flores, 100 - Vila Madalena', 'senha123'),
        ('Bruno Oliveira',      '222.333.444-55', '(11) 97777-5678', 'bruno.oliveira@email.com', 'Av. Paulista, 500 - Bela Vista', 'senha123'),
        ('Carla Mendes',        '333.444.555-66', '(21) 96666-9012', 'carla.mendes@email.com', 'Rua do Bosque, 200 - Tijuca', 'senha123'),
        ('Diego Santos',        '444.555.666-77', '(41) 95555-3456', 'diego.santos@email.com', 'Av. Brasil, 300 - Centro', 'senha123'),
        ('Elisa Ferreira',      '555.666.777-88', '(31) 94444-7890', 'elisa.ferreira@email.com', 'Rua das Acácias, 50 - Savassi', 'senha123');
    `);

    // 20 produtos
    await db.execAsync(`
      INSERT INTO produtos (nome, descricao, categoria, preco, preco_antigo, desconto, estoque, faixa_etaria, imagem) VALUES
        ('Casa da Barbie',     'Casa de atividades inspirada na metodologia Montessori com luzes, engrenagens e xilofone.', 'Barbie',         1099.90, 1099.90, 33, 8,  '5-10 anos',  'https://m.media-amazon.com/images/I/71LXW4kV6EL._AC_SL1500_.jpg'),
        
        
        ('Boneca Barbie Princesa Dreamtopia',  'CRIE CONTOS DE FADAS e se divirta com estilo com a Princesa Tranças Mágicas da Barbie Dreamtopia!', 'Barbie',        200.90,  219.90, 25, 12, '5-10 ano',   'https://m.media-amazon.com/images/I/61yKblMig8L._AC_SX679_.jpg'),
        ('Kit 2 em 1 Brinquedo Bebê Educativo',         'Estimulação Sensorial: Com 6 faces de atividades, cada uma oferece uma nova experiência sensorial, desde cores vibrantes até texturas diversas, ideal para o desenvolvimento da percepção visual e tátil.', 'Bebes',             79.90,  89.90, 33, 15, '0-1 ano',   'https://m.media-amazon.com/images/I/61lrLtjj0PL._AC_SX679_.jpg'),
        ('Caiu Perdeu', 'Pais & Filhos - Caiu Perdeu, 54 Pçs.', 'Jogos de tabuleiro', 39.90, 49.90, 25, 20, '9+ anos', 'https://m.media-amazon.com/images/I/81QAJDzi7DL._AC_SX679_.jpg'),        ('Trator Gigante',      'Trator Giant Escavator até 50kg, unidade. Marca: Roma. Característica do produto: carros e veículos, cenários e carrinhos. Número do produto: 57237.', 'Trator',               249.90, 319.90, 22, 10, '4+ anos',   'https://m.media-amazon.com/images/I/61SipK0vnoL._AC_SX679_.jpg'),
        ('Blocos de montar', 'Blocos de madeira para construção e brincadeira.', 'Montessori', 59.90, 79.90, 25, 12, '3+ anos', 'https://m.media-amazon.com/images/I/51U57UB1fWL._AC_.jpg'),   
        ('Kit jogo de pirata',         'O Pula Pirata é um jogo infantil para 2-4 jogadores, recomendado para crianças a partir de 5 anos e está dentro das normas de qualidade e segurança pelo instituto INMETRO brasileiro. O jogo é para a família toda sendo bem simples de jogar e muito divertido, pode ser jogado em qualquer lugar. ', 'Bonecas',             99.90,  149.90, 33, 15, '3+ anos',   'https://th.bing.com/th/id/OPHS.XM1OK3p2bnZD5w474C474?w=300&h=300&o=5&dpr=1.1&pid=21.1'),
        ('Carrinho Hot Wheels Pack 5',        'Pack com 5 carrinhos miniaturas die-cast em escala 1:64. Colecionáveis e resistentes.', 'Carrinhos',          59.90,  79.90,  25, 20, '3+ anos',   'https://m.media-amazon.com/images/I/71ptTy9yhtL._AC_SX679_.jpg'),
        ('Lego Classic Criativo 500pçs',      'Conjunto Lego Classic com 500 peças coloridas para construções livres e criativas.', 'Lego',               249.90, 319.90, 22, 10, '4+ anos',   'https://tse3.mm.bing.net/th/id/OIP.7Zs5G_J5GXw6qpqbbLm1ugHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
        ('Jogo de Tabuleiro Banco Imobiliário','Versão clássica do banco imobiliário com peças de alta qualidade. De 2 a 6 jogadores.', 'Jogos de tabuleiro', 129.90, 159.90, 19, 8,  '8+ anos',   'https://images.tcdn.com.br/img/img_prod/388802/jogo_de_tabuleiro_banco_imobiliario_estrela_23435_1_39e2614b30debb31cce447fc4d6aada2.jpg'),
        ('Boneca Bebê Reborn',                'Boneca bebê reborn ultra-realista com corpo de silicone macio. Acompanha acessórios.', 'Bonecas',            299.90, 399.90, 25, 5,  '3+ anos',   'https://m.media-amazon.com/images/I/71fTC6Nfj0L._AC_SL1500_.jpg'),
        ('Carrinho de Controle Remoto',       'Carrinho de corrida com controle remoto, velocidade de até 20km/h. Bateria recarregável.', 'Carrinhos',       149.90, 199.90, 25, 7,  '6+ anos',   'https://down-br.img.susercontent.com/file/br-11134207-7r98o-lwp2v24j541re3'),
        ('Kit Lego Cidade Policia',           'Kit Lego Cidade com delegacia de polícia, viatura e 3 minifiguras. 300 peças.', 'Lego',               189.90, 229.90, 17, 6,  '6+ anos',   'https://tse3.mm.bing.net/th/id/OIP.tMzgJiRGeWQqDriL8JJ_EwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
        ('Pelúcia Dinossauro Rex',            'Pelúcia de dinossauro T-Rex com 50cm, sons e movimentos ao apertar a barriga.', 'Pelúcias',           109.90, 139.90, 21, 12, '2+ anos',   'https://images.tcdn.com.br/img/img_prod/1292175/dinossauro_pelucia_t_rex_15651_1_19462ef7603f93bdbcf7f4d4e4386117.jpg'),
        ('Jogo Cara a Cara',                  'Jogo clássico Cara a Cara com 24 personagens. Desenvolve lógica e raciocínio.', 'Jogos de tabuleiro', 89.90,  109.90, 18, 14, '5+ anos',   'https://www.tabuleirocriativo.com.br/Images1/cara_a_cara-img1.jpg'),
        ('Cubo Mágico 3x3 Original',          'Cubo Mágico 3x3 oficial Rubik''s. Giro suave, adesivos de alta durabilidade.', 'Jogos',              49.90,  69.90,  29, 30, '8+ anos',   'https://http2.mlstatic.com/D_NQ_NP_999137-MLB80723521483_112024-O-cubo-magico-3x3-puzzle-preto-estrutura-giro-rapido-original.webp'),
        ('Kit Ar Livre - Badminton',          'Kit de badminton com 2 raquetes, 3 petecas e rede portátil. Para uso ao ar livre.', 'Ar livre',          99.90,  129.90, 23, 9,  '6+ anos',   'https://th.bing.com/th/id/R.27fb0a99641bed5a7cc749b4023268f1?rik=voES2EAwj8evCA&pid=ImgRaw&r=0'),
        ('Massinha de Modelar 12 cores',      'Kit com 12 cores de massinha atóxica e lavável. Acompanha 6 moldes temáticos.', 'Montessori',        39.90,  49.90,  20, 35, '3+ anos',   'https://www.lupel.com.br/wp-content/uploads/2023/07/Massinha-De-Modelar-Soft-12-Cores-180g-Acrilex-2.webp'),
        ('Pista de Corrida Hot Wheels',       'Pista looping com lançador turbo e 2 carrinhos exclusivos. 2,5m de comprimento.', 'Carrinhos',         179.90, 219.90, 18, 4,  '4+ anos',   'https://tse3.mm.bing.net/th/id/OIP.Q1WUZMhGZ8aRrA_VudLvTgHaHh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
        ('Lego Technic Caminhão',             'Lego Technic com mecanismos reais de engrenagens. Caminhão de carga 420 peças.', 'Lego',              329.90, 399.90, 17, 3,  '10+ anos',  'https://legobrasil.vtexassets.com/arquivos/ids/188216-1000-auto?v=638694317383800000&width=1000&height=auto&aspect=true'),
        ('Kit Esporte Aquático',              'Kit com boia inflável, óculos de natação e boiador de braço. Ideal para piscinas.', 'Ar livre',         69.90,  89.90,  22, 11, '3+ anos',   'https://s2-vogue.glbimg.com/qca3BQTci45imtfqtAdWUVoyDhA=/0x0:998x844/640x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_5dfbcf92c1a84b20a5da5024d398ff2f/internal_photos/bs/2023/m/S/rhoB8BTXa9f7ftRHWyoQ/kit-de-mergulho-mascara-com-respirador-e-nadadeiras-cetus-shark-fun.jpg'),
        ('Boneca Fashion com Acessórios',     'Boneca fashion articulada 30cm com 3 looks, sapatos, bolsas e penteados.', 'Bonecas',             139.90, 179.90, 22, 7,  '3+ anos',   'https://http2.mlstatic.com/D_NQ_NP_2X_936110-MLA99542544066_122025-F.webp'),
        ('Pelúcia Unicórnio Arco-Íris',       'Pelúcia de unicórnio com crina e cauda coloridas. 35cm, super macia e lavável.', 'Pelúcias',          89.90,  109.90, 18, 18, '0+ anos',   'https://images.tcdn.com.br/img/img_prod/460977/pelucia_unicornio_arco_iris_grande_branco_68cm_35885_2_20201211174351.jpg');
    `);

    // 20 pedidos
    await db.execAsync(`
      INSERT INTO pedidos (cliente_id, cliente_nome, total, forma_pagamento, status, observacao) VALUES
        (1, 'Ana Clara Rodrigues',  289.80, 'PIX',              'Entregue',              'Presente de aniversário'),
        (2, 'Bruno Oliveira',       309.80, 'Cartão de Crédito','Em trânsito',           'Parcelado em 3x'),
        (3, 'Carla Mendes',         199.90, 'Dinheiro',         'Entregue',              'Retirada na loja'),
        (4, 'Diego Santos',         499.80, 'Cartão de Débito', 'Entregue',              'Presentes filhos'),
        (5, 'Elisa Ferreira',       169.80, 'PIX',              'Cancelado',             'Cancelamento solicitado pelo cliente'),
        (1, 'Ana Clara Rodrigues',  249.90, 'Cartão de Crédito','Entregue',              'Parcelado em 2x'),
        (2, 'Bruno Oliveira',       149.80, 'PIX',              'Aguardando pagamento',  'Aguardando confirmação'),
        (3, 'Carla Mendes',         549.80, 'Cartão de Crédito','Em trânsito',           'Parcelado em 4x'),
        (4, 'Diego Santos',         299.90, 'Dinheiro',         'Entregue',              'Retirada na loja'),
        (5, 'Elisa Ferreira',       389.80, 'PIX',              'Entregue',              'Entrega expressa'),
        (1, 'Ana Clara Rodrigues',  89.90,  'Dinheiro',         'Entregue',              'Retirada na loja'),
        (2, 'Bruno Oliveira',       329.90, 'Cartão de Crédito','Enviado',               'Parcelado em 3x'),
        (3, 'Carla Mendes',         229.80, 'PIX',              'Entregue',              'Presente de natal'),
        (4, 'Diego Santos',         179.90, 'Cartão de Débito', 'Em trânsito',           'Entrega programada'),
        (5, 'Elisa Ferreira',       139.80, 'PIX',              'Entregue',              'Retirada na loja'),
        (1, 'Ana Clara Rodrigues',  579.80, 'Cartão de Crédito','Entregue',              'Parcelado em 6x'),
        (2, 'Bruno Oliveira',       109.80, 'Dinheiro',         'Aguardando pagamento',  'Aguardando pagamento PIX'),
        (3, 'Carla Mendes',         199.90, 'PIX',              'Entregue',              'Presente de dia das crianças'),
        (4, 'Diego Santos',         439.80, 'Cartão de Crédito','Enviado',               'Parcelado em 4x'),
        (5, 'Elisa Ferreira',       289.80, 'PIX',              'Entregue',              'Embalagem presente');
    `);

    // Itens dos pedidos
    await db.execAsync(`
      INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal) VALUES
        -- Pedido 1
        (1,  1, 'Casa de Atividades Montessori',    1, 199.90, 199.90),
        (1,  2, 'Conjunto de Chocalhos de Madeira', 1, 89.90,  89.90),
        -- Pedido 2
        (2,  5, 'Lego Classic Criativo 500pçs',     1, 249.90, 249.90),
        (2,  6, 'Pelúcia Urso Teddy 40cm',          1, 79.90,  59.90),
        -- Pedido 3
        (3,  1, 'Casa de Atividades Montessori',    1, 199.90, 199.90),
        -- Pedido 4
        (4,  5, 'Lego Classic Criativo 500pçs',     1, 249.90, 249.90),
        (4, 10, 'Kit Lego Cidade Policia',           1, 189.90, 189.90),
        (4,  6, 'Pelúcia Urso Teddy 40cm',          1, 79.90,  79.90),
        -- Pedido 5
        (5,  6, 'Pelúcia Urso Teddy 40cm',          1, 79.90,  79.90),
        (5,  2, 'Conjunto de Chocalhos de Madeira', 1, 89.90,  89.90),
        -- Pedido 6
        (6,  5, 'Lego Classic Criativo 500pçs',     1, 249.90, 249.90),
        -- Pedido 7
        (7,  3, 'Boneca Barbie Fashionista',        1, 99.90,  99.90),
        (7,  4, 'Carrinho Hot Wheels Pack 5',       1, 59.90,  49.90),
        -- Pedido 8
        (8, 17, 'Lego Technic Caminhão',            1, 329.90, 329.90),
        (8,  5, 'Lego Classic Criativo 500pçs',     1, 249.90, 219.90),
        -- Pedido 9
        (9,  8, 'Boneca Bebê Reborn',               1, 299.90, 299.90),
        -- Pedido 10
        (10, 9, 'Carrinho de Controle Remoto',      1, 149.90, 149.90),
        (10,11, 'Pelúcia Dinossauro Rex',            1, 109.90, 109.90),
        (10,20, 'Pelúcia Unicórnio Arco-Íris',      1, 89.90,  89.90),
        -- Pedido 11
        (11, 2, 'Conjunto de Chocalhos de Madeira', 1, 89.90,  89.90),
        -- Pedido 12
        (12,17, 'Lego Technic Caminhão',            1, 329.90, 329.90),
        -- Pedido 13
        (13, 7, 'Jogo de Tabuleiro Banco Imobiliário',1, 129.90, 129.90),
        (13,12, 'Jogo Cara a Cara',                 1, 89.90,  89.90),
        -- Pedido 14
        (14,14, 'Kit Ar Livre - Badminton',         1, 99.90,  99.90),
        (14,18, 'Kit Esporte Aquático',             1, 69.90,  69.90),
        -- Pedido 15
        (15,13, 'Cubo Mágico 3x3 Original',         1, 49.90,  49.90),
        (15,15, 'Massinha de Modelar 12 cores',     1, 39.90,  39.90),
        (15,12, 'Jogo Cara a Cara',                 1, 89.90,  49.90),
        -- Pedido 16
        (16,17, 'Lego Technic Caminhão',            1, 329.90, 329.90),
        (16, 5, 'Lego Classic Criativo 500pçs',     1, 249.90, 249.90),
        -- Pedido 17
        (17, 6, 'Pelúcia Urso Teddy 40cm',          1, 79.90,  79.90),
        (17,11, 'Pelúcia Dinossauro Rex',            1, 109.90, 29.90),
        -- Pedido 18
        (18, 1, 'Casa de Atividades Montessori',    1, 199.90, 199.90),
        -- Pedido 19
        (19, 5, 'Lego Classic Criativo 500pçs',     1, 249.90, 249.90),
        (19,10, 'Kit Lego Cidade Policia',           1, 189.90, 189.90),
        -- Pedido 20
        (20, 1, 'Casa de Atividades Montessori',    1, 199.90, 199.90),
        (20, 2, 'Conjunto de Chocalhos de Madeira', 1, 89.90,  89.90);
    `);

    await db.runAsync("INSERT INTO config (chave, valor) VALUES ('seeded_v1', '1')");
    console.log('✅ Dados iniciais inseridos');
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
  }
};

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────

export const getAllClientes = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM clientes ORDER BY nome ASC');
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

export const getClienteById = async (id) => {
  try {
    return await db.getFirstAsync('SELECT * FROM clientes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
};

export const getClienteByEmail = async (email) => {
  try {
    return await db.getFirstAsync('SELECT * FROM clientes WHERE email = ?', [email]);
  } catch (error) {
    console.error('Erro ao buscar cliente por email:', error);
    throw error;
  }
};

export const createCliente = async (nome, cpf, telefone, email, endereco, senha) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO clientes (nome, cpf, telefone, email, endereco, senha) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf || null, telefone || null, email || null, endereco || null, senha || null]
    );
    return { id: result.lastInsertRowId, nome, cpf, telefone, email, endereco };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

export const updateCliente = async (id, nome, cpf, telefone, email, endereco) => {
  try {
    const result = await db.runAsync(
      'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ? WHERE id = ?',
      [nome, cpf || null, telefone || null, email || null, endereco || null, id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id) => {
  try {
    const result = await db.runAsync('DELETE FROM clientes WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// PRODUTOS
// ─────────────────────────────────────────────

export const getAllProdutos = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM produtos ORDER BY nome ASC');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProdutoById = async (id) => {
  try {
    return await db.getFirstAsync('SELECT * FROM produtos WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

export const createProduto = async (nome, descricao, categoria, preco, preco_antigo, desconto, estoque, faixa_etaria, imagem) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO produtos (nome, descricao, categoria, preco, preco_antigo, desconto, estoque, faixa_etaria, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, descricao || null, categoria || null, preco, preco_antigo || null, desconto || 0, estoque || 0, faixa_etaria || null, imagem || null]
    );
    return { id: result.lastInsertRowId, nome, descricao, categoria, preco, preco_antigo, desconto, estoque, faixa_etaria, imagem };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

export const updateProduto = async (id, nome, descricao, categoria, preco, preco_antigo, desconto, estoque, faixa_etaria, imagem) => {
  try {
    const result = await db.runAsync(
      'UPDATE produtos SET nome = ?, descricao = ?, categoria = ?, preco = ?, preco_antigo = ?, desconto = ?, estoque = ?, faixa_etaria = ?, imagem = ? WHERE id = ?',
      [nome, descricao || null, categoria || null, preco, preco_antigo || null, desconto || 0, estoque || 0, faixa_etaria || null, imagem || null, id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduto = async (id) => {
  try {
    const result = await db.runAsync('DELETE FROM produtos WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// PEDIDOS
// ─────────────────────────────────────────────

export const getAllPedidos = async () => {
  try {
    return await db.getAllAsync(`
      SELECT p.*, c.nome AS cliente_nome_db,
             (SELECT COUNT(*) FROM pedido_itens pi WHERE pi.pedido_id = p.id) AS total_itens
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      ORDER BY p.data DESC
    `);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const getPedidosByCliente = async (clienteId) => {
  try {
    return await db.getAllAsync(`
      SELECT p.*,
             (SELECT COUNT(*) FROM pedido_itens pi WHERE pi.pedido_id = p.id) AS total_itens
      FROM pedidos p
      WHERE p.cliente_id = ?
      ORDER BY p.data DESC
    `, [clienteId]);
  } catch (error) {
    console.error('Erro ao buscar pedidos do cliente:', error);
    throw error;
  }
};

export const getPedidoById = async (id) => {
  try {
    const pedido = await db.getFirstAsync(`
      SELECT p.*, c.nome AS cliente_nome_db, c.cpf AS cliente_cpf, c.telefone AS cliente_telefone
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = ?
    `, [id]);

    if (!pedido) return null;

    const itens = await db.getAllAsync(`
      SELECT pi.*, prod.categoria
      FROM pedido_itens pi
      JOIN produtos prod ON prod.id = pi.produto_id
      WHERE pi.pedido_id = ?
    `, [id]);

    return { ...pedido, itens };
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

export const createPedido = async (clienteId, clienteNome, total, formaPagamento, itens, observacao) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO pedidos (cliente_id, cliente_nome, total, forma_pagamento, observacao) VALUES (?, ?, ?, ?, ?)',
      [clienteId || null, clienteNome || 'Cliente Anônimo', total, formaPagamento || null, observacao || null]
    );
    const pedidoId = result.lastInsertRowId;

    for (const item of itens) {
      await db.runAsync(
        'INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [pedidoId, item.produto_id, item.nome_produto, item.quantidade, item.preco_unitario, item.subtotal]
      );
    }
    return pedidoId;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const updatePedidoStatus = async (id, status) => {
  try {
    const result = await db.runAsync('UPDATE pedidos SET status = ? WHERE id = ?', [status, id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// ENDEREÇOS
// ─────────────────────────────────────────────

export const getEnderecosByCliente = async (clienteId) => {
  try {
    return await db.getAllAsync('SELECT * FROM enderecos WHERE cliente_id = ? ORDER BY principal DESC, id ASC', [clienteId]);
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    throw error;
  }
};

export const createEndereco = async (clienteId, cep, rua, numero, complemento, bairro, cidade, estado) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO enderecos (cliente_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [clienteId, cep || null, rua, numero || null, complemento || null, bairro || null, cidade || null, estado || null]
    );
    return { id: result.lastInsertRowId, clienteId, cep, rua, numero, complemento, bairro, cidade, estado, principal: 0 };
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    throw error;
  }
};

export const updateEndereco = async (id, cep, rua, numero, complemento, bairro, cidade, estado) => {
  try {
    const result = await db.runAsync(
      'UPDATE enderecos SET cep = ?, rua = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ? WHERE id = ?',
      [cep || null, rua, numero || null, complemento || null, bairro || null, cidade || null, estado || null, id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    throw error;
  }
};

export const deleteEndereco = async (id) => {
  try {
    const result = await db.runAsync('DELETE FROM enderecos WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    throw error;
  }
};

export const setEnderecoPrincipal = async (id, clienteId) => {
  try {
    await db.runAsync('UPDATE enderecos SET principal = 0 WHERE cliente_id = ?', [clienteId]);
    await db.runAsync('UPDATE enderecos SET principal = 1 WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao definir endereço principal:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// PEDIDOS COM ITENS (por cliente)
// ─────────────────────────────────────────────

export const getPedidosComItensByCliente = async (clienteId) => {
  try {
    const pedidos = await db.getAllAsync(
      'SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY data DESC',
      [clienteId]
    );
    return await Promise.all(
      pedidos.map(async (p) => {
        const itens = await db.getAllAsync(
          'SELECT * FROM pedido_itens WHERE pedido_id = ?',
          [p.id]
        );
        return { ...p, itens };
      })
    );
  } catch (error) {
    console.error('Erro ao buscar pedidos com itens:', error);
    throw error;
  }
};

export default db;
