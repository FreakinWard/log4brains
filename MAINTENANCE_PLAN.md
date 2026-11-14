# Log4brains Fork & Modernization Plan

_Updated 2026-11-14 · Baseline: `develop` @ `17e3202` (upstream v1.1.0 + 3 CI/docs commits), in sync with `origin` (FreakinWard/log4brains) and `upstream/develop`._

## TL;DR

1. **Phase 0 is done.** The fork is synced to upstream v1.1.0 and pushed. Locally on Node 22, everything passes: a clean install, build, typecheck, lint, format, unit tests, e2e, and a smoke test of preview mode.
2. **The first CI run on the fork failed.** There are two causes and both come from the environment drifting since Dec 2024, not from code bugs:
   - **Node 18 is dead.** CI's production-style install pulls current transitive deps, and `lru-cache@11` requires Node 20+.
   - **The `node-version: current` job resolved to Node 27 alpha.** Yarn rejects the prerelease against `engines: >=18`.
   - The 20.x and 22.x jobs were _cancelled_ by fail-fast. I re-ran that path locally on Node 22 and it passes.
   - Fixing CI is the first real work item (Phase 1).
3. **The big job hasn't changed:** `@log4brains/web` is still Next.js 10.2.3 / webpack 4 / React 17 / Material-UI v4 / socket.io v2. It still calls Next.js internal APIs and only runs on modern Node through `--openssl-legacy-provider`.
4. **You still need to decide on npm ownership.** You can't publish `log4brains` / `@log4brains/*` without the original author handing them over.

---

## 1. Current state (verified)

### Local health check: Node 22.23.3, Yarn 1.22.22 via corepack

| Check                                                                                               | Result                                                                                                                       |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `yarn install --frozen-lockfile`                                                                    | ✅ (peer-dependency warnings only)                                                                                           |
| `yarn build` (6 packages)                                                                           | ✅                                                                                                                           |
| `yarn typescript`                                                                                   | ✅                                                                                                                           |
| `yarn lint`                                                                                         | ✅                                                                                                                           |
| `yarn format`                                                                                       | ✅ for all 297 tracked files (this plan file was flagged while it was untracked; run `yarn format:fix` before committing it) |
| `yarn test`                                                                                         | ✅ core 85/85, web 12/12, 17 snapshots                                                                                       |
| `yarn e2e` (init, adr new, adr list, build)                                                         | ✅ reports version 1.1.0                                                                                                     |
| Same e2e after CI-style `yarn install --production --no-lockfile`                                   | ✅ on Node 22                                                                                                                |
| Preview smoke test (`/`, `/api/adr/`, `/api/search-index/`, an ADR page, `/socket.io/socket.io.js`) | ✅ all 200, 19 ADRs                                                                                                          |

### First CI run on the fork: [run 43650281597](https://github.com/FreakinWard/log4brains/actions/runs/43650281597), "On merge to develop (alpha releases)"

| Job                                  | Result            | Cause                                                                                                                                                                                                 |
| ------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quality-checks                       | ✅ 2m11s          |                                                                                                                                                                                                       |
| load-nodejs-supported-versions       | ✅                |                                                                                                                                                                                                       |
| tests: LTS (22) on windows-latest    | ✅ 6m31s          |                                                                                                                                                                                                       |
| tests: LTS (22) on macos-latest      | ✅ 5m41s          |                                                                                                                                                                                                       |
| tests-per-nodejs-version **18.x**    | ❌ E2E step       | The e2e step runs `rm -rf node_modules && yarn install --production --no-lockfile`, which resolves current deps. `lru-cache@11.5.3` needs node `20 \|\| >=22`, so Yarn refuses to install on 18.20.8. |
| tests-per-nodejs-version 20.x / 22.x | ⚪ cancelled      | Matrix fail-fast after 18.x failed. Not actually broken: the same steps pass locally on 22.                                                                                                           |
| tests-nodejs-current                 | ❌ `yarn install` | `node-version: current` downloaded **v27.0.0-alpha.0.1.0**. Yarn's engines check rejects the prerelease for `>=18`.                                                                                   |
| release-alpha                        | ⏭ skipped         | Would have failed anyway: needs `LERNA_GITHUB_DEPLOY_KEY` + `NPM_TOKEN` and publishes to npm packages you don't own.                                                                                  |

Warnings in the run:

- `actions/checkout@v4` / `setup-node@v4` target Node 20, which GitHub has deprecated, and are being forced onto Node 24. Bump them.
- Lerna 5.x sub-packages are marked "no longer supported" on npm.
- Many `glob@7` deprecation warnings.

**What this means for users:** `npm install -g log4brains` has no lockfile either, so Node 18 users get the same floating deps. npm only _warns_ on engines mismatches, so it may install and then break at runtime. Treat Node 18 as unsupported. It went EOL in April 2025.

