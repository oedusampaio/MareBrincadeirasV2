import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/mockData';

// Extrai os nomes únicos das categorias do mockData para uso no filtro
const CATEGORY_NAMES = categories.map((c) => c.nome);
import { ProductCard, Header, EmptyState, Footer } from '../../components/shared';

const AGE_RANGES = ['0-1 ano', '1-3 anos', '3-8 anos', '4-10 anos', '4-12 anos', '5+ anos', '8+ anos'];

export default function ProductsScreen({ navigation }) {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // armazena nomes das categorias
  const [selectedAges, setSelectedAges] = useState([]);
  const [priceMax, setPriceMax] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const filtered = useMemo(() => {
    let list = [...state.products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.categoryId));
    if (selectedAges.length) list = list.filter((p) => selectedAges.includes(p.ageRange));
    list = list.filter((p) => p.value <= priceMax);
    if (sortBy === 'price_asc') list.sort((a, b) => a.value - b.value);
    if (sortBy === 'price_desc') list.sort((a, b) => b.value - a.value);
    if (sortBy === 'discount') list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return list;
  }, [state.products, search, selectedCategories, selectedAges, priceMax, sortBy]);

  const toggleCategory = (nome) =>
    setSelectedCategories((prev) => prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]);
  const toggleAge = (age) =>
    setSelectedAges((prev) => prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]);
  const clearFilters = () => { setSelectedCategories([]); setSelectedAges([]); setPriceMax(500); setSortBy('default'); };
  const hasFilters = selectedCategories.length || selectedAges.length || priceMax < 500 || sortBy !== 'default';

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Produtos" showBack={false} />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchText}
            placeholder="Pesquisar produtos..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={[styles.filterBtn, hasFilters && styles.filterBtnActive]} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={20} color={hasFilters ? COLORS.white : COLORS.primary} />
          {hasFilters && <Text style={styles.filterCount}>{selectedCategories.length + selectedAges.length}</Text>}
        </TouchableOpacity>
      </View>

      {/* Sort Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}>
        {[['default', 'Padrão'], ['price_asc', 'Menor preço'], ['price_desc', 'Maior preço'], ['discount', 'Desconto']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.sortPill, sortBy === key && styles.sortPillActive]}
            onPress={() => setSortBy(key)}
          >
            <Text style={[styles.sortPillText, sortBy === key && styles.sortPillTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultsCount}>{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</Text>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum produto encontrado" subtitle="Tente outros filtros ou palavras-chave." action={{ label: 'Limpar filtros', onPress: clearFilters }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard product={item} navigation={navigation} />}
          ListFooterComponent={<Footer navigation={navigation} />}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Categories */}
              <Text style={styles.filterGroupTitle}>Categoria</Text>
              <View style={styles.filterChips}>
                {CATEGORY_NAMES.map((nome) => (
                  <TouchableOpacity
                    key={nome}
                    style={[styles.chip, selectedCategories.includes(nome) && styles.chipActive]}
                    onPress={() => toggleCategory(nome)}
                  >
                    <Text style={[styles.chipText, selectedCategories.includes(nome) && styles.chipTextActive]}>{nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age */}
              <Text style={styles.filterGroupTitle}>Faixa Etária</Text>
              <View style={styles.filterChips}>
                {AGE_RANGES.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, selectedAges.includes(a) && styles.chipActive]}
                    onPress={() => toggleAge(a)}
                  >
                    <Text style={[styles.chipText, selectedAges.includes(a) && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price */}
              <Text style={styles.filterGroupTitle}>Preço máximo: R$ {priceMax}</Text>
              <View style={styles.priceSlider}>
                {[50, 100, 200, 300, 400, 500].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priceBtn, priceMax === p && styles.priceBtnActive]}
                    onPress={() => setPriceMax(p)}
                  >
                    <Text style={[styles.priceBtnText, priceMax === p && styles.priceBtnTextActive]}>R${p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Limpar tudo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>

  );
}
// style
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, backgroundColor: COLORS.white },
  searchInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.background, borderRadius: SIZES.radius.full,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchText: { flex: 1, fontSize: SIZES.sm, color: COLORS.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary, flexDirection: 'row',
  },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterCount: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: COLORS.error, borderRadius: 10,
    width: 18, height: 18, textAlign: 'center', color: COLORS.white, fontSize: 10, fontWeight: '700',
  },
  sortRow: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortPill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: SIZES.radius.full, borderWidth: 1.5, borderColor: COLORS.border,
  },
  sortPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortPillText: { fontSize: SIZES.sm, color: COLORS.textLight },
  sortPillTextActive: { color: COLORS.white, fontWeight: '700' },
  resultsCount: { fontSize: SIZES.xs, color: COLORS.textMuted, paddingHorizontal: 16, paddingVertical: 8 },
  
  row: { justifyContent: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  filterGroupTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 16 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: SIZES.radius.full, borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: SIZES.sm, color: COLORS.textLight },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  priceSlider: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  priceBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: SIZES.radius.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  priceBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  priceBtnText: { fontSize: SIZES.sm, color: COLORS.textLight },
  priceBtnTextActive: { color: COLORS.white, fontWeight: '700' },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  clearBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.radius.md,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  clearBtnText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textLight },
  applyBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
});
