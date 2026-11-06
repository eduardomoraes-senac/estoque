// Toda a comunicação com a API fica aqui. fetch() já vem pronto: não precisamos de Axios.

// Endereço da API. No computador, localhost funciona. No celular, localhost é o próprio celular:
// nesse caso, defina EXPO_PUBLIC_API_URL em um arquivo .env (veja o .env.example).
// O Expo só substitui essa variável quando ela é escrita exatamente assim: process.env.EXPO_PUBLIC_API_URL.
export const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const TEMPO_LIMITE_MS = 10000;

// Faz a requisição e devolve o JSON. Em caso de problema, lança um erro com mensagem pronta para a tela.
async function requisicao(caminho, metodo = 'GET', corpo = undefined) {
  // Sem tempo limite, um endereço errado deixaria a tela carregando por muito tempo.
  const controle = new AbortController();
  const temporizador = setTimeout(function cancelar() { controle.abort(); }, TEMPO_LIMITE_MS);

  let resposta;
  let dados;
  try {
    resposta = await fetch(API + caminho, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controle.signal,
    });
    dados = await resposta.json();
  } catch {
    throw new Error('Não foi possível falar com a API em ' + API + '. Confira se ela está ligada e na mesma rede.');
  } finally {
    clearTimeout(temporizador);
  }

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Não foi possível concluir a operação.');
  }
  return dados;
}

// Cada função corresponde a uma rota de backend/routes/itensRoutes.js.
export function listarItens() {
  return requisicao('/itens');
}

export async function cadastrarItem(item) {
  const dados = await requisicao('/itens', 'POST', item);
  return dados.item;
}

export async function atualizarItem(id, item) {
  const dados = await requisicao('/itens/' + id, 'PUT', item);
  return dados.item;
}

export function apagarItem(id) {
  return requisicao('/itens/' + id, 'DELETE');
}

export async function consumirItem(id) {
  const dados = await requisicao('/itens/' + id + '/consumo', 'PATCH');
  return dados.item;
}
