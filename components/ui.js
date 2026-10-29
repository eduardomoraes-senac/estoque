// Componentes visuais reutilizáveis. Eles recebem tudo por Props e não guardam regras do app.
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Identidade visual: tons de despensa (terracota, oliva e creme).
export const cores = {
  fundo: '#FBF6EE',
  papel: '#FFFFFF',
  texto: '#2A2118',
  muted: '#6E6255',
  borda: '#EADFD0',
  primaria: '#C4572E', // terracota
  primariaClara: '#F8E6DC',
  oliva: '#5E7A3A',
  olivaClara: '#E9EFDD',
  ambar: '#9A6206',
  ambarClaro: '#FBEFD5',
  vermelho: '#B3261E',
  vermelhoClaro: '#FBE4E1',
};

// Página padrão: área segura + rolagem + teclado sem cobrir os campos.
export function Pagina({ children, incluirTopo = false }) {
  return (
    <SafeAreaView style={ui.tela} edges={incluirTopo ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={ui.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={ui.conteudo} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Painel({ children, style = undefined }) {
  return <View style={[ui.painel, style]}>{children}</View>;
}

// variante: 'primario' | 'secundario' | 'perigo'
export function Botao({ titulo, onPress, variante = 'primario', disabled = false }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={function estiloBotao({ pressed }) {
        return [ui.botao, variante === 'secundario' && ui.secundario, variante === 'perigo' && ui.perigo,
          (pressed || disabled) && { opacity: 0.6 }];
      }}>
      <Text style={[ui.textoBotao, variante === 'secundario' && { color: cores.primaria },
        variante === 'perigo' && { color: cores.vermelho }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Campo({ rotulo, dica = '', ...propriedades }) {
  return (
    <View style={ui.campo}>
      <Text style={ui.rotulo}>{rotulo}</Text>
      <TextInput accessibilityLabel={rotulo} placeholderTextColor="#A39686" style={ui.input} {...propriedades} />
      {dica ? <Text style={ui.dica}>{dica}</Text> : null}
    </View>
  );
}

// Mensagem de erro ou sucesso exibida no topo dos formulários.
export function Aviso({ mensagem, tipo = 'erro' }) {
  if (!mensagem) { return null; }
  const sucesso = tipo === 'sucesso';
  return (
    <View style={[ui.aviso, { backgroundColor: sucesso ? cores.olivaClara : cores.vermelhoClaro }]}>
      <Text accessibilityRole="alert" style={{ color: sucesso ? cores.oliva : cores.vermelho, lineHeight: 22 }}>{mensagem}</Text>
    </View>
  );
}

// Selo pequeno colorido. tom: 'ok' | 'alerta' | 'perigo' | 'neutro'
export function Selo({ texto, tom = 'neutro' }) {
  const paleta = {
    ok: [cores.olivaClara, cores.oliva],
    alerta: [cores.ambarClaro, cores.ambar],
    perigo: [cores.vermelhoClaro, cores.vermelho],
    neutro: ['#F1EBE2', cores.muted],
  }[tom];
  return <View style={[ui.selo, { backgroundColor: paleta[0] }]}><Text style={[ui.textoSelo, { color: paleta[1] }]}>{texto}</Text></View>;
}

// Opção selecionável (usada para filtros de categoria, local e nível).
export function Opcao({ texto, ativo, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: ativo }} onPress={onPress}
      style={[ui.opcao, ativo && ui.opcaoAtiva]}>
      <Text style={[ui.textoOpcao, ativo && { color: '#FFFFFF' }]}>{texto}</Text>
    </Pressable>
  );
}

export const estilos = StyleSheet.create({
  titulo: { color: cores.texto, fontSize: 28, fontWeight: '800', lineHeight: 34 },
  tituloPainel: { color: cores.texto, fontSize: 19, fontWeight: '700', lineHeight: 26 },
  subtitulo: { color: cores.muted, fontSize: 16, lineHeight: 24 },
  texto: { color: cores.texto, fontSize: 15, lineHeight: 23 },
  etiqueta: { color: cores.primaria, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  separador: { height: 1, backgroundColor: cores.borda, marginVertical: 4 },
});

const ui = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, paddingBottom: 40, gap: 16, flexGrow: 1 },
  painel: { backgroundColor: cores.papel, borderWidth: 1, borderColor: cores.borda, borderRadius: 18, padding: 18, gap: 12 },
  botao: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  secundario: { backgroundColor: cores.primariaClara },
  perigo: { backgroundColor: cores.vermelhoClaro },
  textoBotao: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  campo: { gap: 6 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto },
  dica: { fontSize: 13, color: cores.muted },
  input: { color: cores.texto, backgroundColor: '#FFFDF9', borderWidth: 1, borderColor: cores.borda, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48, fontSize: 16 },
  aviso: { padding: 14, borderRadius: 12 },
  selo: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  textoSelo: { fontSize: 12, fontWeight: '700' },
  opcao: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.papel },
  opcaoAtiva: { backgroundColor: cores.texto, borderColor: cores.texto },
  textoOpcao: { color: cores.texto, fontSize: 14, fontWeight: '600' },
});
