# Fetch Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[Fetch.ai](https://fetch.ai)'s fork of the Keplr wallet by [chainapsis](https://github.com/chainapsis), which is designed to act as a generic wallet software for blockchains built using the [Cosmos-SDK](https://github.com/cosmos/cosmos-sdk) and to support the inter-blockchain communication (IBC) protocol.

The wallet is configured for the Fetch.ai Stargate network. 

Further information on the Keplr wallet can be found at the base [repo](https://github.com/chainapsis/keplr-extension).  

## Official Releases

You can find the latest versions of the official managed releases on these links:

- [Browser Extension](https://chrome.google.com/webstore/detail/fetch-wallet/ellkdbaphhldpeajbepobaecooaoafpg)
    - Fetch officially supports Chrome, Firefox.

## Building browser extension locally

### Requirements

- protoc v21.3 (recommended)

  ```sh
    # This script is example for mac arm64 user. for other OS, replace URL(starts with https://..) to be matched with your OS from https://github.com/protocolbuffers/protobuf/releases/tag/v21.3
    curl -Lo protoc-21.3.zip https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-osx-aarch_64.zip 
  
    #OR
  
    # This script is example for linux x86_64 user
    curl -Lo protoc-21.3.zip https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-linux-x86_64.zip
  
    unzip protoc-21.3.zip -d $HOME/protoc
    cp -r $HOME/protoc/include /usr/local
    cp -r $HOME/protoc/bin /usr/local
  ```

- [Node.js v18+](https://nodejs.org/)

Clone this repo and run:

Install global npm dependencies:

```bash
npm install --global yarn lerna

# TODO: install [watchman](https://facebook.github.io/watchman/docs/install.html)
```

Install and build packages:

```bash
yarn && yarn build:libs
```

### Local dev server for fetch-extension

```bash
yarn dev
```

### Local dev server for mobile

```bash
yarn android
```

```bash
yarn ios
```

In case of any error, try this and re-run the local dev server for mobile

```bash
yarn postinstall
```

## Author

👤 **Fetch.ai**

* Twitter: [@fetch_ai](https://twitter.com/Fetch_ai)
* Github: [@fetchai](https://github.com/fetchai)
