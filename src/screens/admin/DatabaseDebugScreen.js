import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllClientes, getAllProdutos, getAllPedidos } from '../../services/database';
import { COLORS, SIZES } from '../../utils/theme';

export default function DatabaseDebugScreen({ navigation }) {
  const [dados, setDados] = useState({ clientes: [], produtos: [], pedidos: [] });
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('clientes');

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const [clientes, produtos, pedidos] = await Promise.all([
        getAllClientes(),
        getAllProdutos(),
        getAllPedidos(),
      ]);
      setDados({ clientes, produtos, pedidos });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const abas = [
    { key: 'clientes', label: 'Clientes', icon: 'people' },
    { key: 'produtos',  label: 'Produtos',  icon: 'cube'   },
    { key: 'pedidos',  label: 'Pedidos',  icon: 'receipt' },
  ];

  const renderItem = (item, idx) => (
    <View key={idx} style={styles.row}>
      {Object.entries(item).map(([k, v]) => (
        <Text key={k} style={styles.cell}>
          <Text style={styles.key}>{k}: </Text>
          <Text style={styles.val}>{String(v ?? '—')}</Text>
        </Text>
      ))}
    </View>
  );

  const lista = dados[aba] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>🐛 Debug do Banco</Text>
        <TouchableOpacity onPress={carregar} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {abas.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={[styles.tab, aba === a.key && styles.tabActive]}
            onPress={() => setAba(a.key)}
          >
            <Ionicons name={a.icon} size={16} color={aba === a.key ? COLORS.white : COLORS.textMuted} />
            <Text style={[styles.tabText, aba === a.key && styles.tabTextActive]}>
              {a.label} ({dados[a.key]?.length ?? 0})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
          {lista.length === 0 ? (
            <Text style={styles.empty}>Nenhum registro encontrado.</Text>
          ) : (
            lista.map((item, idx) => renderItem(item, idx))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  refreshBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cell: { fontSize: 12, marginBottom: 2 },
  key: { fontWeight: '700', color: COLORS.primary },
  val: { color: '#444' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
});
