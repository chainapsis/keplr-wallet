import { ChainsService } from "../chains";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingService } from "../keyring";
import { ChainsUIForegroundService, ChainsUIService } from "../chains-ui";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { AppCurrency, SupportedPaymentType } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Dec } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { VaultService } from "../vault";
import { KVStore } from "@keplr-wallet/common";
import { KeyRingStarknetService } from "../keyring-starknet";
import { CairoUint256 } from "starknet";
import { KeyRingBitcoinService } from "../keyring-bitcoin";
import { MessageRequester } from "@keplr-wallet/router";

export type TokenScan = {
  chainId: string;
  infos: {
    bech32Address?: string;
    ethereumHexAddress?: string;
    starknetHexAddress?: string;
    bitcoinAddress?: {
      bech32Address: string;
      paymentType: SupportedPaymentType;
    };
    coinType?: number;
    assets: {
      currency: AppCurrency;
      amount: string;
    }[];
  }[];
  linkedChainKey?: string;
};

export class TokenScanService {
  @observable
  protected vaultToMap = new Map<string, TokenScan[]>();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventMsgRequester: MessageRequester,
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly vaultService: VaultService,
    protected readonly keyRingService: KeyRingService,
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly keyRingStarknetService: KeyRingStarknetService,
    protected readonly keyRingBitcoinService: KeyRingBitcoinService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, TokenScan[]>>(
      "vaultToMap"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.vaultToMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.vaultToMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set("vaultToMap", obj);
    });

    this.vaultService.addVaultRemovedHandler(
      (type: string, vaultId: string) => {
        if (type === "keyRing") {
          this.vaultToMap.delete(vaultId);
        }
      }
    );
    this.chainsService.addChainSuggestedHandler(
      (chainInfo, options?: Record<string, any>) => {
        // internal에 의해서 suggest chain이 되었다면
        // 현재 선택된 계정에 대해서는 자동으로 enable 시키지 않는다.
        // ui에서 알아서 suggest 시에 필요하다면 현재 계정에 대해서 enable 해준다.
        // background에서 처리하면 필요하지 않을때도 enable되게 되므로 처리하기 복잡해져서
        // internal에서는 ui에 맡긴다.
        const excludeVaultId: string | undefined = (() => {
          if (options && options["isInternalMsg"] === true) {
            return this.keyRingService.selectedVaultId;
          }
        })();

        // 여기서 await을 하면 suggest chain이 계정이 늘어날수록 늦어진다.
        // 절대로 await을 하지않기...
        this.scanWithAllVaults(chainInfo.chainId).then(() => {
          // suggest chain 이후에 한번에 한해서 자동으로 enable을 해준다.
          // scanWithAllVaults이 끝났으면 this.vaultToMap이 업데이트가 완료되었을 것이다.
          for (const keyRing of this.keyRingService.getKeyInfos()) {
            if (excludeVaultId === keyRing.id) {
              continue;
            }

            let enabledChanges = false;
            const vaultId = keyRing.id;
            const tokenScans = this.getTokenScans(vaultId);
            for (const tokenScan of tokenScans) {
              if (
                tokenScan.chainId === chainInfo.chainId &&
                tokenScan.infos.length === 1
              ) {
                for (const modularChainInfo of this.chainsService.getModularChainInfoWithLinkedChainKey(
                  chainInfo.chainId
                )) {
                  const chainId = modularChainInfo.chainId;
                  if (!this.chainsUIService.isEnabled(vaultId, chainId)) {
                    this.chainsUIService.enableChain(vaultId, chainId);
                    enabledChanges = true;
                  }
                }
              }
            }
            if (enabledChanges) {
              ChainsUIForegroundService.invokeEnabledChainIdentifiersUpdated(
                this.eventMsgRequester,
                vaultId
              );
            }
          }
        });
      }
    );
    this.chainsUIService.addChainUIEnabledChangedHandler(
      (vaultId, chainIdentifiers) => {
        runInAction(() => {
          let prevTokenScans = this.vaultToMap.get(vaultId);
          if (prevTokenScans) {
            prevTokenScans = prevTokenScans.filter((tokenScan) => {
              return !chainIdentifiers.includes(
                ChainIdHelper.parse(tokenScan.chainId).identifier
              );
            });
            this.vaultToMap.set(vaultId, prevTokenScans);
          }
        });
      }
    );
  }

  getTokenScans(vaultId: string): TokenScan[] {
    return (this.vaultToMap.get(vaultId) ?? [])
      .filter((tokenScan) => {
        return (
          this.chainsService.hasModularChainInfo(tokenScan.chainId) &&
          !this.chainsUIService.isEnabled(vaultId, tokenScan.chainId)
        );
      })
      .sort((a, b) => {
        // Sort by chain name
        const aChainInfo = this.chainsService.getModularChainInfoOrThrow(
          a.chainId
        );
        const bModualrChainInfo = this.chainsService.getModularChainInfoOrThrow(
          b.chainId
        );

        return aChainInfo.chainName.localeCompare(bModualrChainInfo.chainName);
      });
  }

  protected async scanWithAllVaults(chainId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if ("cosmos" in chainInfo && chainInfo.cosmos.hideInUI) {
      return;
    }

    const vaultIds = this.keyRingService
      .getKeyInfos()
      .map((keyInfo) => keyInfo.id)
      .sort((a, b) => {
        // 현재 선택된 계정에게 우선권을 준다.
        const aIsSelected = this.keyRingService.selectedVaultId === a;
        const bIsSelected = this.keyRingService.selectedVaultId === b;

        if (aIsSelected) {
          return -1;
        }
        if (bIsSelected) {
          return 1;
        }
        return 0;
      });
    for (const vaultId of vaultIds) {
      try {
        // 얘는 계정 수를 예상하기 힘드니까 그냥 순차적으로 한다...
        await this.scan(vaultId, chainId);
      } catch (e) {
        console.log(e);
        // noop
      }
    }
  }

  async scan(vaultId: string, chainId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if ("cosmos" in chainInfo && chainInfo.cosmos.hideInUI) {
      return;
    }

    const tokenScan = await this.calculateTokenScan(vaultId, chainId);

    if (tokenScan) {
      if (this.chainsUIService.isEnabled(vaultId, tokenScan.chainId)) {
        return;
      }

      runInAction(() => {
        let prevTokenScans = this.vaultToMap.get(vaultId) ?? [];

        const chainIdentifier = ChainIdHelper.parse(
          tokenScan.chainId
        ).identifier;
        prevTokenScans = prevTokenScans.filter((scan) => {
          const prevChainIdentifier = ChainIdHelper.parse(
            scan.chainId
          ).identifier;
          return chainIdentifier !== prevChainIdentifier;
        });

        prevTokenScans.push(tokenScan);

        this.vaultToMap.set(vaultId, prevTokenScans);
      });
    }
  }

  async scanAll(vaultId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const modularChainInfos = this.chainsService
      .getModularChainInfos()
      .filter(
        (chainInfo) =>
          !this.chainsUIService.isEnabled(vaultId, chainInfo.chainId)
      );

    const tokenScans: TokenScan[] = [];
    const processedLinkedChainKeys = new Set<string>();
    const promises: Promise<void>[] = [];

    for (const modularChainInfo of modularChainInfos) {
      if ("linkedChainKey" in modularChainInfo) {
        if (processedLinkedChainKeys.has(modularChainInfo.linkedChainKey)) {
          continue;
        }
        processedLinkedChainKeys.add(modularChainInfo.linkedChainKey);
      }

      promises.push(
        (async () => {
          const tokenScan = await this.calculateTokenScan(
            vaultId,
            modularChainInfo.chainId
          );

          if (tokenScan) {
            tokenScans.push(tokenScan);
          }
        })()
      );
    }

    // ignore error
    await Promise.allSettled(promises);

    if (tokenScans.length > 0) {
      runInAction(() => {
        let prevTokenScans = this.vaultToMap.get(vaultId) ?? [];

        for (const tokenScan of tokenScans) {
          const chainIdentifier = ChainIdHelper.parse(
            tokenScan.chainId
          ).identifier;
          prevTokenScans = prevTokenScans.filter((scan) => {
            const prevChainIdentifier = ChainIdHelper.parse(
              scan.chainId
            ).identifier;
            return chainIdentifier !== prevChainIdentifier;
          });

          prevTokenScans.push(tokenScan);
        }

        prevTokenScans = prevTokenScans.filter((scan) => {
          return !this.chainsUIService.isEnabled(vaultId, scan.chainId);
        });

        this.vaultToMap.set(vaultId, prevTokenScans);
      });
    }
  }

  protected async calculateTokenScan(
    vaultId: string,
    chainId: string
  ): Promise<TokenScan | undefined> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    if (this.chainsUIService.isEnabled(vaultId, chainId)) {
      return;
    }

    const tokenScan: TokenScan = {
      chainId,
      infos: [],
    };

    const modularChainInfo = this.chainsService.getModularChainInfo(chainId);
    if (modularChainInfo == null) {
      return;
    }

    if ("linkedChainKey" in modularChainInfo) {
      tokenScan.linkedChainKey = modularChainInfo.linkedChainKey;
    }

    if ("evm" in modularChainInfo) {
      const evmInfo = this.chainsService.getEVMInfoOrThrow(chainId);
      const pubkey = await this.keyRingService.getPubKey(chainId, vaultId);
      const ethereumHexAddress = `0x${Buffer.from(
        pubkey.getEthAddress()
      ).toString("hex")}`;

      const res = await simpleFetch<{
        result: string;
      }>(evmInfo.rpc, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(() => {
            if (typeof browser !== "undefined") {
              return {
                "request-source": new URL(browser.runtime.getURL("/")).origin,
              };
            }
            return undefined;
          })(),
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [ethereumHexAddress, "latest"],
          id: 1,
        }),
      });

      if (res.status === 200 && BigInt(res.data.result).toString(10) !== "0") {
        tokenScan.infos.push({
          bech32Address: "",
          ethereumHexAddress,
          coinType: 60,
          assets: [
            {
              currency: modularChainInfo.evm.currencies[0],
              amount: BigInt(res.data.result).toString(10),
            },
          ],
        });
      }
    }

    if ("cosmos" in modularChainInfo) {
      if (modularChainInfo.cosmos.hideInUI) {
        return;
      }

      const bech32Addresses: {
        value: string;
        coinType?: number;
      }[] = await (async () => {
        if (this.keyRingService.needKeyCoinTypeFinalize(vaultId, chainId)) {
          return (
            await this.keyRingCosmosService.computeNotFinalizedKeyAddresses(
              vaultId,
              chainId
            )
          ).map((addr) => {
            return {
              value: addr.bech32Address,
              coinType: addr.coinType,
            };
          });
        } else {
          return [
            {
              value: (await this.keyRingCosmosService.getKey(vaultId, chainId))
                .bech32Address,
            },
          ];
        }
      })();

      for (const bech32Address of bech32Addresses) {
        const res = await simpleFetch<{
          balances: { denom: string; amount: string }[];
        }>(
          modularChainInfo.cosmos.rest,
          `/cosmos/bank/v1beta1/balances/${bech32Address.value}?pagination.limit=1000`
        );

        if (res.status === 200) {
          const assets: TokenScan["infos"][number]["assets"] = [];

          const balances = res.data?.balances ?? [];
          for (const bal of balances) {
            const currency = modularChainInfo.cosmos.currencies.find(
              (cur) => cur.coinMinimalDenom === bal.denom
            );
            if (currency) {
              // validate
              if (typeof bal.amount !== "string") {
                throw new Error("Invalid amount");
              }

              const dec = new Dec(bal.amount);
              if (dec.gt(new Dec(0))) {
                assets.push({
                  currency,
                  amount: bal.amount,
                });
              }
            }
          }

          if (assets.length > 0) {
            tokenScan.infos.push({
              bech32Address: bech32Address.value,
              coinType: bech32Address.coinType,
              assets,
            });
          }
        }
      }
    } else if ("starknet" in modularChainInfo) {
      const { hexAddress: starknetHexAddress } =
        await this.keyRingStarknetService.getStarknetKey(vaultId, chainId);

      await Promise.all(
        modularChainInfo.starknet.currencies.map(async (currency) => {
          const res = await simpleFetch<{
            result: string[];
          }>(modularChainInfo.starknet.rpc, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(() => {
                if (typeof browser !== "undefined") {
                  return {
                    "request-source": new URL(browser.runtime.getURL("/"))
                      .origin,
                  };
                }
                return undefined;
              })(),
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "starknet_call",
              params: {
                block_id: "latest",
                request: {
                  contract_address: currency.contractAddress,
                  calldata: [starknetHexAddress],
                  // selector.getSelectorFromName("balanceOf")
                  entry_point_selector:
                    "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e",
                },
              },
              id: 1,
            }),
          });

          if (res.status === 200) {
            const amount = new CairoUint256({
              low: res.data.result[0],
              high: res.data.result[1],
            })
              .toBigInt()
              .toString(10);

            if (amount !== "0") {
              // XXX: Starknet의 경우는 여러 주소가 나올수가 없으므로
              //      starknetHexAddress는 같은 값으로 나온다고 생각하고 처리한다.
              if (tokenScan.infos.length === 0) {
                tokenScan.infos.push({
                  starknetHexAddress,
                  assets: [
                    {
                      currency,
                      amount,
                    },
                  ],
                });
              } else {
                if (
                  tokenScan.infos[0].starknetHexAddress === starknetHexAddress
                ) {
                  tokenScan.infos[0].assets.push({
                    currency,
                    amount,
                  });
                }
              }
            }
          }
        })
      );
    } else if ("bitcoin" in modularChainInfo) {
      const getBitcoinScanInfo = async (
        vaultId: string,
        chainId: string,
        allowZeroAmount: boolean
      ) => {
        const { address: bitcoinAddress, paymentType } =
          await this.keyRingBitcoinService.getBitcoinKey(vaultId, chainId);

        const bitcoinChainInfo =
          this.chainsService.getBitcoinChainInfoOrThrow(chainId);

        const res = await simpleFetch<{
          address: string;
          chain_stats: {
            funded_txo_count: number;
            funded_txo_sum: number;
            spent_txo_count: number;
            spent_txo_sum: number;
            tx_count: number;
          };
          mempool_stats: {
            funded_txo_count: number;
            funded_txo_sum: number;
            spent_txo_count: number;
            spent_txo_sum: number;
            tx_count: number;
          };
        }>(`${bitcoinChainInfo.rest}/address/${bitcoinAddress}`);

        const confirmed =
          res.status === 200
            ? res.data.chain_stats.funded_txo_sum -
              res.data.chain_stats.spent_txo_sum
            : 0;

        if (confirmed > 0 || (confirmed === 0 && allowZeroAmount)) {
          return {
            bitcoinAddress: {
              bech32Address: bitcoinAddress,
              paymentType,
            },
            assets: [
              {
                currency: bitcoinChainInfo.currencies[0],
                amount: confirmed.toString(10),
              },
            ],
          };
        }

        return undefined;
      };

      // TODO: 향후 여러 주소체계를 지원하는 체인이 추가되면 linkedChainKey와 관련된 로직은 별도의 함수로 분리가 필요할 것
      if ("linkedChainKey" in modularChainInfo) {
        const linkedBitcoinChains = this.chainsService
          .getModularChainInfos()
          .filter((chainInfo) => {
            return (
              "bitcoin" in chainInfo &&
              chainInfo.linkedChainKey === modularChainInfo.linkedChainKey
            );
          });

        const bitcoinScanInfos: TokenScan["infos"] = [];

        for (const chainInfo of linkedBitcoinChains) {
          const info = await getBitcoinScanInfo(
            vaultId,
            chainInfo.chainId,
            true
          );
          if (info) {
            bitcoinScanInfos.push(info);
          }
        }

        if (bitcoinScanInfos.length !== linkedBitcoinChains.length) {
          throw new Error(
            "Invalid bitcoin scan info: length mismatch between linked bitcoin chains and bitcoin scan infos"
          );
        }

        let hasNonZeroAmount = false;

        for (const bitcoinScanInfo of bitcoinScanInfos) {
          // 우선 main currency만 처리한다.
          if (
            bitcoinScanInfo.assets.length > 0 &&
            bitcoinScanInfo.assets[0].amount !== "0"
          ) {
            hasNonZeroAmount = true;
            break;
          }
        }

        // 하나라도 0이 아닌 값이 있으면 연결된 모든 체인에 대해 토큰 스캔 정보를 추가한다.
        if (hasNonZeroAmount) {
          tokenScan.infos.push(...bitcoinScanInfos);
        }
      } else {
        const bitcoinScanInfo = await getBitcoinScanInfo(
          vaultId,
          chainId,
          false
        );

        if (bitcoinScanInfo) {
          tokenScan.infos.push(bitcoinScanInfo);
        }
      }
    }

    if (tokenScan.infos.length > 0) {
      return tokenScan;
    }

    return undefined;
  }
}
