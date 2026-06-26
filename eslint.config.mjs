import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import sonarjsPlugin from 'eslint-plugin-sonarjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'sonarjs': sonarjsPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      'complexity': ['warn', 15],
      'sonarjs/cognitive-complexity': ['error', 15],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/unused-import': 'warn',
      'sonarjs/no-unused-vars': 'warn',
      'sonarjs/no-dead-store': 'warn',
      'sonarjs/pseudo-random': 'off',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'sonarjs/no-ignored-exceptions': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'sonarjs/use-type-alias': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'no-empty': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
);
