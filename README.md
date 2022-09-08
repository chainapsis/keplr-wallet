# Obi Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Development workflow: mobile app

### Prerequisites

- [Install protobuf](https://grpc.io/docs/protoc-installation/)
- [Setup up React Native development environment (React Native CLI Quickstart)](https://reactnative.dev/docs/environment-setup).
Note: on m1 Mac, use `brew install cocoapods` instead of `sudo gem install cocoapods`. Otherwise `pod install` will fail.
- `npm i -g nx` (or use `npx nx` instead of `nx` for the commands in the Workflow section)

### Setup

In `obi-wallet` directory:

- `yarn setup`
- `nx run mobile:injected-provider-dev` (this process will seem to hang when done – you can safely terminate it)
- Add `.env` to `apps/mobile/.env` as described in Notion.

### Workflow

In `obi-wallet` directory:

- `nx run-ios mobile` (to run ios version)
- `nx run-android mobile` (to run android version. Specify --device-id if using a physical device)
- `nx start mobile` (to only start metro packager)
- `yarn format` (to reformat code using prettier & eslint fixers)
- `yarn lint` (to lint code)
- `yarn test` (to run unit tests)
- `yarn checks` (to run all checks, i.e. lint & test)

## Development workflow: browser extension

In root directory: `yarn dev`

## Additional Dev-Info

- The Multisig address & biometrics wallet need a transaction to work correctly. E.g. by using the testnet faucet for biometrics wallet and then pressing "Prepare Multisig Wallet". Testnet faucet is located here: (https://discord.gg/juno)
In order for the public key not to be null on chain, the account needs to act (like send funds). That’s what "Prepare Multisig Wallet"-button does. Otherwise the nodes simply don’t know this necessary information about the address since it has done nothing.

- Add prop initialRouteName="onboarding4" to Stack.Navigator in OnboardingScreen in "obi-wallet/apps/mobile/src/app/screens/onboarding/index.tsx" to skip onboarding-screens
