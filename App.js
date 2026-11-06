// App controla a sessão e os dados. As telas recebem tudo por Props (sem Redux ou Context).
// Entrega 2: os itens vêm da API (MySQL). Login, família e lista de compras continuam em memória até a Entrega 3.
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/Login.js';
import CadastroUsuario from './screens/CadastroUsuario.js';
import Inicio from './screens/Inicio.js';
import Estoque from './screens/Estoque.js';
import DetalhesItem from './screens/DetalhesItem.js';
import FormularioItem from './screens/FormularioItem.js';
import ListaCompras from './screens/ListaCompras.js';
import Familia from './screens/Familia.js';
import { listaComprasInicial, membrosIniciais, proximoId } from './data/estoque.js';
import { apagarItem, atualizarItem, cadastrarItem, consumirItem, listarItens } from './services/api.js';
import { cores } from './components/ui.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [membros, setMembros] = useState(membrosIniciais);
  const [itens, setItens] = useState([]);
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [erroItens, setErroItens] = useState('');
  const [listaCompras, setListaCompras] = useState(listaComprasInicial);
  const [aviso, setAviso] = useState('');

  // ---------- Sessão (simulada nesta entrega) ----------
  function entrar(email) {
    const encontrado = membros.find(function porEmail(membro) { return membro.email === email.trim().toLowerCase(); });
    if (!encontrado) { return false; }
    setAviso('');
    setUsuario(encontrado);
    carregarItens();
    return true;
  }

  function cadastrar(nome, email) {
    const emailNormalizado = email.trim().toLowerCase();
    if (membros.some(function existe(membro) { return membro.email === emailNormalizado; })) { return false; }
    // Regra do projeto: o cadastro público sempre cria um "membro".
    setMembros(membros.concat({ id: proximoId(membros), nome: nome.trim(), email: emailNormalizado, nivel: 'membro' }));
    return true;
  }

  function sair() {
    setUsuario(null);
    setItens([]);
    setAviso('Você saiu da sua conta.');
  }

  // ---------- Itens do estoque (entidade principal, salvos no MySQL pela API) ----------
  async function carregarItens() {
    setCarregandoItens(true);
    setErroItens('');
    try {
      setItens(await listarItens());
    } catch (erro) {
      setErroItens(erro.message);
    } finally {
      setCarregandoItens(false);
    }
  }

  // Troca na lista apenas o item que a API acabou de devolver.
  function substituirItem(atualizado) {
    setItens(function trocar(atuais) {
      return atuais.map(function atualizar(item) { return item.id === atualizado.id ? atualizado : item; });
    });
  }

  // As funções abaixo só mudam a tela depois que a API confirma.
  // Se a API recusar, o erro segue para a tela que chamou, que mostra a mensagem.
  async function salvarItem(dados) {
    if (dados.id) {
      substituirItem(await atualizarItem(dados.id, dados));
    } else {
      const criado = await cadastrarItem(dados);
      setItens(function incluir(atuais) { return atuais.concat(criado); });
    }
  }

  async function excluirItem(id) {
    await apagarItem(id);
    setItens(function remover(atuais) {
      return atuais.filter(function manter(item) { return item.id !== id; });
    });
  }

  async function registrarConsumo(id) {
    const atualizado = await consumirItem(id);
    substituirItem(atualizado);
    return atualizado;
  }

  // ---------- Lista de compras ----------
  function adicionarCompra(nome) {
    const jaExiste = listaCompras.some(function igual(compra) {
      return !compra.comprado && compra.nome.toLowerCase() === nome.trim().toLowerCase();
    });
    if (jaExiste) { return false; }
    setListaCompras(listaCompras.concat({ id: proximoId(listaCompras), nome: nome.trim(), comprado: false, adicionadoPor: usuario.nome }));
    return true;
  }

  function alternarCompra(id) {
    setListaCompras(listaCompras.map(function alternar(compra) {
      return compra.id === id ? { ...compra, comprado: !compra.comprado } : compra;
    }));
  }

  function limparComprados() {
    setListaCompras(listaCompras.filter(function pendente(compra) { return !compra.comprado; }));
  }

  // ---------- Família ----------
  function alterarNivel(id, nivel) {
    setMembros(membros.map(function trocar(membro) { return membro.id === id ? { ...membro, nivel } : membro; }));
  }

  const ehResponsavel = usuario !== null && usuario.nivel === 'responsavel';

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator id="Despensa" screenOptions={{
          headerStyle: { backgroundColor: cores.fundo }, headerTintColor: cores.texto,
          headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: cores.fundo },
          headerShadowVisible: false,
        }}>
          {/* Trocar o usuário troca o grupo inteiro: o botão Voltar não reabre uma sessão encerrada. */}
          {usuario === null ? (
            <Stack.Group navigationKey="publico">
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {function telaLogin(props) { return <Login {...props} aoEntrar={entrar} aviso={aviso} />; }}
              </Stack.Screen>
              <Stack.Screen name="CadastroUsuario" options={{ title: 'Criar conta' }}>
                {function telaCadastro(props) { return <CadastroUsuario {...props} aoCadastrar={cadastrar} />; }}
              </Stack.Screen>
            </Stack.Group>
          ) : (
            <Stack.Group navigationKey={'sessao-' + usuario.id}>
              <Stack.Screen name="Inicio" options={{ title: 'Despensa em Dia' }}>
                {function telaInicio(props) {
                  return <Inicio {...props} usuario={usuario} itens={itens} listaCompras={listaCompras} sair={sair}
                    carregandoItens={carregandoItens} erroItens={erroItens} recarregarItens={carregarItens} />;
                }}
              </Stack.Screen>
              <Stack.Screen name="Estoque" options={{ title: 'Estoque' }}>
                {function telaEstoque(props) {
                  return <Estoque {...props} usuario={usuario} itens={itens}
                    carregandoItens={carregandoItens} erroItens={erroItens} recarregarItens={carregarItens} />;
                }}
              </Stack.Screen>
              <Stack.Screen name="DetalhesItem" options={{ title: 'Detalhes do item' }}>
                {function telaDetalhes(props) {
                  return <DetalhesItem {...props} usuario={usuario} itens={itens}
                    registrarConsumo={registrarConsumo} excluirItem={excluirItem} adicionarCompra={adicionarCompra} />;
                }}
              </Stack.Screen>
              <Stack.Screen name="ListaCompras" options={{ title: 'Lista de compras' }}>
                {function telaLista(props) {
                  return <ListaCompras {...props} itens={itens} listaCompras={listaCompras}
                    adicionarCompra={adicionarCompra} alternarCompra={alternarCompra} limparComprados={limparComprados} />;
                }}
              </Stack.Screen>
              {/* Telas exclusivas do responsável. Na Entrega 3 o back-end também vai bloquear essas ações. */}
              {ehResponsavel && <Stack.Group>
                <Stack.Screen name="FormularioItem" options={function opcoesFormulario({ route }) {
                  // Só o botão "Editar" envia { id }; o "in" confere se o parâmetro existe.
                  const editando = route.params !== undefined && 'id' in route.params;
                  return { title: editando ? 'Editar item' : 'Novo item' };
                }}>
                  {function telaFormulario(props) { return <FormularioItem {...props} itens={itens} salvarItem={salvarItem} />; }}
                </Stack.Screen>
                <Stack.Screen name="Familia" options={{ title: 'Família' }}>
                  {function telaFamilia(props) {
                    return <Familia {...props} usuario={usuario} membros={membros} alterarNivel={alterarNivel} />;
                  }}
                </Stack.Screen>
              </Stack.Group>}
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
