import {
  ChainInfoWithCoreTypes,
  ChainInfoWithRepoUpdateOptions,
} from "./types";
import {
  AppCurrency,
  ChainInfo,
  ChainInfoWithoutEndpoints,
  FeeCurrency,
  Currency as LegacyCurrency,
  CW20Currency as LegacyCW20Currency,
  Erc20Currency as LegacyERC20Currency,
  IBCCurrency as LegacyIBCCurrency,
} from "@keplr-wallet/types";
import { KVStore, Debouncer, MemoryKVStore } from "@keplr-wallet/common";
import { ChainUpdaterService } from "../updater";
import { InteractionService } from "../interaction";
import { Env, WEBPAGE_PORT } from "@keplr-wallet/router";
import { SuggestChainInfoMsg, SwitchNetworkByChainIdMsg } from "./messages";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { validateBasicChainInfoType } from "@keplr-wallet/chain-validator";
import { getBasicAccessPermissionType, PermissionService } from "../permission";
import { Mutable, Optional } from "utility-types";
import {
  NetworkConfig,
  Currency,
  BaseCurrency,
  NativeCurrency,
  CW20Currency,
  IBCCurrency,
  ERC20Currency,
} from "@fetchai/wallet-types";

type ChainRemovedHandler = (chainId: string, identifier: string) => void;

