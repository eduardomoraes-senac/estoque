// Configuração ESM do ESLint: o projeto é todo em JavaScript.
import expo from 'eslint-config-expo/flat.js';

export default [
  ...expo,
  { ignores: ['dist/**', '.expo/**', 'node_modules/**'] },
];
