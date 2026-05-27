import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { StarRating, Button, Footer } from '../../components/shared';


const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { state, dispatch, showToast } = useApp();
  const product = state.products.find((p) => String(p.id) === String(productId));
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return null;

  const category = require('../../data/mockData').categories.find((c) => c.nome === product.categoryId);
  const avgRating = product.feedbacks?.length
    ? product.feedbacks.reduce((s, f) => s + f.rating, 0) / product.feedbacks.length
    : 0;

  const addToCart = () => {
  if (!state.user) {
    showToast('Faça login para adicionar ao carrinho!', 'warning');
    navigation.navigate('Login');
    return;
  }
  for (let i = 0; i < qty; i++) {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { productId: product.id, nome: product.name, preco: product.value, imagem: product.image },
    });
  }
  showToast(`${qty}x "${product.name}" adicionado ao carrinho!`);
};

const toggleFav = () => {
  if (!state.user) {
    showToast('Faça login para salvar favoritos!', 'warning');
    navigation.navigate('Login');
    return;
  }
  dispatch({ type: 'TOGGLE_FAVORITE', payload: product.id });
};
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={toggleFav} style={styles.topBtn}>
          <Ionicons
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={product.isFavorite ? COLORS.error : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images */}
        <View style={styles.imgSection}>
          <Image source={{ uri: (product.images && product.images[activeImg]) || product.image }} style={styles.mainImg} />
          {product.images && product.images.length > 1 && (
            <View style={styles.thumbRow}>
              {product.images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImg(i)}>
                  <Image
                    source={{ uri: img }}
                    style={[styles.thumb, activeImg === i && styles.thumbActive]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category */}
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category.nome}</Text>
            </View>
          )}

          {/* Name & Rating */}
          <Text style={styles.name}>{product.name}</Text>
          {product.feedbacks?.length > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={Math.round(avgRating)} />
              <Text style={styles.ratingCount}>({product.feedbacks.length} avaliações)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceSection}>
            {product.discount && (
              <View style={styles.discountTag}>
                <Text style={styles.discountTagText}>-{product.discount}%</Text>
              </View>
            )}
            <Text style={styles.price}>R$ {(product.value || 0).toFixed(2).replace('.', ',')}</Text>
            {product.oldValue && (
              <Text style={styles.oldPrice}>R$ {(product.oldValue || 0).toFixed(2).replace('.', ',')}</Text>
            )}
          </View>

          {/* Info chips */}
          <View style={styles.infoChips}>
            {product.color && <View style={styles.chip}><Ionicons name="color-palette-outline" size={14} color={COLORS.primary} /><Text style={styles.chipText}>{product.color}</Text></View>}
            {product.size && <View style={styles.chip}><Ionicons name="resize-outline" size={14} color={COLORS.primary} /><Text style={styles.chipText}>{product.size}</Text></View>}
            {product.ageRange && <View style={styles.chip}><Ionicons name="person-outline" size={14} color={COLORS.primary} /><Text style={styles.chipText}>{product.ageRange}</Text></View>}
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Qty selector */}
          <Text style={styles.sectionLabel}>Quantidade</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
              <Ionicons name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.min(product.quantity, qty + 1))}>
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stock}>Estoque: {product.quantity}</Text>
          </View>

          {/* Feedbacks */}
          {product.feedbacks?.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Avaliações</Text>
              {product.feedbacks.map((f, i) => (
                <View key={i} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackName}>{f.name}</Text>
                    <StarRating rating={f.rating} size={12} />
                  </View>
                  <Text style={styles.feedbackDate}>{new Date(f.date).toLocaleDateString('pt-BR')}</Text>
                  <Text style={styles.feedbackComment}>{f.comment}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        <Footer navigation={navigation} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>R$ {((product.value || 0) * qty).toFixed(2).replace('.', ',')}</Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={addToCart}>
          <Ionicons name="cart" size={20} color={COLORS.white} />
          <Text style={styles.addCartText}>Adicionar ao carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  topBtn: { padding: 4 },
  topTitle: { flex: 1, textAlign: 'center', fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginHorizontal: 8 },
  imgSection: { backgroundColor: COLORS.background, padding: 16, alignItems: 'center' },
  mainImg: { width: width - 32, height: 280, borderRadius: SIZES.radius.lg, resizeMode: 'cover' },
  thumbRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  thumb: { width: 60, height: 60, borderRadius: SIZES.radius.md, resizeMode: 'cover', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: COLORS.primary },
  content: { padding: 20, gap: 0 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: SIZES.radius.full, marginBottom: 10,
  },
  categoryText: { color: COLORS.primary, fontSize: SIZES.xs, fontWeight: '700' },
  name: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 26, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingCount: { fontSize: SIZES.xs, color: COLORS.textMuted },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  discountTag: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  discountTagText: { color: COLORS.white, fontSize: SIZES.xs, fontWeight: '700' },
  price: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.primary },
  oldPrice: { fontSize: SIZES.base, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  infoChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.background, borderRadius: SIZES.radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontSize: SIZES.xs, color: COLORS.textLight },
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  description: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyVal: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, minWidth: 30, textAlign: 'center' },
  stock: { fontSize: SIZES.xs, color: COLORS.textMuted, marginLeft: 8 },
  feedbackCard: { backgroundColor: COLORS.background, borderRadius: SIZES.radius.md, padding: 14, marginBottom: 10 },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  feedbackName: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  feedbackDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 6 },
  feedbackComment: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white,
  },
  totalLabel: { fontSize: SIZES.xs, color: COLORS.textMuted },
  totalVal: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  addCartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  addCartText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
});
