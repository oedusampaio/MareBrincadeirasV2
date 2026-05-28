# 🧸 Mare Brincadeiras — Backend

API Express dedicada para o app Expo **MareBrincadeiras**.  
Roda separado do app, na sua máquina ou em um serviço cloud.

---

## 📁 Estrutura

```
backend/
├── src/
│   ├── app.js        ← Rotas e lógica da API
│   └── server.js     ← Inicialização do servidor HTTP
├── .env.example      ← Variáveis de ambiente (copie para .env)
├── .gitignore
└── package.json
```

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e cole seu **Mercado Pago Access Token**:

```env
PORT=3000
NODE_ENV=development
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> Use o token de **TEST** durante desenvolvimento.  
> Troque pelo token de **produção** somente quando for ao ar.

### 3. Iniciar o servidor

```bash
# Desenvolvimento (reinicia ao salvar)
npm run dev

# Produção
npm start
```

O terminal vai exibir:
```
🧸  Mare Brincadeiras — API Backend
  Porta   : 3000
  Health  : http://localhost:3000/health
```

---

## 📱 Conectar com o Expo

O arquivo de integração já está em:
```
src/services/api.js
```

### Qual URL usar no app?

| Situação | URL |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Emulador iOS / Web | `http://localhost:3000` |
| **Celular físico (Expo Go)** | `http://SEU_IP_LOCAL:3000` |

Para descobrir seu IP local:
- **Mac**: `ifconfig | grep "inet "` → procure algo como `192.168.x.x`
- **Windows**: `ipconfig` → IPv4

Edite a constante `LOCAL_HOST` em `src/services/api.js` conforme necessário.

---

## 🔌 Endpoints disponíveis

### Health
```
GET /health
```

### Produtos
```
GET  /api/products              → lista todos (suporta ?categoria=Lego&page=1)
GET  /api/products/:id          → detalhe de um produto
```

### Carrinho (identificado por header x-user-id)
```
GET    /api/cart                → ver carrinho
POST   /api/cart/items          → adicionar item  { produtoId, quantidade }
PUT    /api/cart/items/:id      → atualizar qtd   { quantidade }
DELETE /api/cart/items/:id      → remover item
DELETE /api/cart                → limpar carrinho
```

### Pagamento
```
POST /api/payments/mercadopago  → cria preferência MP e retorna initPoint
```

---

## 🗺️ Estratégia de dados (o que vai pro backend vs fica local)

| Dado | Onde fica |
|---|---|
| Produtos & catálogo | **Backend** (esta API) |
| Carrinho de compras | **Backend** (por sessão) |
| Pagamento MercadoPago | **Backend** |
| Favoritos | **SQLite local** (expo-sqlite) |
| Perfil do usuário | **SQLite local** (expo-sqlite) |
| Endereços | **SQLite local** (expo-sqlite) |
| Pedidos (histórico) | **SQLite local** (expo-sqlite) |

---

## 🛠️ Próximos passos sugeridos

1. **Adicionar autenticação JWT** para proteger as rotas do carrinho
2. **Persistir carrinho em banco** (SQLite no servidor ou PostgreSQL) para não perder dados ao reiniciar
3. **Webhook do MercadoPago** para atualizar status de pedidos automaticamente
4. **Deploy no Railway ou Render** para acessar de qualquer rede

---

## 📦 Dependências

| Pacote | Uso |
|---|---|
| `express` | Servidor HTTP |
| `cors` | Permitir chamadas do app |
| `dotenv` | Variáveis de ambiente |
| `morgan` | Logs de requisições |
| `mercadopago` | SDK oficial do MercadoPago |
| `nodemon` | Auto-reload em desenvolvimento |
