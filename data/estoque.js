// Opções e regras do estoque, mais os dados que ainda ficam em memória.
// Os itens já vêm da API (MySQL). Contas e lista de compras passam para a API na Entrega 3.

// Mesmas opções das colunas ENUM do banco e de backend/utils/validacoes.js.
export const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene'];
export const LOCAIS = ['Armário', 'Geladeira', 'Freezer', 'Lavanderia', 'Banheiro'];
export const UNIDADES = ['un', 'pacote', 'caixa', 'kg', 'litro', 'garrafa'];
export const DIAS_ALERTA_VALIDADE = 7;

function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return data.getFullYear() + '-' + mes + '-' + dia;
}

// Contas de teste. A senha não é guardada aqui: na Entrega 3 o login será validado pela API com hash.
export const membrosIniciais = [
  { id: 1, nome: 'Ana Souza', email: 'ana@familia.com', nivel: 'responsavel' },
  { id: 2, nome: 'Pedro Souza', email: 'pedro@familia.com', nivel: 'membro' },
  { id: 3, nome: 'Lia Souza', email: 'lia@familia.com', nivel: 'membro' },
];

export const listaComprasInicial = [
  { id: 1, nome: 'Banana', comprado: false, adicionadoPor: 'Pedro Souza' },
  { id: 2, nome: 'Café', comprado: true, adicionadoPor: 'Ana Souza' },
];

// Quantos dias faltam para a validade. Retorna null quando o item não tem validade.
export function diasParaVencer(validade) {
  if (!validade) { return null; }
  const hoje = new Date(paraISO(new Date()) + 'T00:00:00');
  const alvo = new Date(validade + 'T00:00:00');
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export function estaAbaixoDoMinimo(item) {
  return item.quantidade < item.estoqueMinimo;
}

// Resume a situação do item para mostrar um selo colorido na tela.
export function situacaoItem(item) {
  const dias = diasParaVencer(item.validade);
  if (dias !== null && dias < 0) { return { tom: 'perigo', texto: 'Vencido' }; }
  if (dias !== null && dias <= DIAS_ALERTA_VALIDADE) {
    return { tom: 'alerta', texto: dias === 0 ? 'Vence hoje' : 'Vence em ' + dias + (dias === 1 ? ' dia' : ' dias') };
  }
  if (item.quantidade === 0) { return { tom: 'perigo', texto: 'Acabou' }; }
  if (estaAbaixoDoMinimo(item)) { return { tom: 'alerta', texto: 'Estoque baixo' }; }
  return { tom: 'ok', texto: 'Em dia' };
}

// Converte "AAAA-MM-DD" para "DD/MM/AAAA" (exibição).
export function formatarData(validade) {
  if (!validade) { return 'Sem validade'; }
  const [ano, mes, dia] = validade.split('-');
  return dia + '/' + mes + '/' + ano;
}

// Converte "DD/MM/AAAA" digitado pelo usuário para "AAAA-MM-DD". Retorna null se for inválida.
export function lerDataDigitada(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) { return null; }
  const iso = partes[3] + '-' + partes[2] + '-' + partes[1];
  const data = new Date(iso + 'T00:00:00');
  // Confere se a data existe de verdade (ex.: 31/02 é inválida).
  if (Number.isNaN(data.getTime()) || paraISO(data) !== iso) { return null; }
  return iso;
}

export function proximoId(lista) {
  return lista.reduce(function maior(maximo, registro) { return Math.max(maximo, registro.id); }, 0) + 1;
}
