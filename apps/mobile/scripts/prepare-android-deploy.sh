#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ -z ${1+x} ]; then
  echo "codepush secret key unset"
else
  cd $DIR/../android/app/src/main/assets
  sed -i'.bak' "s/2b79d8ee-7cc9-472e-853e-0bd6ecde7561/${1}/g" appcenter-config.json
  rm appcenter-config.json.bak
fi

if [ -z ${2+x} ]; then
  echo "codepush api unset"
else
  cd $DIR/../android/app/src/main/res/values
  sed -i'.bak' "s/REjDoiFB_oK-qkJINr9jXzj8H4SArxGov6b61/${2}/g" strings.xml
  rm strings.xml.bak
fi

if [ -z ${3+x} ]; then
  echo "bugsnag api unset"
else
  cd $DIR/../android/app/src/main
  sed -i'.bak' "s/fba0f81f121c1a15f7195bb269428911/${3}/g" AndroidManifest.xml
  rm AndroidManifest.xml.bak
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

