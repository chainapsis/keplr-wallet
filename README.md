# Obi Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Development workflow: mobile app

### Prerequisites

- [Setup up React Native development environment](https://reactnative.dev/docs/environment-setup).
- `npm i -g nx` (or use `npx nx` instead of `nx` for the commands in the Workflow section)

### Setup

- `yarn`
- `(cd obi-wallet; yarn)`
- `yarn build` (or `yarn dev` so that `@keplr-wallet` packages can be accessed by mobile app)

### Workflow

In `obi-wallet` directory:

- `nx run-ios mobile` (to run ios version)
- `nx run-android mobile` (to run android version)
- `nx start mobile` (to only start metro packager)

## Development workflow: browser extension

- `yarn`
- `yarn dev`
