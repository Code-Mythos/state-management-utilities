import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.test.ts", "!__tests__"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
