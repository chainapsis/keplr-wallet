# Obi Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Development workflow: mobile app

### Prerequisites

- [Install protobuf](https://grpc.io/docs/protoc-installation/)
- [Setup up React Native development environment (React Native CLI Quickstart)](https://reactnative.dev/docs/environment-setup).
- `npm i -g nx` (or use `npx nx` instead of `nx` for the commands in the Workflow section)

### Setup

In `obi-wallet` directory: `yarn setup`

### Workflow

In `obi-wallet` directory:

- `nx run-ios mobile` (to run ios version)
- `nx run-android mobile` (to run android version)
- `nx start mobile` (to only start metro packager)
- `yarn format` (to reformat code using prettier)
- `yarn lint` (to lint code)
- `yarn test` (to run unit tests)
- `yarn checks` (to run all checks, i.e. lint & test)

## Development workflow: browser extension

In root directory: `yarn dev`