export class ChainsService {
  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];

  protected cachedChainInfos: ChainInfoWithCoreTypes[] | undefined;
  protected selectedChainId: string | undefined;

  protected chainUpdaterService!: ChainUpdaterService;
  protected interactionService!: InteractionService;
  public permissionService!: PermissionService;

  protected readonly kvStoreForSuggestChain: KVStore;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: ChainInfo[],
    protected readonly experimentalOptions: Partial<{
      useMemoryKVStoreForSuggestChain: boolean;
    }> = {}
  ) {
    if (experimentalOptions?.useMemoryKVStoreForSuggestChain) {
      this.kvStoreForSuggestChain = new MemoryKVStore("suggest-chain");
    } else {
      this.kvStoreForSuggestChain = kvStore;
    }
  }

  init(
    chainUpdaterService: ChainUpdaterService,
    interactionService: InteractionService,
    permissionService: PermissionService
  ) {
    this.chainUpdaterService = chainUpdaterService;
    this.interactionService = interactionService;
    this.permissionService = permissionService;
  }

  readonly getChainInfos: () => Promise<ChainInfoWithCoreTypes[]> =
    Debouncer.promise(async () => {
      if (this.cachedChainInfos) {
        return this.cachedChainInfos;
      }

      const chainInfos = this.embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          embeded: true,
        };
      });
      const embedChainInfoIdentifierMap: Map<string, true | undefined> =
        new Map();
      for (const embedChainInfo of chainInfos) {
        embedChainInfoIdentifierMap.set(
          ChainIdHelper.parse(embedChainInfo.chainId).identifier,
          true
        );
      }

      const suggestedChainInfos: ChainInfoWithCoreTypes[] = (
        await this.getSuggestedChainInfos()
      )
        .filter((chainInfo) => {
          // Filter the overlaped chain info with the embeded chain infos.
          return !embedChainInfoIdentifierMap.get(
            ChainIdHelper.parse(chainInfo.chainId).identifier
          );
        })
        .map((chainInfo: ChainInfo) => {
          return {
            ...chainInfo,
            embeded: false,
          };
        });

      let result: ChainInfoWithCoreTypes[] =
        chainInfos.concat(suggestedChainInfos);

      // Set the updated property of the chain.
      result = await Promise.all(
        result.map(async (chainInfo) => {
          const updated: ChainInfo =
            await this.chainUpdaterService.replaceChainInfo(chainInfo);

          return {
            ...updated,
            embeded: chainInfo.embeded,
          };
        })
      );

      this.cachedChainInfos = result;

      return result;
    });

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    return (await this.getChainInfos()).map<ChainInfoWithoutEndpoints>(
      (chainInfo) => {
        const chainInfoMutable: Mutable<
          Optional<
            ChainInfoWithCoreTypes,
            "rpc" | "rest" | "updateFromRepoDisabled" | "embeded"
          >
        > = {
          ...chainInfo,
        };

        // Should remove fields not related to `ChainInfoWithoutEndpoints`
        delete chainInfoMutable.rpc;
        delete chainInfoMutable.rest;
        delete chainInfoMutable.nodeProvider;

        delete chainInfoMutable.updateFromRepoDisabled;
        delete chainInfoMutable.embeded;

        return chainInfoMutable;
      }
    );
  }

  clearCachedChainInfos() {
    this.cachedChainInfos = undefined;
  }

  async getChainInfo(chainId: string): Promise<ChainInfoWithCoreTypes> {
    const chainInfo = (await this.getChainInfos()).find((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  getNetworkConfig(chainInfo: ChainInfoWithCoreTypes): NetworkConfig {
    return {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      networkType: chainInfo.features?.includes("evm") ? "evm" : "cosmos",
      rpcUrl: chainInfo.rpc,
      grpcUrl: chainInfo.grpcUrl,
      restUrl: chainInfo.rest,
      type: chainInfo.type,
      status: chainInfo.status
        ? chainInfo.status
        : chainInfo.beta
        ? "beta"
        : undefined,
      bip44s: [
        chainInfo.bip44,
        ...(chainInfo.alternativeBIP44s ? chainInfo.alternativeBIP44s : []),
      ],
      bech32Config: chainInfo.bech32Config,
      currencies: this.mapLegacyToNewCurrencies(
        chainInfo.currencies
      ) as Currency[],
      feeCurrencies: this.mapLegacyToNewCurrencies(
        chainInfo.feeCurrencies
      ) as NativeCurrency[],
      stakeCurrency: this.mapLegacyToNewCurrencies([
        chainInfo.stakeCurrency,
      ])[0] as NativeCurrency,
      gasPriceStep: chainInfo.feeCurrencies[0].gasPriceStep,
      features: chainInfo.features,
      explorerUrl: chainInfo.explorerUrl,
      chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
    };
  }

  mapLegacyToNewCurrencies(
    currencies: AppCurrency[] | FeeCurrency[]
  ): Currency[] | NativeCurrency[] {
    return currencies.map((c) => {
      const baseCurrency = this.getNewBaseCurrency(c);

      if ("type" in c) {
        if (["cw20", "erc20"].includes(c.type) && "contractAddress" in c) {
          return {
            ...baseCurrency,
            type: c.type,
            contractAddress: c.contractAddress,
          } as CW20Currency | ERC20Currency;
        }
      }

      if ("paths" in c && "originChainId" in c && "originCurrency" in c) {
        const ibcCurrency: IBCCurrency = {
          ...baseCurrency,
          type: "ibc",
          paths: c.paths,
          originChainId: c.originChainId,
          originCurrency: undefined,
        };

        if (!c.originCurrency) {
          return ibcCurrency;
        }

        const baseIbcCurrency = this.getNewBaseCurrency(c.originCurrency);

        if (
          "type" in c.originCurrency &&
          "contractAddress" in c.originCurrency
        ) {
          if (c.originCurrency.type === "cw20") {
            return {
              ...ibcCurrency,
              originCurrency: {
                ...baseIbcCurrency,
                type: "cw20",
                contractAddress: c.originCurrency.contractAddress,
              },
            } as IBCCurrency;
          }
        } else {
          return {
            ...ibcCurrency,
            originCurrency: {
              ...baseIbcCurrency,
              type: "native",
            },
          } as IBCCurrency;
        }
      }

      return { ...baseCurrency, denom: c.coinDenom } as NativeCurrency;
    });
  }

  getNewBaseCurrency(c: AppCurrency | FeeCurrency): BaseCurrency {
    return {
      type: "native",
      description: c.description ? c.description : "",
      display: c.display ? c.display : "",
      name: c.name ? c.name : "",
      coinGeckoId: c.coinGeckoId,
      imageUrl: c.coinImageUrl,
      decimals: c.coinDecimals,
      denomUnits: c.denomUnits
        ? c.denomUnits
        : [
            {
              name: c.coinDenom,
              exponent: c.coinDecimals,
            },
            {
              name: c.coinMinimalDenom,
              exponent: 0,
            },
          ],
    };
  }

  mapNewToLegacyCurrencies(
    currencies: Currency[] | NativeCurrency[],
    gasPriceStep?: {
      readonly low: number;
      readonly average: number;
      readonly high: number;
    }
  ): AppCurrency[] | FeeCurrency[] | LegacyCurrency[] {
    return currencies.map((c) => {
      const baseCurrency = this.getLegacyBaseCurrency(c, gasPriceStep);

      if (["cw20", "erc20"].includes(c.type) && "contractAddress" in c) {
        return {
          ...baseCurrency,
          type: c.type,
          contractAddress: c.contractAddress,
        } as LegacyCW20Currency | LegacyERC20Currency;
      }

      if ("paths" in c && "originChainId" in c && "originCurrency" in c) {
        const ibcCurrency: LegacyIBCCurrency = {
          ...baseCurrency,
          paths: c.paths,
          originChainId: c.originChainId,
          originCurrency: undefined,
        };

        if (!c.originCurrency) {
          return ibcCurrency;
        }

        const baseIbcCurrency = this.getLegacyBaseCurrency(
          c.originCurrency,
          gasPriceStep
        );

        if (
          "type" in c.originCurrency &&
          "contractAddress" in c.originCurrency
        ) {
          if (c.originCurrency.type === "cw20") {
            return {
              ...ibcCurrency,
              originCurrency: {
                ...baseIbcCurrency,
                type: "cw20",
                contractAddress: c.originCurrency.contractAddress,
              },
            } as LegacyIBCCurrency;
          }
        } else {
          return {
            ...ibcCurrency,
            originCurrency: {
              ...baseIbcCurrency,
            },
          } as LegacyIBCCurrency;
        }
      }

      return baseCurrency;
    });
  }

  getLegacyBaseCurrency(
    c: Currency | NativeCurrency,
    gasPriceStep?: {
      readonly low: number;
      readonly average: number;
      readonly high: number;
    }
  ): LegacyCurrency | FeeCurrency {
    const legacyBaseCurrency: LegacyCurrency = {
      description: c.description ? c.description : "",
      display: c.display ? c.display : "",
      name: c.name ? c.name : "",
      coinGeckoId: c.coinGeckoId,
      coinImageUrl: c.imageUrl,
      coinDecimals: c.decimals,
      coinDenom:
        c.denomUnits.find((d) => {
          return d.exponent === c.decimals;
        })?.name ?? "unknown",
      coinMinimalDenom:
        c.denomUnits.find((d) => {
          return d.exponent === 0;
        })?.name ?? "unknown",
    };

    if (gasPriceStep) {
      return {
        ...legacyBaseCurrency,
        gasPriceStep,
      } as FeeCurrency;
    }

    return legacyBaseCurrency;
  }

  async getAllNetworks(): Promise<NetworkConfig[]> {
    const chainInfos = await this.getChainInfos();
    return chainInfos.map((chainInfo) => {
      return this.getNetworkConfig(chainInfo);
    });
  }

  async getChainCoinType(chainId: string): Promise<number> {
    const chainInfo = await this.getChainInfo(chainId);

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }

    return chainInfo.bip44.coinType;
  }

  async hasChainInfo(chainId: string): Promise<boolean> {
    return (
      (await this.getChainInfos()).find((chainInfo) => {
        return (
          ChainIdHelper.parse(chainInfo.chainId).identifier ===
          ChainIdHelper.parse(chainId).identifier
        );
      }) != null
    );
  }

  async suggestChainInfo(
    env: Env,
    chainInfo: ChainInfo,
    origin: string
  ): Promise<void> {
    chainInfo = await validateBasicChainInfoType(chainInfo);

    let receivedChainInfo = (await this.interactionService.waitApprove(
      env,
      "/suggest-chain",
      SuggestChainInfoMsg.type(),
      {
        chainInfo,
        origin,
      }
    )) as ChainInfoWithRepoUpdateOptions;

    receivedChainInfo = {
      ...(await validateBasicChainInfoType(receivedChainInfo)),
      // Beta should be from suggested chain info itself.
      beta: chainInfo.beta,
      updateFromRepoDisabled: receivedChainInfo.updateFromRepoDisabled,
    };

    if (receivedChainInfo.updateFromRepoDisabled) {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added with updateFromRepoDisabled`
      );
    } else {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added`
      );
    }

    await this.permissionService.addPermission(
      [chainInfo.chainId],
      getBasicAccessPermissionType(),
      [origin]
    );

    await this.addChainInfo(receivedChainInfo);
  }

  async getSuggestedChainInfos(): Promise<ChainInfoWithRepoUpdateOptions[]> {
    return (
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? []
    );
  }

  async addChainInfo(chainInfo: ChainInfoWithRepoUpdateOptions): Promise<void> {
    if (await this.hasChainInfo(chainInfo.chainId)) {
      throw new Error("Same chain is already registered");
    }

    const savedChainInfos =
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? [];

    savedChainInfos.push(chainInfo);

    await this.kvStoreForSuggestChain.set<ChainInfoWithRepoUpdateOptions[]>(
      "chain-infos",
      savedChainInfos
    );

    this.clearCachedChainInfos();
  }

  async removeChainInfo(chainId: string): Promise<void> {
    if (!(await this.hasChainInfo(chainId))) {
      throw new Error("Chain is not registered");
    }

    if ((await this.getChainInfo(chainId)).embeded) {
      throw new Error("Can't remove the embedded chain");
    }

    const savedChainInfos =
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? [];

    const resultChainInfo = savedChainInfos.filter((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier !==
        ChainIdHelper.parse(chainId).identifier
      );
    });

    await this.kvStoreForSuggestChain.set<ChainInfoWithRepoUpdateOptions[]>(
      "chain-infos",
      resultChainInfo
    );

    // Clear the updated chain info.
    await this.chainUpdaterService.clearUpdatedProperty(chainId);

    for (const chainRemovedHandler of this.onChainRemovedHandlers) {
      chainRemovedHandler(chainId, ChainIdHelper.parse(chainId).identifier);
    }

    this.clearCachedChainInfos();
  }

  async getChainEthereumKeyFeatures(
    chainId: string
  ): Promise<{ address: boolean; signing: boolean }> {
    const chainInfo = await this.getChainInfo(chainId);

    if (chainInfo.features?.includes("evm")) {
      return {
        address: true,
        signing: true,
      };
    }

    return {
      address: chainInfo.features?.includes("eth-address-gen") ?? false,
      signing: chainInfo.features?.includes("eth-key-sign") ?? false,
    };
  }

  async addChainByNetwork(
    env: Env,
    networkConfig: NetworkConfig,
    origin: string
  ): Promise<void> {
    const features = networkConfig.features ?? [];

    if (
      networkConfig.networkType === "evm" &&
      !features.find((f) => f === "evm")
    ) {
      features.push("evm");
    }

    let chainInfo: ChainInfo = {
      rpc: networkConfig.rpcUrl,
      rest: networkConfig.restUrl ?? "",
      chainId: networkConfig.chainId,
      chainName: networkConfig.chainName,
      stakeCurrency: this.mapNewToLegacyCurrencies([
        networkConfig.stakeCurrency,
      ])[0],
      currencies: this.mapNewToLegacyCurrencies(networkConfig.currencies),
      feeCurrencies: this.mapNewToLegacyCurrencies(
        networkConfig.feeCurrencies,
        networkConfig.gasPriceStep
      ),
      bech32Config: networkConfig.bech32Config,
      bip44: networkConfig.bip44s[0],
      alternativeBIP44s: networkConfig.bip44s.slice(
        1,
        networkConfig.bip44s.length - 1
      ),
      features,
      beta: networkConfig.status ? networkConfig.status === "beta" : false,
      grpcUrl: networkConfig.grpcUrl,
      type: networkConfig.type,
      status: networkConfig.status,
      explorerUrl: networkConfig.explorerUrl,
      chainSymbolImageUrl: networkConfig.chainSymbolImageUrl,
    };
    chainInfo = await validateBasicChainInfoType(chainInfo);

    let receivedChainInfo = (await this.interactionService.waitApprove(
      env,
      "/add-chain-by-network",
      SuggestChainInfoMsg.type(),
      {
        chainInfo,
        origin,
      }
    )) as ChainInfoWithRepoUpdateOptions;

    receivedChainInfo = {
      ...(await validateBasicChainInfoType(receivedChainInfo)),
      // Beta should be from suggested chain info itself.
      beta: chainInfo.beta,
      updateFromRepoDisabled: receivedChainInfo.updateFromRepoDisabled,
    };

    if (receivedChainInfo.updateFromRepoDisabled) {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added with updateFromRepoDisabled`
      );
    } else {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added`
      );
    }

    await this.permissionService.addPermission(
      [chainInfo.chainId],
      getBasicAccessPermissionType(),
      [origin]
    );

    await this.addChainInfo(receivedChainInfo);
  }

  async switchChainByChainId(
    env: Env,
    chainId: string,
    origin: string
  ): Promise<void> {
    const receivedChainId = (await this.interactionService.waitApprove(
      env,
      "/switch-chain-by-chainid",
      SwitchNetworkByChainIdMsg.type(),
      {
        chainId,
        origin,
      }
    )) as string;
    console.log(`Switched to chain with chainId ${receivedChainId}`);
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }

  setSelectedChain(chainId: string) {
    if (this.selectedChainId !== chainId) {
      this.selectedChainId = chainId;
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "network-changed",
        {}
      );
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  async getSelectedChain(): Promise<string> {
    if (!this.selectedChainId) {
      return (await this.getChainInfos())[0].chainId;
    }

    return this.selectedChainId;
  }
}
