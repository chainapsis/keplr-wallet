# Keplr Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: Keplr Wallet](https://img.shields.io/twitter/follow/keplrwallet.svg?style=social)](https://twitter.com/keplrwallet)

> The most powerful wallet for the Cosmos ecosystem and the Interchain.

## Official Releases

> NOTE: We do not accept native integrations to the official releases through pull requests. Please feel free to check out [Keplr Chain Registry repo](https://github.com/chainapsis/keplr-chain-registry) for permissionless integrations with your chain.

You can find the latest versions of the official managed releases on these links:

- [Browser Extension](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap)
  - Keplr officially supports Chrome, Firefox.
- [iOS App](https://apps.apple.com/us/app/keplr-wallet/id1567851089)
- [Android App](https://play.google.com/store/apps/details?id=com.chainapsis.keplr)

For help using Keplr Wallet, Visit our [User Support Site](https://help.keplr.app/).

## Building browser extension locally

### Requirements

- protoc v21.3 (recommended)

  ```sh
    # This script is example for mac arm64 user. for other OS, replace URL(starts with https://..) to be matched with your OS from https://github.com/protocolbuffers/protobuf/releases/tag/v21.3
    curl -Lo protoc-21.3.zip https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-osx-aarch_64.zip 
    unzip protoc-21.3.zip -d $HOME/protoc
    cp -r $HOME/protoc/include/* /usr/local/include/
    cp $HOME/protoc/bin/* /usr/local/bin/
  ```
  
- [Node.js v18+](https://nodejs.org/)
  
Clone this repo and run:

```sh
yarn && yarn build
```

You can find the build output of Keplr Extension in apps/extension/build/manifest-v3. This output only works on Chrome now, so we recommend using other build outputs (in apps/extension/build/manifest-v2 or apps/extension/build/firefox) for other browsers. You can visit [this page](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) for instructions on loading the build output on Chrome.

## Building mobile app locally

WIP

## Packages

| Package | Description | Latest |
| ------- | ----------- | -------|
| [@keplr-wallet/background](packages/background) | The core logic of wallet running in the background. Interfaces to communicate with other processes are also defined. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/background.svg)](https://www.npmjs.com/package/@keplr-wallet/background)|
| [@keplr-wallet/cosmos](packages/cosmos) | Interfaces that are compatible with the data from Cosmos SDK, Tendermint based chains. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/cosmos.svg)](https://www.npmjs.com/package/@keplr-wallet/cosmos) |
| [@keplr-wallet/crypto](packages/crypto) | Implementations of key cryptography for wallet. Hashing (sha256, keccak256), elliptic curve (secp256k1), HD key derivation (BIP-32, BIP-39). | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/crypto.svg)](https://www.npmjs.com/package/@keplr-wallet/crypto) |
| [@keplr-wallet/proto-types](packages/proto-types) | scripts to generate `.proto` files into typescript files, and the types generated.| [![npm version](https://img.shields.io/npm/v/@keplr-wallet/proto-types.svg)](https://www.npmjs.com/package/@keplr-wallet/proto-types) |
| [@keplr-wallet/provider](packages/provider) | Implementations that makes some of the wallet's core logic externally available. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/provider.svg)](https://www.npmjs.com/package/@keplr-wallet/provider) |
| [@keplr-wallet/router](packages/router) | Interfaces used to communicate with the background. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/router.svg)](https://www.npmjs.com/package/@keplr-wallet/router) |
| [@keplr-wallet/stores](packages/stores) | The core logic of application's state, query and wallet is implemented on top of Mobx. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/stores.svg)](https://www.npmjs.com/package/@keplr-wallet/stores) |
| [@keplr-wallet/types](packages/types) | Types used across packages. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/types.svg)](https://www.npmjs.com/package/@keplr-wallet/types) |
| [@keplr-wallet/unit](packages/unit) | Interfaces defined to handle token quantities and values, integers, floating points, etc. | [![npm version](https://img.shields.io/npm/v/@keplr-wallet/unit.svg)](https://www.npmjs.com/package/@keplr-wallet/unit) |

## Dapp example

Refer to the [Keplr Example repository](https://github.com/chainapsis/keplr-example) for examples of how to integrate Keplr signing support for your web interface/application.

## Disclaimer

Usage of any other packages besides @keplr-wallet/types is not recommended.

- Any other packages besides @keplr-wallet/types are actively being developed, backward compatibility is not in the scope of support.
- Since there are active changes being made, documentation is not being updated to the most recent version of the package as of right now. Documentations would be updated as packages get stable.

Also, this repo contains submodules that are not open sourced and are only available through the Chainapsis’ official Keplr Browser Extension release. However, all primary features of the extension will work without the closed sourced submodules.

## License

### Browser Extension

Apache 2.0

### iOS / Android App

Copyright (c) 2021 Chainapsis Inc. All rights reserved.
