import js from '@eslint/js';
import typescript from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    ignores: ['.next/**', 'node_modules/**', 'backend/**'],
  },
];
