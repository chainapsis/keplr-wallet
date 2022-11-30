# Keplr Wallet
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: Keplr Wallet](https://img.shields.io/twitter/follow/keplrwallet.svg?style=social)](https://twitter.com/keplrwallet)

> The most powerful wallet for the Cosmos ecosystem and the Interchain.

## Official Releases

> NOTE: We do not accept native integrations to the official releases through pull requests. Please feel free to check out Keplr's [suggest chain](https://docs.keplr.app/api/suggest-chain.html) feature for permissionless integrations to your chain.

You can find the latest versions of the official managed releases on these links:
- [Browser Extension](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap)
- [iOS App](https://apps.apple.com/us/app/keplr-wallet/id1567851089)
- [Android App](https://play.google.com/store/apps/details?id=com.chainapsis.keplr)

For help using Keplr Wallet, Visit our [User Support Site](https://keplr.crunch.help).

## Building browser extension locally
This repo requires `protoc` to be installed. Check [Install protobuf](https://grpc.io/docs/protoc-installation/) for details.  

Clone this repo and run:
```sh
yarn bootstrap
yarn build
```

Browser extension's build output is placed in `packages/extension/build/chrome`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing version.

This repo contains submodules that are not open sourced and are only available through the Chainapsis’ official Keplr Browser Extension release. However, all primary features of the extension will work without the closed sourced submodules.

Source code for mobile app is also placed in `packages/mobile`.

### Example
Refer to the [Keplr Example repository](https://github.com/chainapsis/keplr-example) for examples of how to integrate Keplr signing support for your web interface/application.

### Disclaimer
Usage of any other packages besides @keplr-wallet/types is not recommended.
 - Any other packages besides @keplr-wallet/types are actively being developed, backward compatibility is not in the scope of support.
 - Since there are active changes being made, documentation is not being updated to the most recent version of the package as of right now. Documentations would be updated as packages get stable.

## Author
👤 **Chainapsis**
* Twitter: [@chainapsis](https://twitter.com/chainapsis)
* Github: [@chainapsis](https://github.com/chainapsis)

## License
### Browser Extension 
Apache 2.0
### iOS / Android App
Copyright (c) 2021 Chainapsis Inc. All rights reserved.
