// Teste de ponta a ponta: script SQL + API + MySQL de verdade. Execute com: npm run test:mysql
// Ele liga um mysqld temporário, com dados descartáveis e em outra porta.
// Não lê backend/.env nem toca no serviço MySQL instalado no computador.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { CATEGORIAS, LOCAIS, UNIDADES } from '../../data/estoque.js';

const padraoWindows = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe';
const binario = process.env.MYSQLD_PATH || (existsSync(padraoWindows) ? padraoWindows : '');
const pular = binario ? false : 'Defina MYSQLD_PATH com o caminho do binário mysqld.';
const raiz = fileURLToPath(new URL('../../', import.meta.url));

const itemValido = { nome: 'Azeite', categoria: 'Alimentos', local: 'Armário', unidade: 'garrafa', quantidade: 2, estoqueMinimo: 1, validade: '2027-03-01' };

let pasta;
let mysqld;
let servidor;
let pool;
let url;

function portaLivre() {
  return new Promise(function descobrir(resolve) {
    const teste = createServer();
    teste.listen(0, '127.0.0.1', function lerPorta() {
      const { port } = teste.address();
      teste.close(function liberar() { resolve(port); });
    });
  });
}

async function esperarBanco(porta) {
  for (let tentativa = 0; tentativa < 150; tentativa += 1) {
    try {
      const conexao = await mysql.createConnection({ host: '127.0.0.1', port: porta, user: 'root', password: '', connectTimeout: 500 });
      await conexao.end();
      return;
    } catch {
      await new Promise(function aguardar(resolve) { setTimeout(resolve, 200); });
    }
  }
  throw new Error('O mysqld temporário não ficou pronto a tempo.');
}

function criarBanco() {
  const resultado = spawnSync(process.execPath, ['backend/scripts/criarBanco.js'], { cwd: raiz, env: process.env, encoding: 'utf8' });
  assert.equal(resultado.status, 0, resultado.stderr);
}

// Faz a requisição e devolve o status junto com o JSON da resposta.
async function chamar(metodo, caminho, corpo) {
  const resposta = await fetch(url + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: resposta.status, dados: await resposta.json() };
}

before(async function prepararAmbiente() {
  if (pular) { return; }
  pasta = mkdtempSync(join(tmpdir(), 'despensa-mysql-'));
  const basedir = dirname(dirname(binario));
  const dados = join(pasta, 'dados');
  // --no-defaults precisa vir primeiro: assim o my.ini do serviço instalado não é lido.
  const inicial = spawnSync(binario, ['--no-defaults', '--initialize-insecure', '--basedir=' + basedir, '--datadir=' + dados, '--log-error=' + join(pasta, 'inicial.log')]);
  assert.equal(inicial.status, 0, 'Falha ao inicializar o mysqld temporário.');

  const portaBanco = await portaLivre();
  const argumentos = ['--no-defaults', '--basedir=' + basedir, '--datadir=' + dados, '--port=' + portaBanco, '--bind-address=127.0.0.1', '--mysqlx=OFF', '--log-error=' + join(pasta, 'mysql.log')];
  if (process.platform === 'win32') { argumentos.push('--no-monitor'); }
  mysqld = spawn(binario, argumentos, { stdio: 'ignore', windowsHide: true });
  await esperarBanco(portaBanco);

  // Variáveis já definidas têm prioridade sobre o .env; por isso o teste não usa o banco real.
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = String(portaBanco);
  process.env.DB_USER = 'root';
  process.env.DB_PASSWORD = '';
  process.env.DB_NAME = 'despensa_em_dia';
  criarBanco();

  // Os módulos da API só são carregados agora, depois de o ambiente estar definido.
  const { default: app } = await import('../app.js');
  pool = (await import('../database/conexao.js')).default;
  await new Promise(function ouvir(resolve) { servidor = app.listen(0, '127.0.0.1', resolve); });
  url = 'http://127.0.0.1:' + servidor.address().port;
});

