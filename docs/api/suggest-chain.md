---
title: Suggest Chain
order: 4
---

### Suggest Chain

*Warning: This is an experimental feature.*

Keplr's 'suggest chain' feature allows front-ends to request adding new Cosmos-SDK based blockchains that isn't natively integrated to Keplr extension.  
If the same chain is already added to Keplr, nothing will happen. If the user rejects the request, an error will be thrown.

This allows all Cosmos-SDK blockchains to have permissionless, instant wallet and transaction signing support for front-ends.


```javascript
interface ChainInfo {
    readonly rpc: string;
    readonly rest: string;
    readonly chainId: string;
    readonly chainName: string;
    /**
    * This indicates the type of coin that can be used for stake.
    * You can get actual currency information from Currencies.
    */
    readonly stakeCurrency: Currency;
    readonly walletUrlForStaking?: string;
    readonly bip44: {
        coinType: number;
    };
    readonly alternativeBIP44s?: BIP44[];
    readonly bech32Config: Bech32Config;
    
    readonly currencies: AppCurrency[];
    /**
    * This indicates which coin or token can be used for fee to send transaction.
    * You can get actual currency information from Currencies.
    */
    readonly feeCurrencies: Currency[];
    
    /**
    * This is used to set the fee of the transaction.
    * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
    * And, set field's type as primitive number because it is hard to restore the prototype after deserialzing if field's type is `Dec`.
    */
    readonly gasPriceStep?: {
        low: number;
        average: number;
        high: number;
    };
    
    /**
    * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
    */
    readonly features?: string[];
}
```
```javascript
experimentalSuggestChain(chainInfo: SuggestingChainInfo): Promise<void>
```

#### Usage examples and recommendations

::: suggest-chain-example-table
| Key | Example Value | Note |
|-|-|-|
| `rpc` | http://123.456.789.012:26657 | Address of RPC endpoint of the chain. Default port is 26657 |
| `rest` | http://123.456.789.012:1317 | Address of REST/API endpoint of the chain. Default port is 1317. Must be enabled in `app.toml` |
| `chainId` | mychain-1 | Keplr has a feature which automatically detects when the chain-id has changed, and automatically update to support new chain. However, it should be noted that this functionality will only work when the chain-id follows the {identifier}-{version}(ex.cosmoshub-4) format. Therefore, it is recommended that the chain follows the chain-id format. |
| `stakeCurrency` | ```{     coinDenom: "ATOM",     coinMinimalDenom: "uatom",     coinDecimals: 6,     coinGeckoId: "cosmos",   }``` | Information on the staking token of the chain |
| `walletUrlForStaking` | https://wallet.keplr.app/#/cosmoshub/stake | The URL for the staking interface frontend for the chain. If you don't have a staking interface built, you can use [Lunie Light](https://github.com/luniehq/lunie-light) which supports Keplr. |
| `bip44.coinType` | 118 | BIP44 coin type for address derivation. We recommend using `118`(Cosmos Hub) as this would provide good Ledger hardware wallet compatibility by utilizing the Cosmos Ledger app. |
| `bech32Config` | ```{ bech32PrefixAccAddr: "cosmos", bech32PrefixAccPub: "cosmos" + "pub", bech32PrefixValAddr: "cosmos" + "valoper", bech32PrefixValPub: "cosmos" + "valoperpub", bech32PrefixConsAddr: "cosmos" + "valcons", bech32PrefixConsPub: "cosmos" + "valconspub"}``` | Bech32 config using the address prefix of the chain |
| `currencies` | ```[   {     coinDenom: "ATOM",     coinMinimalDenom: "uatom",     coinDecimals: 6,     coinGeckoId: "cosmos",   }, ]``` | (TBD) |
| `feeCurrencies` | ```[   {     coinDenom: "ATOM",     coinMinimalDenom: "uatom",     coinDecimals: 6,     coinGeckoId: "cosmos",   }, ]``` | List of fee tokens accepted by the chain's validator. |
| `gasPriceStep` | ```{ low: 0.01, average: 0.025, high: 0.03, }``` | Three `gasPrice` values (low, average, high) to estimate transaction fee. |
| `features` | [stargate] | `secretwasm` - Secret Network WASM smart contract transaction support `stargate` - For Cosmos SDK blockchains using cosmos-sdk v0.4+. (However, even if the `stargate` isn't set, Keplr will query "/cosmos/base/tendermint/v1beta1/node_info" to check if it succeeds. If successful, Keplr will assume that a gRPC HTTP gateway available and automatically set it as Stargate) `ibc-transfer` - For IBC transfers (ICS 20) enabled chains. For Stargate (cosmos-sdk v0.40+) chains, Keplr will check the on-chain params and automatically enable IBC transfers if it’s available) `cosmwasm` - For CosmWasm smart contract support (currently broken, in the process of being fixed) |
:::  

Copy and paste example:
```javascript
await window.keplr.experimentalSuggestChain({
    chainId: "mychain-1",
    chainName: "my new chain",
    rpc: "http://123.456.789.012:26657",
    rest: "http://123.456.789.012:1317",
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmos" + "pub",
        bech32PrefixValAddr: "cosmos" + "valoper",
        bech32PrefixValPub: "cosmos" + "valoperpub",
        bech32PrefixConsAddr: "cosmos" + "valcons",
        bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [ 
        { 
            coinDenom: "ATOM", 
            coinMinimalDenom: "uatom", 
            coinDecimals: 6, 
            coinGeckoId: "cosmos", 
        }, 
    ],
    feeCurrencies: [
        {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
    ],
    stakeCurrency: {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
    },
    coinType: 118,
    gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.03,
    },
});
```

Keplr supports the basic the `x/bank` module's send feature and balance query. Also, it is able to show the staking reward percentage from the `supply` and `mint` module. (For Stargate chains, Keplr will find the supply through the `bank` module).
