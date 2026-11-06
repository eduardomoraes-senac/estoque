import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// O caminho parte deste arquivo: o .env certo é lido em qualquer pasta onde o Node for executado.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

// Avisa logo no início se faltar alguma configuração, antes de tentar acessar o banco.
export function validarBanco() {
  const obrigatorias = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  for (const nome of obrigatorias) {
    if (!process.env[nome] || !process.env[nome].trim()) {
      throw new Error('Preencha ' + nome + ' em backend/.env (use backend/.env.example como modelo).');
    }
  }
  // A senha pode ser vazia em algumas instalações locais, mas a variável precisa existir.
  if (process.env.DB_PASSWORD === undefined) {
    throw new Error('Defina DB_PASSWORD em backend/.env, mesmo que fique vazia.');
  }
}
