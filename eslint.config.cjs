const path = require("path");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: path.join(__dirname, "apps/web"),
  resolvePluginsRelativeTo: path.join(__dirname, "apps/web"),
});

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },
  ...compat
    .extends("next/core-web-vitals", "plugin:@typescript-eslint/recommended")
    .map((config) => ({
      ...config,
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    })),
];