### What v1.1.0 already fixed (removed from the old plan)

- Node 18/20/22 support (via the OpenSSL legacy hack), `engines >=18`, `.nvmrc` = 22
- `esm` loader removed from global-cli
- CI rewritten as reusable workflows (`actions/*@v4`, no `::set-output`)
- `markdown-it` 11 → 14
- Dockerfile now `node:lts-alpine`
- `lerna.json` `allowBranch: develop` (GitHub Flow, `develop` is the main branch)
- All packages build with microbundle (`es`+`cjs`)
- Web package split into `packages/web/cli/` (CLI that drives Next) and `packages/web/nextjs/` (the Next app)

---

## 2. Phase 1: Get the fork's CI green (next step, about ½ day)

- [ ] **Drop Node 18.** Set `.github/supported_nodejs_versions.json` to `["20.x", "22.x", "24.x"]` and `engines.node` to `>=20` in the root and all 6 `packages/*/package.json`.
- [ ] **Set `.nvmrc` to 24** (current LTS). The "LTS on all OSes" jobs use it, so confirm macOS and Windows pass on 24 too.
- [ ] **Fix the `tests-nodejs-current` job** (`.github/workflows/on-merge-to-develop.yml:46`). `current` can resolve to a prerelease. Pick one:

  - (a) mark it `continue-on-error: true` so it only gives a heads-up;
  - (b) pin to the newest stable major;
  - (c) remove it.

  I recommend (a).

- [ ] **Add `fail-fast: false`** to the per-version test matrix so one version can't hide the others.
- [ ] **Disable `release-alpha`** until npm ownership is settled. Either add `if: false`, or gate it with `if: github.repository == 'thomvaill/log4brains'` / your own repo once you have secrets. Otherwise every push to `develop` tries to publish.
- [ ] **Check the scheduled workflows**, which now run on your fork:
  - `scheduled-weekly-e2e-stable.yml` (Wed): installs the _published_ `log4brains` from npm. That's still useful as a regression signal while you have no package of your own.
  - `scheduled-weekly-new-nodejs-lts-check.yml` (Sun): opens issues on your repo when a new LTS appears. Keep it if you want the nag.
- [ ] Bump `actions/checkout` and `actions/setup-node` to their current majors (the Node 20 deprecation warning).
- [ ] Add `.DS_Store` and `.idea/` to `.gitignore`.
- [ ] Re-run CI. Done when every job is green except the intentionally disabled release.

---

## 3. Phase 2: Ownership & rebrand (½–1 day, mostly waiting on decisions)

Contact the original maintainer (Thomas Vaillant). Options, best first:

1. Get added as maintainer on the GitHub repo and on npm (`log4brains` + `@log4brains` org). That keeps the name and users.
2. Get a "moved to …" note in the upstream README.
3. Hard fork under a new name or scope, e.g. `@freakinward/*`. Every cross-package dependency in `packages/*/package.json` would need renaming.

Keep the `LICENSE` (Apache-2.0) and attribution, and add a `NOTICE` crediting the original author.

**`thomvaill` references that affect users** (the paths changed in v1.1.0):

| File                                                                                  | What                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/cli/src/cli.ts:14`                                                          | ADR template is fetched **at runtime** from `raw.githubusercontent.com/thomvaill/log4brains/stable/...`. This depends on the upstream `stable` branch. Your fork has no `stable` branch yet. |
| `packages/init/src/commands/InitCommand.ts:16`                                        | docs link printed after `init`                                                                                                                                                               |
| `packages/web/nextjs/src/layouts/AdrBrowserLayout/AdrBrowserLayout.tsx:468`           | footer link                                                                                                                                                                                  |
| `packages/web/nextjs/src/layouts/AdrBrowserLayout/components/AdrMenu/AdrMenu.tsx:171` | issue link                                                                                                                                                                                   |
| `packages/init/assets/{README,index,use-log4brains-to-manage-the-adrs}.md`            | scaffolded into users' repos                                                                                                                                                                 |

**Other references:**

- package metadata (`author`, `homepage`, `repository`) in all 6 packages
- `scripts/release.sh:30-43`
- `docker/Makedockfile.conf` (`MDF_NAMESPACE`) and `docker/README.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (contact email), `docs/adr/*`
- historical issue links in TODO comments (fine to keep)

**Secrets the fork's workflows expect:**

- `NPM_TOKEN`
- `LERNA_GITHUB_DEPLOY_KEY` (a deploy key so Lerna can push version commits to protected `develop`)
- `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN`
- `GITHUB_TOKEN` (automatic)

Also enable GitHub Pages for the `gh-pages` ADR site. Consider GHCR instead of Docker Hub, and npm trusted publishing (OIDC) instead of `NPM_TOKEN`.

---

## 4. Phase 3: Tooling modernization (1–2 days, low risk)

