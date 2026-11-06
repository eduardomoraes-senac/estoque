// Cria o banco, as tabelas e os dados de exemplo a partir de database/despensa_em_dia.sql.
// É uma alternativa a abrir o arquivo no MySQL Workbench: npm run db:criar
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { validarBanco } from '../config/ambiente.js';

async function criarBanco() {
  validarBanco();
  const sql = await readFile(new URL('../../database/despensa_em_dia.sql', import.meta.url), 'utf8');
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    // O arquivo tem vários comandos. Esta opção fica só neste script, nunca no pool da API.
    multipleStatements: true,
  });
  try {
    await conexao.query(sql);
    console.log('Banco despensa_em_dia pronto.');
  } finally {
    await conexao.end();
  }
}

criarBanco().catch(function informarErro(erro) {
  console.error('Não foi possível criar o banco: ' + erro.message);
  process.exitCode = 1;
});
