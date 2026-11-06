// Configuração ESM do ESLint: o projeto é todo em JavaScript.
import expo from 'eslint-config-expo/flat.js';

export default [
  ...expo,
  { ignores: ['dist/**', '.expo/**', 'node_modules/**'] },
  // A API roda no Node: process e fetch existem lá, mesmo fora do aplicativo.
  { files: ['backend/**/*.js'], languageOptions: { globals: { process: 'readonly', fetch: 'readonly', URL: 'readonly' } } },
];
