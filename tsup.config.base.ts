import { defineConfig, Options } from "tsup";

/**
 * Shared tsup config for every package (replaces microbundle).
 *
 * Outputs keep microbundle's file names so `main`/`module`/`types` don't change:
 * - dist/index.js        (CommonJS)
 * - dist/index.module.js (ES modules, NOT .mjs: webpack 4 in @log4brains/web
 *                         consumes this file and would apply strict ESM rules to .mjs)
 * - dist/index.d.ts
 *
 * Target is ES2019 because webpack 4 (Next.js 10) cannot parse `?.` / `??`.
 * TODO: raise the target once @log4brains/web is on a modern Next.js.
 */
export function createConfig(
  overrides: Options = {}
): ReturnType<typeof defineConfig> {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outExtension: ({ format }) => ({
      js: format === "esm" ? ".module.js" : ".js"
    }),
    dts: true,
    target: "es2019",
    platform: "node",
    tsconfig: "tsconfig.build.json",
    outDir: "dist",
    clean: true,
    sourcemap: true,
    splitting: false,
    ...overrides
  });
}

/**
 * Config for ESM-only packages (`"type": "module"`) that webpack never bundles:
 * outputs dist/index.js (ES modules) and dist/index.d.ts, targeting the Node versions we support.
 */
export function createEsmConfig(
  overrides: Options = {}
): ReturnType<typeof defineConfig> {
  return createConfig({
    format: ["esm"],
    outExtension: () => ({ js: ".js" }),
    target: "node22",
    ...overrides
  });
}
