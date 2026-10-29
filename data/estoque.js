// Dados de exemplo e funções auxiliares do estoque.
// Na Entrega 1 os dados ficam em memória. Na Entrega 2 eles virão da API (MySQL) via fetch().

export const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene'];
export const LOCAIS = ['Armário', 'Geladeira', 'Freezer', 'Lavanderia', 'Banheiro'];
export const UNIDADES = ['un', 'pacote', 'caixa', 'kg', 'litro', 'garrafa'];
export const DIAS_ALERTA_VALIDADE = 7;

// Gera uma data "AAAA-MM-DD" a partir de hoje, para que os exemplos sempre tenham alertas.
function diasAPartirDeHoje(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

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

export const itensIniciais = [
  { id: 1, nome: 'Leite integral', categoria: 'Bebidas', local: 'Geladeira', quantidade: 2, unidade: 'litro', estoqueMinimo: 3, validade: diasAPartirDeHoje(3) },
  { id: 2, nome: 'Arroz', categoria: 'Alimentos', local: 'Armário', quantidade: 4, unidade: 'kg', estoqueMinimo: 2, validade: diasAPartirDeHoje(180) },
  { id: 3, nome: 'Feijão carioca', categoria: 'Alimentos', local: 'Armário', quantidade: 1, unidade: 'kg', estoqueMinimo: 2, validade: diasAPartirDeHoje(120) },
  { id: 4, nome: 'Iogurte natural', categoria: 'Alimentos', local: 'Geladeira', quantidade: 4, unidade: 'un', estoqueMinimo: 2, validade: diasAPartirDeHoje(-1) },
  { id: 5, nome: 'Peito de frango', categoria: 'Alimentos', local: 'Freezer', quantidade: 2, unidade: 'kg', estoqueMinimo: 1, validade: diasAPartirDeHoje(40) },
  { id: 6, nome: 'Pão de forma', categoria: 'Alimentos', local: 'Armário', quantidade: 1, unidade: 'pacote', estoqueMinimo: 1, validade: diasAPartirDeHoje(5) },
  { id: 7, nome: 'Detergente', categoria: 'Limpeza', local: 'Lavanderia', quantidade: 1, unidade: 'un', estoqueMinimo: 2, validade: '' },
  { id: 8, nome: 'Sabão em pó', categoria: 'Limpeza', local: 'Lavanderia', quantidade: 1, unidade: 'caixa', estoqueMinimo: 1, validade: '' },
  { id: 9, nome: 'Papel higiênico', categoria: 'Higiene', local: 'Banheiro', quantidade: 12, unidade: 'un', estoqueMinimo: 8, validade: '' },
  { id: 10, nome: 'Creme dental', categoria: 'Higiene', local: 'Banheiro', quantidade: 0, unidade: 'un', estoqueMinimo: 1, validade: diasAPartirDeHoje(300) },
  { id: 11, nome: 'Suco de uva', categoria: 'Bebidas', local: 'Armário', quantidade: 3, unidade: 'garrafa', estoqueMinimo: 1, validade: diasAPartirDeHoje(90) },
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
