#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ "$#" -ne 1 ]; then
  echo "Please pass the code bundle id to set"
  exit 1
fi

echo "export const codeBundleId: string | undefined = \"$1\";" > "$DIR/../bugsnag.env.ts"
