module.exports = {
  root: true,
  
  // Environment configuration
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
    'cypress/globals': true
  },

  // Extend recommended configurations
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
    'plugin:prettier/recommended',
    'prettier'
  ],

  // Parser configuration
  parser: '@babel/eslint-parser',
  
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true
    },
    ecmaVersion: 2022,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },

  // Plugins
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'jest',
    'jest-dom',
    'testing-library',
    'cypress',
    'prettier',
    'unicorn',
    'promise',
    'security',
    'sonarjs',
    'optimize-regex',
    'no-secrets',
    'no-unsanitized'
  ],

  // Settings
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      },
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/components'],
          ['@pages', './src/pages'],
          ['@hooks', './src/hooks'],
          ['@utils', './src/utils'],
          ['@services', './src/services'],
          ['@store', './src/store'],
          ['@config', './src/config'],
          ['@assets', './src/assets'],
          ['@styles', './src/styles'],
          ['@types', './src/types'],
          ['@context', './src/context'],
          ['@middleware', './src/middleware'],
          ['@tests', './tests'],
          ['@fixtures', './tests/fixtures'],
          ['@mocks', './tests/mocks']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
        }
    // Rules configuration
rules: {
  // ==================== Possible Errors ====================
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  'no-alert': 'warn',
  'no-await-in-loop': 'warn',
  'no-constant-binary-expression': 'error',
  'no-constructor-return': 'error',
  'no-duplicate-imports': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-promise-executor-return': 'error',
  'no-self-compare': 'error',
  'no-template-curly-in-string': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-private-class-members': 'warn',
  'no-use-before-define': ['error', { 
    functions: false,
    classes: true,
    variables: true
  }],
  'require-atomic-updates': 'error',

  // ==================== Best Practices ====================
  'array-callback-return': 'error',
  'block-scoped-var': 'error',
  'class-methods-use-this': 'off',
  'complexity': ['warn', { max: 15 }],
  'consistent-return': 'warn',
  'curly': ['error', 'all'],
  'default-case': 'error',
  'default-case-last': 'error',
  'default-param-last': 'error',
  'dot-notation': 'error',
  'eqeqeq': ['error', 'always'],
  'grouped-accessor-pairs': 'error',
  'guard-for-in': 'error',
  'max-classes-per-file': ['error', 1],
  'no-caller': 'error',
  'no-constructor-return': 'error',
  'no-else-return': ['error', { allowElseIf: false }],
  'no-empty-function': 'warn',
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-label': 'error',
  'no-implicit-coercion': ['error', { 
    allow: ['!!']
  }],
  'no-implied-eval': 'error',
  'no-invalid-this': 'error',
  'no-iterator': 'error',
  'no-labels': 'error',
  'no-lone-blocks': 'error',
  'no-loop-func': 'error',
  'no-multi-assign': 'warn',
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-octal-escape': 'error',
  'no-param-reassign': ['error', { 
    props: true,
    ignorePropertyModificationsFor: ['state', 'draft']
  }],
  'no-proto': 'error',
  'no-return-assign': ['error', 'always'],
  'no-script-url': 'error',
  'no-self-assign': ['error', { props: true }],
  'no-sequences': 'error',
  'no-throw-literal': 'error',
  'no-unused-expressions': ['error', { 
    allowShortCircuit: true,
    allowTernary: true,
    allowTaggedTemplates: true
  }],
  'no-useless-call': 'error',
  'no-useless-concat': 'error',
  'no-useless-constructor': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'no-void': 'error',
  'prefer-const': 'error',
  'prefer-destructuring': ['warn', {
    array: true,
    object: true
  }, {
    enforceForRenamedProperties: false
  }],
  'prefer-exponentiation-operator': 'error',
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  'radix': 'error',
  'require-await': 'warn',
  'require-unicode-regexp': 'off',
  'vars-on-top': 'error',
  'yoda': 'error',

  // ==================== Variables ====================
  'no-shadow': ['error', { 
    builtinGlobals: true,
    hoist: 'all',
    allow: ['state', 'props']
  }],
  'no-shadow-restricted-names': 'error',
  'no-undef': 'error',
  'no-undef-init': 'error',
  'no-undefined': 'off',
  'no-unused-vars': ['warn', {
    vars: 'all',
    args: 'after-used',
    ignoreRestSiblings: true,
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }],
  'no-use-before-define': ['error', {
    functions: false,
    classes: true,
    variables: true
  }]
    }
  // ==================== Stylistic Rules ====================
  rules: {
    'array-bracket-newline': ['error', 'consistent'],
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': ['error', 'consistent'],
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', { 
      allowSingleLine: true 
    }],
    'camelcase': ['error', {
      properties: 'never',
      ignoreDestructuring: true,
      ignoreImports: true,
      allow: ['^UNSAFE_']
    }],
    'comma-dangle': ['error', {
      arrays: 'never',
      objects: 'never',
      imports: 'never',
      exports: 'never',
      functions: 'never'
    }],
    'comma-spacing': ['error', { 
      before: false, 
      after: true 
    }],
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'func-call-spacing': ['error', 'never'],
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'consistent'],
    'indent': ['error', 2, { 
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      MemberExpression: 1,
      FunctionDeclaration: { parameters: 1, body: 1 },
      FunctionExpression: { parameters: 1, body: 1 },
      CallExpression: { arguments: 1 },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      ignoreComments: false
    }],
    'jsx-quotes': ['error', 'prefer-double'],
    'key-spacing': ['error', { 
      beforeColon: false, 
      afterColon: true 
    }],
    'keyword-spacing': ['error', { 
      before: true, 
      after: true 
    }],
    'linebreak-style': ['error', 'unix'],
    'lines-around-comment': ['error', {
      beforeBlockComment: true,
      afterBlockComment: false,
      beforeLineComment: true,
      afterLineComment: false,
      allowBlockStart: true,
      allowBlockEnd: true,
      allowObjectStart: true,
      allowObjectEnd: true,
      allowArrayStart: true,
      allowArrayEnd: true
    }],
    'lines-between-class-members': ['error', 'always', { 
      exceptAfterSingleLine: true 
    }],
    'max-len': ['warn', {
      code: 100,
      tabWidth: 2,
      ignoreComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    'max-lines': ['warn', {
      max: 500,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-lines-per-function': ['warn', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true
    }],
    'max-statements-per-line': ['error', { 
      max: 2 
    }],
    'multiline-ternary': ['error', 'always-multiline'],
    'new-cap': ['error', { 
      newIsCap: true,
      capIsNew: false,
      properties: true
    }],
    'new-parens': 'error',
    'newline-per-chained-call': ['error', { 
      ignoreChainWithDepth: 4 
    }],
    'no-array-constructor': 'error',
    'no-bitwise': 'error',
    'no-continue': 'off',
    'no-inline-comments': 'off',
    'no-lonely-if': 'error',
    'no-mixed-operators': ['error', {
      groups: [
        ['%', '**'],
        ['%', '+'],
        ['%', '-'],
        ['%', '*'],
        ['%', '/'],
        ['/', '*'],
        ['&', '|', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!=='],
        ['&&', '||']
      ],
      allowSamePrecedence: false
    }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': ['error', { 
      ignoreEOLComments: true 
    }],
    'no-multiple-empty-lines': ['error', { 
      max: 2, 
      maxEOF: 1, 
      maxBOF: 0 
    }],
    'no-negated-condition': 'off',
    'no-nested-ternary': 'warn',
    'no-new-object': 'error',
    'no-plusplus': ['error', { 
      allowForLoopAfterthoughts: true 
    }],
    'no-restricted-syntax': ['error', 
      'ForInStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    'no-tabs': 'error',
    'no-ternary': 'off',
    'no-trailing-spaces': ['error', {
      skipBlankLines: false,
      ignoreComments: false
    }],
    'no-underscore-dangle': ['error', {
      allow: ['_id', '_v'],
      allowAfterThis: true,
      allowAfterSuper: true,
      enforceInMethodNames: false
    }],
    'no-unneeded-ternary': ['error', {
      defaultAssignment: false
    }],
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': ['error', 'besides'],
    'object-curly-newline': ['error', { 
      consistent: true 
    }],
    'object-curly-spacing': ['error', 'always'],
    'object-property-newline': ['error', { 
      allowAllPropertiesOnSameLine: true 
    }],
    'one-var': ['error', 'never'],
    'one-var-declaration-per-line': ['error', 'always'],
    'operator-assignment': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    'padding-line-between-statements': ['error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' },
      { blankLine: 'always', prev: ['case', 'default'], next: '*' }
    ],
    'prefer-exponentiation-operator': 'error',
    'quote-props': ['error', 'as-needed', { 
      keywords: false,
      unnecessary: true,
      numbers: false
    }],
    'quotes': ['error', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true 
    }],
    'semi': ['error', 'always'],
    'semi-spacing': ['error', { 
      before: false, 
      after: true 
    }],
    'semi-style': ['error', 'last'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', {
      words: true,
      nonwords: false
    }],
    'spaced-comment': ['error', 'always', {
      line: {
        markers: ['/'],
        exceptions: ['-', '+']
      },
      block: {
        markers: ['!'],
        exceptions: ['*'],
        balanced: true
      }
    }],
    'switch-colon-spacing': ['error', {
      after: true,
      before: false
    }],
    'template-curly-spacing': ['error', 'never'],
    'template-tag-spacing': ['error', 'never'],
    'unicode-bom': ['error', 'never'],
    'wrap-iife': ['error', 'outside'],
    'wrap-regex': 'off',
    'yield-star-spacing': ['error', 'both']
  },

  // ==================== Overrides ====================
  overrides: [
    {
      files: ['**/*.{jsx,js}'],
      rules: {
        // React specific rules
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/react-in-jsx-scope': 'error',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/jsx-key': ['error', {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true
        }],
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-undef': 'error',
        'react/jsx-pascal-case': ['error', {
          allowAllCaps: true,
          ignore: []
        }],
        'react/no-children-prop': 'error',
        'react/no-danger': 'warn',
        'react/no-deprecated': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-is-mounted': 'error',
        'react/no-render-return-value': 'error',
        'react/no-string-refs': 'error',
        'react/no-unescaped-entities': 'error',
        'react/no-unknown-property': 'error',
        'react/self-closing-comp': 'error'
      }
    },
    {
      files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', '**/__tests__/**/*.{js,jsx}'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
      }
    },
    {
      files: ['cypress/**/*.{js,jsx}', '**/*.cy.{js,jsx}'],
      rules: {
        'cypress/no-assigning-return-values': 'error',
        'cypress/no-unnecessary-waiting': 'error',
        'cypress/assertion-before-screenshot': 'warn',
        'cypress/no-async-tests': 'error',
        'cypress/no-pause': 'error'
      }
    }
  ],

  // ==================== Globals ====================
  globals: {
    React: 'readonly',
    JSX: 'readonly',
    process: 'readonly',
    module: 'readonly',
    require: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    global: 'readonly',
    Buffer: 'readonly',
    Promise: 'readonly',
    Proxy: 'readonly',
    WeakMap: 'readonly',
    WeakSet: 'readonly',
    Symbol: 'readonly',
    Reflect: 'readonly',
    Intl: 'readonly'
  },

  // ==================== Ignore Patterns ====================
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    'public/',
    '*.min.js',
    '*.config.js',
    '.eslintrc.js'
  ]
};
