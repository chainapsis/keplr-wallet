import { HasMapStore } from "../common";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddTokenMsg,
  GetTokensMsg,
  RemoveTokenMsg,
  SuggestTokenMsg,
} from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { ChainStore } from "../chain";
import { InteractionStore } from "./interaction";
import { toGenerator } from "@keplr-wallet/common";
import { computedFn } from "mobx-utils";

export class TokensStoreInner {
  @observable.ref
  protected _tokens: AppCurrency[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.refreshTokens();

    // If key store in the keplr extension is unlocked, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    window.addEventListener("keplr_keystoreunlock", () => {
      this.refreshTokens();
    });

    // If key store in the keplr extension is changed, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    window.addEventListener("keplr_keystorechange", () => {
      this.refreshTokens();
    });
  }

  get tokens(): DeepReadonly<AppCurrency[]> {
    return this._tokens;
  }

  @flow
  *refreshTokens() {
    const msg = new GetTokensMsg(this.chainId);
    this._tokens = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
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
  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly requester: MessageRequester,
    protected readonly interactionStore: InteractionStore
  ) {
    super((chainId: string) => {
      return new TokensStoreInner(chainId, this.requester);
    });
    makeObservable(this);

    this.chainStore.registerChainInfoOverrider(this.overrideChainInfo);
  }

  protected readonly overrideChainInfo = computedFn(
    (chainInfo: DeepReadonly<C>): C => {
      const inner = this.getTokensOf(chainInfo.chainId);

      const currencies = chainInfo.currencies.slice();
      for (const token of inner.tokens) {
        const find = currencies.find(
          (cur) => cur.coinMinimalDenom === token.coinMinimalDenom
        );

        if (!find) {
          currencies.push(token);
        }
      }

      return {
        ...(chainInfo as C),
        currencies,
      };
    }
  );

  getTokensOf(chainId: string) {
    return this.get(chainId);
  }

  get waitingSuggestedToken() {
    const datas = this.interactionStore.getDatas<{
      chainId: string;
      contractAddress: string;
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
