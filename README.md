# Keplr Browser Extension
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: chainapsis](https://img.shields.io/twitter/follow/chainapsis.svg?style=social)](https://twitter.com/chainapsis)

> Keplr is a browser extension wallet for the Inter blockchain ecosystem.
>
This repository is still under development  

## Evmos Integration - Connect to Local Node

1. Run `./init.sh` from within evmos/
2. Stop execution (ctrl + c), open `~/.evmosd/config/app.toml` and change line 104 (Enable defines if the API server should be enabled) to `enable = True`
3. Run `evmosd start --json-rpc.enable --pruning=nothing --rpc.unsafe --keyring-backend test --log_level info --json-rpc.api eth,txpool,personal,net,debug,web3` to resume execution
4. Run `yarn build` within this repo to create an unpacked build of Keplr
5. Upload the build by visiting chrome://extensions, enabling Developer Mode, and selecting Load Unpacked. Select the folder keplr-extension/packages/extension/prod
6. Create a wallet in Keplr and run `evmosd tx bank send mykey [KEPLR-WALLET-ADDRESS] 10photon --chain-id evmos_9000-1 --keyring-backend test` to send Photons to your wallet

---

This repository containts submodules that are not open sourced and are only available through the Chainapsis’ official Keplr Extension release. However, all primary features of the extension will work without the closed sourced submodules.  

## Dev
Keplr extension repo uses git-secret to encrypt the endpoints and the api keys. So, you can't build this without creating your own config file. You should create your own `config.var.ts`, `config.ui.var.ts` files inside the `packages/extension/src` folder. Refer to the `config.var.example.ts`, ``config.ui.var.example.ts`` sample files to create your own configuration.
```sh
yarn dev
``` 
Extension's build output is placed in `packages/extension/dist`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing extension.  

You can add your chain by adding the chain infomation into `chain-info.ts`. 

## Example Files

Refer to the [Keplr Example repository](https://github.com/chainapsis/keplr-example) for examples of how to integrate Keplr signing support for your web interface/application.

## Author

👤 **Chainapsis**

* Twitter: [@chainapsis](https://twitter.com/chainapsis)
* Github: [@chainapsis](https://github.com/chainapsis)

## License
##### Keplr Mobile License
Copyright (c) 2021 Chainapsis Inc. All rights reserved.
