// ──────────────────────────────────────────────────────────────────────────────
// CARRINHO, FAVORITOS E PERFIL
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ScrollView,
  TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { Header, EmptyState, Button, Footer } from '../../components/shared';

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
  const { showToast, dbCreateCliente } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', telephone: '', cpf: '' });
  const set = (key) => (val) => setForm({ ...form, [key]: val });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { showToast('Preencha todos os campos obrigatórios!', 'warning'); return; }
    if (form.password !== form.confirm) { showToast('As senhas não coincidem!', 'error'); return; }
    try {
      await dbCreateCliente(form.name, form.cpf, form.telephone, form.email, '', form.password);
      showToast('Conta criada com sucesso! 🎉', 'success');
      navigation.navigate('Login');
    } catch (e) {
      showToast('Erro ao criar conta. E-mail já cadastrado?', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
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
// HELPERS DE FORMATAÇÃO
// ──────────────────────────────────────────────────────────────────────────────
function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
}

function formatCVV(value) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function maskCardNumber(number) {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length < 4) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${cleaned.slice(-4)}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// FINALIZAR COMPRA — FLUXO COMPLETO COM PAGAMENTO MERCADO PAGO
// ──────────────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'credit',
    label: 'Cartão de Crédito',
    icon: 'card',
    color: '#3A86FF',
    desc: 'Parcele em até 12x',
    badge: null,
  },
  {
    id: 'debit',
    label: 'Cartão de Débito',
    icon: 'card-outline',
    color: '#43A047',
    desc: 'Débito à vista',
    badge: null,
  },
  {
    id: 'pix',
    label: 'Pix',
    icon: 'qr-code',
    color: '#32BCAD',
    desc: 'Aprovação instantânea',
    badge: '5% OFF',
  },
  {
    id: 'boleto',
    label: 'Boleto Bancário',
    icon: 'document-text',
    color: '#FF9800',
    desc: 'Vence em 3 dias úteis',
    badge: null,
  },
];

const INSTALLMENTS = [1, 2, 3, 4, 6, 12];

