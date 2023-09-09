#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd "$DIR/.."

# Fix from https://github.com/facebook/react-native/issues/36758
sed -i.bo 's/    node->getLayout()\.hadOverflow() |/    node->getLayout()\.hadOverflow() ||/' ./node_modules/react-native/ReactCommon/yoga/yoga/Yoga.cpp
sed -i.bo 's/    node->getLayout()\.hadOverflow() |||/    node->getLayout()\.hadOverflow() ||/' ./node_modules/react-native/ReactCommon/yoga/yoga/Yoga.cpp

cd "ios"

yarn pod-install
yarn build:provider

if [ $(uname -m) == 'arm64' ]; then
  arch -x86_64 npx react-native run-ios
else
  react-native run-ios
fi
