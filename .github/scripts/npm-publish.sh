#!/usr/bin/env bash
# Usage: npm-publish.sh <dir with .tgz files> <dist-tag> <dry-run: true|false>
# Publishes every packed package to npmjs.org under the dist-tag, through npm trusted publishing (OIDC),
# which also adds provenance. Versions already on npm are skipped, so re-running after a partial
# publish finishes the job instead of failing.
set -euo pipefail

dir="$1"
tag="$2"
dry_run="${3:-false}"

cd "$dir"
for tgz in *.tgz; do
  spec="$(tar -xzOf "$tgz" package/package.json \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const p=JSON.parse(d);console.log(p.name+'@'+p.version)})")"
  # "./" so npm reads a local file, not a GitHub shorthand
  if [[ "$dry_run" == "true" ]]; then
    npm publish "./$tgz" --tag "$tag" --access public --dry-run
  elif npm view "$spec" version > /dev/null 2>&1; then
    echo "$spec is already on npm, skipping"
  else
    npm publish "./$tgz" --tag "$tag" --access public
  fi
done
