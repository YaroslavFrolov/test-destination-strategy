module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "linebreak-style": [1, "unix"],
    quotes: [1, "double"],
    semi: [1, "always"],
    "@typescript-eslint/ban-ts-comment": 0,
  },
  ignorePatterns: ["dist/**/*", "node_modules/**/*"],
};
