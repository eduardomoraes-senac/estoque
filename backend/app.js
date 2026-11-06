// Monta a API: configurações gerais, rotas e tratamento de erros.
import express from 'express';
import cors from 'cors';
import pool from './database/conexao.js';
import itensRoutes from './routes/itensRoutes.js';

const app = express();
app.disable('x-powered-by');
// O CORS permite que o Expo Web, em outra porta, chame a API pelo navegador.
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(function garantirCorpo(req, res, next) {
  // Sem JSON no corpo, os controllers continuam recebendo um objeto para validar.
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    req.body = {};
  }
  next();
});

app.get('/', function apresentarApi(req, res) {
  res.json({ mensagem: 'API Despensa em Dia', rotas: ['/status', '/itens'] });
});

// Confere se a API está conseguindo falar com o MySQL.
app.get('/status', async function verificarStatus(req, res) {
  await pool.query('SELECT 1');
  res.json({ api: 'ok', banco: 'ok' });
});

app.use('/itens', itensRoutes);

app.use(function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Quatro parâmetros identificam o tratador de erros do Express.
app.use(function tratarErro(erro, req, res, next) {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'Corpo da requisição muito grande.' });
  }
  // O detalhe fica só no terminal: o cliente nunca recebe SQL ou dados internos do banco.
  console.error(erro.message);
  return res.status(500).json({ mensagem: 'Erro interno do servidor. Tente novamente.' });
});

export default app;
