import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import CartaoItem from '../components/CartaoItem.js';
import { Botao, Campo, Opcao, Pagina, estilos } from '../components/ui.js';
import { CATEGORIAS } from '../data/estoque.js';

export default function Estoque({ navigation, usuario, itens }) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const filtrados = itens
    .filter(function porCategoria(item) { return categoria === 'Todas' || item.categoria === categoria; })
    .filter(function porNome(item) { return item.nome.toLowerCase().includes(busca.trim().toLowerCase()); })
    .sort(function porNomeAZ(a, b) { return a.nome.localeCompare(b.nome); });

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

      <Text style={estilos.subtitulo}>{filtrados.length} {filtrados.length === 1 ? 'item' : 'itens'}</Text>

      {filtrados.length === 0
        ? <Text style={estilos.texto}>Nenhum item encontrado.</Text>
        : filtrados.map(function cartao(item) {
          return <CartaoItem key={item.id} item={item} onPress={function () { navigation.navigate('DetalhesItem', { id: item.id }); }} />;
        })}
    </Pagina>
  );
}
