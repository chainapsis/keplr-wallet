import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddERC20TokenMsg,
  AddTokenMsg,
  GetAllERC20TokenInfosMsg,
  GetAllTokenInfosMsg,
  RemoveTokenMsg,
  RemoveERC20TokenMsg,
  TokenInfo,
  InteractionWaitingData,
} from "@keplr-wallet/background";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { IChainStore, IAccountStore } from "@keplr-wallet/stores";
import { InteractionStore } from "./interaction";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import { KeyRingStore } from "./keyring";
import { computedFn } from "mobx-utils";

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
    protected readonly keyRingStore: KeyRingStore,
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
    const allCW20TokenInfosMsg = new GetAllTokenInfosMsg();
    const allERC20TokenInfosMsg = new GetAllERC20TokenInfosMsg();
    const cw20Tokens = await this.requester.sendMessage(
      BACKGROUND_PORT,
      allCW20TokenInfosMsg
    );
    const erc20Tokens = await this.requester.sendMessage(
      BACKGROUND_PORT,
      allERC20TokenInfosMsg
    );
    runInAction(() => {
      const map = new Map<string, TokenInfo[]>();
      for (const [key, value] of Object.entries(cw20Tokens).concat(
        Object.entries(erc20Tokens)
      )) {
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

    const modularChainInfoImpls = this.chainStore.modularChainInfoImpls;
    for (const modularChainInfoImpl of modularChainInfoImpls) {
      const chainIdentifier = ChainIdHelper.parse(modularChainInfoImpl.chainId);

      const prevTokens =
        this.prevTokenMap.get(chainIdentifier.identifier) ?? [];

      if (
        "starknet" in modularChainInfoImpl &&
        modularChainInfoImpl.starknet != null
      ) {
        modularChainInfoImpl.removeCurrencies(
          "starknet",
          ...prevTokens.map((token) => token.currency.coinMinimalDenom)
        );
      }
    }
  }

  protected updateChainInfos() {
    const modularChainInfoImpls = this.chainStore.modularChainInfoImpls;
    for (const modularChainInfoImpl of modularChainInfoImpls) {
      if ("cosmos" in modularChainInfoImpl.embedded) {
        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfoImpl.chainId
        );

        const tokens = this.tokenMap.get(chainIdentifier.identifier) ?? [];

        const adds: AppCurrency[] = [];

        for (const token of tokens) {
          if (!token.associatedAccountAddress) {
            adds.push(token.currency);
          } else if (
            this.keyRingStore.status === "unlocked" &&
            this.accountStore.getAccount(modularChainInfoImpl.chainId)
              .bech32Address
          ) {
            if (
              Buffer.from(
                Bech32Address.fromBech32(
                  this.accountStore.getAccount(modularChainInfoImpl.chainId)
                    .bech32Address
                ).address
              ).toString("hex") === token.associatedAccountAddress
            ) {
              adds.push(token.currency);
            }
          }
        }

        this.chainStore
          .getChain(modularChainInfoImpl.chainId)
          .addCurrencies(...adds);
      } else if ("starknet" in modularChainInfoImpl.embedded) {
        if ("starknet" in modularChainInfoImpl.embedded) {
          const chainIdentifier = ChainIdHelper.parse(
            modularChainInfoImpl.chainId
          );

          const tokens = this.tokenMap.get(chainIdentifier.identifier) ?? [];

          const adds: AppCurrency[] = [];

          for (const token of tokens) {
            adds.push(token.currency);
          }

          modularChainInfoImpl.addCurrencies("starknet", ...adds);
        }
      }
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
    const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
    const modularChainInfo = this.chainStore.getModularChain(chainId);
    if ("cosmos" in modularChainInfo) {
      const chainInfo = this.chainStore.getChain(chainId);

      const hasBech32Config = chainInfo.bech32Config != null;
      const associatedAccountAddress =
        hasBech32Config && bech32Address
          ? Buffer.from(
              Bech32Address.fromBech32(
                bech32Address,
                chainInfo.bech32Config.bech32PrefixAccAddr
              ).address
            ).toString("hex")
          : undefined;

      const tokens =
        this.tokenMap.get(ChainIdHelper.parse(chainId).identifier) ?? [];

      return tokens.filter((token) => {
        if (
          token.associatedAccountAddress &&
          associatedAccountAddress &&
          token.associatedAccountAddress !== associatedAccountAddress
        ) {
          return false;
        }

        return true;
      });
    } else if ("starknet" in modularChainInfo) {
      return this.tokenMap.get(chainId) ?? [];
    } else {
      throw new Error(`Unsupported chain: ${chainId}`);
    }
  }

  protected getTokensMap = computedFn(
    (chainId: string): Map<string, TokenInfo> => {
      const tokens = this.getTokens(chainId);
      const res = new Map<string, TokenInfo>();
      for (const token of tokens) {
        res.set(token.currency.coinMinimalDenom.toLowerCase(), token);
      }
      return res;
    }
  );

  tokenIsRegistered(chainId: string, coinMinimalDenom: string): boolean {
    return this.getTokensMap(chainId).has(coinMinimalDenom.toLowerCase());
  }

  async addToken(chainId: string, currency: AppCurrency): Promise<void> {
    const modularChainInfo = this.chainStore.getModularChain(chainId);
    if ("cosmos" in modularChainInfo) {
      const bech32Address = this.accountStore.getAccount(chainId).bech32Address;
      if (!bech32Address) {
        throw new Error("Account not initialized");
      }

      const chainInfo = this.chainStore.getChain(chainId);
      const isEvmChain = chainInfo.evm != null;
      const hasBech32Config = chainInfo.bech32Config != null;
      const associatedAccountAddress = hasBech32Config
        ? Buffer.from(
            Bech32Address.fromBech32(
              bech32Address,
              chainInfo.bech32Config.bech32PrefixAccAddr
            ).address
          ).toString("hex")
        : "";

      const msg = isEvmChain
        ? new AddERC20TokenMsg(chainId, currency)
        : new AddTokenMsg(chainId, associatedAccountAddress, currency);
      const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      runInAction(() => {
        const newTokenMap = new Map(this.tokenMap);
        const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
        const newTokens = res[chainIdentifier.identifier];
        if (newTokens) {
          newTokenMap.set(chainIdentifier.identifier, newTokens);
        }

        this.tokenMap = newTokenMap;
      });
    } else if ("starknet" in modularChainInfo) {
      const msg = new AddERC20TokenMsg(chainId, currency);
      const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      runInAction(() => {
        const newTokenMap = new Map(this.tokenMap);
        const chainIdentifier = ChainIdHelper.parse(modularChainInfo.chainId);
        const newTokens = res[chainIdentifier.identifier];
        if (newTokens) {
          newTokenMap.set(chainIdentifier.identifier, newTokens);
        }

        this.tokenMap = newTokenMap;
      });
    } else {
      throw new Error(`Unsupported chain: ${chainId}`);
    }
  }

  async removeToken(chainId: string, tokenInfo: TokenInfo): Promise<void> {
    const contractAddress = (() => {
      if ("contractAddress" in tokenInfo.currency) {
        return tokenInfo.currency.contractAddress;
      }

      throw new Error("Token info is not for contract");
    })();

    const modularChainInfo = this.chainStore.getModularChain(chainId);
    if ("cosmos" in modularChainInfo) {
      const chainInfo = this.chainStore.getChain(chainId);
      const isEvmChain = chainInfo.evm !== undefined;

      const msg = isEvmChain
        ? new RemoveERC20TokenMsg(chainId, contractAddress)
        : new RemoveTokenMsg(
            chainId,
            tokenInfo.associatedAccountAddress ?? "",
            contractAddress
          );
      const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      runInAction(() => {
        // Remove 이후에는 지워진 토큰에 대한 싱크를 맞추기 위해서 clearTokensFromChainInfos를 호출한다.
        // 그냥 다 지우고 다시 다 설정하는 방식임.
        this.clearTokensFromChainInfos();

        const newTokenMap = new Map(this.tokenMap);
        const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
        const newTokens = res[chainIdentifier.identifier];
        if (newTokens) {
          newTokenMap.set(chainIdentifier.identifier, newTokens);
        }

        this.tokenMap = newTokenMap;
      });
    } else if ("starknet" in modularChainInfo) {
      const msg = new RemoveERC20TokenMsg(chainId, contractAddress);

      const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      runInAction(() => {
        // Remove 이후에는 지워진 토큰에 대한 싱크를 맞추기 위해서 clearTokensFromChainInfos를 호출한다.
        // 그냥 다 지우고 다시 다 설정하는 방식임.
        this.clearTokensFromChainInfos();

        const newTokenMap = new Map(this.tokenMap);
        const chainIdentifier = ChainIdHelper.parse(modularChainInfo.chainId);
        const newTokens = res[chainIdentifier.identifier];
        if (newTokens) {
          newTokenMap.set(chainIdentifier.identifier, newTokens);
        }

        this.tokenMap = newTokenMap;
      });
    } else {
      throw new Error(`Unsupported chain: ${chainId}`);
    }
  }

  get waitingSuggestedToken():
    | InteractionWaitingData<{
        chainId: string;
        contractAddress: string;
        viewingKey?: string;
      }>
    | undefined {
    const cw20Datas = this.interactionStore.getAllData<{
      chainId: string;
      contractAddress: string;
      viewingKey?: string;
    }>("suggest-token-cw20");

    if (cw20Datas.length > 0) {
      return cw20Datas[0];
    }

    const erc20Datas = this.interactionStore.getAllData<{
      chainId: string;
      contractAddress: string;
    }>("suggest-token-erc20");

    if (erc20Datas.length > 0) {
      return erc20Datas[0];
    }
  }

  async approveSuggestedTokenWithProceedNext(
    id: string,
    appCurrency: AppCurrency,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    const d = this.interactionStore.getData<{
      chainId: string;
      contractAddress: string;
      viewingKey?: string;
    }>(id);
    if (!d) {
      return;
    }

    await this.interactionStore.approveWithProceedNext(
      id,
      appCurrency,
      afterFn
    );
    this.refreshTokens();
  }

  async rejectSuggestedToken(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAllSuggestedTokens() {
    await this.interactionStore.rejectAll("suggest-token-cw20");
    await this.interactionStore.rejectAll("suggest-token-erc20");
  }
}
