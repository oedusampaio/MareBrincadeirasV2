// ──────────────────────────────────────────────────────────────────────────────
// CARRINHO
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { Header, EmptyState, Button } from '../../components/shared';

export function CarrinhoScreen({ navigation }) {
  const { state, dispatch, cartSubtotal } = useApp();
  const allSelected = state.cart.every((i) => i.selecionado);

  const renderItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_CART_ITEM', payload: item.productId })}>
        <Ionicons
          name={item.selecionado ? 'checkbox' : 'square-outline'}
          size={22} color={item.selecionado ? COLORS.primary : COLORS.textMuted}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.imagem }} style={styles.cartImg} />
      <View style={styles.cartDetails}>
        <Text style={styles.cartName} numberOfLines={2}>{item.nome}</Text>
        <Text style={styles.cartPrice}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => dispatch({ type: 'UPDATE_CART_QTY', payload: { productId: item.productId, delta: -1 } })}>
            <Ionicons name="remove" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyVal}>{item.quantidade}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => dispatch({ type: 'UPDATE_CART_QTY', payload: { productId: item.productId, delta: 1 } })}>
            <Ionicons name="add" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.productId })}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  if (state.cart.length === 0) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Carrinho" showBack />
        <EmptyState icon="🛒" title="Carrinho vazio" subtitle="Adicione produtos para continuar." action={{ label: 'Ver produtos', onPress: () => navigation.navigate('ProductsTab') }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Carrinho" showBack />
      <FlatList
        data={state.cart}
        keyExtractor={(i) => i.productId}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.cartSummary}>
        <View style={styles.selectAllRow}>
          <TouchableOpacity
            style={styles.selectAll}
            onPress={() => dispatch({ type: 'SELECT_ALL_CART', payload: !allSelected })}
          >
            <Ionicons name={allSelected ? 'checkbox' : 'square-outline'} size={20} color={COLORS.primary} />
            <Text style={styles.selectAllText}>Tudo</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Text style={styles.subtotalLabel}>Sub-total</Text>
          <Text style={styles.subtotalVal}>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, cartSubtotal === 0 && styles.checkoutBtnDisabled]}
          disabled={cartSubtotal === 0}
          onPress={() => navigation.navigate('Finalizar')}
        >
          <Text style={styles.checkoutBtnText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FAVORITOS
// ──────────────────────────────────────────────────────────────────────────────
import { ProductCard } from '../../components/shared';

export function FavoritosScreen({ navigation }) {
  const { state } = useApp();
  const favProducts = state.products.filter((p) => state.favorites.includes(p.id));

  if (favProducts.length === 0) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Favoritos" />
        <EmptyState icon="💛" title="Nenhum favorito ainda" subtitle="Toque no coração de um produto para salvar." action={{ label: 'Ver produtos', onPress: () => navigation.navigate('ProductsTab') }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Favoritos" />
      <FlatList
        data={favProducts}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'center' }}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => <ProductCard product={item} navigation={navigation} />}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────────────────────
import { InputField } from '../../components/shared';
import { LinearGradient } from 'expo-linear-gradient';

export function LoginScreen({ navigation }) {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { showToast('Preencha todos os campos!', 'warning'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        showToast(`Bem-vindo(a) de volta! 👋`, 'success');
        if (result.isAdmin) navigation.navigate('AdminDashboard');
        else navigation.navigate('HomeTab');
      } else {
        showToast('E-mail ou senha incorretos.', 'error');
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.secondary, '#FFD55E']} style={styles.loginHero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.loginHeroEmoji}>🌊</Text>
        <Text style={styles.loginHeroTitle}>Maré Brincadeiras</Text>
      </LinearGradient>
      <View style={styles.loginForm}>
        <Text style={styles.loginTitle}>Acesse sua conta</Text>
        <InputField label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
        <InputField label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotLink}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        <Button title="Entrar" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.adminHint}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.adminHintText}>Admin: admin@mare.com / admin123</Text>
        </View>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CADASTRO
