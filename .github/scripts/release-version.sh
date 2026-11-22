#!/usr/bin/env bash
# Prints the versions for the current commit, computed from git tags and Conventional Commits only
# (the pipeline never commits version bumps back to develop):
#   stable=<X.Y.Z>        the version the Release stage publishes to npm "latest"
#   beta=<X.Y.Z-beta.N>   the version the Beta stage publishes to npm "beta"
#
# stable = the latest stable tag (vX.Y.Z) bumped by the commits since it: a breaking change
# ("type!:" or a "BREAKING CHANGE:" footer) bumps major, "feat" bumps minor, anything else patch.
# lerna.json's "version" is a floor: raise it in a pull request to force a bigger bump (e.g. 2.0.0).
# beta  = stable plus the next free beta number among the vX.Y.Z-beta.N tags.
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

last_beta="$(git tag --list "v${stable}-beta.*" | sed -E 's/.*-beta\.//' | sort -n | tail -1 || true)"
beta_number=$(( ${last_beta:--1} + 1 ))

echo "stable=${stable}"
echo "beta=${stable}-beta.${beta_number}"
