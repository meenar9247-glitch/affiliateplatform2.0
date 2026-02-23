module.exports = {
  root: true,
  
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
    'cypress/globals': true
  },

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
          ['@styles', './src/styles']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },

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
};
// ==================== Stylistic Issues ====================
{
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
} 
overrides: [
  // ==================== React/JSX Rules ====================
  {
    files: ['**/*.{jsx,js}'],
    rules: {
      'react/boolean-prop-naming': ['error', {
        rule: '^(is|has|can)[A-Z]([A-Za-z0-9]?)+',
        message: 'Boolean prop should start with is/has/can'
      }],
      'react/button-has-type': ['error', {
        button: true,
        submit: true,
        reset: true
      }],
      'react/default-props-match-prop-types': 'error',
      'react/destructuring-assignment': ['error', 'always'],
      'react/display-name': 'off',
      'react/forbid-component-props': ['error', {
        forbid: ['style', 'className']
      }],
      'react/forbid-dom-props': ['error', {
        forbid: ['style']
      }],
      'react/forbid-elements': ['error', {
        forbid: ['button']
      }],
      'react/forbid-foreign-prop-types': 'error',
      'react/forbid-prop-types': ['error', {
        forbid: ['any', 'array', 'object'],
        checkContextTypes: true,
        checkChildContextTypes: true
      }],
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }],
      'react/hook-use-state': 'error',
      'react/iframe-missing-sandbox': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-child-element-spacing': 'off',
      'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-curly-brace-presence': ['error', {
        props: 'never',
        children: 'never'
      }],
      'react/jsx-curly-newline': ['error', {
        multiline: 'consistent',
        singleline: 'consistent'
      }],
      'react/jsx-curly-spacing': ['error', {
        when: 'never',
        children: true
      }],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-filename-extension': ['error', {
        extensions: ['.jsx']
      }],
      'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-handler-names': ['error', {
        eventHandlerPrefix: 'handle',
        eventHandlerPropPrefix: 'on'
      }],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-key': ['error', {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true
      }],
      'react/jsx-max-depth': ['warn', { max: 5 }],
      'react/jsx-max-props-per-line': ['error', {
        maximum: 1,
        when: 'multiline'
      }],
      'react/jsx-newline': ['error', {
        prevent: false
      }],
      'react/jsx-no-bind': ['error', {
        allowArrowFunctions: true,
        allowBind: false,
        ignoreRefs: true
      }],
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-leaked-render': ['error', {
        validStrategies: ['ternary', 'coerce']
      }],
      'react/jsx-no-literals': 'off',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-target-blank': ['error', {
        allowReferrer: true,
        enforceDynamicLinks: 'always'
      }],
      'react/jsx-no-undef': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-one-expression-per-line': ['error', {
        allow: 'single-child'
      }],
      'react/jsx-pascal-case': ['error', {
        allowAllCaps: true,
        ignore: []
      }],
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-props-no-spreading': ['error', {
        html: 'enforce',
        custom: 'ignore',
        explicitSpread: 'ignore',
        exceptions: []
      }],
      'react/jsx-sort-props': ['error', {
        callbacksLast: true,
        shorthandFirst: true,
        shorthandLast: false,
        ignoreCase: true,
        noSortAlphabetically: false,
        reservedFirst: true
      }],
      'react/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never'
      }],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-wrap-multilines': ['error', {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line'
      }],
      'react/no-access-state-in-setstate': 'error',
      'react/no-adjacent-inline-elements': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-arrow-function-lifecycle': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger': 'warn',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-did-mount-set-state': 'error',
      'react/no-did-update-set-state': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-invalid-html-attribute': 'error',
      'react/no-is-mounted': 'error',
      'react/no-multi-comp': ['error', {
        ignoreStateless: true
      }],
      'react/no-namespace': 'error',
      'react/no-object-type-as-default-prop': 'error',
      'react/no-redundant-should-component-update': 'error',
      'react/no-render-return-value': 'error',
      'react/no-set-state': 'off',
      'react/no-string-refs': 'error',
      'react/no-this-in-sfc': 'error',
      'react/no-typos': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': ['error', {
        checkAliases: true
      }],
      'react/no-unstable-nested-components': ['error', {
        allowAsProps: true
      }],
      'react/no-unused-class-component-methods': 'error',
      'react/no-unused-prop-types': 'error',
      'react/no-unused-state': 'error',
      'react/no-will-update-set-state': 'error',
      'react/prefer-es6-class': ['error', 'always'],
      'react/prefer-exact-props': 'error',
      'react/prefer-read-only-props': 'error',
      'react/prefer-stateless-function': ['error', {
        ignorePureComponents: true
      }],
      'react/prop-types': ['error', {
        ignore: [],
        customValidators: [],
        skipUndeclared: false
      }],
      'react/react-in-jsx-scope': 'error',
      'react/require-default-props': ['error', {
        forbidDefaultForRequired: true,
        functions: 'defaultArguments'
      }],
      'react/require-optimization': 'off',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/sort-comp': ['error', {
        order: [
          'static-variables',
          'static-methods',
          'instance-variables',
          'lifecycle',
          'everything-else',
          'render'
        ],
        groups: {
          lifecycle: [
            'displayName',
            'propTypes',
            'contextTypes',
            'childContextTypes',
            'mixins',
            'statics',
            'defaultProps',
            'constructor',
            'getDefaultProps',
            'getInitialState',
            'state',
            'getChildContext',
            'getDerivedStateFromProps',
            'componentWillMount',
            'UNSAFE_componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'UNSAFE_componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'UNSAFE_componentWillUpdate',
            'getSnapshotBeforeUpdate',
            'componentDidUpdate',
            'componentDidCatch',
            'componentWillUnmount'
          ]
        }
      }],
      'react/sort-prop-types': ['error', {
        callbacksLast: true,
        ignoreCase: true,
        requiredFirst: true,
        sortShapeProp: true,
        noSortAlphabetically: false
      }],
      'react/state-in-constructor': ['error', 'always'],
      'react/static-property-placement': ['error', 'static public field'],
      'react/style-prop-object': 'error',
      'react/void-dom-elements-no-children': 'error'
    }
  },

  // ==================== React Hooks Rules ====================
  {
    files: ['**/*.{jsx,js}'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': ['warn', {
        additionalHooks: '(useMyCustomHook|useMyOtherCustomHook)'
      }]
    }
  },

  // ==================== Jest Rules ====================
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.{spec,test}.{js,jsx}'],
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'jest/consistent-test-it': ['error', {
        fn: 'test',
        withinDescribe: 'test'
      }],
      'jest/expect-expect': ['error', {
        assertFunctionNames: ['expect', 'request.**.expect']
      }],
      'jest/lowercase-name': ['error', {
        ignore: ['describe']
      }],
      'jest/no-alias-methods': 'error',
      'jest/no-commented-out-tests': 'warn',
      'jest/no-conditional-expect': 'error',
      'jest/no-deprecated-functions': 'error',
      'jest/no-duplicate-hooks': 'error',
      'jest/no-export': 'error',
      'jest/no-standalone-expect': 'error',
      'jest/no-test-prefixes': 'error',
      'jest/no-test-return-statement': 'error',
      'jest/prefer-called-with': 'error',
      'jest/prefer-expect-assertions': 'off',
      'jest/prefer-hooks-on-top': 'error',
      'jest/prefer-spy-on': 'error',
      'jest/prefer-strict-equal': 'error',
      'jest/require-top-level-describe': 'error',
      'jest/valid-describe-callback': 'error',
      'jest/valid-title': ['error', {
        ignoreTypeOfDescribeName: true
      }]
    }
  },

  // ==================== Testing Library Rules ====================
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.{spec,test}.{js,jsx}'],
    rules: {
      'testing-library/await-async-query': 'error',
      'testing-library/await-async-utils': 'error',
      'testing-library/no-await-sync-query': 'error',
      'testing-library/no-container': 'error',
      'testing-library/no-debugging-utils': 'warn',
      'testing-library/no-dom-import': ['error', 'react'],
      'testing-library/no-manual-cleanup': 'error',
      'testing-library/no-node-access': 'error',
      'testing-library/no-promise-in-fire-event': 'error',
      'testing-library/no-render-in-setup': ['error', {
        allowTestingFrameworkSetupHook: 'beforeEach'
      }],
      'testing-library/no-unnecessary-act': 'error',
      'testing-library/no-wait-for-empty-callback': 'error',
      'testing-library/no-wait-for-multiple-assertions': 'error',
      'testing-library/no-wait-for-side-effects': 'error',
      'testing-library/no-wait-for-snapshot': 'error',
      'testing-library/prefer-find-by': 'error',
      'testing-library/prefer-presence-queries': 'error',
      'testing-library/prefer-query-by-disappearance': 'error',
      'testing-library/prefer-screen-queries': 'error',
      'testing-library/render-result-naming-convention': 'error'
    }
  },

  // ==================== Jest DOM Rules ====================
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.{spec,test}.{js,jsx}'],
    rules: {
      'jest-dom/prefer-checked': 'error',
      'jest-dom/prefer-empty': 'error',
      'jest-dom/prefer-enabled-disabled': 'error',
      'jest-dom/prefer-focus': 'error',
      'jest-dom/prefer-in-document': 'error',
      'jest-dom/prefer-required': 'error',
      'jest-dom/prefer-to-have-attribute': 'error',
      'jest-dom/prefer-to-have-class': 'error',
      'jest-dom/prefer-to-have-style': 'error',
      'jest-dom/prefer-to-have-text-content': 'error',
      'jest-dom/prefer-to-have-value': 'error'
    }
  },

  // ==================== Cypress Rules ====================
  {
    files: ['cypress/**/*.{js,jsx}', '**/*.cy.{js,jsx}'],
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-async-tests': 'error',
      'cypress/no-pause': 'error'
    }
  },

  // ==================== Import Rules ====================
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'import/no-unresolved': ['error', { 
        commonjs: true,
        amd: true,
        caseSensitive: true
      }],
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/export': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-deprecated': 'warn',
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          '**/*.test.{js,jsx}',
          '**/*.spec.{js,jsx}',
          '**/__tests__/**/*',
          '**/cypress/**/*',
          '**/*.cy.{js,jsx}'
        ],
        optionalDependencies: false,
        peerDependencies: false
      }],
      'import/no-mutable-exports': 'error',
      'import/no-commonjs': 'off',
      'import/no-amd': 'error',
      'import/no-nodejs-modules': 'off',
      'import/first': 'error',
      'import/exports-last': 'off',
      'import/no-duplicates': 'error',
      'import/no-namespace': 'off',
      'import/extensions': ['error', 'ignorePackages', {
        js: 'never',
        jsx: 'never'
      }],
      'import/order': ['error', {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@/**',
            group: 'internal'
          }
        ],
        pathGroupsExcludedImportTypes: ['react']
      }],
      'import/newline-after-import': ['error', {
        count: 1
      }],
      'import/prefer-default-export': 'off',
      'import/max-dependencies': ['warn', {
        max: 20
      }],
      'import/no-unassigned-import': ['error', {
        allow: ['**/*.css', '**/*.scss', '**/*.less']
      }],
      'import/no-named-default': 'error',
      'import/no-default-export': 'off',
      'import/no-self-import': 'error',
      'import/no-cycle': ['error', {
        maxDepth: 10,
        ignoreExternal: true
      }],
      'import/no-useless-path-segments': ['error', {
        noUselessIndex: true
      }],
      'import/no-relative-packages': 'error',
      'import/no-absolute-path': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-webpack-loader-syntax': 'error'
    }
  },

  // ==================== Security Rules ====================
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'security/detect-object-injection': 'off',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-require': 'error',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-unsafe-regex': 'error'
    }
  },

  // ==================== SonarJS Rules ====================
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicate-string': ['warn', {
        threshold: 5
      }],
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-empty-collection': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-ignored-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/non-existent-operator': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-print': 'error',
      'sonarjs/prefer-while': 'error'
    }
  },

  // ==================== Unicorn Rules ====================
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': ['error', {
        name: 'error'
      }],
      'unicorn/consistent-destructuring': 'error',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/custom-error-definition': 'off',
      'unicorn/empty-brace-spaces': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'warn',
      'unicorn/explicit-length-check': 'error',
      'unicorn/filename-case': ['error', {
        cases: {
          camelCase: true,
          pascalCase: true
        }
      }],
      'unicorn/import-style': ['error', {
        styles: {
          util: false
        }
      }],
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-callback-reference': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-array-method-this-argument': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'error',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-keyword-prefix': 'off',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off',
      'unicorn/no-object-as-default-parameter': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-unsafe-regex': 'off',
      'unicorn/no-unused-properties': 'warn',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/no-useless-undefined': ['error', {
        checkArguments: false
      }],
      'unicorn/no-zero-fractions': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': ['error', {
        onlyIfContainsSeparator: true
      }],
