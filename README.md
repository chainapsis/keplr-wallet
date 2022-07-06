# Keplr Wallet
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: Keplr Wallet](https://img.shields.io/twitter/follow/keplrwallet.svg?style=social)](https://twitter.com/keplrwallet)

> The most powerful wallet for the Cosmos ecosystem and the Interchain.

## Official Releases

> NOTE: We do not accept native integrations to the official releases through pull requests. Please feel free to check out Keplr's [suggest chain](https://docs.keplr.app/api/suggest-chain.html) feature for permissionless integrations to your chain.

You can find the latest versions of the official managed releases on these links:
- [Browser Extension](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap)
- [IOS App](https://apps.apple.com/us/app/keplr-wallet/id1567851089)
- [Android App](https://play.google.com/store/apps/details?id=com.chainapsis.keplr)

For help using Keplr Wallet, Visit our [User Support Site](https://keplr.crunch.help).

## Building browser extension locally
This repo uses git-secret to encrypt the endpoints and the api keys. **So, you can't build this without creating your own config file.** You should create your own `config.var.ts`, `config.ui.var.ts` files inside the `packages/extension/src` folder. Refer to the `config.var.example.ts`, ``config.ui.var.example.ts`` sample files to create your own configuration.

This repo requires `protoc` to be installed. Check [Install protobuf](https://grpc.io/docs/protoc-installation/) for details.  

Clone this repo and run:
```sh
yarn bootstrap
yarn build
```

Browser extension's build output is placed in `packages/extension/prod`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing version.

This repo contains submodules that are not open sourced and are only available through the Chainapsis’ official Keplr Browser Extension release. However, all primary features of the extension will work without the closed sourced submodules.

Source code for mobile app is also placed in `packages/mobile`.

### Example
Refer to the [Keplr Example repository](https://github.com/chainapsis/keplr-example) for examples of how to integrate Keplr signing support for your web interface/application.

## Author
👤 **Chainapsis**
* Twitter: [@chainapsis](https://twitter.com/chainapsis)
* Github: [@chainapsis](https://github.com/chainapsis)

## License
### Browser Extension 
Apache 2.0
### IOS / Android App
Copyright (c) 2021 Chainapsis Inc. All rights reserved.
