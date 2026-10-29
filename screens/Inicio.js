import { StyleSheet, Text, View } from 'react-native';
import CartaoItem from '../components/CartaoItem.js';
import { Botao, Pagina, Painel, Selo, cores, estilos } from '../components/ui.js';
import { DIAS_ALERTA_VALIDADE, diasParaVencer, estaAbaixoDoMinimo } from '../data/estoque.js';

export default function Inicio({ navigation, usuario, itens, listaCompras, sair }) {
  const vencendo = itens.filter(function validadeProxima(item) {
    const dias = diasParaVencer(item.validade);
    return dias !== null && dias <= DIAS_ALERTA_VALIDADE;
  });
  const baixos = itens.filter(estaAbaixoDoMinimo);
  const pendentes = listaCompras.filter(function naoComprado(compra) { return !compra.comprado; });

  // "Atenção agora": itens vencendo primeiro, depois os que estão acabando (sem repetir).
  const atencao = vencendo.concat(baixos.filter(function naoRepetido(item) { return !vencendo.includes(item); })).slice(0, 4);
  const ehResponsavel = usuario.nivel === 'responsavel';

  function abrirItem(id) { navigation.navigate('DetalhesItem', { id }); }

  return (
    <Pagina>
      <View style={{ gap: 6 }}>
        <Text style={estilos.titulo}>Olá, {usuario.nome.split(' ')[0]}!</Text>
        <View style={estilos.linha}>
          <Selo texto={ehResponsavel ? 'Responsável' : 'Membro'} tom={ehResponsavel ? 'ok' : 'neutro'} />
          <Text style={estilos.subtitulo}>Veja como está a casa hoje.</Text>
        </View>
      </View>

      <View style={css.resumo}>
        <Resumo numero={vencendo.length} rotulo="vencidos ou vencendo" cor={cores.vermelho} />
        <Resumo numero={baixos.length} rotulo="com estoque baixo" cor={cores.ambar} />
        <Resumo numero={pendentes.length} rotulo="na lista de compras" cor={cores.oliva} />
      </View>

      <Painel>
        <Text style={estilos.etiqueta}>Atenção agora</Text>
        {atencao.length === 0
          ? <Text style={estilos.subtitulo}>Tudo em dia por aqui. 🎉</Text>
          : atencao.map(function cartao(item) {
            return <CartaoItem key={item.id} item={item} onPress={function () { abrirItem(item.id); }} />;
          })}
      </Painel>

      <Botao titulo="Ver estoque completo" onPress={function () { navigation.navigate('Estoque'); }} />
      <Botao titulo="Lista de compras" variante="secundario" onPress={function () { navigation.navigate('ListaCompras'); }} />

      {/* Esconder o botão é só visual. Na Entrega 3 a API vai validar o nível pelo JWT. */}
      {ehResponsavel && <Painel>
        <Text style={estilos.etiqueta}>Área do responsável</Text>
        <Botao titulo="+ Cadastrar item" variante="secundario" onPress={function () { navigation.navigate('FormularioItem'); }} />
        <Botao titulo="Gerenciar família" variante="secundario" onPress={function () { navigation.navigate('Familia'); }} />
      </Painel>}

      <Botao titulo="Sair" variante="perigo" onPress={sair} />
    </Pagina>
  );
}

function Resumo({ numero, rotulo, cor }) {
  return (
    <View style={css.cartaoResumo}>
      <Text style={[css.numero, { color: cor }]}>{numero}</Text>
      <Text style={css.rotulo}>{rotulo}</Text>
    </View>
  );
}

const css = StyleSheet.create({
  resumo: { flexDirection: 'row', gap: 10 },
  cartaoResumo: { flex: 1, backgroundColor: cores.papel, borderWidth: 1, borderColor: cores.borda, borderRadius: 16, padding: 12, gap: 2 },
  numero: { fontSize: 28, fontWeight: '800' },
  rotulo: { color: cores.muted, fontSize: 12, lineHeight: 16 },
});
