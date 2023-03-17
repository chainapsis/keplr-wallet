import { HasMapStore } from "../common";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddTokenMsg,
  GetTokensMsg,
  RemoveTokenMsg,
  SuggestTokenMsg,
} from "@keplr-wallet/background";
import { autorun, flow, makeObservable, observable } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { ChainStore } from "../chain";
import { InteractionStore } from "./interaction";
import { toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class TokensStoreInner {
  @observable.ref
  protected _tokens: AppCurrency[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore<any>,
    protected readonly chainId: string,
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.refreshTokens();

    // If key store in the keplr extension is unlocked, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystoreunlock", () => {
      this.refreshTokens();
    });

    // If key store in the keplr extension is changed, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystorechange", () => {
      this.refreshTokens();
    });
  }

  get tokens(): DeepReadonly<AppCurrency[]> {
    return this._tokens;
  }

  @flow
  *refreshTokens() {
    const chainInfo = this.chainStore.getChain(this.chainId);

    if (
      chainInfo.features &&
      // Tokens service is only needed for secretwasm and cosmwasm,
      // so, there is no need to fetch the registered token if the chain doesn't support the secretwasm and cosmwasm.
      (chainInfo.features.includes("secretwasm") ||
        chainInfo.features.includes("cosmwasm"))
    ) {
      const msg = new GetTokensMsg(this.chainId);
      this._tokens = yield* toGenerator(
        this.requester.sendMessage(BACKGROUND_PORT, msg)
      );
    } else {
      this._tokens = [];
    }
  }

  @flow
  *addToken(currency: AppCurrency) {
    const msg = new AddTokenMsg(this.chainId, currency);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.refreshTokens();
  }

  @flow
  *removeToken(currency: AppCurrency) {
    const msg = new RemoveTokenMsg(this.chainId, currency);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.refreshTokens();
  }
}

export class TokensStore<
  C extends ChainInfo = ChainInfo
> extends HasMapStore<TokensStoreInner> {
  protected prevTokens: Map<string, AppCurrency[]> = new Map();

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore<C>,
    protected readonly requester: MessageRequester,
    protected readonly interactionStore: InteractionStore
  ) {
    super((chainId: string) => {
      return new TokensStoreInner(
        this.eventListener,
        this.chainStore,
        chainId,
        this.requester
      );
    });
    makeObservable(this);

    this.chainStore.addSetChainInfoHandler((chainInfoInner) => {
      autorun(() => {
        const chainIdentifier = ChainIdHelper.parse(chainInfoInner.chainId);

        // Tokens should be changed whenever the account changed.
        // But, the added currencies are not removed automatically.
        // So, we should remove the prev token currencies from the chain info.
        const prevToken = this.prevTokens.get(chainIdentifier.identifier) ?? [];
        chainInfoInner.removeCurrencies(
          ...prevToken.map((token) => token.coinMinimalDenom)
        );

        const inner = this.getTokensOf(chainInfoInner.chainId);
        chainInfoInner.addCurrencies(...inner.tokens);

        this.prevTokens.set(
          chainIdentifier.identifier,
          inner.tokens as AppCurrency[]
        );
      });
    });
  }

  getTokensOf(chainId: string) {
    return this.get(chainId);
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

      yield this.getTokensOf(data.data.chainId).refreshTokens();
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
