const path = require("path");
const fs = require("fs");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const packageJson = require(
  `${
    fs.existsSync(path.join(__dirname, "package.json")) ? "./" : "../"
  }package.json`
);

// `log4brains build` runs `next build` with these variables (see cli/commands/build.ts)
const isStaticExport = process.env.NEXT_PUBLIC_LOG4BRAINS_STATIC === "1";
const buildId = process.env.LOG4BRAINS_BUILD_ID;

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  // Users' `log4brains build` compiles this app from node_modules, which the bundler skips by default
  transpilePackages: [packageJson.name],
  poweredByHeader: false,
  trailingSlash: true,
  ...(isStaticExport
    ? {
        output: "export",
        // In export mode, distDir is the export's destination: the build files still go to .next
        distDir: ".next-export",
        basePath: process.env.LOG4BRAINS_BASE_PATH || ""
      }
    : {
        // Preview mode's build, made when the package is built (`build:nextjs`) and published with it:
        // - a different folder than .next, which `log4brains build` overwrites
        // - built with webpack: Turbopack loads server externals (chokidar) through symlinks in the build folder,
        //   which npm does not publish
        distDir: ".next-preview",
        // Same as the pages' revalidation period (lib/revalidate.ts): no `stale-while-revalidate` Cache-Control,
        // otherwise the browser shows an ADR's previous version on Hot Reload
        expireTime: 1
      }),
  ...(buildId ? { generateBuildId: () => buildId } : {}),
  env: {
    LOG4BRAINS_VERSION: packageJson.version,
    // Static mode: the ADRs list and the search index are generated in out/data/<build ID>/
    LOG4BRAINS_BUILD_ID: buildId || ""
  },
  // Bundles the server dependencies like the client ones: otherwise @mui/lab is loaded from node_modules
  // while @mui/material is bundled, and the lab components (Timeline) do not see the app's theme
  bundlePagesRouterDependencies: true,
  // Loaded from node_modules at runtime instead of being bundled (and minified) into the server code:
  // - core's dependency injection container registers its classes by name
  // - chokidar uses native file watching (fsevents)
  serverExternalPackages: [
    "@log4brains/core",
    "@log4brains/cli-common",
    "chokidar"
  ],
  experimental: {
    // Keeps class names in the server code: core's dependency injection container resolves its classes by name
    // (@log4brains/core is a symlinked workspace in development, so it is bundled despite serverExternalPackages)
    serverMinification: false
  },
  typescript: {
    // We check typescript errors only during the first build, not during "log4brains build",
    // for performance purpose and to avoid importing @types/* packages as dependencies
    ignoreBuildErrors: process.env.LOG4BRAINS_PHASE !== "initial-build"
  }
});
