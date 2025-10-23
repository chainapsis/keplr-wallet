import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { QuerySharedContext } from "../../common";
import { ChainGetter } from "../../chain";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { ObservableSecretContractChainQuery } from "./contract-query";
import { WrongViewingKeyError } from "./errors";
import { AppCurrency, Keplr } from "@keplr-wallet/types";

export class ObservableQuerySecret20BalanceImpl
  extends ObservableSecretContractChainQuery<{
    balance: { amount: string };
    ["viewing_key_error"]?: {
      msg: string;
    };
  }>
  implements IObservableQueryBalanceImpl
{
  protected readonly viewingKey: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<Keplr | undefined>,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string,
    querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    if (denomHelper.type !== "secret20") {
      throw new Error(`Denom helper must be secret20: ${denomHelper.denom}`);
    }
    const currency = chainGetter
      .getChain(chainId)
      .forceFindCurrency(denomHelper.denom);
    let viewingKey = "";
    if ("type" in currency && currency.type === "secret20") {
      viewingKey = currency.viewingKey;
    }
    super(
      sharedContext,
      chainId,
      chainGetter,
      apiGetter,
      denomHelper.contractAddress,
      {
        balance: { address: bech32Address, key: viewingKey },
      },
      querySecretContractCodeHash
    );

    this.viewingKey = viewingKey;

    makeObservable(this);

    if (!viewingKey) {
      this.setError({
        status: 0,
        statusText: "Viewing key is empty",
        message: "Viewing key is empty",
      });
    }
  }

  protected override canFetch(): boolean {
    return (
      super.canFetch() && this.bech32Address !== "" && this.viewingKey !== ""
    );
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{
    data: { balance: { amount: string } };
    headers: any;
  }> {
    const { data, headers } = await super.fetchResponse(abortController);

    if (data["viewing_key_error"]) {
      throw new WrongViewingKeyError(data["viewing_key_error"]?.msg);
    }

    return {
      headers,
      data,
    };
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const currency = this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .findCurrency(denom);

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data.balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.response.data.balance.amount));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    return this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .forceFindCurrency(denom);
  }
}

export class ObservableQuerySecret20BalanceRegistry implements BalanceRegistry {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "secret20") {
      return new ObservableQuerySecret20BalanceImpl(
        this.sharedContext,
        chainId,
        chainGetter,
        this.apiGetter,
        denomHelper,
        bech32Address,
        this.querySecretContractCodeHash
      );
    }
  }
}