// ──────────────────────────────────────────────────────────────────────────────
export function CadastroScreen({ navigation }) {
  const { dispatch, showToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', telephone: '', cpf: '' });
  const set = (key) => (val) => setForm({ ...form, [key]: val });

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { showToast('Preencha todos os campos obrigatórios!', 'warning'); return; }
    if (form.password !== form.confirm) { showToast('As senhas não coincidem!', 'error'); return; }
    const newCustomer = { ...form, id: Date.now().toString() };
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    showToast('Conta criada com sucesso! 🎉', 'success');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>Criar conta</Text>
      </View>
      <FlatList
        data={[{ key: 'form' }]}
        renderItem={() => (
          <View style={styles.loginForm}>
            <InputField label="Nome completo *" value={form.name} onChangeText={set('name')} placeholder="Seu nome" />
            <InputField label="E-mail *" value={form.email} onChangeText={set('email')} placeholder="seu@email.com" keyboardType="email-address" />
            <InputField label="Senha *" value={form.password} onChangeText={set('password')} placeholder="Mínimo 6 caracteres" secureTextEntry />
            <InputField label="Confirmar senha *" value={form.confirm} onChangeText={set('confirm')} placeholder="Repita a senha" secureTextEntry />
            <InputField label="Telefone" value={form.telephone} onChangeText={set('telephone')} placeholder="(11) 99999-9999" keyboardType="phone-pad" />
            <InputField label="CPF" value={form.cpf} onChangeText={set('cpf')} placeholder="000.000.000-00" keyboardType="numeric" />
            <Button title="Criar conta" onPress={handleRegister} style={{ marginTop: 8 }} />
          </View>
        )}
        keyExtractor={(i) => i.key}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PERFIL
// ──────────────────────────────────────────────────────────────────────────────
export function PerfilScreen({ navigation }) {
  const { state, dispatch, showToast } = useApp();

  if (!state.user) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Perfil" />
        <EmptyState icon="👤" title="Faça login" subtitle="Entre na sua conta para acessar seu perfil." action={{ label: 'Entrar', onPress: () => navigation.navigate('Login') }} />
      </View>
    );
  }

  const menuItems = [
    { icon: 'receipt-outline', label: 'Meus Pedidos', onPress: () => navigation.navigate('Pedidos') },
    { icon: 'heart-outline', label: 'Favoritos', onPress: () => navigation.navigate('FavoritosTab') },
    { icon: 'location-outline', label: 'Endereços', onPress: () => navigation.navigate('Enderecos') },
    { icon: 'card-outline', label: 'Cartões', onPress: () => navigation.navigate('Cartoes') },
    { icon: 'person-outline', label: 'Informações pessoais', onPress: () => navigation.navigate('PersonalInfo') },
    { icon: 'lock-closed-outline', label: 'Alterar senha', onPress: () => {} },
    ...(state.isAdmin ? [{ icon: 'settings-outline', label: 'Painel Admin', onPress: () => navigation.navigate('AdminDashboard') }] : []),
  ];

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    showToast('Até logo! 👋', 'success');
    navigation.navigate('HomeTab');
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Perfil" />
      <LinearGradient colors={[COLORS.secondary, '#FFD55E']} style={styles.profileHero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{state.user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{state.user.name}</Text>
        <Text style={styles.profileEmail}>{state.user.email}</Text>
        {state.isAdmin && (
          <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>👑 Administrador</Text></View>
        )}
      </LinearGradient>
      <FlatList
        data={menuItems}
        keyExtractor={(i) => i.label}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FINALIZAR COMPRA
// ──────────────────────────────────────────────────────────────────────────────
export function FinalizarScreen({ navigation }) {
  const { state, dispatch, showToast, cartSubtotal } = useApp();
  const [step, setStep] = useState(0); // 0 = resumo, 1 = endereço, 2 = pagamento, 3 = sucesso
  const selectedItems = state.cart.filter((i) => i.selecionado);

  const finalize = () => {
    const order = {
      id: `PED-${Date.now()}`,
      customerId: state.user?.id,
      customerName: state.user?.name,
      items: selectedItems.map((i) => ({ productId: i.productId, name: i.nome, qty: i.quantidade, price: i.preco })),
      total: cartSubtotal,
      status: 'Aguardando pagamento',
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'CLEAR_CART' });
    setStep(3);
  };

  if (step === 3) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 40 }]}>
        <Text style={{ fontSize: 80 }}>🎉</Text>
        <Text style={styles.successTitle}>Pedido realizado!</Text>
        <Text style={styles.successSub}>Seu pedido foi confirmado e está sendo processado.</Text>
        <Button title="Voltar ao início" onPress={() => navigation.navigate('HomeTab')} style={{ marginTop: 24, paddingHorizontal: 32 }} />
      </View>
    );
  }

  const steps = ['Resumo', 'Endereço', 'Pagamento'];

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>Finalizar compra</Text>
      </View>
      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {step === 0 && (
          <View>
            <Text style={styles.sectionLabel}>Itens selecionados</Text>
            {selectedItems.map((i) => (
              <View key={i.productId} style={styles.orderItem}>
                <Image source={{ uri: i.imagem }} style={styles.orderImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderName} numberOfLines={1}>{i.nome}</Text>
                  <Text style={styles.orderQty}>{i.quantidade}x R$ {i.preco.toFixed(2).replace('.', ',')}</Text>
                </View>
                <Text style={styles.orderTotal}>R$ {(i.preco * i.quantidade).toFixed(2).replace('.', ',')}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>
        )}
        {step === 1 && (
          <View>
            <Text style={styles.sectionLabel}>Endereço de entrega</Text>
            <InputField label="CEP" placeholder="00000-000" keyboardType="numeric" />
            <InputField label="Rua" placeholder="Nome da rua" />
            <InputField label="Número" placeholder="123" keyboardType="numeric" />
            <InputField label="Complemento" placeholder="Apto, bloco..." />
            <InputField label="Bairro" placeholder="Seu bairro" />
            <InputField label="Cidade" placeholder="Sua cidade" />
          </View>
        )}
        {step === 2 && (
          <View>
            <Text style={styles.sectionLabel}>Forma de pagamento</Text>
            {['Cartão de Crédito', 'Cartão de Débito', 'Pix', 'Boleto'].map((m) => (
              <TouchableOpacity key={m} style={styles.payMethod}>
                <Ionicons name={m.includes('Pix') ? 'qr-code-outline' : m.includes('Boleto') ? 'document-text-outline' : 'card-outline'} size={22} color={COLORS.primary} />
                <Text style={styles.payMethodText}>{m}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.stepFooter}>
        {step < 2 ? (
          <Button title="Continuar" onPress={() => setStep(step + 1)} />
        ) : (
          <Button title="Confirmar pedido" onPress={finalize} />
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PEDIDOS
// ──────────────────────────────────────────────────────────────────────────────
export function PedidosScreen({ navigation }) {
  const { state } = useApp();
  const myOrders = state.orders.filter((o) => !state.isAdmin && o.customerId === state.user?.id);

  const STATUS_COLOR = { 'Entregue': COLORS.success, 'Em trânsito': COLORS.primary, 'Aguardando pagamento': COLORS.warning, 'Cancelado': COLORS.error };

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>Meus Pedidos</Text>
      </View>
      {myOrders.length === 0 ? (
        <EmptyState icon="📦" title="Sem pedidos ainda" subtitle="Seus pedidos aparecerão aqui." action={{ label: 'Ver produtos', onPress: () => navigation.navigate('ProductsTab') }} />
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <Text style={styles.orderId}>{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}20` }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
              {item.items.map((i) => <Text key={i.productId} style={styles.orderItemText}>• {i.name} x{i.qty}</Text>)}
              <Text style={styles.orderTotalBold}>Total: R$ {item.total.toFixed(2).replace('.', ',')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD (stub)
// ──────────────────────────────────────────────────────────────────────────────
export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { showToast } = useApp();
  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>Recuperar senha</Text>
      </View>
      <View style={styles.loginForm}>
        <Text style={styles.forgotInfo}>Informe seu e-mail para receber as instruções de recuperação de senha.</Text>
        <InputField label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
        <Button title="Enviar instruções" onPress={() => { showToast('E-mail enviado! Verifique sua caixa de entrada.', 'success'); navigation.goBack(); }} />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  // Cart
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 12, ...SHADOWS.sm,
  },
  cartImg: { width: 70, height: 70, borderRadius: SIZES.radius.md, resizeMode: 'cover' },
  cartDetails: { flex: 1 },
  cartName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cartPrice: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  qtyVal: { fontSize: SIZES.base, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 6 },
  cartSummary: {
    padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.white, gap: 12,
  },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllText: { fontSize: SIZES.sm, color: COLORS.text, fontWeight: '600' },
  subtotalLabel: { fontSize: SIZES.sm, color: COLORS.textMuted },
  subtotalVal: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  checkoutBtnDisabled: { opacity: 0.4 },
  checkoutBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
  // Login
  loginHero: { padding: 40, alignItems: 'center', paddingTop: 50 },
  backBtn: { position: 'absolute', top: 50, left: 16, padding: 4 },
  loginHeroEmoji: { fontSize: 60 },
  loginHeroTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary, marginTop: 8 },
  loginForm: { flex: 1, padding: 24 },
  loginTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  forgotLink: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: '600', textAlign: 'right', marginBottom: 8 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: SIZES.sm, color: COLORS.textLight },
  registerLink: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '700' },
  adminHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, justifyContent: 'center' },
  adminHintText: { fontSize: SIZES.xs, color: COLORS.textMuted },
  // Form header
  formHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  formHeaderTitle: { flex: 1, textAlign: 'center', fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  // Profile
  profileHero: { padding: 24, alignItems: 'center', gap: 6 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarText: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.white },
  profileName: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  profileEmail: { fontSize: SIZES.sm, color: COLORS.textLight },
  adminBadge: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius.full, paddingHorizontal: 14, paddingVertical: 4 },
  adminBadgeText: { color: COLORS.white, fontSize: SIZES.xs, fontWeight: '700' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: SIZES.base, color: COLORS.text, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20 },
  logoutText: { color: COLORS.error, fontSize: SIZES.base, fontWeight: '700' },
  // Finalizar
  stepsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepNum: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textMuted },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: 10, color: COLORS.textMuted },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  orderImg: { width: 50, height: 50, borderRadius: SIZES.radius.md, resizeMode: 'cover' },
  orderName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },
  orderQty: { fontSize: SIZES.xs, color: COLORS.textMuted },
  orderTotal: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  totalVal: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  payMethod: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  payMethodText: { flex: 1, fontSize: SIZES.base, color: COLORS.text, fontWeight: '500' },
  stepFooter: { padding: 20, paddingBottom: 28, borderTopWidth: 1, borderTopColor: COLORS.border },
  successTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, marginTop: 16, textAlign: 'center' },
  successSub: { fontSize: SIZES.base, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
  // Orders list
  orderCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 16, ...SHADOWS.sm },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  statusBadge: { borderRadius: SIZES.radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: SIZES.xs, fontWeight: '700' },
  orderDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 8 },
  orderItemText: { fontSize: SIZES.sm, color: COLORS.textLight, marginBottom: 2 },
  orderTotalBold: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.primary, marginTop: 8 },
  // Forgot password
  forgotInfo: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 22, marginBottom: 20 },
});
