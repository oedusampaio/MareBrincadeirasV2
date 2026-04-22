import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  TextInput, ActivityIndicator, Animated, Platform
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';

// ─── HEADER ────────────────────────────────────────────────────────────────────
export function Header({ title, navigation, showBack = false, showCart = true, showSearch = false, onSearch }) {
  const { state, cartCount } = useApp();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation?.navigate('Home')} style={styles.logoContainer}>

            <Text style={styles.logoText}>🌊 {title ? 'MB' : 'Maré'}</Text>
            {!title && <Text style={styles.logoSub}> Brincadeiras</Text>}
          </TouchableOpacity>
        )}
      </View>
      {title && <Text style={styles.headerTitle}>{title}</Text>}

      <View style={styles.headerRight}>
        {showSearch && (
          <TouchableOpacity onPress={onSearch} style={styles.headerBtn}>
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation?.navigate('Favoritos')} style={styles.headerBtn}>
          <Ionicons name="heart-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        {showCart && (
          <TouchableOpacity onPress={() => navigation?.navigate('Carrinho')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={24} color={COLORS.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {state.user ? (
          <TouchableOpacity onPress={() => navigation?.navigate('Perfil')} style={styles.headerBtn}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation?.navigate('Login')} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── PRODUCT CARD ───────────────────────────────────────────────────────────────
export function ProductCard({ product, navigation, compact = false }) {
  const { dispatch, showToast } = useApp();

  const addToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { productId: product.id, nome: product.name, preco: product.value, imagem: product.image },
    });
    showToast(`"${product.name}" adicionado ao carrinho!`);
  };

  const toggleFav = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: product.id });
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => navigation?.navigate('ProductDetail', { productId: product.id })}
      activeOpacity={0.9}
    >
      {product.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favBtn} onPress={toggleFav}>
        <Ionicons
          name={product.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={product.isFavorite ? COLORS.error : COLORS.textMuted}
        />
      </TouchableOpacity>
      <Image source={{ uri: product.image }} style={compact ? styles.cardImgCompact : styles.cardImg} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, !product.oldValue && { color: COLORS.primary }]}>
            R$ {product.value.toFixed(2).replace('.', ',')}
          </Text>
          {product.oldValue && (
            <Text style={styles.oldPrice}>R$ {product.oldValue.toFixed(2).replace('.', ',')}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── TOAST ──────────────────────────────────────────────────────────────────────
export function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;
  const bgColor = {
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.primary,
  }[state.toast.type] || COLORS.success;

  return (
    <View style={[styles.toast, { backgroundColor: bgColor }]}>
      <Ionicons
        name={state.toast.type === 'error' ? 'close-circle' : 'checkmark-circle'}
        size={20}
        color={COLORS.white}
      />
      <Text style={styles.toastText}>{state.toast.message}</Text>
    </View>
  );
}

// ─── SECTION TITLE ──────────────────────────────────────────────────────────────
export function SectionTitle({ title }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionTitleLine} />
    </View>
  );
}

// ─── BUTTON ─────────────────────────────────────────────────────────────────────
export function Button({ title, onPress, variant = 'primary', disabled = false, style, loading = false }) {
  const bg = variant === 'primary' ? COLORS.primary : variant === 'secondary' ? COLORS.secondary : COLORS.white;
  const color = variant === 'outline' ? COLORS.primary : COLORS.white;
  const border = variant === 'outline' ? { borderWidth: 1.5, borderColor: COLORS.primary } : {};

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }, border, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── INPUT FIELD ────────────────────────────────────────────────────────────────
export function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, style, error }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

// ─── STAR RATING ────────────────────────────────────────────────────────────────
export function StarRating({ rating, size = 14 }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons key={s} name={s <= rating ? 'star' : 'star-outline'} size={size} color={COLORS.discount} />
      ))}
    </View>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon || '📦'}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      {action && <Button title={action.label} onPress={action.onPress} style={{ marginTop: 20, paddingHorizontal: 32 }} />}
    </View>
  );
}

// ─── BOTTOM TAB BAR (custom) ────────────────────────────────────────────────────
export function BottomTab({ state: navState, descriptors, navigation }) {
  const { cartCount } = useApp();
  const tabs = [
    { name: 'HomeTab', icon: 'home', label: 'Início' },
    { name: 'ProductsTab', icon: 'grid', label: 'Produtos' },
    { name: 'CarrinhoTab', icon: 'cart', label: 'Carrinho', badge: cartCount },
    { name: 'FavoritosTab', icon: 'heart', label: 'Favoritos' },
    { name: 'PerfilTab', icon: 'person', label: 'Perfil' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isFocused = navState.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrap, isFocused && styles.tabIconActive]}>
              <Ionicons
                name={isFocused ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={isFocused ? COLORS.white : COLORS.textMuted}
              />
              {tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isFocused && { color: COLORS.primary }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { flex: 2, textAlign: 'center', fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  logoSub: { fontSize: 14, fontWeight: '800', color: COLORS.text, },
  headerBtn: { padding: 6 },
  cartBtn: { padding: 6, position: 'relative' },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.primary, borderRadius: 10,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.full,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  loginBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg,
    width: 170, margin: 6, overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardCompact: { width: 150 },
  cardImg: { width: '100%', height: 140, resizeMode: 'cover' },
  cardImgCompact: { width: '100%', height: 120, resizeMode: 'cover' },
  cardInfo: { padding: 10 },
  cardName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.secondary },
  oldPrice: { fontSize: SIZES.xs, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.sm,
    paddingVertical: 7, alignItems: 'center',
  },
  addBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '700' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 1,
    backgroundColor: COLORS.secondary, borderRadius: SIZES.radius.sm,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  discountText: { color: COLORS.white, fontSize: SIZES.xs, fontWeight: '700' },
  favBtn: { position: 'absolute', top: 8, right: 8, zIndex: 1, padding: 4 },

  // Toast
  toast: {
    position: 'absolute', bottom: 90, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: SIZES.radius.md, padding: 14,
    zIndex: 9999, ...SHADOWS.lg,
  },
  toastText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '500', flex: 1 },

  // Section Title
  sectionTitleWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  sectionTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.primary },
  sectionTitleLine: {
    marginTop: 8, width: 60, height: 3,
    backgroundColor: COLORS.primary, borderRadius: 2,
  },

  // Button
  button: {
    borderRadius: SIZES.radius.md, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: SIZES.base, fontWeight: '700' },

  // Input
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.base,
    color: COLORS.text, backgroundColor: COLORS.white,
  },
  inputError: { borderColor: COLORS.error },
  inputErrorText: { color: COLORS.error, fontSize: SIZES.xs, marginTop: 4 },

  // Stars
  stars: { flexDirection: 'row', gap: 2 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptySub: { fontSize: SIZES.base, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },

  // Bottom Tab
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8, paddingHorizontal: 8,
    ...SHADOWS.md,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIconWrap: { padding: 6, borderRadius: SIZES.radius.full, position: 'relative' },
  tabIconActive: { backgroundColor: COLORS.primary },
  tabBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: COLORS.error, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  tabBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  tabLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
});
