#! /bin/bash -x
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd "$DIR/../ios"

if [ "$(which xcodebuild 2>/dev/null)" == "" ]; then
  echo "xcodebuild not found - skipping xcodebuild clean..."
else
  xcodebuild clean
fi

rm -rf "$DIR/../ios/Pods"

cd "$DIR/../android"
if [ "$(which gradlew 2>/dev/null)" == "" ]; then
  echo "gradlew not found - skipping gradlew clean..."
else
  ./gradlew clean
fi

rm -rf "$DIR/../android/.gradle"
rm -rf "$DIR/../android/build"

rm -rf "$DIR/../node_modules"
rm -rf "$DIR/../build"
