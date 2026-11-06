// Ponto de entrada da API: confere a configuração e o banco e só então aceita requisições.
import app from './app.js';
import { validarBanco } from './config/ambiente.js';
import pool from './database/conexao.js';

// Traduz os erros mais comuns de conexão para uma orientação direta.
function explicarErroBanco(erro) {
  const endereco = process.env.DB_HOST + ':' + (process.env.DB_PORT || 3306);
  if (erro.code === 'ECONNREFUSED') { return 'MySQL não encontrado em ' + endereco + '. Confira se o serviço está ligado e a porta DB_PORT em backend/.env.'; }
  if (erro.code === 'ER_ACCESS_DENIED_ERROR') { return 'O MySQL recusou o acesso. Confira DB_USER e DB_PASSWORD em backend/.env.'; }
  if (erro.code === 'ER_BAD_DB_ERROR') { return 'O banco ' + process.env.DB_NAME + ' ainda não existe. Execute: npm run db:criar'; }
  return 'Não foi possível acessar o MySQL: ' + erro.message;
}

async function iniciar() {
  validarBanco();
  try {
    await pool.query('SELECT 1');
  } catch (erro) {
    throw new Error(explicarErroBanco(erro));
  }

  const porta = Number(process.env.PORT || 3000);
  // 0.0.0.0 aceita conexões da rede local, necessárias para testar pelo celular.
  const servidor = app.listen(porta, '0.0.0.0', function avisarInicio() {
    console.log('API executando em http://localhost:' + porta);
  });
  servidor.on('error', function informarErroServidor(erro) {
    console.error(erro.code === 'EADDRINUSE' ? 'A porta ' + porta + ' já está em uso.' : 'Não foi possível iniciar a API.');
    process.exit(1);
  });
}

iniciar().catch(function informarErro(erro) {
  console.error(erro.message);
  process.exit(1);
});
