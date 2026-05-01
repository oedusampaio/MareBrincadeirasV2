# 🌊 Maré Brincadeiras — React Native App

E-commerce de brinquedos convertido de Angular para **React Native + Expo**, com suporte mobile-first (390×844).

---r

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go no celular (iOS ou Android)

### Instalação

```bash
npm install
npx expo start
```

Escaneie o QR Code com o aplicativo **Expo Go** no celular.

---

## 📁 Estrutura do projeto

```
src/
├── context/
│   └── AppContext.js        # Estado global (carrinho, auth, produtos, clientes, pedidos)
├── data/
│   └── mockData.js          # Dados mock (produtos, categorias, clientes, pedidos)
├── navigation/
│   └── AppNavigator.js      # Stack + Bottom Tabs (React Navigation)
├── components/
│   └── shared.js            # Header, ProductCard, Toast, Button, InputField, etc.
├── screens/
│   ├── client/
│   │   ├── HomeScreen.js          # Tela inicial com hero, destaques, promoção, carrossel
│   │   ├── ProductsScreen.js      # Listagem com filtros avançados, busca, ordenação
│   │   ├── ProductDetailScreen.js # Detalhes do produto, galeria, avaliações
│   │   └── ClientScreens.js       # Carrinho, Favoritos, Login, Cadastro, Perfil,
│   │                               # Finalizar, Pedidos, ForgotPassword
│   └── admin/
│       └── AdminScreens.js        # Dashboard, Produtos, Clientes, Pedidos,
│                                   # Categorias, Avaliações, Relatório
└── utils/
    └── theme.js             # Cores, fontes, tamanhos, sombras
```

---

## 🎨 Paleta de cores

| Nome | Hex | Uso |
|------|-----|-----|
| Primary (Azul) | `#3A86FF` | Botões, links, ícones ativos |
| Secondary (Amarelo) | `#FFBE0B` | Header, hero, badges |
| Hover | `#21447e` | Estado hover/pressed |
| Discount | `#FFAD33` | Preços com desconto |

---

## 📱 Telas implementadas

### Cliente
- **Home** — Hero, benefícios, destaques, promoção c/ countdown, carrossel, depoimentos, newsletter, footer
- **Produtos** — Grid 2 colunas, busca, filtros (categoria, faixa etária, preço máximo), ordenação
- **Detalhe do Produto** — Galeria, avaliações, seletor de quantidade, botão de carrinho
- **Carrinho** — Seleção de itens, controle de quantidade, subtotal, checkout
- **Favoritos** — Grid de produtos favoritados
- **Login** — Email/senha, credenciais admin hardcoded
- **Cadastro** — Formulário completo
- **Perfil** — Menu de ações, logout, link ao admin
- **Finalizar Compra** — Stepper 3 etapas (resumo, endereço, pagamento)
- **Meus Pedidos** — Histórico do usuário
- **Recuperar Senha** — Formulário de email

### Admin *(acesso: admin@mare.com / admin123)*
- **Dashboard** — Cards de estatísticas, menu rápido
- **Produtos** — CRUD completo com modal
- **Clientes** — Listagem + edição
- **Pedidos** — Listagem + atualização de status
- **Categorias** — Adicionar/remover categorias
- **Avaliações** — Moderação e remoção
- **Relatório de Vendas** — Métricas e últimos pedidos

---

## 🔐 Credenciais de teste

- **Admin:** `admin@mare.com` / `admin123`
- **Cliente 1:** `ana@email.com` / `123456`
- **Cliente 2:** `carlos@email.com` / `123456`

---

## 📦 Dependências principais

| Pacote | Uso |
|--------|-----|
| `@react-navigation/native` | Navegação base |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Bottom tab bar |
| `expo-linear-gradient` | Gradientes |
| `@expo/vector-icons` | Ícones Ionicons |
| `@react-native-async-storage/async-storage` | Persistência de carrinho/favoritos |
| `react-native-safe-area-context` | Safe areas iOS/Android |

---

## 🔌 Integrar com backend real

Para conectar à sua API, substitua as funções no `AppContext.js`:

```js
// Exemplo: carregar produtos de uma API
const loadProducts = async () => {
  const res = await fetch('https://sua-api.com/products');
  const data = await res.json();
  dispatch({ type: 'SET_PRODUCTS', payload: data });
};
```

---

## 📐 Responsividade

O app foi desenvolvido mobile-first com foco em telas 390×844 (iPhone 14/15) mas funciona em qualquer tamanho via StyleSheet responsivo. Não há breakpoints — usa `Dimensions.get('window')` onde necessário.
=======
# MareBrincadeirasV2