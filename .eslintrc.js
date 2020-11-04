module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "env": {
    "node": true,
    "jest/globals": true
  },
  "extends": [
    "eslint:recommended",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "jest"
  ],
  "rules": {
    "max-len": ["error", { "code": 145 }],
    "import/prefer-default-export": "off",
    "implicit-arrow-linebreak": "off",
    "max-classes-per-file": "off",
    "no-restricted-imports": ["error", {
      "patterns": ["../*", "./*"],
      "paths": [
        {
          "name": "moment",
          "message": "Please use \"import moment from 'src/server/helpers/moment'\" instead"
        }
      ]
    }],
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    }
  }
}

