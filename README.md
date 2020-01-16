# Keplr Browser Extension
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: everettprotocol](https://img.shields.io/twitter/follow/everettprotocol.svg?style=social)](https://twitter.com/everettprotocol)

> Keplr is a browser extension wallet for the Inter blockchain ecosystem.
>
This repository is still under development

## Dev
```sh
npm run dev:extension
npm run dev:web
```
There are two build processes for keplr. One is browser extension, and another is a web page for providing dashboard for chains and sending more complex transactions.  
Extension's build output is placed in `/dist/extension`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing extension.  

You can add your chain by adding the chain infomation into `chain-info.ts`. And to add that chain into web page, you should add ui infomation to `ui/supported-chain.tsx`. 


## Author

👤 **everett-protocol**

* Twitter: [@everettprotocol](https://twitter.com/everettprotocol)
* Github: [@everett-protocol](https://github.com/everett-protocol)
