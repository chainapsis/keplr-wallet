import { computed } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { ChainGetter } from "../../chain";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { Cw20ContractBalance } from "./types";
import { ObservableCosmwasmContractChainQuery } from "./contract-query";
import { QuerySharedContext } from "../../common";
import { AppCurrency } from "@keplr-wallet/types";

export class ObservableQueryCw20BalanceImpl
  extends ObservableCosmwasmContractChainQuery<Cw20ContractBalance>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    if (denomHelper.type !== "cw20") {
      throw new Error(`Denom helper must be cw20: ${denomHelper.denom}`);
    }
    super(sharedContext, chainId, chainGetter, denomHelper.contractAddress, {
      balance: { address: bech32Address },
    });
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );
    const currency = modularChainInfoImpl
      .getCurrencies()
      .find((cur) => cur.coinMinimalDenom === denom);

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data.balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.response.data.balance));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    return this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .forceFindCurrency(denom);
  }
}

export class ObservableQueryCw20BalanceRegistry implements BalanceRegistry {
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "cw20") {
      return new ObservableQueryCw20BalanceImpl(
        this.sharedContext,
        chainId,
        chainGetter,
        denomHelper,
        bech32Address
      );
    }
  }
}
