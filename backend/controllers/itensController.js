// No Express 5, um erro em função async segue sozinho para o tratador de erros de app.js.
import pool from '../database/conexao.js';
import { idValido, validarItem } from '../utils/validacoes.js';

// O alias entrega estoqueMinimo no formato que o aplicativo usa (a coluna do banco é estoque_minimo).
const CAMPOS = 'id, nome, categoria, local, unidade, quantidade, estoque_minimo AS estoqueMinimo, validade';

async function buscarNoBanco(id) {
  const [linhas] = await pool.execute('SELECT ' + CAMPOS + ' FROM itens WHERE id = ?', [id]);
  return linhas.length > 0 ? linhas[0] : null;
}

// Os valores entram nos parâmetros "?": nada que vem do cliente é concatenado ao SQL.
function valoresDoItem(dados) {
  return [dados.nome.trim(), dados.categoria, dados.local, dados.unidade, dados.quantidade, dados.estoqueMinimo, dados.validade || null];
}

export async function listarItens(req, res) {
  const [itens] = await pool.execute('SELECT ' + CAMPOS + ' FROM itens ORDER BY nome');
  return res.status(200).json(itens);
}

export async function buscarItem(req, res) {
  if (!idValido(req.params.id)) { return res.status(400).json({ mensagem: 'ID do item inválido.' }); }

  const item = await buscarNoBanco(Number(req.params.id));
  if (!item) { return res.status(404).json({ mensagem: 'Item não encontrado.' }); }
  return res.status(200).json(item);
}

export async function criarItem(req, res) {
  const erro = validarItem(req.body);
  if (erro) { return res.status(400).json({ mensagem: erro }); }

  const [resultado] = await pool.execute(
    'INSERT INTO itens (nome, categoria, local, unidade, quantidade, estoque_minimo, validade) VALUES (?, ?, ?, ?, ?, ?, ?)',
    valoresDoItem(req.body),
  );
  const item = await buscarNoBanco(resultado.insertId);
  return res.status(201).json({ mensagem: 'Item cadastrado.', item });
}

export async function atualizarItem(req, res) {
  if (!idValido(req.params.id)) { return res.status(400).json({ mensagem: 'ID do item inválido.' }); }
  const erro = validarItem(req.body);
  if (erro) { return res.status(400).json({ mensagem: erro }); }

  const id = Number(req.params.id);
  await pool.execute(
    'UPDATE itens SET nome = ?, categoria = ?, local = ?, unidade = ?, quantidade = ?, estoque_minimo = ?, validade = ? WHERE id = ?',
    valoresDoItem(req.body).concat(id),
  );
  const item = await buscarNoBanco(id);
  if (!item) { return res.status(404).json({ mensagem: 'Item não encontrado.' }); }
  return res.status(200).json({ mensagem: 'Item atualizado.', item });
}

export async function excluirItem(req, res) {
  if (!idValido(req.params.id)) { return res.status(400).json({ mensagem: 'ID do item inválido.' }); }

  const [resultado] = await pool.execute('DELETE FROM itens WHERE id = ?', [Number(req.params.id)]);
  if (resultado.affectedRows === 0) { return res.status(404).json({ mensagem: 'Item não encontrado.' }); }
  return res.status(200).json({ mensagem: 'Item excluído.' });
}

// "Usei 1": subtrair no próprio UPDATE evita erro se duas pessoas usarem o mesmo item ao mesmo tempo.
export async function registrarConsumo(req, res) {
  if (!idValido(req.params.id)) { return res.status(400).json({ mensagem: 'ID do item inválido.' }); }

  const id = Number(req.params.id);
  const [resultado] = await pool.execute('UPDATE itens SET quantidade = quantidade - 1 WHERE id = ? AND quantidade > 0', [id]);
  const item = await buscarNoBanco(id);
  if (!item) { return res.status(404).json({ mensagem: 'Item não encontrado.' }); }
  if (resultado.affectedRows === 0) { return res.status(409).json({ mensagem: 'Este item já acabou.', item }); }
  return res.status(200).json({ mensagem: 'Consumo registrado.', item });
}
