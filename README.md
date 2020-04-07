# Keplr Browser Extension
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: everettprotocol](https://img.shields.io/twitter/follow/everettprotocol.svg?style=social)](https://twitter.com/everettprotocol)

> Keplr is a browser extension wallet for the Inter blockchain ecosystem.
>
This repository is still under development

## Dev
Keplr extension repo uses git-secret to encrypt the endpoints and the api keys. So, you can't build this without creating your own config file. You should create your own `config.var.ts` file inside the `src` folder. Refer to the `config.var.example.ts` sample file to create your own configuration.
```sh
npm run dev
``` 
Extension's build output is placed in `/dist`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing extension.  

You can add your chain by adding the chain infomation into `chain-info.ts`. 

## Author

👤 **everett-protocol**

* Twitter: [@everettprotocol](https://twitter.com/everettprotocol)
* Github: [@everett-protocol](https://github.com/everett-protocol)
