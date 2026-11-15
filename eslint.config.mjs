// ESLint 9 flat config (replaces .eslintrc.js + per-package .eslintrc.js files)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import promise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-config-prettier";
import globals from "globals";

const packagesWithOwnTsconfig = [
  "cli",
  "cli-common",
  "core",
  "global-cli",
  "init",
  "web"
];

export default tseslint.config(
  {
    ignores: [
      "**/*.js",
      "**/*.mjs",
      "**/*.d.ts",
      "**/*.stories.tsx", // temporary disabled
      "**/tsup.config.ts",
      "tsup.config.base.ts",
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/.next-export/**",
      "**/.log4brains/**",
      "e2e-tests/**"
    ]
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  promise.configs["flat/recommended"],
  sonarjs.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2021 }
    },
    settings: {
      "import/resolver": { typescript: true, node: true }
    },
    rules: {
      // Kept from the previous airbnb-based config
      "import/prefer-default-export": "off", // @adr 20200927-avoid-default-exports
      "import/no-default-export": "error", // @adr 20200927-avoid-default-exports
      "import/no-cycle": "error",
      "class-methods-use-this": "error",
      "no-await-in-loop": "error",
      "no-param-reassign": "error",
      "no-console": "warn",
      "no-void": ["error", { allowAsStatement: true }], // For React.useEffect() with async functions

      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true
        }
      ],

      // TypeScript already checks these
      "import/no-unresolved": "off",
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default-member": "off",

      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } } // async React event handlers
      ],

      "sonarjs/no-duplicate-string": "off",
      // Rules added in eslint-plugin-sonarjs v1-v4 that are stylistic or noisy for this code base
      // TODO: review and enable progressively
      "sonarjs/todo-tag": "off",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/prefer-regexp-exec": "off",
      "sonarjs/constructor-for-side-effects": "off",
      "sonarjs/public-static-readonly": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/prefer-single-boolean-return": "off",
      "sonarjs/no-alphabetical-sort": "off",
      "sonarjs/no-selector-parameter": "off",
      "sonarjs/concise-regex": "off",
      "sonarjs/single-char-in-character-classes": "off",
      "sonarjs/future-reserved-words": "off",
      "sonarjs/different-types-comparison": "off", // false positives on value-object null checks
      "sonarjs/no-ignored-exceptions": "off",
      "sonarjs/unused-import": "off", // covered by @typescript-eslint/no-unused-vars
      "sonarjs/no-array-delete": "off" // covered by @typescript-eslint/no-array-delete
    }
  },

  // Type-aware linting: each package uses its own tsconfig, as before
  ...packagesWithOwnTsconfig.map((pkg) => ({
    files: [`packages/${pkg}/**/*.ts`, `packages/${pkg}/**/*.tsx`],
    languageOptions: {
      parserOptions: {
        project: `packages/${pkg}/tsconfig.json`,
        tsconfigRootDir: import.meta.dirname
      }
    }
  })),

  // Next.js app (React)
  {
    files: ["packages/web/nextjs/**/*.ts", "packages/web/nextjs/**/*.tsx"],
    ...react.configs.flat.recommended,
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "packages/web/nextjs/tsconfig.dev.json", // includes .test.ts and .stories.tsx files
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off", // Next.js
      "react/prop-types": "off", // TypeScript
      "react/prefer-stateless-function": [
        "error",
        { ignorePureComponents: false }
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function"
        }
      ],
      "react/require-default-props": [
        "error",
        { ignoreFunctionalComponents: true }
      ],
      "react/no-unused-prop-types": "error",
      "react/destructuring-assignment": "error",
      "react/display-name": "off"
    }
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "sonarjs/cognitive-complexity": ["error", 18], // React functions are usually more complex
      "@typescript-eslint/explicit-module-boundary-types": "off", // @adr web/20200927-avoid-react-fc-type
      "class-methods-use-this": "off" // React class components (e.g. _document.tsx render())
    }
  },
  {
    files: [
      "packages/web/nextjs/src/pages/**/*.tsx",
      "packages/web/nextjs/src/pages/api/**/*.ts"
    ], // Next.js pages and api routes
    rules: { "import/no-default-export": "off" }
  },

  // Jest
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/integration-tests/**/*.ts"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      ...jest.configs["flat/style"].rules,
      "max-classes-per-file": "off",
      "import/no-extraneous-dependencies": "off",
      "no-new": "off",
      "no-empty": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/parameterized-tests": "off"
    }
  },

  prettier
);
