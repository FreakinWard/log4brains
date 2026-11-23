#!/usr/bin/env bash
# Prints the versions for the current commit, computed from git tags and Conventional Commits only
# (the pipeline never commits version bumps back to develop):
#   stable=<X.Y.Z>        the version the Release stage publishes to npm "latest"
#   beta=<X.Y.Z-beta.N>   the version the Beta stage publishes to npm "beta"
#   releasable=<true|false>  whether any commit since the last stable tag changes the published packages
#   last_release=<vX.Y.Z>    the last stable tag
#
# stable = the latest stable tag (vX.Y.Z) bumped by the commits since it: a breaking change
# ("type!:" or a "BREAKING CHANGE:" footer) bumps major, "feat" bumps minor, anything else patch.
# lerna.json's "version" is a floor: raise it in a pull request to force a bigger bump (e.g. 2.0.0).
# beta  = stable plus a beta number: BETA_NUMBER when set (the pipeline passes its run number, so runs
#         building at the same time never pick the same version), otherwise the next free number among
#         the vX.Y.Z-beta.N tags.
#
# releasable = true when a commit since the last stable tag is a feat, fix, perf or revert, a breaking
# change, or a production dependency update ("type(deps):", as Dependabot writes it). ci, docs, test,
# chore and dev-dependency (deps-dev) commits alone don't make a release.
set -euo pipefail

semver_max() { printf '%s\n' "$@" | sort -V | tail -1; }

last_stable_tag="$(git tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1 || true)"
last_stable="${last_stable_tag#v}"
last_stable="${last_stable:-0.0.0}"

range="${last_stable_tag:+${last_stable_tag}..}HEAD"
subjects="$(git log --format=%s "$range")"
bodies="$(git log --format=%b "$range")"

IFS=. read -r major minor patch <<< "$last_stable"
if grep -qE '^[a-z]+(\([^)]*\))?!:' <<< "$subjects" || grep -qE '^BREAKING[ -]CHANGE:' <<< "$bodies"; then
  bumped="$((major + 1)).0.0"
elif grep -qE '^feat(\([^)]*\))?:' <<< "$subjects"; then
  bumped="${major}.$((minor + 1)).0"
else
  bumped="${major}.${minor}.$((patch + 1))"
fi

floor="$(node -p "require('./lerna.json').version")"
stable="$(semver_max "$bumped" "$floor")"
if [[ "$stable" == "$last_stable" ]]; then
  stable="$bumped" # the floor was already released
fi

if [[ -n "${BETA_NUMBER:-}" ]]; then
  beta_number="$BETA_NUMBER"
else
  last_beta="$(git tag --list "v${stable}-beta.*" | sed -E 's/.*-beta\.//' | sort -n | tail -1 || true)"
  beta_number=$(( ${last_beta:--1} + 1 ))
fi

echo "stable=${stable}"
echo "beta=${stable}-beta.${beta_number}"

if grep -qE '^(feat|fix|perf|revert)(\([^)]*\))?!?:|^[a-z]+(\([^)]*\))?!:|^[a-z]+\(deps\):' <<< "$subjects" \
  || grep -qE '^BREAKING[ -]CHANGE:' <<< "$bodies"; then
  echo "releasable=true"
else
  echo "releasable=false"
fi
echo "last_release=${last_stable_tag:-none}"
