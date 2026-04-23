import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Dimensions, FlatList, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';
import { useApp } from '../../context/AppContext';
import { testimonials } from '../../data/mockData';
import { ProductCard, SectionTitle, Header } from '../../components/shared';

const { width } = Dimensions.get('window');

const BENEFITS = [
  { icon: 'car-outline', title: 'Entrega Rápida', sub: 'Em todo o Brasil' },
  { icon: 'card-outline', title: 'Pagamento Seguro', sub: 'Diversas formas' },
  { icon: 'refresh-outline', title: 'Troca Garantida', sub: '7 dias para trocar' },
  { icon: 'headset-outline', title: 'Suporte 24h', sub: 'Atendimento especializado' },
];

function CountdownBox({ value, label }) {
  return (
    <View style={styles.countBox}>
      <Text style={styles.countNum}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { state, dispatch, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState({ days: 2, hours: 23, minutes: 59, seconds: 59 });
  const [finished, setFinished] = useState(false);

  // Countdown
  useEffect(() => {
    let total = countdown.days * 86400 + countdown.hours * 3600 + countdown.minutes * 60 + countdown.seconds;
    const interval = setInterval(() => {
      if (total <= 0) { clearInterval(interval); setFinished(true); return; }
      total--;
      setCountdown({
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const featured = state.products.slice(0, 4);
  const bestsellers = state.products.slice(0, 6);

  const subscribeNewsletter = () => {
    if (!email) { showToast('Informe seu e-mail!', 'warning'); return; }
    showToast('Inscrição realizada com sucesso! 🎉', 'success');
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={[COLORS.secondary, '#FFD55E']} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Diversão{'\n'}sem fim!</Text>
            <Text style={styles.heroSub}>
              Explore nossa coleção de brinquedos encantadores para momentos inesquecíveis.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('ProductsTab')}
            >
              <Text style={styles.heroBtnText}>Ver todos os brinquedos</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEmoji}>🧸</Text>
        </LinearGradient>

        {/* Benefícios */}
        <View style={styles.benefits}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitSub}>{b.sub}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Produtos em Destaque */}
        <View style={styles.section}>
          <SectionTitle title="Produtos em Destaque" />
          <View style={styles.productsGrid}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} navigation={navigation} />
            ))}
          </View>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('ProductsTab')}>
            <Text style={styles.seeAllText}>Ver todos os produtos</Text>
          </TouchableOpacity>
        </View>

        {/* Promoção Destaque */}
        <LinearGradient colors={[COLORS.primary, COLORS.hover]} style={styles.promo}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Casa de Atividades Montessori</Text>
            <View style={styles.promoPrice}>
              <Text style={styles.promoOldPrice}>R$ 299,90</Text>
              <Text style={styles.promoNewPrice}>R$ 199,90</Text>
            </View>
            {!finished ? (
              <View style={styles.countdown}>
                <CountdownBox value={countdown.days} label="Dias" />
                <Text style={styles.colon}>:</Text>
                <CountdownBox value={countdown.hours} label="Horas" />
                <Text style={styles.colon}>:</Text>
                <CountdownBox value={countdown.minutes} label="Min" />
                <Text style={styles.colon}>:</Text>
                <CountdownBox value={countdown.seconds} label="Seg" />
              </View>
            ) : (
              <Text style={styles.promoEnd}>Promoção encerrada!</Text>
            )}
            <TouchableOpacity
              style={styles.promoBuyBtn}
              onPress={() => (navigation.getParent() ?? navigation).navigate('Finalizar')}
            >
              <Text style={styles.promoBuyText}>Compre agora</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Mais Vendidos */}
        <View style={styles.section}>
          <SectionTitle title="Mais Vendidos" />
          <FlatList
            data={bestsellers}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <ProductCard product={item} navigation={navigation} compact />}
          />
        </View>

        {/* Depoimentos */}
        <View style={[styles.section, { backgroundColor: COLORS.background }]}>
          <SectionTitle title="O que nossos clientes dizem" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
            {testimonials.map((t) => (
              <View key={t.id} style={styles.testimonialCard}>
                <View style={styles.stars}>
                  {[1,2,3,4,5].map((s) => (
                    <Ionicons key={s} name={s <= t.rating ? 'star' : 'star-outline'} size={14} color={COLORS.discount} />
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{t.text}"</Text>
                <Text style={styles.testimonialAuthor}>{t.name}</Text>
                <Text style={styles.testimonialLoc}>{t.location}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Newsletter */}
        <LinearGradient colors={[COLORS.primary, COLORS.hover]} style={styles.newsletter}>
          <Text style={styles.newsletterTitle}>Fique por dentro das novidades!</Text>
          <Text style={styles.newsletterSub}>Receba ofertas exclusivas e lançamentos.</Text>
          <View style={styles.newsletterForm}>
            <TextInput
              style={styles.newsletterInput}
              placeholder="Seu melhor e-mail"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.newsletterBtn} onPress={subscribeNewsletter}>
              <Ionicons name="send" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>🌊 Maré Brincadeiras</Text>
          <View style={styles.footerLinks}>
          <View style={styles.footerLinks}>
  <TouchableOpacity onPress={() => (navigation.getParent() ?? navigation).navigate('ProductsTab')}>
    <Text style={styles.footerLink}>Produtos</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('QuemSomos')}>
    <Text style={styles.footerLink}>Quem Somos</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('Contato')}>
    <Text style={styles.footerLink}>Contato</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('PoliticaPrivacidade')}>
    <Text style={styles.footerLink}>Política de Privacidade</Text>
  </TouchableOpacity>
</View>
          </View>
          <Text style={styles.footerCopy}>© 2025 Oceano Encantado - Todos os direitos reservados</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { padding: 24, paddingTop: 32, paddingBottom: 40, flexDirection: 'row', alignItems: 'center', minHeight: 200 },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: COLORS.primary, lineHeight: 40 },
  heroSub: { fontSize: SIZES.sm, color: COLORS.text, marginTop: 8, marginBottom: 20, lineHeight: 20, opacity: 0.8 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: SIZES.radius.full, alignSelf: 'flex-start',
  },
  heroBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.sm },
  heroEmoji: { fontSize: 80 },
  benefits: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  benefitItem: { alignItems: 'center', width: 100 },
  benefitIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  benefitTitle: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  benefitSub: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  section: { paddingVertical: 24 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  seeAllBtn: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  seeAllText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.base },
  promo: { margin: 16, borderRadius: SIZES.radius.xl, padding: 24 },
  promoContent: { gap: 12 },
  promoTitle: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700', lineHeight: 26 },
  promoPrice: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoOldPrice: { color: 'rgba(255,255,255,0.6)', fontSize: SIZES.lg, textDecorationLine: 'line-through' },
  promoNewPrice: { color: COLORS.discount, fontSize: SIZES.xxl, fontWeight: '800' },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countBox: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.md,
    width: 58, height: 58, alignItems: 'center', justifyContent: 'center',
  },
  countNum: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  countLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  colon: { color: COLORS.white, fontSize: SIZES.xxl, fontWeight: '800' },
  promoEnd: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700' },
  promoBuyBtn: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  promoBuyText: { color: COLORS.primary, fontWeight: '800', fontSize: SIZES.base },
  testimonialCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg,
    padding: 16, width: 260, ...SHADOWS.md,
  },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  testimonialText: { fontSize: SIZES.sm, color: COLORS.textLight, fontStyle: 'italic', lineHeight: 20, marginBottom: 10 },
  testimonialAuthor: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  testimonialLoc: { fontSize: SIZES.xs, color: COLORS.textMuted },
  newsletter: { padding: 28, margin: 16, borderRadius: SIZES.radius.xl },
  newsletterTitle: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '800', marginBottom: 6 },
  newsletterSub: { color: 'rgba(255,255,255,0.8)', fontSize: SIZES.sm, marginBottom: 20 },
  newsletterForm: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: SIZES.radius.full, overflow: 'hidden',
  },
  newsletterInput: {
    flex: 1, paddingHorizontal: 18, paddingVertical: 12,
    color: COLORS.white, fontSize: SIZES.sm,
  },
  newsletterBtn: {
    backgroundColor: COLORS.white, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { backgroundColor: '#1a1a2e', padding: 24, gap: 16 },
  footerLogo: { color: COLORS.secondary, fontSize: SIZES.xl, fontWeight: '800', textAlign: 'center' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  footerLink: { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.sm },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: SIZES.xs, textAlign: 'center' },
});
