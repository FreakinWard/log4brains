# Automate stable releases with a staged release pipeline

- Status: accepted
- Deciders: FreakinWard
- Date: 2026-11-24

Technical Story: [#5](https://github.com/FreakinWard/log4brains/pull/5), [#7](https://github.com/FreakinWard/log4brains/pull/7), [#8](https://github.com/FreakinWard/log4brains/pull/8), [#9](https://github.com/FreakinWard/log4brains/pull/9), [#11](https://github.com/FreakinWard/log4brains/pull/11), [#12](https://github.com/FreakinWard/log4brains/pull/12) — staging the release pipeline as Build, Beta and Release, then hardening it

## Context and Problem Statement

[20241217-switch-back-to-github-flow](20241217-switch-back-to-github-flow.md) kept the automated **beta** release but left the **stable** release as "a manual script executed by maintainers" (`scripts/release.sh`). In practice that meant a maintainer ran a local script that carried long-lived npm and Docker credentials (`release-credentials.local.sh`), picked the version by hand, and could publish from any state of their working copy. That step was a single point of failure, a security liability, and impossible to delegate safely — exactly the "manual testing and release increase bottlenecks" problem earlier ADRs set out to remove, only now concentrated on the one step that still mattered most.

How should a merge to `develop` turn into a published stable release without a human running credentialed commands on a laptop, while keeping the fast beta feedback loop and an honest, bump-free Git history?

## Decision Drivers

- Remove the manual, credential-bearing stable release step; no maintainer should hold publish secrets locally.
- Keep the automated beta release so early adopters keep testing `develop` quickly.
- Keep the Git history clean: no version-bump or release commits pushed back to `develop`.
- A human must still authorize each stable release — automation chooses _what_ can ship, a person decides _whether_ it ships.
- A release must be reproducible and re-runnable after a transient failure, without re-merging.
- The same commit that was beta-tested is what becomes stable — no rebuild drift.

## Considered Options

- Option 1: Keep the manual `scripts/release.sh` run by a maintainer (the status quo left by the superseded ADR).
- Option 2: Let the tooling commit version bumps back to `develop` (the default Lerna/semantic-release style) and release on the resulting tag.
- Option 3: One staged pipeline per merge — **Build → Beta → Release** — that derives the version from Git tags and Conventional Commits and gates the stable publish behind an approval environment.

## Decision Outcome

Chosen option: **Option 3 — a staged Build → Beta → Release pipeline**, because it automates the stable release end to end while still asking a human to approve it, keeps the beta loop, and never writes a bump commit back to `develop`. Option 1 keeps the bottleneck and the local secrets we wanted gone; Option 2 pollutes `develop` with release commits and fights the same Lerna-on-a-branch limitation the previous ADRs already ran into, so we keep versions in Git tags instead of in `package.json` on the branch.

Concretely, as implemented in `.github/workflows/on-merge-to-develop.yml` and the reusable `stage-build.yml`, `stage-beta.yml` and `stage-release.yml`:

- **One run per merge to `develop`, three stages: Build → Beta → Release.** Each stage is a reusable `stage-*.yml` workflow called by the top-level pipeline, modelled on Azure DevOps stages. The run page lists the stages in its sidebar and each stage can be re-run on its own from there.
- **Versions come from Git tags and Conventional Commits; nothing is committed back.** `.github/scripts/release-version.sh` reads the latest `vX.Y.Z` tag and the commit subjects/bodies since it: a breaking change (`type!:` or a `BREAKING CHANGE:` footer) bumps major, `feat` bumps minor, anything else patch; `lerna.json`'s `version` acts as a floor. The beta version is the stable version plus a beta number (the pipeline passes the run number so concurrent runs never collide). The computed version is only _stamped_ in-memory (`lerna version … --no-git-tag-version --no-push`) before packing — no bump commit ever lands on `develop`.
- **"Releasable" is itself a Conventional-Commits decision.** Beta and Release only run when a commit since the last stable tag is a `feat`, `fix`, `perf` or `revert`, a breaking change, or a production-dependency update (`type(deps):`, as Dependabot writes it). `ci`, `docs`, `test`, `chore` and dev-dependency (`deps-dev`) commits alone do not trigger a release; the stages are skipped unless a manual run checks **Force release**.
- **Beta publishes automatically.** The Beta stage publishes the Build stage's packages to npm under the `beta` dist-tag via npm **trusted publishing** (OIDC, `id-token: write` — no stored npm token), tags `vX.Y.Z-beta.N`, e2e-tests the published package across the OS/Node matrix, then builds and pushes the Docker image (`:beta` and the version tag).
- **Release republishes the same commit as stable, after approval.** The Release stage's Publish job holds the `release` GitHub environment, which requires manual approval; every other job in the stage waits on it. It refuses to run unless the commit is still the branch's latest, rebuilds the same commit with the stable version, publishes to the `latest` dist-tag (again trusted publishing), creates the `vX.Y.Z` tag and GitHub Release, then pushes Docker (`:latest`) and deploys the GitHub Pages site. Approval is bounded: a sibling `release-timeout` job gives the approver **1 minute**, after which it cancels the run so a waiting approval never blocks the next merge. To release later, re-run the failed jobs and approve within the minute.
- **Dry-run by default; only `develop` ever publishes.** Real publishing is gated by the `RELEASES_ENABLED` repository variable, and `dry-run` is forced on for any ref other than `refs/heads/develop`. In a dry run the stages publish, tag, push and deploy nothing — e2e and Docker install from a throwaway local npm registry instead, and the `beta`/`release` environments (which only allow `develop`) are skipped. This lets the whole pipeline be exercised on a branch with **Force release** before it is trusted on `develop`.

### Positive Consequences

- No maintainer holds npm or Docker publish credentials locally; publishing uses short-lived OIDC trusted publishing from CI.
- The exact commit that was beta-tested is what ships as stable — the Release stage rebuilds the same SHA, no drift.
- `develop` history stays free of bump/release commits; the version lives entirely in Git tags.
- A human still gates every stable release through the `release` environment, and the 1-minute timeout keeps an idle approval from blocking later merges.
- Partial failures are recoverable by re-running a single stage from the run page.

### Negative Consequences

- The 1-minute approval window is deliberately short; an approver who misses it must re-run the failed jobs and approve again.
- Understanding "what version will ship" now means reading Git tags and commit types rather than a number in `package.json`, which is less obvious at a glance.
- The pipeline depends on GitHub environments, OIDC trusted publishing and the `RELEASES_ENABLED` variable being configured correctly; misconfiguration shows up only at release time.

## Links

- Supersedes [20241217-switch-back-to-github-flow](20241217-switch-back-to-github-flow.md) (which kept the stable release manual).
- Builds on [20240926-transition-to-simplified-git-flow](20240926-transition-to-simplified-git-flow.md) and the automated beta release it introduced.
- Implemented in `.github/workflows/on-merge-to-develop.yml`, `stage-build.yml`, `stage-beta.yml`, `stage-release.yml` and `.github/scripts/release-version.sh`.
