#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ -z ${1+x} ]; then
  echo "codepush secret key unset"
else
  cd $DIR/../ios
  sed -i'.bak' "s/18e30278-e46f-4a4b-89e7-e35fefacafb5/${1}/g" AppCenter-Config.plist
  rm AppCenter-Config.plist.bak
fi

if [ -z ${2+x} ]; then
  echo "codepush api unset"
else
  cd $DIR/../ios/keplrmobile
  sed -i'.bak' "s/y_oh1EPXmQ7mMKNB13bAw3cxE9cvw2wY6YlUG/${2}/g" Info.plist
  rm Info.plist.bak
fi

if [ -z ${3+x} ]; then
  echo "bugsnag api unset"
else
  cd $DIR/../ios/keplrmobile
  sed -i'.bak' "s/fba0f81f121c1a15f7195bb269428911/${3}/g" Info.plist
  rm Info.plist.bak
fi

if [ -z ${4+x} ]; then
  echo "version unset"
else
  cd $DIR/..
  sed -i'.bak' "s/export const APP_VERSION: string = '2.0.0'/export const APP_VERSION: string = '${4}'/g" constants.ts
  rm constants.ts.bak
fi

if [ -z ${5+x} ]; then
  echo "codepush version unset"
else
  cd $DIR/..
  sed -i'.bak' "s/export const CODEPUSH_VERSION: string | undefined = undefined;/export const CODEPUSH_VERSION: string | undefined = '${5}';/g" constants.ts
  rm constants.ts.bak
fi

