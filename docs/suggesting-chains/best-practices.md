---
title: Suggest Chain Best Practices
order: 2
---

## Suggest Chain Best Practices

Keplr highly recommends chains to follow the following conventions:

| **Parameter**    | **Value**        | **Example**           | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------------|------------------|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Chain ID         | chainName-number | testchain-1           | Keplr uses the numbered section for automated check for potential chain upgrades, IBC channel information and more. The number should only increment up by 1. If the chain name must contain a number, please use an underscore (i.e. testchain_1000-1).                                                                                                                                                                                                                                                                    |
| BIP 44 Coin Type | 118              | 118                   | While Keplr does support address derivation for different BIP44 coin types, Keplr only supports the Cosmos Ledger App, which is locked down to only support the '118' BIP44 coin type. We strongly believe the UX benefits of using the same BIP44 coin type across the Cosmos ecosystem but varying the bech32 prefix outweigh the privacy concerns of using a different coin type for every zone. Not using the 118 coin type can lead to Ledger generated addresses to be different than an extension generated address. |
| Decimals         | 6                | 1 ATOM = 1000000uatom | The majority of Cosmos blockchains default to using 6 decimal points as default.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Gas Price        | 0.025            | 0.025 uatom / gas     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Infrastructure requirements

Suggest chain feature requires a LCD(REST) and RPC endpoint infrastructure to be provided in order for Keplr to function.

##### REST Endpoint

You can enable the LCD(REST) server by changing the configuration of your node's app.toml file. The default port is `:1317`

```
[api]

# Enable defines if the API server should be enabled.
enable = true
```

#### RPC Endpoint

Websocket needs to be enabled. 

Keplr uses the websocket feature to notify users when transactions are confirmed.