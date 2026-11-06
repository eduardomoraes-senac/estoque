import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import CartaoItem from '../components/CartaoItem.js';
import { Botao, Campo, EstadoDados, Opcao, Pagina, estilos } from '../components/ui.js';
import { CATEGORIAS } from '../data/estoque.js';

export default function Estoque({ navigation, usuario, itens, carregandoItens, erroItens, recarregarItens }) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const filtrados = itens
    .filter(function porCategoria(item) { return categoria === 'Todas' || item.categoria === categoria; })
    .filter(function porNome(item) { return item.nome.toLowerCase().includes(busca.trim().toLowerCase()); })
    .sort(function porNomeAZ(a, b) { return a.nome.localeCompare(b.nome); });
  // Sem dados e com carregamento ou erro, "nenhum item" seria uma informação falsa.
  const semDados = itens.length === 0 && (carregandoItens || erroItens !== '');

  return (
    <Pagina>
      {usuario.nivel === 'responsavel' &&
        <Botao titulo="+ Novo item" onPress={function () { navigation.navigate('FormularioItem'); }} />}

      <Campo rotulo="Buscar" value={busca} onChangeText={setBusca} placeholder="Ex.: arroz, leite…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {['Todas'].concat(CATEGORIAS).map(function chip(nome) {
          return <Opcao key={nome} texto={nome} ativo={categoria === nome} onPress={function () { setCategoria(nome); }} />;
        })}
      </ScrollView>

      <EstadoDados carregando={semDados && carregandoItens} erro={erroItens} aoTentarNovamente={recarregarItens} />

      {!semDados && <>
        <Text style={estilos.subtitulo}>{filtrados.length} {filtrados.length === 1 ? 'item' : 'itens'}</Text>

        {filtrados.length === 0
          ? <Text style={estilos.texto}>Nenhum item encontrado.</Text>
          : filtrados.map(function cartao(item) {
            return <CartaoItem key={item.id} item={item} onPress={function () { navigation.navigate('DetalhesItem', { id: item.id }); }} />;
          })}

        {/* O estoque é da família: outra pessoa pode ter mudado algo pelo celular dela. */}
        <Botao titulo={carregandoItens ? 'Atualizando…' : 'Atualizar estoque'} variante="secundario"
          disabled={carregandoItens} onPress={recarregarItens} />
      </>}
    </Pagina>
  );
}
