import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'eqeqeq': 'error',
      'curly': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Excluir archivos stub y legacy
    ignores: [
      'node_modules/**',
      '__tests__/**',
      'coverage/**',
      'frontend/**',
      'src/controllers/snippetController.js',
      'src/controllers/testController.js',
      'src/routes/snippetRoutes.js',
      'src/routes/testRoutes.js',
      'src/models/Snippet.js',
      'src/validators/snippetValidator.js',
    ],
  },
];
