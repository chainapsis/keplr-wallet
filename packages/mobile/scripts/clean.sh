#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd "$DIR/../ios"
xcodebuild clean | true

rm -rf "$DIR/../ios/Pods"

cd "$DIR/../android"
./gradlew clean | true

rm -rf "$DIR/../android/.gradle"
rm -rf "$DIR/../android/build"

rm -rf "$DIR/../node_modules"
rm -rf "$DIR/../build"
