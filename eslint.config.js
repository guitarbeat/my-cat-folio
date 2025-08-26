const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  // Base JavaScript recommended rules
  js.configs.recommended,
  
  // Global environment configuration
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 2022,
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    }
  },
  
  // React-specific configuration
  {
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      // React recommended rules
      ...react.configs.recommended.rules,
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom rule overrides
      'react/prop-types': 'off',
      'react/display-name': 'off',
      
      // Additional React rules
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      
      // General JavaScript rules
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn', // Allow console statements but warn about them
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Additional useful rules
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-empty': 'error',
      'no-extra-semi': 'error',
      'no-irregular-whitespace': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always']
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  
  // Files to ignore
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vercel/**',
      '*.config.js',
      '*.config.mjs'
    ]
  }
];
