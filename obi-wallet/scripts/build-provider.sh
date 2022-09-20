SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd ${SCRIPT_DIR}/..;

yarn webpack --config libs/injected-provider/webpack.config.js --mode production
node scripts/build-provider
yarn prettier --write apps/mobile/src/app/injected-provider/bundle.ts
