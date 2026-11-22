# Log4brains Fork & Modernization Plan

_Updated 2026-11-21 · Branch `chore-modernization` (on top of `develop` @ `17e3202`, upstream v1.1.0 + 3 CI/docs commits)._

## TL;DR

1. **The modernization is done** on `chore-modernization`. Every package, tool and CI workflow is on a current major version, except the few held back on purpose (see [§4](#4-held-back-on-purpose)).
2. **CI is green** on Node 22.x, 24.x and 26.x, on Linux, macOS and Windows, plus a best-effort job on the newest Node release.
3. **The packages are renamed** to the `@awarded` npm scope (`@awarded/log4brains`, `@awarded/log4brains-*`) but **nothing is published yet**: releases are gated behind the `RELEASES_ENABLED` repository variable.
4. **Next:** add preview/build smoke tests, open the PR into `develop`, then set up the release secrets and publish a first alpha (see [§5](#5-remaining-work)).

---

## 1. Current stack

| Area                | Before (upstream v1.1.0)                                       | Now                                                                                                  |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Node.js             | `>=18`, CI 18/20/22, `--openssl-legacy-provider` hack          | `^22.22.2 \|\| >=24.15.0`, CI 22/24/26, `.nvmrc` 26, no hack                                         |
| Package manager     | Yarn 1                                                         | npm workspaces (`package-lock.json`), `engine-strict`                                                |
| Monorepo / release  | Lerna 5                                                        | Lerna 10 (`lerna publish --conventional-commits`)                                                    |
| Build               | microbundle 0.12 (CJS + ES)                                    | tsup 9: ESM only for core, cli-common, cli, init, global-cli; CJS + ESM for web's CLI                |
| TypeScript          | 4.x                                                            | 6.0 (`tsconfig.base.json`, `moduleResolution: bundler`)                                              |
| Lint / format       | ESLint 7 + airbnb, Prettier 2                                  | ESLint 9 flat config + typescript-eslint 8, Prettier 3                                               |
| Tests               | Jest 26                                                        | Jest 30 (ts-jest; `next/jest` + Testing Library for the web app)                                     |
| Git hooks / bots    | husky 4                                                        | husky 9, lint-staged 17, commitlint 21, Dependabot                                                   |
| Web framework       | Next.js 10.2 (webpack 4, internal APIs), React 17              | Next.js 16.4 (Pages Router, public CLI only), React 19.2                                             |
| UI                  | Material-UI v4 (`makeStyles`)                                  | MUI v9 (`@mui/lab` 9 beta for the timeline), theme overrides + `styled()`                            |
| Preview live reload | socket.io 2, private Next.js cache override                    | socket.io 4, on-demand revalidation (`pages/api/revalidate.ts`)                                      |
| Other web deps      | highlight.js 10, markdown-to-jsx 7.6, react-icons 3            | highlight.js 11, markdown-to-jsx 9, react-icons 5                                                    |
| Core deps           | awilix 4, cheerio rc.3, chokidar 3, simple-git 2, yaml 1, etc. | awilix 13, cheerio 1.2, chokidar 6, simple-git 4, yaml 2, etc.; parse-git-config and core-js removed |
| npm package names   | `log4brains`, `@log4brains/*`                                  | `@awarded/log4brains`, `@awarded/log4brains-*` (the CLI command is still `log4brains`)               |
| Code quality        | none                                                           | SonarCloud (`FreakinWard_log4brains`): PRs and `develop`, production-code coverage and test results  |

## 2. How the web package works now

- **`log4brains build`** runs `next build` as a child process with `output: "export"`. Its settings (static mode, base path, build ID, ADR folder) are passed as environment variables read by `nextjs/next.config.js`. The export lands in `nextjs/.next-export` and is copied to the output folder. It is built with **Turbopack**, from inside users' `node_modules` (`transpilePackages`).
- **`log4brains preview`** serves a build made when the package is built (`build:nextjs`) and published with it, in `nextjs/.next-preview`. It is built with **webpack**, because Turbopack links server externals (chokidar) through a folder that npm does not publish.
- **Hot reload:** the preview server watches the ADR files. On a change it calls `/api/revalidate/` (protected by a random token) to regenerate the affected pages, then notifies the browser over socket.io. `expireTime: 1` prevents the browser from showing a stale version.
- `next-env.d.ts` is generated (`next typegen` runs before `tsc`).

## 3. Decisions made

- **npm:** publish under the `@awarded` npm organization (owned by the `freakinward` npm user). The project contact is `log4brains@awardedservices.com`. Attribution is kept in `NOTICE`.
- **Node.js:** support the active LTS lines only: 22 (from 22.22.2) and 24 (from 24.15.0) and later, including 26. The best-effort CI job on the newest Node runs with `engine-strict` off.
- **Module system:** ESM for every package except the web package's CLI, which is built as CJS + ESM. CommonJS consumers load the ESM packages with `require(esm)`.
- **Package manager:** npm, with Lerna 10 kept for publishing.
- **Bundlers:** Turbopack for static builds and `next dev`, webpack for the published preview build.
- **Styling:** MUI theme overrides where a style applies app-wide, `styled()` components for everything else, and no `sx` helpers.
- **Accepted visual changes:**
  - **Headings from 1280px:** MUI v9 sizes them exactly (title 47.3 → 48px).
  - **Code blocks:** highlight.js 11's redesigned GitHub theme.
  - **Heading anchors:** markdown-to-jsx 9 drops HTML comments from heading IDs (`#decision-drivers` instead of `#decision-drivers-less-optional-greater`) and makes repeated headings unique (`pros`, `pros-1`, …).
- **Storybook:** its v6 packages were removed because they are incompatible with React 19 and installed a second React. The config, stories and `storybook` script stay for the dev team's upgrade.
- **Tests with ESM-only dependencies:** Jest compiles them to CommonJS on Node 22 (`transformIgnorePatterns`). Remove this once Node 22 is dropped, since Jest loads them natively from Node 24.9.

## 4. Held back on purpose

These are also listed in `.github/dependabot.yml`'s ignore list.

| Package                                         | Kept at       | Why                                                                                                                                       |
| ----------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint, `@eslint/js`                            | 9             | `eslint-plugin-react` and `eslint-plugin-import` don't support ESLint 10 yet. Swapping to `@eslint-react` would drop five enforced rules. |
| TypeScript                                      | 6.0           | TypeScript 7 removes the compiler API used by typescript-eslint and Next.js.                                                              |
| `@types/node`                                   | 22            | Matches the oldest supported Node.js.                                                                                                     |
| `domhandler`                                    | 5             | Must match cheerio's version (core uses its node types).                                                                                  |
| `next`, `react`, `react-dom`, `markdown-to-jsx` | current major | Future majors are planned steps, not automatic updates.                                                                                   |

**Audit:** the published packages' dependencies have no known vulnerabilities (`npm audit --omit=dev`). Development tools have 26 moderate findings from two advisories (glob < 14.0.2, minimatch < 11.0.1). They come through the latest jest, lerna/nx, eslint-plugin-sonarjs, nodemon and typedoc, which pin older majors. They will clear when those tools release fixes.

## 5. Remaining work

| #   | Step                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Status              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | **Local e2e bin link.** On a fresh clone, `npm ci` didn't link `log4brains` because the bin pointed to `dist/`. The bin script is now committed in `global-cli/bin/`.                                                                                                                                                                                                                                                                                                  | done                |
| 2   | **Smoke tests.** Commit the checks run by hand during the upgrade: <ul><li>`log4brains preview --no-open -p <port>`, then GET `/`, `/api/adr/`, `/api/search-index/` and one `/adr/<slug>/`.</li><li>Hot reload: edit an ADR, then expect the revalidation.</li><li>Build output: `out/adr/**`, `out/data/<buildId>/adrs.json` and `search-index.json`.</li><li>An install from `npm pack` tarballs, since that's how users run the app from `node_modules`.</li></ul> | to do               |
| 3   | Open the PR `chore-modernization` → `develop`, with release notes for the breaking changes (Node versions, package names, heading anchors).                                                                                                                                                                                                                                                                                                                            | to do               |
| 4   | **Release setup.** Add the `NPM_TOKEN` and `LERNA_GITHUB_DEPLOY_KEY` secrets (npm trusted publishing is an option), set `RELEASES_ENABLED=true`, publish a first alpha, and run the e2e job against it.                                                                                                                                                                                                                                                                | blocked on secrets  |
| 5   | **Docker.** The image namespace is `freakinward` on Docker Hub (`DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN`). Decide between Docker Hub and GHCR before the first release.                                                                                                                                                                                                                                                                                                | open decision       |
| 6   | **GitHub Pages** for the project's own ADR site (`gh-pages`).                                                                                                                                                                                                                                                                                                                                                                                                          | to do after release |
| 7   | **Storybook upgrade** (Storybook 10 + `@storybook/nextjs`). Framework-based config, essentials in core, CSF3 stories, `build-storybook` runs in CI.                                                                                                                                                                                                                                                                                                                    | done                |
| 8   | **Test coverage.** SonarCloud measures 53.3% coverage of production code. New-code coverage is 34.3%, below the quality gate's 80%, so pull requests get a warning (it doesn't block merging). cli, cli-common, global-cli and the web CLI have no unit tests; the largest uncovered files are `AdrBrowserLayout.tsx`, `InitCommand.ts`, `theme.ts`, `AdrMenu.tsx` and `AppConsole.ts`.                                                                                | later               |
| 9   | **`init`'s tests** have been disabled (`"test": "exit 0"`) since upstream's first commit. Re-enable them or remove them.                                                                                                                                                                                                                                                                                                                                               | optional            |
| 10  | **Possible refactors:** replace moment/moment-timezone (maintenance mode) and lunr (unmaintained).                                                                                                                                                                                                                                                                                                                                                                     | optional            |

## 6. Open decisions

1. **Docker registry:** Docker Hub (`freakinward/log4brains`) or GHCR (`ghcr.io/freakinward/log4brains`)?
2. **Release tooling:** keep `lerna publish --conventional-commits`, or move to Changesets / release-please?
3. **ESLint 10:** wait for `eslint-plugin-react`, or swap to `@eslint-react` and drop five rules?