export function FinalizarScreen({ navigation }) {
  const { state, dispatch, showToast, cartSubtotal, dbCreatePedido } = useApp();
  const [step, setStep] = useState(0); // 0 = resumo, 1 = endereço, 2 = pagamento, 3 = sucesso

  // Endereço
  const [address, setAddress] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '' });

  // Pagamento
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [installments, setInstallments] = useState(1);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pixCode] = useState('00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540' + cartSubtotal.toFixed(2) + '5802BR5920Mare Brincadeiras6009Sao Paulo62070503***6304');
  const [boletoCode] = useState('34191.09008 00010.053013 00009.820008 6 00010000' + Math.floor(cartSubtotal * 100));

  const selectedItems = state.cart.filter((i) => i.selecionado);

  // Desconto Pix
  const pixDiscount = selectedMethod === 'pix' ? cartSubtotal * 0.05 : 0;
  const finalTotal = cartSubtotal - pixDiscount;

  const setAddr = (key) => (val) => setAddress({ ...address, [key]: val });

  const validateAddress = () => {
    if (!address.cep || !address.rua || !address.numero || !address.bairro || !address.cidade) {
      showToast('Preencha todos os campos obrigatórios!', 'warning');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!selectedMethod) {
      showToast('Selecione uma forma de pagamento!', 'warning');
      return false;
    }
    if (selectedMethod === 'credit' || selectedMethod === 'debit') {
      const cleaned = cardData.number.replace(/\s/g, '');
      if (cleaned.length < 16) { showToast('Número do cartão inválido!', 'error'); return false; }
      if (!cardData.name.trim()) { showToast('Informe o nome do titular!', 'error'); return false; }
      if (cardData.expiry.length < 5) { showToast('Validade inválida!', 'error'); return false; }
      if (cardData.cvv.length < 3) { showToast('CVV inválido!', 'error'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateAddress()) return;
    if (step === 2) {
      if (!validatePayment()) return;
      finalize();
      return;
    }
    setStep(step + 1);
  };

  const finalize = async () => {
    setProcessing(true);
    try {
      const methodLabel = PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label || '';
      const itens = selectedItems.map((i) => ({
        produto_id: i.productId,
        nome_produto: i.nome || i.name || 'Produto',
        quantidade: i.quantidade,
        preco_unitario: i.preco || i.value || 0,
        subtotal: (i.preco || i.value || 0) * i.quantidade,
      }));
      await dbCreatePedido(
        state.user?.id || null,
        state.user?.nome || state.user?.name || 'Cliente Anônimo',
        finalTotal,
        methodLabel,
        itens,
        selectedMethod === 'boleto' ? 'Aguardando pagamento' : null,
      );
      dispatch({ type: 'CLEAR_CART' });
      setStep(3);
    } catch (e) {
      showToast('Erro ao finalizar pedido.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ── Tela de Sucesso ──
  if (step === 3) {
    const isPix = selectedMethod === 'pix';
    const isBoleto = selectedMethod === 'boleto';
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', padding: 32, paddingTop: 60 }}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 52 }}>{isBoleto ? '📄' : '🎉'}</Text>
        </View>
        <Text style={styles.successTitle}>{isBoleto ? 'Pedido aguardando pagamento!' : 'Pedido confirmado!'}</Text>
        <Text style={styles.successSub}>
          {isBoleto
            ? 'Pague o boleto para confirmar seu pedido. Vence em 3 dias úteis.'
            : isPix
            ? 'Pagamento via Pix confirmado com sucesso!'
            : 'Seu pedido foi confirmado e está sendo processado.'}
        </Text>

        {/* Pix QR Code simulado */}
        {isPix && (
          <View style={styles.pixSuccess}>
            <View style={styles.qrCodeBox}>
              <View style={styles.qrInner}>
                <Text style={{ fontSize: 10, color: COLORS.textMuted, textAlign: 'center' }}>QR Code Pix</Text>
                {/* Grade simulando QR */}
                <View style={styles.qrGrid}>
                  {Array.from({ length: 64 }).map((_, i) => (
                    <View key={i} style={[styles.qrCell, { backgroundColor: Math.random() > 0.5 ? '#000' : 'transparent' }]} />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.pixCodeLabel}>Pix copia e cola:</Text>
            <View style={styles.pixCodeBox}>
              <Text style={styles.pixCodeText} numberOfLines={2}>{pixCode.slice(0, 60)}...</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => showToast('Código Pix copiado!', 'success')}>
                <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Boleto */}
        {isBoleto && (
          <View style={styles.boletoSuccess}>
            <Ionicons name="barcode-outline" size={60} color={COLORS.text} />
            <Text style={styles.pixCodeLabel}>Código do boleto:</Text>
            <View style={styles.pixCodeBox}>
              <Text style={styles.pixCodeText} numberOfLines={2}>{boletoCode}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => showToast('Código de barras copiado!', 'success')}>
                <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => showToast('Boleto gerado!', 'success')}>
              <Ionicons name="download-outline" size={18} color={COLORS.white} />
              <Text style={styles.downloadBtnText}>Baixar boleto</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.successSummary}>
          <Text style={styles.successSummaryTitle}>Resumo do pedido</Text>
          <View style={styles.successRow}>
            <Text style={styles.successRowLabel}>Total</Text>
            <Text style={styles.successRowVal}>R$ {finalTotal.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successRowLabel}>Forma de pagamento</Text>
            <Text style={styles.successRowVal}>{PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}</Text>
          </View>
        </View>

        <Button title="Voltar ao início" onPress={() => navigation.navigate('HomeTab')} style={{ marginTop: 24, paddingHorizontal: 32 }} />
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('Pedidos')}>
          <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: SIZES.sm }}>Ver meus pedidos</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const steps = ['Resumo', 'Endereço', 'Pagamento'];

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtnHeader}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>Finalizar compra</Text>
      </View>

      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                {i < step
                  ? <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  : <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

        {/* ── STEP 0: RESUMO ── */}
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
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoBoxText}>Pague com Pix e ganhe 5% de desconto!</Text>
            </View>
          </View>
        )}

        {/* ── STEP 1: ENDEREÇO ── */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionLabel}>Endereço de entrega</Text>
            <PayInput label="CEP *" value={address.cep} onChangeText={setAddr('cep')} placeholder="00000-000" keyboardType="numeric" maxLength={9} />
            <PayInput label="Rua *" value={address.rua} onChangeText={setAddr('rua')} placeholder="Nome da rua" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <PayInput label="Número *" value={address.numero} onChangeText={setAddr('numero')} placeholder="123" keyboardType="numeric" />
              </View>
              <View style={{ flex: 2 }}>
                <PayInput label="Complemento" value={address.complemento} onChangeText={setAddr('complemento')} placeholder="Apto, bloco..." />
              </View>
            </View>
            <PayInput label="Bairro *" value={address.bairro} onChangeText={setAddr('bairro')} placeholder="Seu bairro" />
            <PayInput label="Cidade *" value={address.cidade} onChangeText={setAddr('cidade')} placeholder="Sua cidade" />
          </View>
        )}

        {/* ── STEP 2: PAGAMENTO ── */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionLabel}>Forma de pagamento</Text>

            {/* Seleção de método */}
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.payMethodCard, selectedMethod === m.id && styles.payMethodCardActive]}
                onPress={() => { setSelectedMethod(m.id); setCardFlipped(false); }}
              >
                <View style={[styles.payMethodIcon, { backgroundColor: `${m.color}18` }]}>
                  <Ionicons name={m.icon} size={24} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payMethodLabel, selectedMethod === m.id && { color: COLORS.primary }]}>{m.label}</Text>
                  <Text style={styles.payMethodDesc}>{m.desc}</Text>
                </View>
                {m.badge && (
                  <View style={styles.payBadge}>
                    <Text style={styles.payBadgeText}>{m.badge}</Text>
                  </View>
                )}
                <View style={[styles.payRadio, selectedMethod === m.id && styles.payRadioActive]}>
                  {selectedMethod === m.id && <View style={styles.payRadioDot} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Formulário Cartão */}
            {(selectedMethod === 'credit' || selectedMethod === 'debit') && (
              <View style={styles.cardForm}>
                {/* Preview do cartão */}
                <TouchableOpacity onPress={() => setCardFlipped(!cardFlipped)} activeOpacity={0.9}>
                  <LinearGradient
                    colors={selectedMethod === 'credit' ? ['#3A86FF', '#1a5fcc'] : ['#43A047', '#2e7d32']}
                    style={styles.cardPreview}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    {!cardFlipped ? (
                      <>
                        <View style={styles.cardPreviewTop}>
                          <Text style={styles.cardPreviewType}>{selectedMethod === 'credit' ? 'CRÉDITO' : 'DÉBITO'}</Text>
                          <Ionicons name="card" size={28} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.cardPreviewNumber}>{maskCardNumber(cardData.number)}</Text>
                        <View style={styles.cardPreviewBottom}>
                          <View>
                            <Text style={styles.cardPreviewMiniLabel}>TITULAR</Text>
                            <Text style={styles.cardPreviewName}>{cardData.name.toUpperCase() || 'SEU NOME'}</Text>
                          </View>
                          <View>
                            <Text style={styles.cardPreviewMiniLabel}>VALIDADE</Text>
                            <Text style={styles.cardPreviewName}>{cardData.expiry || 'MM/AA'}</Text>
                          </View>
                        </View>
                      </>
                    ) : (
                      <View style={styles.cardBack}>
                        <View style={styles.cardStripe} />
                        <View style={styles.cvvRow}>
                          <View style={styles.cvvStripe} />
                          <View style={styles.cvvBox}>
                            <Text style={styles.cvvVal}>{cardData.cvv || '•••'}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardBackLabel}>Toque para virar</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.cardFlipHint}>Toque no cartão para ver o CVV</Text>

                <PayInput
                  label="Número do cartão"
                  value={cardData.number}
                  onChangeText={(v) => setCardData({ ...cardData, number: formatCardNumber(v) })}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="numeric"
                  maxLength={19}
                />
                <PayInput
                  label="Nome do titular"
                  value={cardData.name}
                  onChangeText={(v) => setCardData({ ...cardData, name: v })}
                  placeholder="Como está no cartão"
                  autoCapitalize="characters"
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <PayInput
                      label="Validade"
                      value={cardData.expiry}
                      onChangeText={(v) => setCardData({ ...cardData, expiry: formatExpiry(v) })}
                      placeholder="MM/AA"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PayInput
                      label="CVV"
                      value={cardData.cvv}
                      onChangeText={(v) => { setCardData({ ...cardData, cvv: formatCVV(v) }); setCardFlipped(true); }}
                      placeholder="•••"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Parcelas (só crédito) */}
                {selectedMethod === 'credit' && (
                  <View style={styles.installmentsSection}>
                    <Text style={styles.payInputLabel}>Parcelas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {INSTALLMENTS.map((n) => {
                        const parcelVal = (finalTotal / n).toFixed(2).replace('.', ',');
                        return (
                          <TouchableOpacity
                            key={n}
                            style={[styles.installmentChip, installments === n && styles.installmentChipActive]}
                            onPress={() => setInstallments(n)}
                          >
                            <Text style={[styles.installmentChipText, installments === n && styles.installmentChipTextActive]}>
                              {n}x R${parcelVal}
                            </Text>
                            {n === 1 && <Text style={[styles.installmentChipSub, installments === n && { color: COLORS.white }]}>sem juros</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Pix */}
            {selectedMethod === 'pix' && (
              <View style={styles.pixInfo}>
                <View style={styles.pixQrPreview}>
                  <View style={styles.qrGrid}>
                    {Array.from({ length: 64 }).map((_, i) => (
                      <View key={i} style={[styles.qrCell, { backgroundColor: Math.random() > 0.5 ? '#32BCAD' : '#e8faf9' }]} />
                    ))}
                  </View>
                </View>
                <Text style={styles.pixInfoTitle}>Pague com Pix</Text>
                <Text style={styles.pixInfoDesc}>O QR Code e o código Pix serão gerados após confirmar o pedido. O pagamento é aprovado em segundos.</Text>
                <View style={styles.pixDiscountBadge}>
                  <Ionicons name="pricetag" size={14} color={COLORS.success} />
                  <Text style={styles.pixDiscountText}>Desconto de 5% aplicado: -R$ {pixDiscount.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            )}

            {/* Boleto */}
            {selectedMethod === 'boleto' && (
              <View style={styles.boletoInfo}>
                <Ionicons name="barcode-outline" size={48} color={COLORS.warning} />
                <Text style={styles.boletoTitle}>Boleto Bancário</Text>
                <Text style={styles.boletoDesc}>O boleto será gerado após confirmar o pedido. Vencimento em 3 dias úteis. Após o pagamento, a compensação pode levar até 2 dias úteis.</Text>
                <View style={styles.boletoWarning}>
                  <Ionicons name="alert-circle-outline" size={14} color={COLORS.warning} />
                  <Text style={styles.boletoWarningText}>O pedido só será processado após confirmação do pagamento.</Text>
                </View>
              </View>
            )}

            {/* Resumo de valores */}
            {selectedMethod && (
              <View style={styles.paymentSummary}>
                <Text style={styles.sectionLabel}>Resumo</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryVal}>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</Text>
                </View>
                {pixDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Desconto Pix (5%)</Text>
                    <Text style={[styles.summaryVal, { color: COLORS.success }]}>-R$ {pixDiscount.toFixed(2).replace('.', ',')}</Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalVal}>R$ {finalTotal.toFixed(2).replace('.', ',')}</Text>
                </View>
                {selectedMethod === 'credit' && installments > 1 && (
                  <Text style={styles.installmentInfo}>
                    {installments}x de R$ {(finalTotal / installments).toFixed(2).replace('.', ',')} sem juros
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.stepFooter}>
        {step < 2 ? (
          <Button title="Continuar" onPress={handleNext} />
        ) : (
          <TouchableOpacity
            style={[styles.confirmBtn, (!selectedMethod || processing) && styles.confirmBtnDisabled]}
            onPress={handleNext}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={16} color={COLORS.white} />
                <Text style={styles.confirmBtnText}>Confirmar pagamento</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.secureText}>Pagamento seguro via Mercado Pago</Text>
        </View>
      </View>

      {/* Modal de processamento */}
      <Modal transparent visible={processing} animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>Processando pagamento...</Text>
            <Text style={styles.processingSubText}>Aguarde um momento</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Componente de input de pagamento ──
function PayInput({ label, value, onChangeText, placeholder, keyboardType, maxLength, secureTextEntry, autoCapitalize }) {
  return (
    <View style={styles.payInputWrap}>
      <Text style={styles.payInputLabel}>{label}</Text>
      <TextInput
        style={styles.payInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize || 'none'}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PEDIDOS
// ──────────────────────────────────────────────────────────────────────────────
export function PedidosScreen({ navigation }) {
  const { state } = useApp();
  const myOrders = state.orders.filter((o) => !state.isAdmin && o.customerId === state.user?.id);

  const STATUS_COLOR = { 'Entregue': COLORS.success, 'Em trânsito': COLORS.primary, 'Pagamento confirmado': COLORS.success, 'Aguardando pagamento': COLORS.warning, 'Cancelado': COLORS.error };

  return (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
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
              {item.paymentMethod && (
                <Text style={styles.orderPayMethod}>
                  <Ionicons name="card-outline" size={12} /> {item.paymentMethod}
                </Text>
              )}
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
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
  backBtnHeader: { padding: 4, marginRight: 4 },
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
  formHeaderTitle: { flex: 1, textAlign: 'center', fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginRight: 40 },

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
  stepsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: 'center', gap: 4 },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 16, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.primary },
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

  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${COLORS.primary}10`, borderRadius: SIZES.radius.md,
    padding: 12, marginTop: 16,
  },
  infoBoxText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600', flex: 1 },

  // Payment method cards
  payMethodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius.lg,
    padding: 14, marginBottom: 10, backgroundColor: COLORS.white,
  },
  payMethodCardActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}06` },
  payMethodIcon: { width: 44, height: 44, borderRadius: SIZES.radius.md, alignItems: 'center', justifyContent: 'center' },
  payMethodLabel: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.text },
  payMethodDesc: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  payBadge: { backgroundColor: `${COLORS.success}18`, borderRadius: SIZES.radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  payBadgeText: { fontSize: SIZES.xs, color: COLORS.success, fontWeight: '700' },
  payRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  payRadioActive: { borderColor: COLORS.primary },
  payRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Card form
  cardForm: { marginTop: 16 },
  cardPreview: {
    borderRadius: SIZES.radius.xl, padding: 22, marginBottom: 8,
    minHeight: 180, justifyContent: 'space-between',
  },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPreviewType: { color: 'rgba(255,255,255,0.8)', fontSize: SIZES.xs, fontWeight: '700', letterSpacing: 2 },
  cardPreviewNumber: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700', letterSpacing: 3, textAlign: 'center', marginVertical: 16 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewMiniLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  cardPreviewName: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '600', marginTop: 2 },
  cardBack: { flex: 1, justifyContent: 'center' },
  cardStripe: { height: 40, backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: -22, marginTop: -10 },
  cvvRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  cvvStripe: { flex: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  cvvBox: { width: 60, height: 36, backgroundColor: COLORS.white, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cvvVal: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, letterSpacing: 3 },
  cardBackLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, textAlign: 'center', marginTop: 12 },
  cardFlipHint: { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },

  // Pay input
  payInputWrap: { marginBottom: 14 },
  payInputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  payInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.base,
    color: COLORS.text, backgroundColor: COLORS.white,
  },

  // Installments
  installmentsSection: { marginTop: 4, marginBottom: 8 },
  installmentChip: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius.md,
    paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, alignItems: 'center', minWidth: 90,
  },
  installmentChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  installmentChipText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  installmentChipTextActive: { color: COLORS.white },
  installmentChipSub: { fontSize: 9, color: COLORS.success, fontWeight: '600', marginTop: 2 },

  // Pix info
  pixInfo: { alignItems: 'center', padding: 16, backgroundColor: '#e8faf9', borderRadius: SIZES.radius.lg, marginTop: 12 },
  pixQrPreview: { padding: 10, backgroundColor: COLORS.white, borderRadius: SIZES.radius.md, marginBottom: 12 },
  qrCodeBox: { padding: 12, backgroundColor: COLORS.white, borderRadius: SIZES.radius.md, alignItems: 'center' },
  qrInner: { gap: 8, alignItems: 'center' },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 120 },
  qrCell: { width: 15, height: 15 },
  pixInfoTitle: { fontSize: SIZES.base, fontWeight: '700', color: '#32BCAD', marginBottom: 6 },
  pixInfoDesc: { fontSize: SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  pixDiscountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${COLORS.success}15`, borderRadius: SIZES.radius.full,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  pixDiscountText: { fontSize: SIZES.sm, color: COLORS.success, fontWeight: '700' },

  // Boleto info
  boletoInfo: { alignItems: 'center', padding: 20, backgroundColor: '#fff8e1', borderRadius: SIZES.radius.lg, marginTop: 12 },
  boletoTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.warning, marginTop: 8, marginBottom: 6 },
  boletoDesc: { fontSize: SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  boletoWarning: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: `${COLORS.warning}18`, borderRadius: SIZES.radius.md,
    padding: 10, marginTop: 12,
  },
  boletoWarningText: { fontSize: SIZES.xs, color: COLORS.warning, flex: 1, lineHeight: 18 },

  // Payment summary
  paymentSummary: {
    backgroundColor: COLORS.background, borderRadius: SIZES.radius.lg,
    padding: 16, marginTop: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: SIZES.sm, color: COLORS.textLight },
  summaryVal: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },
  summaryTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4 },
  summaryTotalLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  summaryTotalVal: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  installmentInfo: { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },

  // Footer
  stepFooter: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  confirmBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md,
    paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { fontSize: SIZES.xs, color: COLORS.textMuted },

  // Processing modal
  processingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  processingBox: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.xl,
    padding: 40, alignItems: 'center', gap: 12, width: 240,
  },
  processingText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  processingSubText: { fontSize: SIZES.sm, color: COLORS.textMuted },

  // Success
  successIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  successTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginTop: 8 },
  successSub: { fontSize: SIZES.base, color: COLORS.textLight, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  successSummary: {
    width: '100%', backgroundColor: COLORS.background, borderRadius: SIZES.radius.lg,
    padding: 16, marginTop: 24,
  },
  successSummaryTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  successRowLabel: { fontSize: SIZES.sm, color: COLORS.textLight },
  successRowVal: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },

  // Pix & Boleto success
  pixSuccess: { width: '100%', alignItems: 'center', marginTop: 16 },
  pixCodeLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginTop: 12, marginBottom: 6 },
  pixCodeBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: SIZES.radius.md,
    padding: 12, width: '100%', gap: 10,
  },
  pixCodeText: { flex: 1, fontSize: SIZES.xs, color: COLORS.textMuted },
  copyBtn: { padding: 4 },
  boletoSuccess: { width: '100%', alignItems: 'center', marginTop: 16 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.warning, borderRadius: SIZES.radius.md,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 14,
  },
  downloadBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.sm },

  // Orders list
  orderCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 16, ...SHADOWS.sm },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  statusBadge: { borderRadius: SIZES.radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: SIZES.xs, fontWeight: '700' },
  orderDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 4 },
  orderPayMethod: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 6 },
  orderItemText: { fontSize: SIZES.sm, color: COLORS.textLight, marginBottom: 2 },
  orderTotalBold: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.primary, marginTop: 8 },

  // Forgot password
  forgotInfo: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 22, marginBottom: 20 },
});