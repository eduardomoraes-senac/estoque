import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Pagina, Painel, Selo, cores, estilos } from '../components/ui.js';
import { formatarData, situacaoItem } from '../data/estoque.js';

export default function DetalhesItem({ navigation, route, usuario, itens, registrarConsumo, excluirItem, adicionarCompra }) {
  const [mensagem, setMensagem] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  // O id chega pelos parâmetros da rota: navigation.navigate('DetalhesItem', { id }).
  const item = itens.find(function porId(registro) { return registro.id === route.params.id; });

  if (!item) {
    return <Pagina><Painel><Text style={estilos.texto}>Este item não existe mais.</Text>
      <Botao titulo="Voltar" onPress={function () { navigation.goBack(); }} /></Painel></Pagina>;
  }

  const situacao = situacaoItem(item);
  const ehResponsavel = usuario.nivel === 'responsavel';

  function usarUm() {
    registrarConsumo(item.id);
    setMensagem(item.quantidade - 1 <= 0 ? 'Último item usado! Que tal colocar na lista de compras?' : 'Consumo registrado.');
  }

  function colocarNaLista() {
    setMensagem(adicionarCompra(item.nome) ? 'Adicionado à lista de compras.' : 'Esse item já está na lista de compras.');
  }

  function excluir() {
    excluirItem(item.id);
    navigation.goBack();
  }

  return (
    <Pagina>
      <View style={{ gap: 8 }}>
        <Text style={estilos.etiqueta}>{item.categoria}</Text>
        <Text style={estilos.titulo}>{item.nome}</Text>
        <Selo texto={situacao.texto} tom={situacao.tom} />
      </View>

      <Aviso mensagem={mensagem} tipo="sucesso" />

      <Painel>
        <Linha rotulo="Quantidade" valor={item.quantidade + ' ' + item.unidade} />
        <Linha rotulo="Estoque mínimo" valor={item.estoqueMinimo + ' ' + item.unidade} />
        <Linha rotulo="Local" valor={item.local} />
        <Linha rotulo="Validade" valor={formatarData(item.validade)} />
      </Painel>

      <Botao titulo="Usei 1" onPress={usarUm} disabled={item.quantidade === 0} />
      <Botao titulo="Colocar na lista de compras" variante="secundario" onPress={colocarNaLista} />

      {ehResponsavel && <Painel>
        <Text style={estilos.etiqueta}>Área do responsável</Text>
        <Botao titulo="Editar item" variante="secundario" onPress={function () { navigation.navigate('FormularioItem', { id: item.id }); }} />
        {/* Confirmação na própria tela: Alert.alert não funciona igual no Expo Web. */}
        {confirmandoExclusao ? <>
          <Text style={estilos.texto}>Excluir "{item.nome}" do estoque?</Text>
          <Botao titulo="Sim, excluir" variante="perigo" onPress={excluir} />
          <Botao titulo="Cancelar" variante="secundario" onPress={function () { setConfirmandoExclusao(false); }} />
        </> : <Botao titulo="Excluir item" variante="perigo" onPress={function () { setConfirmandoExclusao(true); }} />}
      </Painel>}
    </Pagina>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <View style={css.linha}>
      <Text style={css.rotulo}>{rotulo}</Text>
      <Text style={css.valor}>{valor}</Text>
    </View>
  );
}

const css = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  rotulo: { color: cores.muted, fontSize: 15 },
  valor: { color: cores.texto, fontSize: 15, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
});
