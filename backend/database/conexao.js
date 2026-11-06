import '../config/ambiente.js';
import mysql from 'mysql2/promise';

// O pool reaproveita conexões entre as requisições. As credenciais vêm do backend/.env.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  // Devolve DATE como o texto "AAAA-MM-DD". Com objetos Date, o fuso horário poderia mudar o dia da validade.
  dateStrings: true,
});

export default pool;
