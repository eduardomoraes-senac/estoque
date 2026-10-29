// Uma única tela serve para cadastrar (sem id) e editar (com id nos parâmetros da rota).
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Aviso, Botao, Campo, Opcao, Pagina, Painel, estilos } from '../components/ui.js';
import { CATEGORIAS, LOCAIS, UNIDADES, formatarData, lerDataDigitada } from '../data/estoque.js';

export default function FormularioItem({ navigation, route, itens, salvarItem }) {
  const idEdicao = route.params && route.params.id;
  const existente = idEdicao ? itens.find(function porId(item) { return item.id === idEdicao; }) : null;

  const [nome, setNome] = useState(existente ? existente.nome : '');
  const [categoria, setCategoria] = useState(existente ? existente.categoria : CATEGORIAS[0]);
  const [local, setLocal] = useState(existente ? existente.local : LOCAIS[0]);
  const [unidade, setUnidade] = useState(existente ? existente.unidade : UNIDADES[0]);
  const [quantidade, setQuantidade] = useState(existente ? String(existente.quantidade) : '1');
  const [minimo, setMinimo] = useState(existente ? String(existente.estoqueMinimo) : '1');
  const [validade, setValidade] = useState(existente && existente.validade ? formatarData(existente.validade) : '');
  const [erro, setErro] = useState('');

  function salvar() {
    const qtd = Number(quantidade);
    const min = Number(minimo);
    if (nome.trim().length < 2) { setErro('Informe o nome do item.'); return; }
    if (!Number.isInteger(qtd) || qtd < 0) { setErro('Quantidade deve ser um número inteiro (0 ou mais).'); return; }
    if (!Number.isInteger(min) || min < 0) { setErro('Estoque mínimo deve ser um número inteiro (0 ou mais).'); return; }
    const validadeISO = validade.trim() ? lerDataDigitada(validade) : '';
    if (validadeISO === null) { setErro('Validade inválida. Use o formato DD/MM/AAAA.'); return; }

    salvarItem({ id: existente ? existente.id : undefined, nome: nome.trim(), categoria, local, unidade, quantidade: qtd, estoqueMinimo: min, validade: validadeISO });
    navigation.goBack();
  }

  return (
    <Pagina>
      <Painel>
        <Aviso mensagem={erro} />
        <Campo rotulo="Nome do item" value={nome} onChangeText={setNome} placeholder="Ex.: Arroz integral" />
        <Grupo titulo="Categoria" opcoes={CATEGORIAS} valor={categoria} aoEscolher={setCategoria} />
        <Grupo titulo="Onde fica" opcoes={LOCAIS} valor={local} aoEscolher={setLocal} />
        <Grupo titulo="Unidade" opcoes={UNIDADES} valor={unidade} aoEscolher={setUnidade} />
        <Campo rotulo="Quantidade em casa" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" />
        <Campo rotulo="Estoque mínimo" value={minimo} onChangeText={setMinimo} keyboardType="number-pad"
          dica="Abaixo deste número o item aparece como estoque baixo." />
        <Campo rotulo="Validade (opcional)" value={validade} onChangeText={setValidade} placeholder="DD/MM/AAAA"
          keyboardType="numbers-and-punctuation" dica="Deixe em branco para itens sem validade." />
        <Botao titulo={existente ? 'Salvar alterações' : 'Cadastrar item'} onPress={salvar} />
        <Botao titulo="Cancelar" variante="secundario" onPress={function () { navigation.goBack(); }} />
      </Painel>
    </Pagina>
  );
}

function Grupo({ titulo, opcoes, valor, aoEscolher }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[estilos.texto, { fontWeight: '600' }]}>{titulo}</Text>
      <View style={estilos.linha}>
        {opcoes.map(function opcao(texto) {
          return <Opcao key={texto} texto={texto} ativo={valor === texto} onPress={function () { aoEscolher(texto); }} />;
        })}
      </View>
    </View>
  );
}