after(async function encerrarAmbiente() {
  if (servidor) { await new Promise(function fechar(resolve) { servidor.close(resolve); }); }
  if (pool) {
    await pool.query('SHUTDOWN');
    await pool.end();
  }
  if (mysqld) {
    await new Promise(function aguardarFim(resolve) {
      if (mysqld.exitCode !== null) { resolve(); return; }
      mysqld.once('exit', resolve);
    });
  }
  if (pasta) { rmSync(pasta, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); }
});

test('o script SQL cria as tabelas e os exemplos, sem perder acentos', { skip: pular }, async function () {
  const [tabelas] = await pool.query('SHOW TABLES');
  assert.equal(tabelas.length, 3);
  const { status, dados } = await chamar('GET', '/itens');
  assert.equal(status, 200);
  assert.equal(dados.length, 11);
  assert.ok(dados.some(function (item) { return item.nome === 'Feijão carioca' && item.local === 'Armário'; }));
  assert.equal(dados.find(function (item) { return item.nome === 'Detergente'; }).validade, null);
  assert.match(dados.find(function (item) { return item.nome === 'Arroz'; }).validade, /^\d{4}-\d{2}-\d{2}$/);
  const [lista] = await pool.query('SELECT nome, adicionado_por FROM itens_lista_compras ORDER BY id');
  assert.deepEqual(lista[1], { nome: 'Café', adicionado_por: 1 });
});

test('executar o script SQL de novo não duplica nem apaga dados', { skip: pular }, async function () {
  const { dados: criado } = await chamar('POST', '/itens', itemValido);
  criarBanco();
  const { dados } = await chamar('GET', '/itens');
  assert.equal(dados.length, 12);
  await chamar('DELETE', '/itens/' + criado.item.id);
});

test('GET /status confirma a conexão com o banco', { skip: pular }, async function () {
  const { status, dados } = await chamar('GET', '/status');
  assert.equal(status, 200);
  assert.deepEqual(dados, { api: 'ok', banco: 'ok' });
});

test('POST grava no MySQL e a validade não muda de dia', { skip: pular }, async function () {
  const { status, dados } = await chamar('POST', '/itens', itemValido);
  assert.equal(status, 201);
  assert.equal(dados.item.validade, '2027-03-01');
  assert.equal(dados.item.estoqueMinimo, 1);
  const [linhas] = await pool.execute('SELECT nome, estoque_minimo, DATE_FORMAT(validade, "%Y-%m-%d") AS validade FROM itens WHERE id = ?', [dados.item.id]);
  assert.deepEqual(linhas[0], { nome: 'Azeite', estoque_minimo: 1, validade: '2027-03-01' });
  await chamar('DELETE', '/itens/' + dados.item.id);
});

test('POST aceita item sem validade e todas as opções do aplicativo', { skip: pular }, async function () {
  const criados = [];
  for (const categoria of CATEGORIAS) {
    for (const local of LOCAIS) {
      for (const unidade of UNIDADES) {
        const { status, dados } = await chamar('POST', '/itens', { ...itemValido, categoria, local, unidade, validade: '' });
        assert.equal(status, 201);
        assert.equal(dados.item.validade, null);
        criados.push(dados.item.id);
      }
    }
  }
  for (const id of criados) { await chamar('DELETE', '/itens/' + id); }
});

