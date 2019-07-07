module.exports = {
  ignore: [
    "/node_modules/**/*"
  ],
  sourceMaps: true,
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "8.16"
        },
      }
    ],
    "@babel/typescript"
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-transform-typescript",
    ["module-resolver", {
      extensions: [".js", ".ts"],
      root: '.'
    }]
  ]
}
