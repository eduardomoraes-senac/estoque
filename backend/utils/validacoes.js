// O aplicativo já valida os formulários, mas a API precisa validar de novo:
// qualquer programa pode chamar a API diretamente, sem passar pelo aplicativo.

// Mesmas opções das colunas ENUM do banco e de data/estoque.js no aplicativo.
const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene'];
const LOCAIS = ['Armário', 'Geladeira', 'Freezer', 'Lavanderia', 'Banheiro'];
const UNIDADES = ['un', 'pacote', 'caixa', 'kg', 'litro', 'garrafa'];
const MAIOR_INT = 2147483647; // limite da coluna INT do MySQL

export function idValido(id) {
  return /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= MAIOR_INT;
}

function quantidadeValida(valor) {
  return Number.isInteger(valor) && valor >= 0 && valor <= MAIOR_INT;
}

// Validade vazia significa "sem validade". Confere também se a data existe (31/02 não existe).
function validadeValida(validade) {
  if (validade === undefined || validade === null || validade === '') { return true; }
  if (typeof validade !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(validade)) { return false; }
  const data = new Date(validade + 'T00:00:00Z');
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === validade && data.getUTCFullYear() >= 1000;
}

// Devolve a mensagem do primeiro problema encontrado, ou null se os dados estiverem corretos.
export function validarItem(dados) {
  if (typeof dados.nome !== 'string' || dados.nome.trim().length < 2 || dados.nome.trim().length > 120) {
    return 'Informe um nome de item com 2 a 120 caracteres.';
  }
  if (!CATEGORIAS.includes(dados.categoria)) { return 'Categoria inválida.'; }
  if (!LOCAIS.includes(dados.local)) { return 'Local inválido.'; }
  if (!UNIDADES.includes(dados.unidade)) { return 'Unidade inválida.'; }
  if (!quantidadeValida(dados.quantidade)) { return 'Quantidade deve ser um número inteiro (0 ou mais).'; }
  if (!quantidadeValida(dados.estoqueMinimo)) { return 'Estoque mínimo deve ser um número inteiro (0 ou mais).'; }
  if (!validadeValida(dados.validade)) { return 'Validade inválida. Use o formato AAAA-MM-DD.'; }
  return null;
}
