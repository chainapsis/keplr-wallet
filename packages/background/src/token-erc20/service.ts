import { Env, KeplrError } from "@keplr-wallet/router";
import {
  AppCurrency,
  ChainInfo,
  ERC20Currency,
  ModularChainInfo,
} from "@keplr-wallet/types";
import { ERC20CurrencySchema } from "@keplr-wallet/chain-validator";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainsService } from "../chains";
import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { computedFn } from "mobx-utils";
import { ERC20TokenInfo } from "./types";

export class TokenERC20Service {
  protected readonly kvStore: KVStore;

  @observable
  protected tokenMap: Map<string, ERC20TokenInfo[]> = new Map();

  constructor(
    kvStore: KVStore,
    protected chainsService: ChainsService,
    protected interactionService: InteractionService
  ) {
    this.kvStore = new PrefixKVStore(kvStore, "v2");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, ERC20TokenInfo[]>>(
      "tokenMapERC20"
    );
    if (saved) {
      for (const [key, value] of Object.entries(saved)) {
        this.tokenMap.set(key, value);
      }
    }
    autorun(() => {
      const js = toJS(this.tokenMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, ERC20TokenInfo[]>>("tokenMapERC20", obj);
    });

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
    runInAction(() => {
      this.tokenMap.delete(chainIdentifier);
    });
  };

  getAllERC20TokenInfos = computedFn(
    (): Record<string, ERC20TokenInfo[] | undefined> => {
      const js = toJS(this.tokenMap);
      return Object.fromEntries(js);
    }
  );

  protected validateChainInfo(chainInfo: ModularChainInfo) {
    if ("evm" in chainInfo && chainInfo.evm === undefined) {
      throw new Error("The chain doesn't support evm");
    }
  }

  async suggestERC20Token(env: Env, chainId: string, contractAddress: string) {
    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);
    if ("cosmos" in modularChainInfo) {
      this.validateChainInfo(modularChainInfo);
    } else if ("evm" in modularChainInfo) {
      if (modularChainInfo.evm == null) {
        throw new Error("EVM chain info is not defined");
      }
    } else if ("starknet" in modularChainInfo) {
      if (modularChainInfo.starknet == null) {
        throw new Error("Starknet chain info is not defined");
      }
    } else {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    const existing = this.getERC20Token(chainId, contractAddress);

    // If the same currency is already registered, do nothing.
    if (existing) {
      return;
    }

    // Validate contract Address
    if (
      !contractAddress.match(/^0x[0-9A-Fa-f]*$/) ||
      (contractAddress.length !== 42 &&
        // For Starknet, contract address length can be 65 or 66.
        contractAddress.length !== 65 &&
        contractAddress.length !== 66)
    ) {
      throw new Error("Contract address is not valid hex address");
    }

    const params = {
      chainId,
      contractAddress,
    };

    const appCurrency = (await this.interactionService.waitApprove(
      env,
      `/setting/token/add`,
      "suggest-token-erc20",
      params
    )) as AppCurrency;

    await this.setERC20Token(chainId, appCurrency);
  }

  getERC20Token = computedFn(
    (chainId: string, contractAddress: string): ERC20TokenInfo | undefined => {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      const tokens = this.tokenMap.get(chainIdentifier);
      if (!tokens) {
        return undefined;
      }
      return tokens.find((token) => {
        if ("contractAddress" in token.currency) {
          return token.currency.contractAddress === contractAddress;
        }
        return false;
      });
    }
  );

  async setERC20Token(chainId: string, currency: AppCurrency): Promise<void> {
    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);
    if ("cosmos" in modularChainInfo) {
      this.validateChainInfo(modularChainInfo);
    } else if ("evm" in modularChainInfo) {
      if (modularChainInfo.evm == null) {
        throw new Error("EVM chain info is not defined");
      }
    } else if ("starknet" in modularChainInfo) {
      if (modularChainInfo.starknet == null) {
        throw new Error("Starknet chain info is not defined");
      }
    } else {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    if (!this.tokenMap.has(chainIdentifier)) {
      runInAction(() => {
        this.tokenMap.set(chainIdentifier, []);
      });
    }

    const tokens = this.tokenMap.get(chainIdentifier)!;

    currency = await TokenERC20Service.validateCurrency(currency);

    if (!("type" in currency) || currency.type !== "erc20") {
      throw new Error("Unknown type of currency");
    }

    const contractAddress = currency.contractAddress;

    const find = tokens.find((token) => {
      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    runInAction(() => {
      if (find) {
        find.currency = currency;
      } else {
        tokens.push({
          currency,
        });
      }
    });
  }

  @action
  removeERC20Token(chainId: string, contractAddress: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const tokens = this.tokenMap.get(chainIdentifier);
    if (!tokens) {
      return;
    }
    const findIndex = tokens.findIndex((token) => {
      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    if (findIndex >= 0) {
      tokens.splice(findIndex, 1);
    }
  }

  static async validateCurrency(currency: AppCurrency): Promise<AppCurrency> {
    // Validate the schema.
    if ("type" in currency) {
      switch (currency.type) {
        case "erc20":
          currency = await TokenERC20Service.validateERC20Currency(currency);
          break;
        default:
          throw new KeplrError("tokens", 110, "Unknown type of currency");
      }
    } else {
      throw new Error("Unknown type of currency");
    }

    return currency;
  }

  static async validateERC20Currency(
    currency: ERC20Currency
  ): Promise<ERC20Currency> {
    await ERC20CurrencySchema.validateAsync(currency);

    return currency;
  }
}
