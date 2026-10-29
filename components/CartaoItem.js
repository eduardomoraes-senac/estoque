// Cartão usado nas listas do Início e do Estoque. Ao tocar, abre os detalhes do item.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { situacaoItem } from '../data/estoque.js';
import { Selo, cores } from './ui.js';

export default function CartaoItem({ item, onPress }) {
  const situacao = situacaoItem(item);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={'Abrir ' + item.nome} onPress={onPress}
      style={function estiloCartao({ pressed }) { return [css.cartao, pressed && { opacity: 0.7 }]; }}>
      <View style={[css.faixa, { backgroundColor: corDaFaixa(situacao.tom) }]} />
      <View style={css.info}>
        <Text style={css.nome}>{item.nome}</Text>
        <Text style={css.detalhe}>{item.categoria} · {item.local}</Text>
        <Selo texto={situacao.texto} tom={situacao.tom} />
      </View>
      <View style={css.quantidade}>
        <Text style={css.numero}>{item.quantidade}</Text>
        <Text style={css.detalhe}>{item.unidade}</Text>
      </View>
    </Pressable>
  );
}

function corDaFaixa(tom) {
  if (tom === 'perigo') { return cores.vermelho; }
  if (tom === 'alerta') { return '#D99A2B'; }
  return cores.oliva;
}

const css = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: cores.papel, borderWidth: 1, borderColor: cores.borda, borderRadius: 16, padding: 14, overflow: 'hidden' },
  faixa: { width: 5, alignSelf: 'stretch', borderRadius: 4 },
  info: { flex: 1, gap: 4 },
  nome: { color: cores.texto, fontSize: 16, fontWeight: '700' },
  detalhe: { color: cores.muted, fontSize: 13 },
  quantidade: { alignItems: 'center', minWidth: 52 },
  numero: { color: cores.texto, fontSize: 24, fontWeight: '800' },
});