| Tool                             | Now                                      | Target                                            | Notes                                                                                                                                                       |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node                             | 18/20/22                                 | 20/22/24                                          | covered in Phase 1                                                                                                                                          |
| Yarn                             | 1.22 classic (no `packageManager` field) | add `"packageManager"`; optionally pnpm or Yarn 4 | Yarn 1 is frozen. A switch also gets rid of `workspace-aggregator` weirdness.                                                                               |
| Lerna                            | 5.5 (deprecated sub-packages)            | 8+/latest, or **Changesets**                      | Lerna ≥7 drops `useWorkspaces`/`bootstrap`. Release flow is `lerna publish --conventional-commits` (in `on-merge-to-develop.yml` and `scripts/release.sh`). |
| TypeScript                       | ^4.0                                     | 5.x, then 7 (`tsgo`)                              | `web` pins its own `typescript ^4.0.3` too                                                                                                                  |
| ESLint                           | 7 + airbnb-typescript + `.eslintrc.js`   | 9/10 flat config + `typescript-eslint` 8          | `eslint-plugin-sonarjs@0.5` already has broken peer deps. Drop airbnb-typescript and `prettier-eslint-cli`.                                                 |
| Prettier                         | 2                                        | 3                                                 | one reformat commit                                                                                                                                         |
| Jest / ts-jest                   | 26                                       | 30, or Vitest                                     | Vitest is easier once on ESM                                                                                                                                |
| husky / lint-staged / commitlint | 4 / 10 / 11                              | latest                                            | husky ≥5 needs a `.husky/` directory                                                                                                                        |
| microbundle                      | 0.12                                     | **tsup** (or `tsc`)                               | microbundle is effectively unmaintained and now builds _every_ package                                                                                      |
| typedoc                          | `0.17.0-3`                               | latest                                            | `--mode` flag removed                                                                                                                                       |
| Storybook                        | 6.1 (needs the OpenSSL hack)             | re-init after the web upgrade, or drop it         |                                                                                                                                                             |
| Dependency bot                   | none                                     | Dependabot or Renovate                            | so this doesn't happen again                                                                                                                                |

---

## 5. Phase 4: Runtime deps for core/cli/cli-common/init (2–3 days)

Mostly mechanical, but several are **ESM-only**. **Recommendation:** convert the monorepo to ESM (`"type": "module"`, tsup emitting ESM, plus CJS only if needed).

| Package(s)                     | Dep                                                                                 | Now → Latest                                                                                       | Notes                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| core                           | awilix                                                                              | 4 → 13                                                                                             | DI container; check injection modes                                      |
| core                           | neverthrow                                                                          | 2 → 8                                                                                              | stricter `andThen` typings                                               |
| core                           | cheerio                                                                             | `1.0.0-rc.3` → 1.2                                                                                 | import style; drop `@types/cheerio`                                      |
| core                           | simple-git, git-url-parse                                                           | 2 → 4, 11 → 16                                                                                     | ESM in later majors                                                      |
| core                           | yaml, chokidar, joi, slugify, launch-editor, lodash                                 | various                                                                                            | `yaml` 2 options changed. `chokidar` 4 dropped globs. Drop `@types/joi`. |
| core                           | `markdown-it-source-map`                                                            | unmaintained                                                                                       | vendor it if it breaks on markdown-it 14+                                |
| core                           | core-js                                                                             | 3.7                                                                                                | probably removable on Node ≥20                                           |
| core/init/web                  | moment, moment-timezone                                                             | maintenance mode                                                                                   | works; replace later (7 files)                                           |
| cli-common/cli/init/global-cli | chalk 4, ora 5, inquirer 7, execa 4/5, terminal-link 2, open 7, commander 6, mkdirp | → chalk 5, ora 8, `@inquirer/prompts`, execa 9, terminal-link 3, open 10, commander 14, `fs.mkdir` | ESM-only; `inquirer` has a new API                                       |

---

## 6. Phase 5: `@log4brains/web` rewrite (7–12 days, most of the risk)

Layout since v1.1.0: `packages/web/cli/` (programmatic Next driver: `commands/build.ts`, `commands/preview.ts`) + `packages/web/nextjs/` (Pages Router app, `next.config.js`, `.storybook`). The `nextjs/` folder is shipped inside the npm package and **built and exported from inside users' `node_modules`**.

