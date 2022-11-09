#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd "$DIR/../ios"

yarn pod-install
yarn build:provider

if [ $(uname -m) == 'arm64' ]; then
  arch -x86_64 npx react-native run-ios
else
  react-native run-ios
fi
