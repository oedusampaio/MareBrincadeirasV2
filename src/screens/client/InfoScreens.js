import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';

// ─── Cabeçalho com botão voltar (usado nas 3 telas) ───────────────────────────
function BackHeader({ navigation, title }) {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={headerStyles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={headerStyles.title}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
});

// ─── TELA: Quem Somos ─────────────────────────────────────────────────────────
export function QuemSomosScreen({ navigation }) {
  const values = [
    { icon: 'heart-outline', title: 'Amor pelos Pequenos', text: 'Cada brinquedo é escolhido com carinho pensando no desenvolvimento saudável das crianças.' },
    { icon: 'shield-checkmark-outline', title: 'Segurança em 1º Lugar', text: 'Todos os produtos são aprovados pelo INMETRO e fabricados com materiais atóxicos e seguros.' },
    { icon: 'star-outline', title: 'Qualidade Garantida', text: 'Trabalhamos apenas com fornecedores certificados que entregam produtos de alta durabilidade.' },
    { icon: 'leaf-outline', title: 'Responsabilidade', text: 'Comprometidos com práticas sustentáveis e embalagens recicláveis sempre que possível.' },
  ];

  return (
    <View style={styles.container}>
      <BackHeader navigation={navigation} title="Quem Somos" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[COLORS.secondary, '#FFD55E']} style={styles.hero}>
          <Text style={styles.heroEmoji}>🌊</Text>
          <Text style={styles.heroTitle}>Maré Brincadeiras</Text>
          <Text style={styles.heroSub}>
            Trazendo alegria e desenvolvimento para as crianças desde 2020
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossa História</Text>
          <Text style={styles.paragraph}>
            A Maré Brincadeiras nasceu do sonho de dois pais apaixonados por brinquedos educativos.
            Em 2020, percebemos que era difícil encontrar produtos de qualidade que unissem
            diversão, segurança e desenvolvimento infantil num só lugar.
          </Text>
          <Text style={styles.paragraph}>
            Hoje somos referência em brinquedos pedagógicos e educativos no Brasil,
            atendendo famílias em todo o país com um catálogo cuidadosamente selecionado
            de mais de 200 produtos.
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { num: '5.000+', label: 'Famílias atendidas' },
            { num: '200+', label: 'Produtos' },
            { num: '4.9★', label: 'Avaliação média' },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossos Valores</Text>
          {values.map((v) => (
            <View key={v.title} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons name={v.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.valueText}>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueSub}>{v.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <LinearGradient colors={[COLORS.primary, COLORS.hover]} style={styles.missionBox}>
          <Text style={styles.missionTitle}>Nossa Missão</Text>
          <Text style={styles.missionText}>
            "Proporcionar experiências de aprendizado e diversão que estimulem o
            desenvolvimento pleno de cada criança, com segurança, qualidade e amor."
          </Text>
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── TELA: Contato ────────────────────────────────────────────────────────────
export function ContatoScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarMensagem = () => {
    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setNome(''); setEmail(''); setMensagem('');
      Alert.alert('Mensagem enviada! 🎉', 'Obrigado pelo contato! Responderemos em até 24 horas.');
    }, 1500);
  };

  const contatos = [
    { icon: 'mail-outline', label: 'E-mail', value: 'contato@marebrincadeiras.com.br', action: () => Linking.openURL('mailto:contato@marebrincadeiras.com.br') },
    { icon: 'logo-whatsapp', label: 'WhatsApp', value: '(11) 99999-8888', action: () => Linking.openURL('https://wa.me/5511999998888') },
    { icon: 'time-outline', label: 'Horário', value: 'Seg–Sex: 9h às 18h\nSáb: 9h às 13h', action: null },
    { icon: 'location-outline', label: 'Endereço', value: 'São Paulo, SP – Brasil', action: null },
  ];

  return (
    <View style={styles.container}>
      <BackHeader navigation={navigation} title="Contato" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <LinearGradient colors={[COLORS.secondary, '#FFD55E']} style={styles.heroSmall}>
          <Text style={styles.heroTitle}>Fale Conosco</Text>
          <Text style={styles.heroSub}>Estamos aqui para ajudar! 💬</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossos Canais</Text>
          {contatos.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={styles.contactCard}
              onPress={c.action || undefined}
              activeOpacity={c.action ? 0.7 : 1}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={c.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              {c.action && <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Envie uma Mensagem</Text>

          <Text style={styles.inputLabel}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Mensagem</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Como podemos ajudar?"
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor={COLORS.textMuted}
          />

          <TouchableOpacity
            style={[styles.sendBtn, enviando && { opacity: 0.7 }]}
            onPress={enviarMensagem}
            disabled={enviando}
          >
            <Ionicons name="send-outline" size={18} color={COLORS.white} />
            <Text style={styles.sendBtnText}>{enviando ? 'Enviando...' : 'Enviar Mensagem'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── TELA: Política de Privacidade ────────────────────────────────────────────
export function PoliticaPrivacidadeScreen({ navigation }) {
  const sections = [
    {
      title: '1. Informações que Coletamos',
      text: 'Coletamos informações fornecidas diretamente por você, como nome, e-mail, endereço de entrega, telefone e dados de pagamento ao realizar um cadastro ou compra em nossa plataforma. Também podemos coletar dados de uso como páginas visitadas, produtos visualizados e interações com o aplicativo.',
    },
    {
      title: '2. Como Usamos suas Informações',
      text: 'Utilizamos suas informações para: processar pedidos e pagamentos; enviar confirmações e atualizações de entrega; oferecer suporte ao cliente; personalizar sua experiência de compra; enviar comunicações de marketing (quando autorizado); melhorar nossos produtos e serviços.',
    },
    {
      title: '3. Compartilhamento de Dados',
      text: 'Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros sem seu consentimento, exceto quando necessário para concluir uma transação (ex.: transportadoras para entrega), cumprir obrigações legais ou proteger nossos direitos.',
    },
    {
      title: '4. Segurança dos Dados',
      text: 'Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL em todas as transmissões de dados sensíveis.',
    },
    {
      title: '5. Seus Direitos (LGPD)',
      text: 'Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a: acessar seus dados pessoais; corrigir dados incompletos ou desatualizados; solicitar a exclusão dos seus dados; revogar o consentimento a qualquer momento; portabilidade dos dados.',
    },
    {
      title: '6. Cookies',
      text: 'Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário, analisar o tráfego e personalizar conteúdo. Você pode configurar seu dispositivo para recusar cookies, mas isso pode afetar algumas funcionalidades do aplicativo.',
    },
    {
      title: '7. Retenção de Dados',
      text: 'Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Após esse período, os dados são excluídos ou anonimizados com segurança.',
    },
    {
      title: '8. Contato sobre Privacidade',
      text: 'Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com nosso encarregado de proteção de dados (DPO) pelo e-mail: privacidade@marebrincadeiras.com.br',
    },
    {
      title: '9. Alterações nesta Política',
      text: 'Esta política pode ser atualizada periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou notificação no aplicativo. A data da última atualização está indicada no início deste documento.',
    },
  ];

  return (
    <View style={styles.container}>
      <BackHeader navigation={navigation} title="Política de Privacidade" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[COLORS.primary, COLORS.hover]} style={styles.heroSmall}>
          <Ionicons name="shield-checkmark-outline" size={40} color={COLORS.white} />
          <Text style={[styles.heroTitle, { color: COLORS.white }]}>Privacidade e Segurança</Text>
          <Text style={[styles.heroSub, { color: 'rgba(255,255,255,0.85)' }]}>
            Última atualização: Janeiro de 2025
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            A Maré Brincadeiras respeita sua privacidade e está comprometida em proteger
            seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos
            suas informações.
          </Text>
          {sections.map((s) => (
            <View key={s.title} style={styles.policySection}>
              <Text style={styles.policyTitle}>{s.title}</Text>
              <Text style={styles.policyText}>{s.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { padding: 32, alignItems: 'center', gap: 8 },
  heroSmall: { padding: 24, alignItems: 'center', gap: 8 },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  heroSub: { fontSize: SIZES.sm, color: COLORS.text, textAlign: 'center', opacity: 0.8 },
  section: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  paragraph: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.background, padding: 20, gap: 8 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius.lg, padding: 16, ...SHADOWS.sm },
  statNum: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  valueCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: COLORS.background, borderRadius: SIZES.radius.md, padding: 14 },
  valueIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  valueText: { flex: 1 },
  valueTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  valueSub: { fontSize: SIZES.xs, color: COLORS.textMuted, lineHeight: 18 },
  missionBox: { margin: 20, borderRadius: SIZES.radius.xl, padding: 24, gap: 10 },
  missionTitle: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },
  missionText: { color: 'rgba(255,255,255,0.9)', fontSize: SIZES.sm, lineHeight: 22, fontStyle: 'italic' },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.background, borderRadius: SIZES.radius.md, padding: 14 },
  contactIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  contactValue: { fontSize: SIZES.sm, color: COLORS.text, fontWeight: '500' },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.sm,
    color: COLORS.text, backgroundColor: COLORS.white, marginBottom: 12,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary, borderRadius: SIZES.radius.md,
    paddingVertical: 14, marginTop: 4,
  },
  sendBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.base },
  policySection: { gap: 6 },
  policyTitle: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.text },
  policyText: { fontSize: SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
});