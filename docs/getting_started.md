## Intro

Fetch.ai's fork of the Keplr browser extension wallet by [chainapsis](https://github.com/chainapsis), which is designed to act as a generic wallet software for blockchains built using the Cosmos-SDK and to support the inter-blockchain communication (IBC) protocol.

#### Benefits:

- Private keys are stored locally. This removes the friction and risk of webpages having to manage user private keys safely and securely.
- As the user's private key is not managed by the website, users do not have to worry about the level of security of the website. The user only has to trust the security guarantees of Keplr, and freely interact with various web applications as they wish (and verify the contents of the transaction).
- Keplr can easily connect to libraries such as CosmJS, simplifying the process of connecting webpages to blockchains.

Further information on the Keplr extension wallet can be found at the base repo.

## How to get

Install the [Fetch.ai Network Wallet](https://chrome.google.com/webstore/detail/fetchai-network-wallet/ellkdbaphhldpeajbepobaecooaoafpg) extension from the Chrome web store.

## Requirements

Recent version of Chrome (or [based on chromium](https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium))

## Version

![chrome web store version svg](https://img.shields.io/chrome-web-store/v/ellkdbaphhldpeajbepobaecooaoafpg)

## First-time use

The first time you open the wallet, a page will open in  a new tab with a set of buttons to create an account:

- [Create a new account](./account_management.md#creating-a-new-account)
- [Import existing account](./account_management.md#existing-account)
- [Import ledger](./account_management.md#hardware-wallet)
- [Migrate from ETH](./account_management.md#migrating-from-eth)

After account creation is complete the dashboard will be accessible by clicking on the extension icon in the browser.

## How to contribute

[GitHub repository](https://github.com/fetchai/keplr-extension)
