#! /bin/bash -x
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

watchman watch-del "$DIR/.."
watchman watch-del "$DIR/../../.."
watchman watch-project "$DIR/.."
watchman watch-project "$DIR/../../.."

cd "$DIR/../ios"
xcodebuild clean

rm -rf "$DIR/../ios/Pods"

cd "$DIR/../android"
./gradlew clean

rm -rf "$DIR/../android/.gradle"
rm -rf "$DIR/../android/build"

rm -rf "$DIR/../node_modules"
rm -rf "$DIR/../build"
