#!/usr/bin/env bash
set -euo pipefail

package_name="${1:-}"
package_version="${2:-}"
wait_minutes="${3:-}"

usage() {
  echo "Usage: $0 <package_name> <package_version> <wait_minutes>"
}

if [[ -z "${package_name}" ]]
then
  echo "Missing package_name"
  usage
  exit 1
fi

if [[ -z "${package_version}" ]]
then
  echo "Missing package_version"
  usage
  exit 1
fi

if [[ -z "${wait_minutes}" ]] || ! [[ "${wait_minutes}" =~ ^-?[0-9]+$ ]]
then
  echo "Missing wait_minutes or is not a valid integer"
  usage
  exit 1
fi

echo "Checking if ${package_name}@${package_version} is available on NPM (waiting max ${wait_minutes} min)..."

# --prefer-online: ask the registry every time; npm's cached copy of the version list can lag minutes behind
is_available() {
  npm view "${package_name}" versions --json --prefer-online 2> /dev/null \
    | jq -e --arg package_version "${package_version}" 'index($package_version)' &> /dev/null
}

deadline=$((SECONDS + wait_minutes * 60))
until is_available
do
  if [[ ${SECONDS} -ge ${deadline} ]]
  then
    echo "Failure for more than ${wait_minutes} minutes"
    echo "Available versions:"
    npm view "${package_name}" versions --json --prefer-online
    echo "Abort"
    exit 1
  fi

  echo "${package_name}@${package_version} is not available yet on NPM. Let's wait 10s..."
  sleep 10
done

echo "${package_name}@${package_version} is available"
