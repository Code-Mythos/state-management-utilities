import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.test.ts", "!__tests__", "!src/**/*.tsx"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  tsconfig: "tsconfig.json",
});
