module.exports = {
  // Environment setup
  env: {
    browser: true,        // Browser global variables (window, document)
    es2021: true,         // ES2021 features (Promise, etc.)
    node: true,           // Node.js global variables (require, module)
    jest: true,           // Jest testing framework
  },

  // Base configurations to extend
  extends: [
    'eslint:recommended',                    // ESLint's recommended rules
    'plugin:react/recommended',              // React recommended rules
    'plugin:react-hooks/recommended',        // React Hooks rules
    'plugin:jsx-a11y/recommended',           // Accessibility rules for JSX
    'plugin:import/recommended',              // Import/export rules
  ],

  // Parser options for modern JavaScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true,                             // Enable JSX
    },
    ecmaVersion: 'latest',                    // Latest ECMAScript version
    sourceType: 'module',                      // Use ES modules (import/export)
  },

  // Plugins
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],

  // Custom rules (overrides)
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',        // Next.js/Vite mein import React zaroori nahi
    'react/prop-types': 'off',                  // TypeScript use kar rahe ho to off
    'react/jsx-uses-react': 'off',              // Same as above
    'react/jsx-uses-vars': 'error',             // Variables used in JSX must be defined
    
    // Hooks rules
    'react-hooks/rules-of-hooks': 'error',      // Hooks rules enforce
    'react-hooks/exhaustive-deps': 'warn',       // useEffect dependencies check
    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',  // No console in prod
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Unused vars warning
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',  // No debugger in prod
    
    // Import rules
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to'],
    }],
    
    // Style rules
    'semi': ['error', 'always'],               // Semicolons mandatory
    'quotes': ['error', 'single'],              // Single quotes
    'indent': ['error', 2, { SwitchCase: 1 }],  // 2 spaces indent
    'comma-dangle': ['error', 'always-multiline'], // Trailing commas
    'eol-last': ['error', 'always'],            // New line at end of file
  },

  // Settings for React version
  settings: {
    react: {
      version: 'detect',                        // Auto-detect React version
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['src'],                          // Import paths relative to src
      },
    },
  },

  // Override for specific files
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',                    // Tests mein console allowed
      },
    },
  ],
};
