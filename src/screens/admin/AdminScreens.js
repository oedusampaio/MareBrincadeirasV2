import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, TextInput, Modal, Platform, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/mockData';
import { InputField, Button, EmptyState } from '../../components/shared';

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ──────────────────────────────────────────────────────────────────────────────
export function AdminDashboardScreen({ navigation }) {
  const { state, dispatch, showToast, recarregarTudo } = useApp();
  const totalRevenue = state.orders.reduce((s, o) => s + Number(o.total || 0), 0);

  const stats = [
    { icon: '📦', label: 'Produtos', value: state.products.length, color: COLORS.primary, screen: 'AdminProducts' },
    { icon: '👥', label: 'Clientes', value: state.customers.length, color: '#9B59B6', screen: 'AdminCustomers' },
    { icon: '🛒', label: 'Pedidos', value: state.orders.length, color: COLORS.success, screen: 'AdminOrders' },
    { icon: '💰', label: 'Receita', value: `R$${totalRevenue.toFixed(0)}`, color: COLORS.secondary, screen: null },
  ];

  const menuItems = [
    { icon: 'cube-outline', label: 'Gerenciar Produtos', sub: 'Adicionar, editar e remover', screen: 'AdminProducts' },
    { icon: 'people-outline', label: 'Gerenciar Clientes', sub: 'Ver e editar clientes', screen: 'AdminCustomers' },
    { icon: 'receipt-outline', label: 'Pedidos', sub: 'Acompanhe todos os pedidos', screen: 'AdminOrders' },
    { icon: 'grid-outline', label: 'Categorias', sub: 'Gerenciar categorias', screen: 'AdminCategories' },
    { icon: 'star-outline', label: 'Avaliações', sub: 'Moderação de reviews', screen: 'AdminReviews' },
    { icon: 'bar-chart-outline', label: 'Relatório de Vendas', sub: 'Métricas e dados', screen: 'AdminSales' },
    { icon: 'bug-outline', label: 'Debug do Banco', sub: 'Ver dados salvos no SQLite', screen: 'DatabaseDebug' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.hover]} style={styles.adminHero}>
        <View style={styles.adminHeroTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.adminHeroTitle}>Painel Admin</Text>
            <Text style={styles.adminHeroSub}>Maré Brincadeiras</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => navigation.navigate('DatabaseDebug')}>
              <Ionicons name="bug-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { dispatch({ type: 'LOGOUT' }); navigation.navigate('HomeTab'); }}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <TouchableOpacity key={s.label} style={styles.statCard} onPress={() => s.screen && navigation.navigate(s.screen)}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
      <FlatList
        data={menuItems}
        keyExtractor={(i) => i.label}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.adminMenuItem} onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.adminMenuIcon}>
              <Ionicons name={item.icon} size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminMenuLabel}>{item.label}</Text>
              <Text style={styles.adminMenuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, gap: 4 }}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN PRODUCTS
