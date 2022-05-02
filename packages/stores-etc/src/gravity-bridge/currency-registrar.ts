import { AppCurrency } from "@keplr-wallet/types";
import {
  IChainInfoImpl,
  ChainStore,
  IQueriesStore,
  CurrencyRegistrar,
} from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { KeplrETCQueries } from "../queries";

export class GravityBridgeCurrencyRegsitrarInner implements CurrencyRegistrar {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainInfo: IChainInfoImpl,
    protected readonly queriesStore: IQueriesStore<KeplrETCQueries>
  ) {}

  observeUnknownDenom(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("gravity0x")
    ) {
      return;
    }

    const queries = this.queriesStore.get(this.chainInfo.chainId);

    const contractAddress = denomHelper.denom.replace("gravity", "");

    const erc20Metadata = queries.keplrETC.queryERC20Metadata.get(
      contractAddress
    );
    if (erc20Metadata.symbol && erc20Metadata.decimals != null) {
      return [
        {
          coinMinimalDenom: denomHelper.denom,
          coinDenom: erc20Metadata.symbol,
          coinDecimals: erc20Metadata.decimals,
        },
        true,
      ];
    }

    return [undefined, false];
  }
}

export class GravityBridgeCurrencyRegistrar {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<KeplrETCQueries>
  ) {
    this.chainStore.addCurrencyRegistrarCreator((chainInfo) => {
      return new GravityBridgeCurrencyRegsitrarInner(
        kvStore,
        chainInfo,
        queriesStore
      );
    });
  }
}
