#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

rm -rf "$DIR/../node_modules"
rm -rf "$DIR/../build"
rm -rf "$DIR/../ios/build"
rm -rf "$DIR/../ios/Pods"
rm -rf "$DIR/../android/.gradle"
rm -rf "$DIR/../android/build"
rm -rf "$DIR/../android/app/build"

cd "$DIR/../ios"

if [ "$(which xcodebuild 2>/dev/null)" == "" ]; then
  echo "xcodebuild not found - skipping xcodebuild clean..."
else
  xcodebuild clean | true
fi


cd "$DIR/../android"

if [ "$(which gradlew 2>/dev/null)" == "" ]; then
  echo "gradlew not found - skipping gradlew clean..."
else
  ./gradlew clean | true
fi


