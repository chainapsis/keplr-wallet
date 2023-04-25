import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddTokenMsg,
  GetAllTokenInfosMsg,
  RemoveTokenMsg,
  SuggestTokenMsg,
  TokenInfo,
} from "@keplr-wallet/background";
import {
  action,
  autorun,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { IChainStore } from "../chain";
import { InteractionStore } from "./interaction";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import { IAccountStore } from "../account";

export class TokensStore {
  @observable
  protected _isInitialized: boolean = false;

  @observable.ref
  protected tokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> = new Map();
  // No need to be observable.
  protected prevTokenMap: ReadonlyMap<string, ReadonlyArray<TokenInfo>> =
    new Map();

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly requester: MessageRequester,
    protected readonly chainStore: IChainStore,
    protected readonly accountStore: IAccountStore,
    protected readonly interactionStore: InteractionStore
  ) {
    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    await this.refreshTokens();

    // If key store in the keplr extension is changed, this event will be dispatched.
    // This is needed becuase the token such as secret20 exists according to the account.
    this.eventListener.addEventListener("keplr_keystorechange", () => {
      this.clearTokensFromChainInfos();
      this.refreshTokens();
    });

    autorun(() => {
      // Account가 변경되었을때, 체인 정보가 변경되었을때 등에 반응해야하기 때문에 autorun 안에 넣는다.
      this.updateChainInfos();
    });

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  protected async refreshTokens() {
    const msg = new GetAllTokenInfosMsg();
    const tokens = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      const map = new Map<string, TokenInfo[]>();
      for (const [key, value] of Object.entries(tokens)) {
        if (value) {
          map.set(key, value);
        }
      }
      this.tokenMap = map;
    });
  }

  @action
  protected clearTokensFromChainInfos() {
    const chainInfos = this.chainStore.chainInfos;
    for (const chainInfo of chainInfos) {
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);

      // Tokens should be changed whenever the account changed.
      // But, the added currencies are not removed automatically.
      // So, we should remove the prev token currencies from the chain info.
      const prevTokens =
        this.prevTokenMap.get(chainIdentifier.identifier) ?? [];
      chainInfo.removeCurrencies(
        ...prevTokens.map((token) => token.currency.coinMinimalDenom)
      );
    }
  }

  @action
  protected updateChainInfos() {
    const chainInfos = this.chainStore.chainInfos;
    for (const chainInfo of chainInfos) {
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);

      const tokens = this.tokenMap.get(chainIdentifier.identifier) ?? [];

      const adds: AppCurrency[] = [];

      for (const token of tokens) {
        if (!token.associatedAccountAddress) {
          adds.push(token.currency);
        } else if (
          this.accountStore.getAccount(chainInfo.chainId).bech32Address ===
          token.associatedAccountAddress
        ) {
          adds.push(token.currency);
        }
      }

      chainInfo.addCurrencies(...adds);
    }

    this.prevTokenMap = this.tokenMap;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async waitUntilInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (this.isInitialized) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  getTokens(chainId: string): ReadonlyArray<TokenInfo> {
    return this.tokenMap.get(ChainIdHelper.parse(chainId).identifier) ?? [];
  }

  async addToken(
    chainId: string,
    accountBech32Address: string,
    currency: AppCurrency
  ): Promise<void> {
    const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
    if (!bech32Address) {
      throw new Error("Account not initialized");
    }
    const chainInfo = this.chainStore.getChain(chainId);
    const associatedAccountAddress = Buffer.from(
      Bech32Address.fromBech32(
        accountBech32Address,
        chainInfo.bech32Config.bech32PrefixAccAddr
      ).address
    ).toString("hex");

    const msg = new AddTokenMsg(chainId, associatedAccountAddress, currency);
    const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      const map = new Map<string, TokenInfo[]>();
      for (const [key, value] of Object.entries(res)) {
        if (value) {
          map.set(key, value);
        }
      }
      this.tokenMap = map;
    });
  }

  async removeToken(
    chainId: string,
    accountBech32Address: string,
    contractAddress: string
  ): Promise<void> {
    const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
    if (!bech32Address) {
      throw new Error("Account not initialized");
    }
    const chainInfo = this.chainStore.getChain(chainId);
    const associatedAccountAddress = Buffer.from(
      Bech32Address.fromBech32(
        accountBech32Address,
        chainInfo.bech32Config.bech32PrefixAccAddr
      ).address
    ).toString("hex");

    const msg = new RemoveTokenMsg(
      chainId,
      associatedAccountAddress,
      contractAddress
    );
    const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      const map = new Map<string, TokenInfo[]>();
      for (const [key, value] of Object.entries(res)) {
        if (value) {
          map.set(key, value);
        }
      }
      this.tokenMap = map;
    });
  }

  get waitingSuggestedToken() {
    const datas = this.interactionStore.getDatas<{
      chainId: string;
      contractAddress: string;
      viewingKey?: string;
    }>("suggest-token-cw20");

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

      yield this.refreshTokens();
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