| Area                                                                    | Now                                                                                                                                                                  | Target                          | Impact                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js                                                                 | 10.2.3 (webpack 4)                                                                                                                                                   | 15/16                           | `target: "serverless"` is gone. `next export` is replaced by `output: "export"`. The webpack `rules[0].exclude` hack and `future.excludeDefaultMomentLocales` in `nextjs/next.config.js` stop working. |
| **Internal Next APIs**                                                  | `packages/web/cli/commands/build.ts:2-5` imports `next/dist/build`, `next/dist/export`, `next/dist/next-server/server/config`, `next/dist/next-server/lib/constants` | public APIs only                | Redesign it: run `next build` with `output: "export"` (child process or a generated config). Preview can keep `next({ dev, dir })`.                                                                    |
| OpenSSL hack                                                            | `global-cli/src/log4brains` re-spawns node with `--openssl-legacy-provider`. The same flag is in the `web` `build:nextjs`, `dev:nextjs` and `storybook` scripts.     | remove                          | Becomes possible once webpack 4 is gone.                                                                                                                                                               |
| React                                                                   | 17 (`@types/react` pinned to 17.0.4)                                                                                                                                 | 18, then 19                     | `react-test-renderer` is deprecated, so use Testing Library                                                                                                                                            |
| Material-UI                                                             | `@material-ui/*` v4 (19 files)                                                                                                                                       | `@mui/material` v5, then latest | `makeStyles` → `sx`/`styled`/`tss-react`. `Alert`/`Autocomplete` move out of `lab`. Remove the `babel-plugin-import` `.babelrc` so SWC can be used.                                                    |
| socket.io                                                               | v2 server + client                                                                                                                                                   | v4                              | `preview.ts` server init changes. Client is served from `/socket.io/socket.io.js`.                                                                                                                     |
| highlight.js                                                            | 10                                                                                                                                                                   | 11                              | API + CSS path changes                                                                                                                                                                                 |
| react-icons, markdown-to-jsx, copy-text-to-clipboard, lunr, badge-maker | minor/major                                                                                                                                                          | latest                          | small                                                                                                                                                                                                  |

**Order:**

1. Next 12 + React 18 + SWC: drop `serverless`, `.babelrc`, and the webpack 4 hacks.
2. MUI v5.
3. Next 13/14: `output: "export"`, rewrite `build.ts` to drop the internal APIs, socket.io 4.
4. Next 15/16 + React 19 + latest MUI. Remove the OpenSSL hack everywhere.

After each step, run e2e **after a production-style install** (the CI step that caught the Node 18 issue) plus the preview smoke test.

---

## 7. Phase 6: Tests worth adding before Phase 5 (½–1 day)

- Commit the **preview smoke test** I ran by hand: start `log4brains preview --no-open -p <port>`, poll `/`, then GET `/api/adr/` (note the trailing slash; without it you get a 308), `/api/search-index/` and one `/adr/<slug>/`. Expect 200s and a non-empty ADR list.
- **Build output assertions:** ADR pages exist under `.log4brains/out/adr/`, the `data/<buildId>/` JSON exists, and the search index loads.
- Optional: Playwright for search and navigation.

---

## 8. Phase 7: Release & distribution (1–2 days)

- Choose release tooling: keep `lerna publish --conventional-commits` (already wired into `on-merge-to-develop.yml`, `on-release-tag.yml` and `scripts/release.sh`), or switch to Changesets/release-please.
- Create a `stable` branch on your fork if you keep the runtime template URL pattern (`cli.ts:14`).
- Docker: change the namespace, or move to `ghcr.io/freakinward/log4brains`.
- Add `SECURITY.md`. Run an audit after upgrading (Next 10, socket.io v2 and cheerio rc have known advisories).

---

## 9. Order & sizing

| #   | Step                                                                                                      | Effort    | Status                    |
| --- | --------------------------------------------------------------------------------------------------------- | --------- | ------------------------- |
| 0   | Sync fork to upstream v1.1.0, verify locally, push                                                        | ½ day     | ✅ done                   |
| 1   | Get CI green: drop Node 18, add 24, fix `current` job, fail-fast off, disable alpha release, `.gitignore` | ½ day     | next                      |
| 2   | Ownership decision, rebrand, secrets                                                                      | ½–1 day   | blocked on you / upstream |
| 3   | Tooling modernization                                                                                     | 1–2 days  |                           |
| 4   | ESM + core/cli dependency upgrades                                                                        | 2–3 days  |                           |
| 5   | Commit preview/build smoke tests                                                                          | ½–1 day   | do before 6               |
| 6   | Web: Next/React/MUI/socket.io upgrade, replace internal Next APIs                                         | 7–12 days | highest risk              |
| 7   | Release pipeline, Docker, first release from the fork                                                     | 1–2 days  |                           |

**Remaining total:** about 2–3½ weeks.

## 10. Open decisions

1. **npm name:** negotiate a handover, or rename under a new scope?
2. **Node support:** `>=20` (recommended) or `>=22`?
3. **Package manager / release tool:** Yarn 1 + Lerna, or pnpm/Yarn 4 + Changesets?
4. **Module system:** full ESM (recommended) or stay on CJS-compatible majors?
5. **Storybook:** re-init or drop?
6. **Docker registry:** Docker Hub or GHCR?
