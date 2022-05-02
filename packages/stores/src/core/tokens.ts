import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddTokenMsg,
  GetTokensMsg,
  RemoveTokenMsg,
  SuggestTokenMsg,
} from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";
import {
  AppCurrency,
  Currency,
  CW20Currency,
  IBCCurrency,
  Secret20Currency,
} from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { ChainInfoImpl, ChainStore, CurrencyRegistrar } from "../chain";
import { InteractionStore } from "./interaction";
import { toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class TokensStoreInner implements CurrencyRegistrar {
  @observable.ref
  protected _tokens: AppCurrency[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainInfo: ChainInfoImpl,
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.refreshTokens();

    // If key store in the keplr extension is unlocked, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystoreunlock", () => {
      this.chainInfo.removeCurrencies(...this._tokens);
      this.refreshTokens();
    });

    // If key store in the keplr extension is changed, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystorechange", () => {
      // Tokens should be changed whenever the account changed.
      // But, the added currencies are not removed automatically.
      // So, we should remove the prev token currencies from the chain info.
      this.chainInfo.removeCurrencies(...this._tokens);
      this.refreshTokens();
    });
  }

  observeUnknownDenom():
    | Currency
    | CW20Currency
    | Secret20Currency
    | IBCCurrency
    | [
        Currency | CW20Currency | Secret20Currency | IBCCurrency | undefined,
        boolean
      ]
    | undefined {
    // No need to implement this method.
    // Only used to satisfy interface.
    return undefined;
  }

  get tokens(): DeepReadonly<AppCurrency[]> {
    return this._tokens;
  }

  @flow
  *refreshTokens() {
    if (
      this.chainInfo.features &&
      // Tokens service is only needed for secretwasm and cosmwasm,
      // so, there is no need to fetch the registered token if the chain doesn't support the secretwasm and cosmwasm.
      (this.chainInfo.features.includes("secretwasm") ||
        this.chainInfo.features.includes("cosmwasm"))
    ) {
      const msg = new GetTokensMsg(this.chainInfo.chainId);
      this._tokens = yield* toGenerator(
        this.requester.sendMessage(BACKGROUND_PORT, msg)
      );
    } else {
      this._tokens = [];
    }

    // Register currencies whenever refreshing tokens from background.
    this.chainInfo.addOrReplaceCurrencies(...this._tokens);
  }

  @flow
  *addToken(currency: AppCurrency) {
    const msg = new AddTokenMsg(this.chainInfo.chainId, currency);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.refreshTokens();
  }

  @flow
  *removeToken(currency: AppCurrency) {
    const msg = new RemoveTokenMsg(this.chainInfo.chainId, currency);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.refreshTokens();
  }
}

export class TokensStore {
  protected readonly map: Map<string, TokensStoreInner> = new Map();

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly requester: MessageRequester,
    protected readonly interactionStore: InteractionStore
  ) {
    makeObservable(this);

    this.chainStore.addCurrencyRegistrarCreator((chainInfo) => {
      const inner = new TokensStoreInner(eventListener, chainInfo, requester);

      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
      this.map.set(chainIdentifier.identifier, inner);

      return inner;
    });
  }

  getTokensOf(chainId: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId);
    return this.map.get(chainIdentifier.identifier);
  }

  get waitingSuggestedToken() {
    const datas = this.interactionStore.getDatas<{
      chainId: string;
      contractAddress: string;
      viewingKey?: string;
    }>(SuggestTokenMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  @flow
  *approveSuggestedToken(appCurrency: AppCurrency) {
    const data = this.waitingSuggestedToken;
    if (data) {
      yield this.interactionStore.approve(
        SuggestTokenMsg.type(),
        data.id,
        appCurrency
      );

      yield this.getTokensOf(data.data.chainId)?.refreshTokens();
    }
  }

  @flow
  *rejectSuggestedToken() {
    const data = this.waitingSuggestedToken;
    if (data) {
      yield this.interactionStore.reject(SuggestTokenMsg.type(), data.id);
    }
  }

  @flow
  *rejectAllSuggestedTokens() {
    yield this.interactionStore.rejectAll(SuggestTokenMsg.type());
  }
}
