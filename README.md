# Fetch Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[Fetch.ai](https://fetch.ai)'s fork of the Keplr wallet by [chainapsis](https://github.com/chainapsis), which is designed to act as a generic wallet software for blockchains built using the [Cosmos-SDK](https://github.com/cosmos/cosmos-sdk) and to support the inter-blockchain communication (IBC) protocol.

The wallet is configured for the Fetch.ai Stargate network. 

Further information on the Keplr wallet can be found at the base [repo](https://github.com/chainapsis/keplr-extension).  

## Developing

### Environment Setup

Install global npm dependencies:

```bash
npm install --global yarn lerna

# TODO: install [watchman](https://facebook.github.io/watchman/docs/install.html)
```

[Bootstrap](https://lerna.js.org/#command-bootstrap) packages:

```bash
yarn bootstrap
```

Install package dependencies:

```bash
yarn install
```

Initial build:

```bash
yarn build
```

### Local dev server

```bash
yarn dev
```

## Author

👤 **Fetch.ai**

* Twitter: [@fetch_ai](https://twitter.com/Fetch_ai)
* Github: [@fetchai](https://github.com/fetchai)
