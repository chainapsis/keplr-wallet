---
title: Suggest Chain
order: 4
---

### Suggest Chain
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

*Warning: This is an experimental feature.*

It allows a blockchain that isn't natively integrated by Keplr to be added to Keplr extension.  
If the same chain is already added to Keplr, nothing will happen. If the user rejects the request, an error will be thrown.  
  
For Stargate Cosmos-SDK chains, it is recommended to put the `features` value as `stargate`.
(However, even if the `stargate` isn't set, Keplr will query "/cosmos/base/tendermint/v1beta1/node_info" to check if it succeeds. If successful, Keplr will assume that a gRPC HTTP gateway available and automatically set it as Stargate).

Keplr has a feature which automatically detects when the chain-id has changed, and automatically update to support new chain. However, it should be noted that this functionality will only work when the chain-id follows the `{identifier}-{version}` (ex. `cosmoshub-4`) format. Therefore, it is recommended that the chain follows the chain-id format.
  
If the chain supports Secret WASM contracts, you may input `secretwasm` as a value for `features` to enable Secret WASM support.
  
Keplr supports the basic the `x/bank` module's send feature and balance query. Also, it is able to show the staking reward percentage from the `supply` and `mint` module. (For Stargate chains, Keplr will find the supply through the `bank` module).