// ──────────────────────────────────────────────────────────────────────────────
export function AdminProductsScreen({ navigation }) {
  const { state, showToast, dbCreateProduto, dbUpdateProduto, dbDeleteProduto } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', value: '', oldValue: '', discount: '', quantity: '', image: '', categoryId: '', ageRange: '' });
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const filtered = state.products.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', value: '', oldValue: '', discount: '', quantity: '', image: '', categoryId: '', ageRange: '' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p, value: String(p.value || p.preco || ''), oldValue: String(p.oldValue || p.preco_antigo || ''), discount: String(p.discount || p.desconto || ''), quantity: String(p.quantity || p.estoque || '') }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.value) { showToast('Nome e preço são obrigatórios!', 'warning'); return; }
    setSaving(true);
    try {
      const dados = {
        name: form.name, description: form.description,
        categoryId: form.categoryId, value: parseFloat(form.value),
        oldValue: form.oldValue ? parseFloat(form.oldValue) : null,
        discount: form.discount ? parseInt(form.discount) : 0,
        quantity: parseInt(form.quantity) || 0,
        ageRange: form.ageRange, image: form.image,
      };
      if (editing) {
        await dbUpdateProduto(editing.id, dados);
        showToast('Produto atualizado!', 'success');
      } else {
        await dbCreateProduto(dados);
        showToast('Produto criado!', 'success');
      }
      setModal(false);
    } catch (e) {
      showToast('Erro ao salvar produto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (id) => {
    Alert.alert('Confirmar Exclusão', 'Deseja excluir este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await dbDeleteProduto(id);
        showToast('Produto removido.', 'info');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Produtos</Text>
        <TouchableOpacity onPress={openNew} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Buscar produto..." value={search} onChangeText={setSearch} placeholderTextColor={COLORS.textMuted} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image source={{ uri: item.image }} style={styles.productRowImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productRowName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productRowPrice}>R$ {item.value.toFixed(2)} • Estoque: {item.quantity}</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(item.id)}>
                <Ionicons name="trash" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="📦" title="Nenhum produto" subtitle="Adicione seu primeiro produto." />}
      />
      {/* Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Produto' : 'Novo Produto'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField label="Nome *" value={form.name} onChangeText={set('name')} placeholder="Nome do produto" />
              <InputField label="Descrição" value={form.description} onChangeText={set('description')} placeholder="Descrição do produto" />
              <InputField label="Preço (R$) *" value={form.value} onChangeText={set('value')} placeholder="0.00" keyboardType="decimal-pad" />
              <InputField label="Preço original (R$)" value={form.oldValue} onChangeText={set('oldValue')} placeholder="0.00" keyboardType="decimal-pad" />
              <InputField label="Desconto (%)" value={form.discount} onChangeText={set('discount')} placeholder="0" keyboardType="numeric" />
              <InputField label="Estoque" value={form.quantity} onChangeText={set('quantity')} placeholder="0" keyboardType="numeric" />
              <InputField label="URL da imagem" value={form.image} onChangeText={set('image')} placeholder="https://..." />
              <InputField label="Faixa etária" value={form.ageRange} onChangeText={set('ageRange')} placeholder="Ex: 3-8 anos" />
              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.catChips}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, form.categoryId === c.id && styles.catChipActive]}
                    onPress={() => setForm({ ...form, categoryId: c.id })}
                  >
                    <Text style={[styles.catChipText, form.categoryId === c.id && styles.catChipTextActive]}>{c.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Salvar" onPress={save} style={{ marginTop: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN CUSTOMERS
// ──────────────────────────────────────────────────────────────────────────────
export function AdminCustomersScreen({ navigation }) {
  const { state, showToast, dbUpdateCliente, dbDeleteCliente, dbCreateCliente } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', endereco: '', senha: '' });
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const filtered = state.customers.filter(
    (c) => (c.nome || c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm({ nome: '', email: '', telefone: '', cpf: '', endereco: '', senha: '' }); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nome: c.nome || c.name || '', email: c.email || '', telefone: c.telefone || c.telephone || '', cpf: c.cpf || '', endereco: c.endereco || '', senha: '' }); setModal(true); };

  const save = async () => {
    if (!form.nome) { showToast('Nome é obrigatório!', 'warning'); return; }
    setSaving(true);
    try {
      if (editing) {
        await dbUpdateCliente(editing.id, form.nome, form.cpf, form.telefone, form.email, form.endereco);
        showToast('Cliente atualizado!', 'success');
      } else {
        await dbCreateCliente(form.nome, form.cpf, form.telefone, form.email, form.endereco, form.senha);
        showToast('Cliente cadastrado!', 'success');
      }
      setModal(false);
    } catch (e) {
      showToast('Erro ao salvar cliente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = (id) => {
    Alert.alert('Confirmar Exclusão', 'Deseja excluir este cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await dbDeleteCliente(id);
        showToast('Cliente removido.', 'info');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Clientes ({filtered.length})</Text>
        <View style={{ width: 38 }} />
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Buscar cliente..." value={search} onChangeText={setSearch} placeholderTextColor={COLORS.textMuted} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>{(item.nome || item.name || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{item.nome || item.name}</Text>
              <Text style={styles.customerEmail}>{item.email}</Text>
              {item.telefone ? <Text style={styles.customerEmail}>📞 {item.telefone}</Text> : null}
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCustomer(item.id)}>
                <Ionicons name="trash" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="👥" title="Nenhum cliente" subtitle="Adicione o primeiro cliente." />}
      />
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField label="Nome *" value={form.nome} onChangeText={set('nome')} placeholder="Nome completo" />
              <InputField label="E-mail" value={form.email} onChangeText={set('email')} keyboardType="email-address" placeholder="email@exemplo.com" />
              <InputField label="Telefone" value={form.telefone} onChangeText={set('telefone')} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
              <InputField label="CPF" value={form.cpf} onChangeText={set('cpf')} keyboardType="numeric" placeholder="000.000.000-00" />
              <InputField label="Endereço" value={form.endereco} onChangeText={set('endereco')} placeholder="Rua, número - Bairro" />
              {!editing && <InputField label="Senha" value={form.senha} onChangeText={set('senha')} placeholder="Senha de acesso" secureTextEntry />}
              <Button title={saving ? "Salvando..." : "Salvar"} onPress={save} style={{ marginTop: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN ORDERS
// ──────────────────────────────────────────────────────────────────────────────
export function AdminOrdersScreen({ navigation }) {
  const { state, dispatch, showToast, dbUpdatePedidoStatus } = useApp();
  const STATUSES = ['Aguardando pagamento', 'Em trânsito', 'Entregue', 'Cancelado', 'Enviado'];
  const STATUS_COLOR = { 'Entregue': COLORS.success, 'Em trânsito': COLORS.primary, 'Aguardando pagamento': COLORS.warning, 'Cancelado': COLORS.error };

  const updateStatus = async (orderId, status) => {
    await dbUpdatePedidoStatus(orderId, status);
    showToast(`Pedido atualizado para "${status}"!`, 'success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Pedidos ({state.orders.length})</Text>
        <View style={{ width: 38 }} />
      </View>
      {state.orders.length === 0 ? (
        <EmptyState icon="📋" title="Nenhum pedido" subtitle="Os pedidos dos clientes aparecerão aqui." />
      ) : (
        <FlatList
          data={state.orders}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.adminOrderCard}>
              <View style={styles.adminOrderHeader}>
                <Text style={styles.adminOrderId}>{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status] || COLORS.textMuted}20` }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] || COLORS.textMuted }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.adminOrderCustomer}>👤 {item.customerName}</Text>
              <Text style={styles.adminOrderDate}>📅 {new Date(item.date).toLocaleDateString('pt-BR')}</Text>
              {item.items.map((i) => <Text key={i.productId} style={styles.adminOrderItem}>• {i.name} x{i.qty}</Text>)}
              <Text style={styles.adminOrderTotal}>Total: R$ {item.total.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.statusChangeLabel}>Atualizar status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {STATUSES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusBtn, item.status === s && { backgroundColor: STATUS_COLOR[s] }]}
                      onPress={() => updateStatus(item.id, s)}
                    >
                      <Text style={[styles.statusBtnText, item.status === s && { color: COLORS.white }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN CATEGORIES
// ──────────────────────────────────────────────────────────────────────────────
export function AdminCategoriesScreen({ navigation }) {
  const { showToast } = useApp();
  const [cats, setCats] = useState(categories);
  const [modal, setModal] = useState(false);
  const [newCat, setNewCat] = useState('');

  const add = () => {
    if (!newCat) return;
    setCats([...cats, { id: Date.now().toString(), nome: newCat }]);
    setNewCat('');
    setModal(false);
    showToast('Categoria adicionada!', 'success');
  };
  const remove = (id) => { setCats(cats.filter((c) => c.id !== id)); showToast('Categoria removida.', 'info'); };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Categorias</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={cats}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.catRow}>
            <View style={styles.catIcon}><Ionicons name="grid-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.catName}>{item.nome}</Text>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: 200 }]}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            <InputField label="Nome" value={newCat} onChangeText={setNewCat} placeholder="Ex: Jogos Educativos" style={{ marginTop: 12 }} />
            <Button title="Adicionar" onPress={add} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN REVIEWS
// ──────────────────────────────────────────────────────────────────────────────
import { StarRating } from '../../components/shared';

export function AdminReviewsScreen({ navigation }) {
  const { state, dispatch, showToast } = useApp();
  const allReviews = state.products.flatMap((p) =>
    (p.feedbacks || []).map((f) => ({ ...f, productId: p.id, productName: p.name }))
  );

  const deleteReview = (productId, name, date) => {
    const updated = state.products.map((p) =>
      p.id === productId ? { ...p, feedbacks: p.feedbacks.filter((f) => !(f.name === name && f.date === date)) } : p
    );
    updated.forEach((p) => dispatch({ type: 'UPDATE_PRODUCT', payload: p }));
    showToast('Avaliação removida.', 'info');
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Avaliações ({allReviews.length})</Text>
        <View style={{ width: 38 }} />
      </View>
      <FlatList
        data={allReviews}
        keyExtractor={(i, idx) => `${i.productId}-${idx}`}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewProduct} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.reviewAuthor}>{item.name} · {new Date(item.date).toLocaleDateString('pt-BR')}</Text>
              </View>
              <StarRating rating={item.rating} size={12} />
              <TouchableOpacity onPress={() => deleteReview(item.productId, item.name, item.date)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="⭐" title="Sem avaliações" subtitle="As avaliações dos clientes aparecerão aqui." />}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN SALES REPORT
// ──────────────────────────────────────────────────────────────────────────────
export function AdminSalesScreen({ navigation }) {
  const { state } = useApp();
  const totalRevenue = state.orders.reduce((s, o) => s + o.total, 0);
  const delivered = state.orders.filter((o) => o.status === 'Entregue').length;
  const pending = state.orders.filter((o) => o.status === 'Aguardando pagamento').length;
  const transit = state.orders.filter((o) => o.status === 'Em trânsito').length;

  const stats = [
    { label: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, icon: '💰', color: COLORS.success },
    { label: 'Pedidos', value: state.orders.length, icon: '📦', color: COLORS.primary },
    { label: 'Entregues', value: delivered, icon: '✅', color: COLORS.success },
    { label: 'Em trânsito', value: transit, icon: '🚚', color: COLORS.secondary },
    { label: 'Aguardando', value: pending, icon: '⏳', color: COLORS.warning },
    { label: 'Clientes', value: state.customers.length, icon: '👥', color: '#9B59B6' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Relatório de Vendas</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.salesGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.salesCard, { borderLeftColor: s.color }]}>
              <Text style={styles.salesIcon}>{s.icon}</Text>
              <Text style={[styles.salesValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.salesLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Últimos Pedidos</Text>
        {state.orders.slice(-5).reverse().map((o) => (
          <View key={o.id} style={styles.salesOrderRow}>
            <View>
              <Text style={styles.salesOrderId}>{o.id}</Text>
              <Text style={styles.salesOrderCustomer}>{o.customerName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.salesOrderTotal}>R$ {o.total.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.salesOrderDate}>{new Date(o.date).toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Dashboard
  adminHero: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 24 },
  adminHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 4 },
  adminHeroTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.white },
  adminHeroSub: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZES.radius.lg, padding: 14, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.8)' },
  adminMenuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg,
    padding: 14, ...SHADOWS.sm,
  },
  adminMenuIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  adminMenuLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  adminMenuSub: { fontSize: SIZES.xs, color: COLORS.textMuted },
  // Screen header
  screenHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn2: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 12,
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.full,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: SIZES.sm, color: COLORS.text },
  // Product row
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 10, ...SHADOWS.sm },
  productRowImg: { width: 54, height: 54, borderRadius: SIZES.radius.md, resizeMode: 'cover' },
  productRowName: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  productRowPrice: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 6 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${COLORS.error}15`, alignItems: 'center', justifyContent: 'center' },
  // Customer row
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 12, ...SHADOWS.sm },
  customerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  customerAvatarText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.white },
  customerName: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  customerEmail: { fontSize: SIZES.xs, color: COLORS.textMuted },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 8 },
  catChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radius.full, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: SIZES.xs, color: COLORS.textLight },
  catChipTextActive: { color: COLORS.white, fontWeight: '700' },
  // Orders
  adminOrderCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 14, ...SHADOWS.sm },
  adminOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  adminOrderId: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  adminOrderCustomer: { fontSize: SIZES.sm, color: COLORS.textLight, marginBottom: 2 },
  adminOrderDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 6 },
  adminOrderItem: { fontSize: SIZES.xs, color: COLORS.textLight, marginBottom: 2 },
  adminOrderTotal: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.primary, marginTop: 6 },
  statusBadge: { borderRadius: SIZES.radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: SIZES.xs, fontWeight: '700' },
  statusChangeLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 10 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radius.full, borderWidth: 1, borderColor: COLORS.border },
  statusBtnText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  // Categories
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 14, ...SHADOWS.sm },
  catIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontSize: SIZES.base, fontWeight: '600', color: COLORS.text },
  // Reviews
  reviewCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 14, ...SHADOWS.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewProduct: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  reviewAuthor: { fontSize: SIZES.xs, color: COLORS.textMuted },
  reviewComment: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  // Sales
  salesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  salesCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 16, borderLeftWidth: 4, ...SHADOWS.sm },
  salesIcon: { fontSize: 28, marginBottom: 4 },
  salesValue: { fontSize: SIZES.xl, fontWeight: '800' },
  salesLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  salesOrderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.md, padding: 12, marginBottom: 8, ...SHADOWS.sm,
  },
  salesOrderId: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  salesOrderCustomer: { fontSize: SIZES.xs, color: COLORS.textMuted },
  salesOrderTotal: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.success },
  salesOrderDate: { fontSize: SIZES.xs, color: COLORS.textMuted },
});
