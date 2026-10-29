import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Campo, Pagina, Painel, cores, estilos } from '../components/ui.js';
import { estaAbaixoDoMinimo } from '../data/estoque.js';

export default function ListaCompras({ itens, listaCompras, adicionarCompra, alternarCompra, limparComprados }) {
  const [novo, setNovo] = useState('');
  const [erro, setErro] = useState('');

  const pendentes = listaCompras.filter(function (compra) { return !compra.comprado; });
  const comprados = listaCompras.filter(function (compra) { return compra.comprado; });
  // Sugestões: itens abaixo do mínimo que ainda não estão na lista.
  const sugestoes = itens.filter(function sugerir(item) {
    return estaAbaixoDoMinimo(item) && !pendentes.some(function (compra) { return compra.nome.toLowerCase() === item.nome.toLowerCase(); });
  });

  function adicionar(nome) {
    if (!nome.trim()) { setErro('Digite o nome do produto.'); return; }
    if (!adicionarCompra(nome)) { setErro('Esse produto já está na lista.'); return; }
    setErro('');
    setNovo('');
  }

  return (
    <Pagina>
      <Painel>
        <Aviso mensagem={erro} />
        <Campo rotulo="Adicionar produto" value={novo} onChangeText={setNovo} placeholder="Ex.: Banana"
          onSubmitEditing={function () { adicionar(novo); }} returnKeyType="done" />
        <Botao titulo="Adicionar à lista" onPress={function () { adicionar(novo); }} />
      </Painel>

      {sugestoes.length > 0 && <Painel>
        <Text style={estilos.etiqueta}>Acabando em casa</Text>
        {sugestoes.map(function sugestao(item) {
          return (
            <View key={item.id} style={css.linha}>
              <Text style={[estilos.texto, { flex: 1 }]}>{item.nome} <Text style={{ color: cores.muted }}>({item.quantidade} de {item.estoqueMinimo})</Text></Text>
              <Pressable accessibilityRole="button" onPress={function () { adicionar(item.nome); }} style={css.mais}>
                <Text style={css.textoMais}>+ Lista</Text>
              </Pressable>
            </View>
          );
        })}
      </Painel>}

      <Painel>
        <Text style={estilos.etiqueta}>Para comprar ({pendentes.length})</Text>
        {pendentes.length === 0 && <Text style={estilos.subtitulo}>Nada pendente.</Text>}
        {pendentes.map(function (compra) { return <LinhaCompra key={compra.id} compra={compra} aoTocar={alternarCompra} />; })}
      </Painel>

      {comprados.length > 0 && <Painel>
        <Text style={estilos.etiqueta}>Já comprados ({comprados.length})</Text>
        {comprados.map(function (compra) { return <LinhaCompra key={compra.id} compra={compra} aoTocar={alternarCompra} />; })}
        <Botao titulo="Limpar comprados" variante="secundario" onPress={limparComprados} />
      </Painel>}
    </Pagina>
  );
}

function LinhaCompra({ compra, aoTocar }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: compra.comprado }}
      onPress={function () { aoTocar(compra.id); }} style={css.linha}>
      <View style={[css.caixa, compra.comprado && css.caixaMarcada]}>
        {compra.comprado && <Text style={css.check}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[estilos.texto, compra.comprado && css.riscado]}>{compra.nome}</Text>
        <Text style={css.autor}>por {compra.adicionadoPor}</Text>
      </View>
    </Pressable>
  );
}

const css = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  caixa: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  caixaMarcada: { backgroundColor: cores.oliva, borderColor: cores.oliva },
  check: { color: '#FFFFFF', fontWeight: '800' },
  riscado: { textDecorationLine: 'line-through', color: cores.muted },
  autor: { color: cores.muted, fontSize: 12 },
  mais: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: cores.primariaClara },
  textoMais: { color: cores.primaria, fontWeight: '700', fontSize: 13 },
});