test('POST recusa dados inválidos sem gravar nada', { skip: pular }, async function () {
  const { dados: antes } = await chamar('GET', '/itens');
  const invalidos = [
    {},
    { ...itemValido, nome: ' ' },
    { ...itemValido, nome: 'x'.repeat(121) },
    { ...itemValido, categoria: 'Brinquedos' },
    { ...itemValido, local: 'Garagem' },
    { ...itemValido, unidade: 'tonelada' },
    { ...itemValido, quantidade: -1 },
    { ...itemValido, quantidade: 1.5 },
    { ...itemValido, quantidade: '2' },
    { ...itemValido, quantidade: 2147483648 },
    { ...itemValido, estoqueMinimo: null },
    { ...itemValido, validade: '2027-02-31' },
    { ...itemValido, validade: '01/03/2027' },
  ];
  for (const corpo of invalidos) {
    const { status, dados } = await chamar('POST', '/itens', corpo);
    assert.equal(status, 400, JSON.stringify(corpo));
    assert.ok(dados.mensagem);
  }
  const { dados: depois } = await chamar('GET', '/itens');
  assert.equal(depois.length, antes.length);
});

test('texto malicioso é gravado como texto, sem alterar o SQL', { skip: pular }, async function () {
  const nome = "x'); DROP TABLE itens; --";
  const { status, dados } = await chamar('POST', '/itens', { ...itemValido, nome });
  assert.equal(status, 201);
  assert.equal(dados.item.nome, nome);
  await chamar('DELETE', '/itens/' + dados.item.id);
});

test('GET por id responde 200, 404 e 400', { skip: pular }, async function () {
  assert.equal((await chamar('GET', '/itens/1')).status, 200);
  assert.equal((await chamar('GET', '/itens/99999')).status, 404);
  assert.equal((await chamar('GET', '/itens/abc')).status, 400);
  assert.equal((await chamar('GET', '/itens/0')).status, 400);
});

test('PUT atualiza o item e responde 404 se ele não existir', { skip: pular }, async function () {
  const { dados: criado } = await chamar('POST', '/itens', itemValido);
  const caminho = '/itens/' + criado.item.id;
  const { status, dados } = await chamar('PUT', caminho, { ...itemValido, nome: '  Azeite extra  ', quantidade: 9, validade: null });
  assert.equal(status, 200);
  assert.equal(dados.item.nome, 'Azeite extra');
  assert.equal(dados.item.quantidade, 9);
  assert.equal(dados.item.validade, null);
  // Enviar os mesmos dados de novo não é erro.
  assert.equal((await chamar('PUT', caminho, { ...itemValido, nome: 'Azeite extra', quantidade: 9, validade: null })).status, 200);
  assert.equal((await chamar('PUT', caminho, { ...itemValido, quantidade: -5 })).status, 400);
  assert.equal((await chamar('PUT', '/itens/99999', itemValido)).status, 404);
  await chamar('DELETE', caminho);
});

test('consumo desconta 1 e não deixa a quantidade ficar negativa', { skip: pular }, async function () {
  const { dados: criado } = await chamar('POST', '/itens', { ...itemValido, quantidade: 1 });
  const caminho = '/itens/' + criado.item.id + '/consumo';
  const primeiro = await chamar('PATCH', caminho);
  assert.equal(primeiro.status, 200);
  assert.equal(primeiro.dados.item.quantidade, 0);
  const segundo = await chamar('PATCH', caminho);
  assert.equal(segundo.status, 409);
  assert.equal(segundo.dados.item.quantidade, 0);
  assert.equal((await chamar('PATCH', '/itens/99999/consumo')).status, 404);
  await chamar('DELETE', '/itens/' + criado.item.id);
});

test('DELETE remove o item e depois responde 404', { skip: pular }, async function () {
  const { dados: criado } = await chamar('POST', '/itens', itemValido);
  const caminho = '/itens/' + criado.item.id;
  assert.equal((await chamar('DELETE', caminho)).status, 200);
  assert.equal((await chamar('GET', caminho)).status, 404);
  assert.equal((await chamar('DELETE', caminho)).status, 404);
});

test('JSON inválido e rota inexistente recebem mensagens claras', { skip: pular }, async function () {
  const resposta = await fetch(url + '/itens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' });
  assert.equal(resposta.status, 400);
  assert.equal((await chamar('GET', '/nao-existe')).status, 404);
});
