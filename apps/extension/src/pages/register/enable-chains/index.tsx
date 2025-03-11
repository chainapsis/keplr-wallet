import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { Column, Columns } from "../../../components/column";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { SearchTextInput } from "../../../components/input";
import {
  BaseTypography,
  Body3,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { Button } from "../../../components/button";
import { ColorPalette } from "../../../styles";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { useNavigate } from "react-router";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../../components/image";
import { Checkbox } from "../../../components/checkbox";
import { KeyRingCosmosService } from "@keplr-wallet/background";
import { WalletStatus } from "@keplr-wallet/stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TextButton } from "../../../components/button-text";
import { FormattedMessage, useIntl } from "react-intl";
import { Tag } from "../../../components/tag";
import SimpleBar from "simplebar-react";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { NativeChainMarkIcon } from "../../../components/icon";
import { EmbedChainInfos } from "../../../config";
import { ViewToken } from "../../main";
import { IconButton } from "../../../components/icon-button";
import { DenomHelper } from "@keplr-wallet/common";
import { Tooltip } from "../../../components/tooltip";
import { useSpring, animated } from "@react-spring/web";
import { useGetAllNonNativeChain } from "../../../hooks/use-get-all-chain";
import { hexToRgba } from "../../../utils";

/**
 * EnableChainsScene은 finalize-key scene에서 선택한 chains를 활성화하는 scene이다.
 * 근데 문제는 extension 자체의 메인 페이지에서 manage chains 버튼을 눌러서도 올 수 있다는 점이다...
 * registeration이 하는 역할이 많아지면서 복잡해졌는데... 알아서 잘 처리하자
 */
export const EnableChainsScene: FunctionComponent<{
  vaultId: string;
  // finalize-key scene으로부터 온 경우에는 finalize-key scene이 미리 계산해서 전달해준다.
  // 아닌 경우는 이 scene에서 계산한다.
  // 또한 밑의 prop이 제공된 경우에만 automatic chain selection(?) 기능이 처리된다.
  candidateAddresses?: {
    chainId: string;
    bech32Addresses: {
      coinType: number;
      address: string;
    }[];
  }[];
  isFresh?: boolean;
  skipWelcome?: boolean;
  initialSearchValue?: string;
  fallbackEthereumLedgerApp?: boolean;
  fallbackStarknetLedgerApp?: boolean;
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({
    vaultId,
    candidateAddresses: propCandiateAddresses,
    isFresh,
    fallbackEthereumLedgerApp,
    fallbackStarknetLedgerApp,
    stepPrevious,
    stepTotal,
    skipWelcome,
    initialSearchValue,
  }) => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      priceStore,
      keyRingStore,
      starknetQueriesStore,
      hugeQueriesStore,
    } = useStore();

    const navigate = useNavigate();
    const intl = useIntl();
    const theme = useTheme();

    const searchRef = useRef<HTMLInputElement | null>(null);

    const nativeChainIdentifierSet = useMemo(
      () =>
        new Set(
          EmbedChainInfos.filter((chainInfo) => {
            if ("hideInUI" in chainInfo && chainInfo.hideInUI) {
              return false;
            }
            return true;
          }).map(
            (chainInfo) => ChainIdHelper.parse(chainInfo.chainId).identifier
          )
        ),
      []
    );

    const tokensByChainIdentifier =
      hugeQueriesStore.allTokenMapByChainIdentifier;

    const header = useRegisterHeader();
    useSceneEvents({
      onWillVisible: () => {
        header.setHeader({
          mode: "step",
          title: intl.formatMessage({
            id: "pages.register.enable-chains.title",
          }),
          paragraphs: [
            intl.formatMessage({
              id: "pages.register.enable-chains.paragraph",
            }),
          ],
          stepCurrent: stepPrevious + 1,
          stepTotal: stepTotal,
        });
      },
      onDidVisible: () => {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      },
    });

    const keyType = useMemo(() => {
      const keyInfo = keyRingStore.keyInfos.find(
        (keyInfo) => keyInfo.id === vaultId
      );
      if (!keyInfo) {
        throw new Error("KeyInfo not found");
      }

      return keyInfo.type;
    }, [keyRingStore.keyInfos, vaultId]);

    const [candidateAddresses, setCandidateAddresses] = useState<
      {
        chainId: string;
        bech32Addresses: {
          coinType: number;
          address: string;
        }[];
      }[]
    >(propCandiateAddresses ?? []);
    useEffectOnce(() => {
      if (candidateAddresses.length === 0) {
        (async () => {
          // TODO: 이거 뭔가 finalize-key scene이랑 공통 hook 쓸 수 잇게 하던가 함수를 공유해야할 듯...?
          const candidateAddresses: {
            chainId: string;
            bech32Addresses: {
              coinType: number;
              address: string;
            }[];
          }[] = [];

          const promises: Promise<unknown>[] = [];
          for (const modularChainInfo of chainStore.modularChainInfos) {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = chainStore.getChain(
                modularChainInfo.cosmos.chainId
              );
              if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
                promises.push(
                  (async () => {
                    const res =
                      await keyRingStore.computeNotFinalizedKeyAddresses(
                        vaultId,
                        chainInfo.chainId
                      );

                    candidateAddresses.push({
                      chainId: chainInfo.chainId,
                      bech32Addresses: res.map((res) => {
                        return {
                          coinType: res.coinType,
                          address: res.bech32Address,
                        };
                      }),
                    });
                  })()
                );
              } else {
                const account = accountStore.getAccount(chainInfo.chainId);
                promises.push(
                  (async () => {
                    if (account.walletStatus !== WalletStatus.Loaded) {
                      await account.init();
                    }

                    if (account.bech32Address) {
                      candidateAddresses.push({
                        chainId: chainInfo.chainId,
                        bech32Addresses: [
                          {
                            coinType: chainInfo.bip44.coinType,
                            address: account.bech32Address,
                          },
                        ],
                      });
                    }
                  })()
                );
              }
            } else if ("starknet" in modularChainInfo) {
              const account = accountStore.getAccount(
                modularChainInfo.starknet.chainId
              );
              promises.push(
                (async () => {
                  if (account.walletStatus !== WalletStatus.Loaded) {
                    await account.init();
                  }
                })()
              );
            }
          }

          await Promise.allSettled(promises);

          setCandidateAddresses(candidateAddresses);
        })();
      }
    });
    const candidateAddressesMap = useMemo(() => {
      const map: Map<
        string,
        {
          coinType: number;
          address: string;
        }[]
      > = new Map();
      for (const candidateAddress of candidateAddresses) {
        map.set(
          ChainIdHelper.parse(candidateAddress.chainId).identifier,
          candidateAddress.bech32Addresses
        );
      }
      return map;
    }, [candidateAddresses]);

    // Select derivation scene으로 이동한 후에는 coin type을 여기서 자동으로 finalize 하지 않도록 보장한다.
    const sceneMovedToSelectDerivation = useRef(false);

    // Handle coin type selection.
    useEffect(() => {
      if (!isFresh && candidateAddresses.length > 0) {
        for (const candidateAddress of candidateAddresses) {
          const queries = queriesStore.get(candidateAddress.chainId);
          const chainInfo = chainStore.getChain(candidateAddress.chainId);

          if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
            if (candidateAddress.bech32Addresses.length === 1) {
              // finalize-key scene을 통하지 않고도 이 scene으로 들어올 수 있는 경우가 있기 때문에...
              keyRingStore.finalizeKeyCoinType(
                vaultId,
                candidateAddress.chainId,
                candidateAddress.bech32Addresses[0].coinType
              );
            }

            if (candidateAddress.bech32Addresses.length >= 2) {
              (async () => {
                const promises: Promise<unknown>[] = [];

                for (const bech32Address of candidateAddress.bech32Addresses) {
                  const queryAccount =
                    queries.cosmos.queryAccount.getQueryBech32Address(
                      bech32Address.address
                    );

                  promises.push(queryAccount.waitResponse());
                }

                await Promise.allSettled(promises);

                const mainAddress = candidateAddress.bech32Addresses.find(
                  (a) => a.coinType === chainInfo.bip44.coinType
                );
                const otherAddresses = candidateAddress.bech32Addresses.filter(
                  (a) => a.coinType !== chainInfo.bip44.coinType
                );

                let otherIsSelectable = false;
                if (mainAddress && otherAddresses.length > 0) {
                  for (const otherAddress of otherAddresses) {
                    const bech32Address = otherAddress.address;
                    const queryAccount =
                      queries.cosmos.queryAccount.getQueryBech32Address(
                        bech32Address
                      );

                    // Check that the account exist on chain.
                    // With stargate implementation, querying account fails with 404 status if account not exists.
                    // But, if account receives some native tokens, the account would be created and it may deserve to be chosen.
                    if (
                      queryAccount.response?.data &&
                      queryAccount.error == null
                    ) {
                      otherIsSelectable = true;
                      break;
                    }
                  }
                }

                if (
                  !otherIsSelectable &&
                  mainAddress &&
                  !sceneMovedToSelectDerivation.current
                ) {
                  console.log(
                    "Finalize key coin type",
                    vaultId,
                    chainInfo.chainId,
                    mainAddress.coinType
                  );
                  keyRingStore.finalizeKeyCoinType(
                    vaultId,
                    chainInfo.chainId,
                    mainAddress.coinType
                  );
                }
              })();
            }
          }
        }
      }
    }, [
      isFresh,
      candidateAddresses,
      vaultId,
      chainStore,
      queriesStore,
      keyRingStore,
    ]);

    const sceneTransition = useSceneTransition();
    const [isCollapsedNativeChainView, setIsCollapsedNativeChainView] =
      useState(false);

    const [nonNativeChainListForSuggest, setNonNativeChainListForSuggest] =
      useState<(ChainInfo | ModularChainInfo)[]>([]);

    const [enabledChainIdentifiers, setEnabledChainIdentifiers] = useState(
      () => {
        // We assume that the chain store can be already initialized.
        // candidateAddresses가 prop으로 제공되지 않으면 얘는 무조건 초기값을 가진다.
        // useState의 initial state 기능을 사용해서 이를 보장한다는 점을 참고...
        const enabledChainIdentifiers: string[] =
          chainStore.enabledChainIdentifiers;

        // 모든 처리 이후에 모든 체인을 enable한다.
        // 실제 로직은 계정이 만들어질때 최초에 자동으로 enable할 체인을 찾지 못할때
        // (기존에 자산을 가진 계정을 찾을 수 없을때)
        // 모든 체인을 eanble한다.
        let enableAllChains = false;
        // noble과 ethereum도 default로 활성화되어야 한다.
        // 근데 enable-chains가 처음 register일때가 아니라
        // manage chain visibility로부터 왔을수도 있다
        // 이 경우 candidateAddresses의 length는 로직상 0일 수밖에 없기 때문에
        // 이를 통해서 상황을 구분한다.
        if (
          candidateAddresses.length > 0 &&
          enabledChainIdentifiers.length === 1 &&
          enabledChainIdentifiers[0] ===
            chainStore.chainInfos[0].chainIdentifier
        ) {
          enableAllChains = true;
        }

        // 스타크넷 관련 체인들은 `candidateAddresses`에 추가되지 않으므로 여기서 enable 할지 판단한다.
        for (const modularChainInfo of chainStore.modularChainInfosInListUI) {
          if ("starknet" in modularChainInfo) {
            const account = accountStore.getAccount(modularChainInfo.chainId);
            const mainCurrency = modularChainInfo.starknet.currencies[0];

            const queryBalance = starknetQueriesStore
              .get(modularChainInfo.chainId)
              .queryStarknetERC20Balance.getBalance(
                modularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                mainCurrency.coinMinimalDenom
              );

            if (queryBalance && queryBalance.balance.toDec().gt(new Dec(0))) {
              enableAllChains = false;
              enabledChainIdentifiers.push(
                ChainIdHelper.parse(modularChainInfo.chainId).identifier
              );
            }
          }
        }

        for (const candidateAddress of candidateAddresses) {
          const queries = queriesStore.get(candidateAddress.chainId);
          const chainInfo = chainStore.getChain(candidateAddress.chainId);
          const mainCurrency =
            chainInfo.stakeCurrency || chainInfo.currencies[0];
          const account = accountStore.getAccount(chainInfo.chainId);

          // hideInUI인 chain은 UI 상에서 enable이 되지 않아야한다.
          // 정말 만약의 수로 왜인지 그 체인에 유저가 자산등을 가지고 있을수도 있으니
          // 여기서도 막아야한다
          if (!chainStore.isInChainInfosInListUI(chainInfo.chainId)) {
            continue;
          }

          // If the chain is already enabled, skip.
          if (chainStore.isEnabledChain(candidateAddress.chainId)) {
            continue;
          }

          // If the chain is not enabled, check that the account exists.
          // If the account exists, turn on the chain.
          for (const bech32Address of candidateAddress.bech32Addresses) {
            // Check that the account has some assets or delegations.
            // If so, enable it by default
            const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainInfo.chainId);
            const queryBalance = isEVMOnlyChain
              ? queries.queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                )
              : queries.queryBalances.getQueryBech32Address(
                  account.bech32Address
                );
            const balance = queryBalance.getBalance(mainCurrency);

            if (balance?.response?.data) {
              // A bit tricky. The stake coin is currently only native, and in this case,
              // we can check whether the asset exists or not by checking the response.
              const data = balance.response.data as any;
              if (
                data.balances &&
                Array.isArray(data.balances) &&
                data.balances.length > 0 &&
                // nomic은 지들이 대충 구현한 가짜 rest를 쓰는데...
                // 얘네들이 구현한게 cosmos-sdk의 실제 동작과 약간 차이가 있음
                // cosmos-sdk에서는 balacne가 0인거는 response에 포함되지 않지만
                // nomic은 대충 만들어서 balance가 0인거도 response에 포함됨
                // 그래서 밑의 줄이 없으면 nomic이 무조건 enable된채로 시작되기 때문에
                // 이 문제를 해결하기 위해서 로직을 추가함
                data.balances.find((bal: any) => {
                  return (
                    bal.amount &&
                    typeof bal.amount === "string" &&
                    bal.amount !== "0"
                  );
                })
              ) {
                enableAllChains = false;
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }

              if (isEVMOnlyChain && balance.balance.toDec().gt(new Dec(0))) {
                enableAllChains = false;
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }
            }

            if (!isEVMOnlyChain) {
              const queryDelegations =
                queries.cosmos.queryDelegations.getQueryBech32Address(
                  bech32Address.address
                );
              if (queryDelegations.delegationBalances.length > 0) {
                enableAllChains = false;
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }
            }
          }
        }

        if (enableAllChains) {
          // enableAllChains일때는 native chain만 활성화한다.
          return EmbedChainInfos.map(
            (chainInfo) => ChainIdHelper.parse(chainInfo.chainId).identifier
          );
        }

        return [...new Set(enabledChainIdentifiers)];
      }
    );

    const enabledNativeChainIdentifiers = enabledChainIdentifiers.filter(
      (chainIdentifier) => nativeChainIdentifierSet.has(chainIdentifier)
    );
    const enabledSuggestChainIdentifiers = enabledChainIdentifiers.filter(
      (chainIdentifier) => !nativeChainIdentifierSet.has(chainIdentifier)
    );

    const enabledChainIdentifierMap = useMemo(() => {
      const map = new Map<string, boolean>();

      for (const enabledChainIdentifier of enabledChainIdentifiers) {
        map.set(enabledChainIdentifier, true);
      }

      return map;
    }, [enabledChainIdentifiers]);

    // 기본적으로 최초로 활성화되어있던 체인의 경우 sort에서 우선권을 가진다.
    const [sortPriorityChainIdentifierMap] = useState(
      enabledChainIdentifierMap
    );

    const [search, setSearch] = useState<string>(initialSearchValue ?? "");

    // 검색 뿐만 아니라 로직에 따른 선택할 수 있는 체인 목록을 가지고 있다.
    // 그러니까 로직을 파악해서 주의해서 사용해야함.
    // 그리고 이를 토대로 balance에 따른 sort를 진행한다.
    // queries store의 구조 문제로 useMemo 안에서 balance에 따른 sort를 진행하긴 힘들다.
    // 그래서 이를 위한 변수로 따로 둔다.
    // 실제로는 modularChainInfos를 사용하면 된다.
    const preSortModularChainInfos = useMemo(() => {
      let modularChainInfos = chainStore.modularChainInfosInListUI.slice();

      if (keyType === "ledger") {
        modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
          if ("cosmos" in modularChainInfo) {
            const chainInfo = chainStore.getChain(
              modularChainInfo.cosmos.chainId
            );
            const isEthermintLike =
              chainInfo.bip44.coinType === 60 ||
              !!chainInfo.features?.includes("eth-address-gen") ||
              !!chainInfo.features?.includes("eth-key-sign");

            // Ledger일 경우 ethereum app을 바로 처리할 수 없다.
            // 이 경우 빼줘야한다.
            if (isEthermintLike && !fallbackEthereumLedgerApp) {
              return false;
            }

            // fallbackEthereumLedgerApp가 true이면 ethereum app이 필요없는 체인은 이전에 다 처리된 것이다.
            // 이게 true이면 ethereum app이 필요하고 가능한 체인만 남기면 된다.
            if (fallbackEthereumLedgerApp) {
              if (!isEthermintLike) {
                return false;
              }

              try {
                // 처리가능한 체인만 true를 반환한다.
                KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                  chainInfo.chainId
                );
                return true;
              } catch {
                return false;
              }
            }
            // fallbackStarknetLedgerApp가 true이면 Starknet app이 필요없는 체인은 이전에 다 처리된 것이다.
            // 그러므로 Starknet만 남기도록 한다.
            if (fallbackStarknetLedgerApp) {
              return false;
            }

            return true;
          } else if ("starknet" in modularChainInfo) {
            return fallbackStarknetLedgerApp;
          } else {
            return false;
          }
        });
      }

      if (keyType === "keystone") {
        modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
          // keystone은 스타크넷을 지원하지 않는다.
          if ("starknet" in modularChainInfo) {
            return false;
          }
          return true;
        });
      }

      const trimSearch = search.trim().toLowerCase();
      if (!trimSearch) {
        return modularChainInfos;
      } else {
        return modularChainInfos.filter((modularChainInfo) => {
          if (modularChainInfo.chainName.toLowerCase().includes(trimSearch)) {
            return true;
          }

          if ("cosmos" in modularChainInfo) {
            const chainInfo = chainStore.getChain(
              modularChainInfo.cosmos.chainId
            );
            return (
              chainInfo.stakeCurrency || chainInfo.currencies[0]
            ).coinDenom.includes(trimSearch);
          } else if ("starknet" in modularChainInfo) {
            return modularChainInfo.starknet.currencies[0].coinDenom.includes(
              trimSearch
            );
          }
        });
      }
    }, [
      chainStore,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      keyType,
      search,
    ]);

    const chainSort = useCallback(
      (
        aModularChainInfo: ModularChainInfo,
        bModularChainInfo: ModularChainInfo
      ) => {
        const aChainIdentifier = ChainIdHelper.parse(
          aModularChainInfo.chainId
        ).identifier;
        const bChainIdentifier = ChainIdHelper.parse(
          bModularChainInfo.chainId
        ).identifier;

        // Cosmos Hub를 먼저 배치
        if (
          aChainIdentifier.startsWith("cosmoshub") &&
          !bChainIdentifier.startsWith("cosmoshub")
        ) {
          return -1;
        }

        if (
          !aChainIdentifier.startsWith("cosmoshub") &&
          bChainIdentifier.startsWith("cosmoshub")
        ) {
          return 1;
        }

        // Ethereum을 두 번째로 배치
        const isNotCosmosHub =
          !aChainIdentifier.startsWith("cosmoshub") &&
          !bChainIdentifier.startsWith("cosmoshub");
        if (isNotCosmosHub) {
          if (
            aChainIdentifier === "eip155:1" &&
            !bChainIdentifier.startsWith("eip155:1")
          ) {
            return -1;
          }

          if (
            !aChainIdentifier.startsWith("eip155:1") &&
            bChainIdentifier === "eip155:1"
          ) {
            return 1;
          }
        }

        const aHasPriority =
          sortPriorityChainIdentifierMap.has(aChainIdentifier);
        const bHasPriority =
          sortPriorityChainIdentifierMap.has(bChainIdentifier);

        if (aHasPriority && !bHasPriority) {
          return -1;
        }

        if (!aHasPriority && bHasPriority) {
          return 1;
        }

        const aBalance = (() => {
          if ("cosmos" in aModularChainInfo) {
            const addresses = candidateAddressesMap.get(aChainIdentifier);
            const chainInfo = chainStore.getChain(aModularChainInfo.chainId);
            const queries = queriesStore.get(aModularChainInfo.chainId);

            const mainCurrency =
              chainInfo.stakeCurrency || chainInfo.currencies[0];
            const account = accountStore.getAccount(chainInfo.chainId);

            if (addresses && addresses.length > 0) {
              const queryBalance = chainStore.isEvmOnlyChain(chainInfo.chainId)
                ? queries.queryBalances.getQueryEthereumHexAddress(
                    account.ethereumHexAddress
                  )
                : queries.queryBalances.getQueryBech32Address(
                    addresses[0].address
                  );
              const balance = queryBalance.getBalance(mainCurrency)?.balance;

              if (balance) {
                return balance;
              }
            }

            return new CoinPretty(mainCurrency, "0");
          } else if ("starknet" in aModularChainInfo) {
            const account = accountStore.getAccount(aModularChainInfo.chainId);
            const mainCurrency = aModularChainInfo.starknet.currencies[0];

            const queryBalance = starknetQueriesStore
              .get(aModularChainInfo.chainId)
              .queryStarknetERC20Balance.getBalance(
                aModularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                mainCurrency.coinMinimalDenom
              );

            if (queryBalance) {
              return queryBalance.balance;
            }
          }
        })();
        const bBalance = (() => {
          if ("cosmos" in bModularChainInfo) {
            const addresses = candidateAddressesMap.get(bChainIdentifier);
            const chainInfo = chainStore.getChain(bModularChainInfo.chainId);
            const queries = queriesStore.get(bModularChainInfo.chainId);

            const mainCurrency =
              chainInfo.stakeCurrency || chainInfo.currencies[0];
            const account = accountStore.getAccount(chainInfo.chainId);

            if (addresses && addresses.length > 0) {
              const queryBalance = chainStore.isEvmOnlyChain(chainInfo.chainId)
                ? queries.queryBalances.getQueryEthereumHexAddress(
                    account.ethereumHexAddress
                  )
                : queries.queryBalances.getQueryBech32Address(
                    addresses[0].address
                  );
              const balance = queryBalance.getBalance(mainCurrency)?.balance;

              if (balance) {
                return balance;
              }
            }

            return new CoinPretty(mainCurrency, "0");
          } else if ("starknet" in bModularChainInfo) {
            const account = accountStore.getAccount(bModularChainInfo.chainId);
            const mainCurrency = bModularChainInfo.starknet.currencies[0];

            const balance = starknetQueriesStore
              .get(bModularChainInfo.chainId)
              .queryStarknetERC20Balance.getBalance(
                bModularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                mainCurrency.coinMinimalDenom
              )?.balance;

            if (balance) {
              return balance;
            }
          }
        })();

        const aPrice = aBalance
          ? priceStore.calculatePrice(aBalance)?.toDec() ?? new Dec(0)
          : new Dec(0);
        const bPrice = bBalance
          ? priceStore.calculatePrice(bBalance)?.toDec() ?? new Dec(0)
          : new Dec(0);

        if (!aPrice.equals(bPrice)) {
          return aPrice.gt(bPrice) ? -1 : 1;
        }

        // balance의 fiat 기준으로 sort.
        // 같으면 이름 기준으로 sort.
        return aModularChainInfo.chainName.localeCompare(
          bModularChainInfo.chainName
        );
      },
      [
        sortPriorityChainIdentifierMap,
        candidateAddressesMap,
        chainStore,
        queriesStore,
        accountStore,
        starknetQueriesStore,
        priceStore,
      ]
    );

    const nativeModularChainInfos = preSortModularChainInfos
      .filter((modularChainInfo) =>
        nativeChainIdentifierSet.has(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier
        )
      )
      .sort(chainSort);

    const suggestModularChainInfos = preSortModularChainInfos
      .filter(
        (modularChainInfo) =>
          !nativeChainIdentifierSet.has(
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          )
      )
      .sort(chainSort);

    const { chains: searchedNonNativeChainInfos, infiniteScrollTriggerRef } =
      useGetAllNonNativeChain({
        search,
        fallbackEthereumLedgerApp,
        fallbackStarknetLedgerApp,
        keyType,
      });

    const numSelected = useMemo(() => {
      const modularChainInfoMap = new Map<string, ModularChainInfo>();
      for (const modularChainInfo of chainStore.modularChainInfos) {
        modularChainInfoMap.set(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier,
          modularChainInfo
        );
      }

      let numSelected = 0;
      for (const enabledChainIdentifier of enabledChainIdentifiers) {
        const enabledModularChainInfo = modularChainInfoMap.get(
          enabledChainIdentifier
        );
        if (enabledModularChainInfo) {
          if (keyType === "ledger") {
            const isEthereumAppNeed =
              "cosmos" in enabledModularChainInfo &&
              (enabledModularChainInfo.cosmos.bip44.coinType === 60 ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-address-gen"
                ) ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-key-sign"
                ));

            if (fallbackStarknetLedgerApp) {
              if ("starknet" in enabledModularChainInfo) {
                numSelected++;
              }
            } else if (fallbackEthereumLedgerApp) {
              if (isEthereumAppNeed) {
                numSelected++;
              }
            } else {
              if (!isEthereumAppNeed) {
                numSelected++;
              }
            }
          } else {
            numSelected++;
          }
        }
      }
      return numSelected;
    }, [
      chainStore.modularChainInfos,
      enabledChainIdentifiers,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      keyType,
    ]);

    const replaceToWelcomePage = () => {
      if (skipWelcome) {
        window.close();
      } else {
        navigate("/welcome", {
          replace: true,
        });
      }
    };

    const enabledNativeChainIdentifiersInPage = useMemo(() => {
      return enabledChainIdentifiers.filter(
        (chainIdentifier) =>
          nativeModularChainInfos.some(
            (modularChainInfo) =>
              chainIdentifier ===
              ChainIdHelper.parse(modularChainInfo.chainId).identifier
          ) && nativeChainIdentifierSet.has(chainIdentifier)
      );
    }, [
      nativeChainIdentifierSet,
      enabledChainIdentifiers,
      nativeModularChainInfos,
    ]);

    const [
      preSelectedNativeChainIdentifiers,
      setPreSelectedNativeChainIdentifiers,
    ] = useState<string[]>([]);

    const getChainItemInfoForView = useCallback(
      (modularChainInfo: ModularChainInfo) => {
        const account = accountStore.getAccount(modularChainInfo.chainId);
        const tokens =
          tokensByChainIdentifier.get(
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          ) ?? [];

        const balance = (() => {
          if ("cosmos" in modularChainInfo) {
            const chainInfo = chainStore.getChain(
              modularChainInfo.cosmos.chainId
            );
            const queries = queriesStore.get(modularChainInfo.chainId);
            const mainCurrency =
              chainInfo.stakeCurrency || chainInfo.currencies[0];

            const queryBalance = chainStore.isEvmOnlyChain(chainInfo.chainId)
              ? queries.queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                )
              : queries.queryBalances.getQueryBech32Address(
                  account.bech32Address
                );
            const balance = queryBalance.getBalance(mainCurrency);

            if (balance) {
              return balance.balance;
            }

            return new CoinPretty(mainCurrency, "0");
          } else if ("starknet" in modularChainInfo) {
            const mainCurrency = modularChainInfo.starknet.currencies[0];
            const queryBalance = starknetQueriesStore
              .get(modularChainInfo.chainId)
              .queryStarknetERC20Balance.getBalance(
                modularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                mainCurrency.coinMinimalDenom
              );

            if (queryBalance) {
              return queryBalance.balance;
            }

            return new CoinPretty(mainCurrency, "0");
          }
        })();
        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId
        ).identifier;

        const enabled = enabledChainIdentifierMap.get(chainIdentifier) || false;

        // At least, one chain should be enabled.
        const blockInteraction = enabledChainIdentifiers.length <= 1 && enabled;

        return {
          balance,
          enabled,
          blockInteraction,
          tokens,
          chainIdentifier,
        };
      },
      [
        accountStore,
        chainStore,
        enabledChainIdentifiers,
        enabledChainIdentifierMap,
        queriesStore,
        starknetQueriesStore,
        tokensByChainIdentifier,
      ]
    );

    const titleChainImage = (() => {
      if (keyType === "ledger") {
        if (fallbackEthereumLedgerApp) {
          return (
            <ChainImageFallback
              chainInfo={chainStore.getChain("eip155:1")}
              size="3rem"
            />
          );
        }

        if (fallbackStarknetLedgerApp) {
          return (
            <ChainImageFallback
              chainInfo={chainStore.getModularChain("starknet:SN_MAIN")}
              size="3rem"
            />
          );
        }
      }

      return (
        <div
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "1000000px",
            backgroundColor: ColorPalette["gray-700"],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
          >
            <g clipPath="url(#clip0_16221_98764)">
              <path
                d="M14 17.5C13.3078 17.5 12.6311 17.2947 12.0555 16.9101C11.4799 16.5256 11.0313 15.9789 10.7664 15.3394C10.5015 14.6999 10.4322 13.9961 10.5673 13.3172C10.7023 12.6383 11.0356 12.0146 11.5251 11.5251C12.0146 11.0356 12.6383 10.7023 13.3172 10.5673C13.9961 10.4322 14.6999 10.5015 15.3394 10.7664C15.9789 11.0313 16.5256 11.4799 16.9101 12.0555C17.2947 12.6311 17.5 13.3078 17.5 14C17.4988 14.9279 17.1297 15.8175 16.4736 16.4736C15.8175 17.1297 14.9279 17.4988 14 17.5ZM14 12.25C13.6539 12.25 13.3155 12.3526 13.0278 12.5449C12.74 12.7372 12.5157 13.0105 12.3832 13.3303C12.2508 13.6501 12.2161 14.0019 12.2836 14.3414C12.3512 14.6809 12.5178 14.9927 12.7626 15.2374C13.0073 15.4822 13.3191 15.6489 13.6586 15.7164C13.9981 15.7839 14.3499 15.7492 14.6697 15.6168C14.9895 15.4843 15.2628 15.26 15.4551 14.9722C15.6474 14.6845 15.75 14.3461 15.75 14C15.75 13.5359 15.5656 13.0908 15.2374 12.7626C14.9092 12.4344 14.4641 12.25 14 12.25ZM4.375 17.5C3.68277 17.5 3.00608 17.2947 2.43051 16.9101C1.85493 16.5256 1.40633 15.9789 1.14142 15.3394C0.876516 14.6999 0.807205 13.9961 0.942253 13.3172C1.0773 12.6383 1.41064 12.0146 1.90013 11.5251C2.38961 11.0356 3.01325 10.7023 3.69219 10.5673C4.37112 10.4322 5.07485 10.5015 5.71439 10.7664C6.35393 11.0313 6.90056 11.4799 7.28514 12.0555C7.66973 12.6311 7.875 13.3078 7.875 14C7.87384 14.9279 7.50472 15.8175 6.8486 16.4736C6.19247 17.1297 5.3029 17.4988 4.375 17.5ZM4.375 12.25C4.02888 12.25 3.69054 12.3526 3.40275 12.5449C3.11497 12.7372 2.89067 13.0105 2.75821 13.3303C2.62576 13.6501 2.5911 14.0019 2.65863 14.3414C2.72615 14.6809 2.89282 14.9927 3.13756 15.2374C3.38231 15.4822 3.69413 15.6489 4.03359 15.7164C4.37306 15.7839 4.72493 15.7492 5.0447 15.6168C5.36447 15.4843 5.63778 15.26 5.83007 14.9722C6.02237 14.6845 6.125 14.3461 6.125 14C6.125 13.5359 5.94063 13.0908 5.61244 12.7626C5.28425 12.4344 4.83913 12.25 4.375 12.25ZM8.75 27.125C8.05777 27.125 7.38108 26.9197 6.80551 26.5351C6.22993 26.1506 5.78133 25.6039 5.51642 24.9644C5.25152 24.3249 5.18221 23.6211 5.31725 22.9422C5.4523 22.2633 5.78564 21.6396 6.27513 21.1501C6.76461 20.6606 7.38825 20.3273 8.06719 20.1923C8.74612 20.0572 9.44985 20.1265 10.0894 20.3914C10.7289 20.6563 11.2756 21.1049 11.6601 21.6805C12.0447 22.2561 12.25 22.9328 12.25 23.625C12.2488 24.5529 11.8797 25.4425 11.2236 26.0986C10.5675 26.7547 9.6779 27.1238 8.75 27.125ZM8.75 21.875C8.40388 21.875 8.06554 21.9776 7.77775 22.1699C7.48997 22.3622 7.26567 22.6355 7.13321 22.9553C7.00076 23.2751 6.9661 23.6269 7.03363 23.9664C7.10115 24.3059 7.26782 24.6177 7.51257 24.8624C7.75731 25.1072 8.06913 25.2739 8.40859 25.3414C8.74806 25.4089 9.09993 25.3742 9.4197 25.2418C9.73947 25.1093 10.0128 24.885 10.2051 24.5972C10.3974 24.3095 10.5 23.9711 10.5 23.625C10.5 23.1609 10.3156 22.7158 9.98744 22.3876C9.65925 22.0594 9.21413 21.875 8.75 21.875ZM19.25 27.125C18.5578 27.125 17.8811 26.9197 17.3055 26.5351C16.7299 26.1506 16.2813 25.6039 16.0164 24.9644C15.7515 24.3249 15.6822 23.6211 15.8173 22.9422C15.9523 22.2633 16.2856 21.6396 16.7751 21.1501C17.2646 20.6606 17.8883 20.3273 18.5672 20.1923C19.2461 20.0572 19.9499 20.1265 20.5894 20.3914C21.2289 20.6563 21.7756 21.1049 22.1601 21.6805C22.5447 22.2561 22.75 22.9328 22.75 23.625C22.7488 24.5529 22.3797 25.4425 21.7236 26.0986C21.0675 26.7547 20.1779 27.1238 19.25 27.125ZM19.25 21.875C18.9039 21.875 18.5655 21.9776 18.2778 22.1699C17.99 22.3622 17.7657 22.6355 17.6332 22.9553C17.5008 23.2751 17.4661 23.6269 17.5336 23.9664C17.6012 24.3059 17.7678 24.6177 18.0126 24.8624C18.2573 25.1072 18.5691 25.2739 18.9086 25.3414C19.2481 25.4089 19.5999 25.3742 19.9197 25.2418C20.2395 25.1093 20.5128 24.885 20.7051 24.5972C20.8974 24.3095 21 23.9711 21 23.625C21 23.1609 20.8156 22.7158 20.4874 22.3876C20.1593 22.0594 19.7141 21.875 19.25 21.875ZM23.625 17.5C22.9328 17.5 22.2561 17.2947 21.6805 16.9101C21.1049 16.5256 20.6563 15.9789 20.3914 15.3394C20.1265 14.6999 20.0572 13.9961 20.1923 13.3172C20.3273 12.6383 20.6606 12.0146 21.1501 11.5251C21.6396 11.0356 22.2633 10.7023 22.9422 10.5673C23.6211 10.4322 24.3249 10.5015 24.9644 10.7664C25.6039 11.0313 26.1506 11.4799 26.5351 12.0555C26.9197 12.6311 27.125 13.3078 27.125 14C27.1238 14.9279 26.7547 15.8175 26.0986 16.4736C25.4425 17.1297 24.5529 17.4988 23.625 17.5ZM23.625 12.25C23.2789 12.25 22.9405 12.3526 22.6528 12.5449C22.365 12.7372 22.1407 13.0105 22.0082 13.3303C21.8758 13.6501 21.8411 14.0019 21.9086 14.3414C21.9762 14.6809 22.1428 14.9927 22.3876 15.2374C22.6323 15.4822 22.9441 15.6489 23.2836 15.7164C23.6231 15.7839 23.9749 15.7492 24.2947 15.6168C24.6145 15.4843 24.8878 15.26 25.0801 14.9722C25.2724 14.6845 25.375 14.3461 25.375 14C25.375 13.5359 25.1906 13.0908 24.8624 12.7626C24.5343 12.4344 24.0891 12.25 23.625 12.25ZM19.25 7.875C18.5578 7.875 17.8811 7.66973 17.3055 7.28514C16.7299 6.90056 16.2813 6.35393 16.0164 5.71439C15.7515 5.07485 15.6822 4.37112 15.8173 3.69219C15.9523 3.01325 16.2856 2.38961 16.7751 1.90013C17.2646 1.41064 17.8883 1.0773 18.5672 0.942253C19.2461 0.807205 19.9499 0.876516 20.5894 1.14142C21.2289 1.40633 21.7756 1.85493 22.1601 2.43051C22.5447 3.00608 22.75 3.68277 22.75 4.375C22.7488 5.3029 22.3797 6.19247 21.7236 6.8486C21.0675 7.50472 20.1779 7.87384 19.25 7.875ZM19.25 2.625C18.9039 2.625 18.5655 2.72764 18.2778 2.91993C17.99 3.11222 17.7657 3.38553 17.6332 3.70531C17.5008 4.02508 17.4661 4.37694 17.5336 4.71641C17.6012 5.05588 17.7678 5.3677 18.0126 5.61244C18.2573 5.85718 18.5691 6.02385 18.9086 6.09138C19.2481 6.1589 19.5999 6.12424 19.9197 5.99179C20.2395 5.85934 20.5128 5.63504 20.7051 5.34725C20.8974 5.05946 21 4.72112 21 4.375C21 3.91087 20.8156 3.46575 20.4874 3.13756C20.1593 2.80938 19.7141 2.625 19.25 2.625ZM8.75 7.875C8.05777 7.875 7.38108 7.66973 6.80551 7.28514C6.22993 6.90056 5.78133 6.35393 5.51642 5.71439C5.25152 5.07485 5.18221 4.37112 5.31725 3.69219C5.4523 3.01325 5.78564 2.38961 6.27513 1.90013C6.76461 1.41064 7.38825 1.0773 8.06719 0.942253C8.74612 0.807205 9.44985 0.876516 10.0894 1.14142C10.7289 1.40633 11.2756 1.85493 11.6601 2.43051C12.0447 3.00608 12.25 3.68277 12.25 4.375C12.2488 5.3029 11.8797 6.19247 11.2236 6.8486C10.5675 7.50472 9.6779 7.87384 8.75 7.875ZM8.75 2.625C8.40388 2.625 8.06554 2.72764 7.77775 2.91993C7.48997 3.11222 7.26567 3.38553 7.13321 3.70531C7.00076 4.02508 6.9661 4.37694 7.03363 4.71641C7.10115 5.05588 7.26782 5.3677 7.51257 5.61244C7.75731 5.85718 8.06913 6.02385 8.40859 6.09138C8.74806 6.1589 9.09993 6.12424 9.4197 5.99179C9.73947 5.85934 10.0128 5.63504 10.2051 5.34725C10.3974 5.05946 10.5 4.72112 10.5 4.375C10.5 3.91087 10.3156 3.46575 9.98744 3.13756C9.65925 2.80938 9.21413 2.625 8.75 2.625Z"
                fill="url(#paint0_linear_16221_98764)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_16221_98764"
                x1="14"
                y1="0.875"
                x2="14"
                y2="27.125"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8D7CFF" />
                <stop offset="1" stopColor="#2759F2" />
              </linearGradient>
              <clipPath id="clip0_16221_98764">
                <rect width="28" height="28" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      );
    })();

    const nativeChainViewTitle = (() => {
      if (keyType === "ledger") {
        if (fallbackEthereumLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-evm-title",
          });
        }

        if (fallbackStarknetLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-starknet-title",
          });
        }

        return intl.formatMessage({
          id: "pages.register.enable-chains.native-chain-view.ledger-cosmos-title",
        });
      }

      return intl.formatMessage({
        id: "pages.register.enable-chains.native-chain-view.title",
      });
    })();
    const nativeChainViewParagraph = (() => {
      if (keyType === "ledger") {
        if (fallbackEthereumLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-evm-paragraph",
          });
        }

        if (fallbackStarknetLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-starknet-paragraph",
          });
        }

        return intl.formatMessage({
          id: "pages.register.enable-chains.native-chain-view.paragraph",
        });
      }

      return intl.formatMessage({
        id: "pages.register.enable-chains.native-chain-view.paragraph",
      });
    })();

    return (
      <RegisterSceneBox>
        <SearchTextInput
          ref={searchRef}
          placeholder={intl.formatMessage({
            id: "pages.register.enable-chains.search-input-placeholder",
          })}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
        />
        <Gutter size="0.75rem" />
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette.white
          }
          style={{
            textAlign: "center",
          }}
        >
          <FormattedMessage
            id="pages.register.enable-chains.chain-selected-count"
            values={{ numSelected }}
          />
        </Subtitle3>
        <Gutter size="0.75rem" />
        <SimpleBar
          style={{
            display: "flex",
            flexDirection: "column",
            height: "25.5rem",
            overflowY: "auto",
          }}
        >
          <Stack gutter="0.5rem">
            <NativeChainSection
              title={nativeChainViewTitle}
              titleChainImage={titleChainImage}
              paragraph={nativeChainViewParagraph}
              showTitleBox={search.trim().length < 1}
              isCollapsed={isCollapsedNativeChainView}
              isSelectAll={
                nativeModularChainInfos.length ===
                enabledNativeChainIdentifiersInPage.length
              }
              onClick={() => {
                if (
                  nativeModularChainInfos.length ===
                  enabledNativeChainIdentifiersInPage.length
                ) {
                  if (preSelectedNativeChainIdentifiers.length > 0) {
                    setEnabledChainIdentifiers([
                      ...enabledSuggestChainIdentifiers,
                      ...preSelectedNativeChainIdentifiers,
                    ]);
                  } else {
                    if (nativeModularChainInfos.length > 0) {
                      setEnabledChainIdentifiers([
                        ChainIdHelper.parse(nativeModularChainInfos[0].chainId)
                          .identifier,
                        ...enabledSuggestChainIdentifiers,
                      ]);
                    }
                  }
                } else {
                  setPreSelectedNativeChainIdentifiers([
                    ...enabledNativeChainIdentifiers,
                  ]);

                  const newEnabledNativeChainIdentifiers: string[] =
                    enabledNativeChainIdentifiers.slice();

                  for (const modularChainInfo of nativeModularChainInfos) {
                    const chainIdentifier = ChainIdHelper.parse(
                      modularChainInfo.chainId
                    ).identifier;

                    if (
                      !enabledNativeChainIdentifiers.includes(chainIdentifier)
                    ) {
                      newEnabledNativeChainIdentifiers.push(chainIdentifier);
                    }
                  }
                  setEnabledChainIdentifiers([
                    ...enabledSuggestChainIdentifiers,
                    ...newEnabledNativeChainIdentifiers,
                  ]);
                }
              }}
              enabledNativeChainIdentifierList={
                enabledNativeChainIdentifiersInPage
              }
              onClickCollapse={() => {
                setIsCollapsedNativeChainView(!isCollapsedNativeChainView);
              }}
            >
              {nativeModularChainInfos.map((modularChainInfo) => {
                const {
                  balance,
                  enabled,
                  blockInteraction,
                  tokens,
                  chainIdentifier,
                } = getChainItemInfoForView(modularChainInfo);

                return (
                  <ChainItem
                    showTagText={
                      fallbackEthereumLedgerApp
                        ? "EVM"
                        : fallbackStarknetLedgerApp
                        ? "Starknet"
                        : undefined
                    }
                    tokens={tokens}
                    key={chainIdentifier}
                    chainInfo={modularChainInfo}
                    balance={balance}
                    enabled={enabled}
                    blockInteraction={blockInteraction}
                    isFresh={isFresh ?? false}
                    isNativeChain={nativeChainIdentifierSet.has(
                      chainIdentifier
                    )}
                    onClick={() => {
                      if (enabledChainIdentifierMap.get(chainIdentifier)) {
                        setEnabledChainIdentifiers(
                          enabledChainIdentifiers.filter(
                            (ci) => ci !== chainIdentifier
                          )
                        );
                      } else {
                        setEnabledChainIdentifiers([
                          ...enabledChainIdentifiers,
                          chainIdentifier,
                        ]);
                      }
                    }}
                  />
                );
              })}
            </NativeChainSection>

            {suggestModularChainInfos.map((modularChainInfo) => {
              const {
                balance,
                enabled,
                blockInteraction,
                tokens,
                chainIdentifier,
              } = getChainItemInfoForView(modularChainInfo);

              return (
                <ChainItem
                  showTagText={
                    fallbackEthereumLedgerApp
                      ? "EVM"
                      : fallbackStarknetLedgerApp
                      ? "Starknet"
                      : undefined
                  }
                  key={chainIdentifier}
                  chainInfo={modularChainInfo}
                  balance={balance}
                  enabled={enabled}
                  blockInteraction={blockInteraction}
                  isFresh={isFresh ?? false}
                  onClick={() => {
                    if (enabledChainIdentifierMap.get(chainIdentifier)) {
                      setEnabledChainIdentifiers(
                        enabledChainIdentifiers.filter(
                          (ci) => ci !== chainIdentifier
                        )
                      );
                    } else {
                      setEnabledChainIdentifiers([
                        ...enabledChainIdentifiers,
                        chainIdentifier,
                      ]);
                    }
                  }}
                  tokens={tokens}
                />
              );
            })}
            {!fallbackStarknetLedgerApp &&
              !fallbackEthereumLedgerApp &&
              keyType === "ledger" &&
              chainStore.modularChainInfos
                .filter((modularChainInfo) => {
                  const trimSearch = search.trim();
                  const trimSearchLowerCase = trimSearch.toLowerCase();

                  const isChainNameSearch = modularChainInfo.chainName
                    .toLowerCase()
                    .includes(trimSearchLowerCase);
                  const isCoinDenomSearch = (() => {
                    if ("cosmos" in modularChainInfo) {
                      const chainInfo = chainStore.getChain(
                        modularChainInfo.cosmos.chainId
                      );
                      return (
                        chainInfo.stakeCurrency || chainInfo.currencies[0]
                      ).coinDenom
                        .toLowerCase()
                        .includes(trimSearchLowerCase);
                    } else if ("starknet" in modularChainInfo) {
                      return (
                        modularChainInfo.starknet.currencies[0] ||
                        modularChainInfo.starknet.currencies[1]
                      ).coinDenom
                        .toLowerCase()
                        .includes(trimSearchLowerCase);
                    }

                    return false;
                  })();

                  return isChainNameSearch || isCoinDenomSearch;
                })
                .map((modularChainInfo) => {
                  if ("cosmos" in modularChainInfo) {
                    const chainInfo = chainStore.getChain(
                      modularChainInfo.chainId
                    );
                    const isEthermintLike =
                      chainInfo.bip44.coinType === 60 ||
                      !!chainInfo.features?.includes("eth-address-gen") ||
                      !!chainInfo.features?.includes("eth-key-sign");

                    const isLedgerSupported = (() => {
                      try {
                        // 처리가능한 체인만 true를 반환한다.
                        KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                          chainInfo.chainId
                        );
                        return true;
                      } catch {
                        return false;
                      }
                    })();

                    if (isEthermintLike && isLedgerSupported) {
                      return (
                        <NextStepChainItem
                          key={modularChainInfo.chainId}
                          modularChainInfo={modularChainInfo}
                          tagText="EVM"
                        />
                      );
                    }
                  } else if ("starknet" in modularChainInfo) {
                    return (
                      <NextStepChainItem
                        key={modularChainInfo.chainId}
                        modularChainInfo={modularChainInfo}
                        tagText="Starknet"
                      />
                    );
                  }

                  return null;
                })}

            {!fallbackStarknetLedgerApp &&
              searchedNonNativeChainInfos.map((modularChainInfo) => {
                const chainIdentifier = ChainIdHelper.parse(
                  modularChainInfo.chainId
                ).identifier;
                const isChecked =
                  nonNativeChainListForSuggest.includes(modularChainInfo);
                const isChainInfoType = "bip44" in modularChainInfo;

                const isNextStepChain =
                  !fallbackEthereumLedgerApp &&
                  keyType === "ledger" &&
                  isChainInfoType &&
                  (modularChainInfo.bip44.coinType === 60 ||
                    !!modularChainInfo.features?.includes("eth-address-gen") ||
                    !!modularChainInfo.features?.includes("eth-key-sign"));
                if (isNextStepChain) {
                  return (
                    <NextStepChainItem
                      key={chainIdentifier}
                      modularChainInfo={modularChainInfo}
                      tagText="EVM"
                    />
                  );
                }

                return (
                  <ChainItem
                    showTagText={
                      fallbackEthereumLedgerApp
                        ? "EVM"
                        : fallbackStarknetLedgerApp
                        ? "Starknet"
                        : undefined
                    }
                    key={chainIdentifier}
                    chainInfo={modularChainInfo}
                    enabled={isChecked}
                    isFresh={true}
                    blockInteraction={false}
                    onClick={() => {
                      if (isChecked) {
                        setNonNativeChainListForSuggest(
                          nonNativeChainListForSuggest.filter(
                            (ci) => ci.chainId !== modularChainInfo.chainId
                          )
                        );
                      } else {
                        setNonNativeChainListForSuggest([
                          ...nonNativeChainListForSuggest,
                          modularChainInfo,
                        ]);
                      }
                    }}
                  />
                );
              })}

            <div ref={infiniteScrollTriggerRef} />
          </Stack>
        </SimpleBar>

        <VerticalCollapseTransition
          collapsed={(() => {
            if (nonNativeChainListForSuggest.length > 0) {
              return false;
            }

            return true;
          })()}
        >
          <Gutter size="1.25rem" />
          <Box
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"]
            }
            borderRadius="0.5rem"
            padding="1.125rem"
          >
            <XAxis alignY="center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="none"
                viewBox="0 0 20 20"
              >
                <path
                  fill={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-100"]
                  }
                  d="M10 1.667A8.336 8.336 0 001.667 10c0 4.6 3.733 8.333 8.333 8.333S18.333 14.6 18.333 10 14.6 1.667 10 1.667zm.833 12.5H9.166v-5h1.667v5zm0-6.667H9.166V5.833h1.667V7.5z"
                />
              </svg>
              <Gutter size="0.5rem" />
              <Subtitle4
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-100"]
                }
              >
                <FormattedMessage id="pages.register.enable-chains.guide.non-native-chain.title" />
              </Subtitle4>
            </XAxis>
            <Gutter size="0.35rem" />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="pages.register.enable-chains.guide.non-native-chain.paragraph" />
            </Body3>
          </Box>
        </VerticalCollapseTransition>

        <Gutter size="1.25rem" />
        <Box width="22.5rem" marginX="auto">
          <Button
            text={intl.formatMessage({
              id: "button.save",
            })}
            size="large"
            onClick={async () => {
              const enables: string[] = [];
              const disables: string[] = [];
              const successSuggestChainIdentifiers: string[] = [];

              if (nonNativeChainListForSuggest.length > 0) {
                for (const chainInfo of nonNativeChainListForSuggest) {
                  try {
                    await window.keplr?.experimentalSuggestChain(
                      chainInfo as ChainInfo
                    );
                    successSuggestChainIdentifiers.push(
                      ChainIdHelper.parse(chainInfo.chainId).identifier
                    );
                  } catch {
                    console.error(
                      `Failed to suggest chain ${chainInfo.chainId}`
                    );
                    continue;
                  }
                }
                try {
                  await keyRingStore.refreshKeyRingStatus();
                  await chainStore.updateChainInfosFromBackground();
                  await chainStore.updateEnabledChainIdentifiersFromBackground();
                  dispatchGlobalEventExceptSelf("keplr_suggested_chain_added");
                } catch {
                  console.error(
                    "Failed to suggest chain",
                    successSuggestChainIdentifiers
                  );
                }

                enables.push(...successSuggestChainIdentifiers);
              }

              for (const modularChainInfo of chainStore.modularChainInfos) {
                const chainIdentifier = ChainIdHelper.parse(
                  modularChainInfo.chainId
                ).identifier;
                const enabled =
                  enabledChainIdentifierMap.get(chainIdentifier) || false;

                if (enabled) {
                  enables.push(chainIdentifier);
                } else {
                  //NOTE - 위에서 suggest 체인이 추가되었으면
                  //이 체인은 disable 하면 안되기 때문에 무시함
                  if (
                    successSuggestChainIdentifiers.some(
                      (c) => c === chainIdentifier
                    )
                  ) {
                    continue;
                  }

                  disables.push(chainIdentifier);
                }
              }

              const needFinalizeCoinType: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);
                if ("cosmos" in modularChainInfo) {
                  const chainInfo = chainStore.getChain(enable);
                  if (
                    keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)
                  ) {
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    needFinalizeCoinType.push(enable);
                  }
                }
              }

              const ledgerEthereumAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackEthereumLedgerApp) {
                  break;
                }

                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);

                if ("cosmos" in modularChainInfo) {
                  const chainInfo = chainStore.getChain(enable);
                  const isEthermintLike =
                    chainInfo.bip44.coinType === 60 ||
                    !!chainInfo.features?.includes("eth-address-gen") ||
                    !!chainInfo.features?.includes("eth-key-sign");

                  if (isEthermintLike) {
                    // 참고로 위에서 chainInfos memo로 인해서 막혀있기 때문에
                    // 여기서 throwErrorIfEthermintWithLedgerButNotSupported 확인은 생략한다.
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    ledgerEthereumAppNeeds.push(enable);
                  }
                }
              }

              const ledgerStarknetAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackStarknetLedgerApp) {
                  break;
                }

                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);

                if ("starknet" in modularChainInfo) {
                  // Remove enable from enables
                  enables.splice(i, 1);
                  i--;
                  // And push it disables
                  disables.push(enable);

                  ledgerStarknetAppNeeds.push(enable);
                }
              }
              await Promise.all([
                (async () => {
                  if (enables.length > 0) {
                    await chainStore.enableChainInfoInUIWithVaultId(
                      vaultId,
                      ...enables
                    );
                  }
                })(),
                (async () => {
                  if (disables.length > 0) {
                    await chainStore.disableChainInfoInUIWithVaultId(
                      vaultId,
                      ...disables
                    );
                  }
                })(),
              ]);

              dispatchGlobalEventExceptSelf(
                "keplr_enabled_chain_changed",
                vaultId
              );

              if (needFinalizeCoinType.length > 0) {
                sceneMovedToSelectDerivation.current = true;
                sceneTransition.replace("select-derivation-path", {
                  vaultId,
                  chainIds: needFinalizeCoinType,

                  totalCount: needFinalizeCoinType.length,

                  skipWelcome,
                });
              } else {
                // 어차피 bip44 coin type selection과 ethereum ledger app이 동시에 필요한 경우는 없다.
                // (ledger에서는 coin type이 app당 할당되기 때문에...)
                if (keyType === "ledger") {
                  if (fallbackStarknetLedgerApp) {
                    if (ledgerStarknetAppNeeds.length > 0) {
                      const keyInfo = keyRingStore.keyInfos.find(
                        (keyInfo) => keyInfo.id === vaultId
                      );

                      if (!keyInfo) {
                        throw new Error("KeyInfo not found");
                      }
                      if (keyInfo.insensitive["Starknet"]) {
                        await chainStore.enableChainInfoInUI(
                          ...ledgerStarknetAppNeeds
                        );
                        dispatchGlobalEventExceptSelf(
                          "keplr_enabled_chain_changed",
                          keyInfo.id
                        );
                        replaceToWelcomePage();
                      } else {
                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }

                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Starknet",
                          bip44Path,

                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerStarknetAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });
                      }
                    } else {
                      replaceToWelcomePage();
                    }
                  } else if (fallbackEthereumLedgerApp) {
                    if (ledgerEthereumAppNeeds.length > 0) {
                      const keyInfo = keyRingStore.keyInfos.find(
                        (keyInfo) => keyInfo.id === vaultId
                      );
                      if (!keyInfo) {
                        throw new Error("KeyInfo not found");
                      }
                      if (keyInfo.insensitive["Ethereum"]) {
                        await chainStore.enableChainInfoInUI(
                          ...ledgerEthereumAppNeeds
                        );
                        dispatchGlobalEventExceptSelf(
                          "keplr_enabled_chain_changed",
                          keyInfo.id
                        );
                        sceneTransition.push("enable-chains", {
                          vaultId,
                          keyType,
                          candidateAddresses: [],
                          isFresh: false,
                          skipWelcome,
                          fallbackStarknetLedgerApp: true,
                          stepPrevious: stepPrevious + 1,
                          stepTotal: stepTotal,
                        });
                      } else {
                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Ethereum",
                          bip44Path,

                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerEthereumAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });
                      }
                    } else {
                      sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType,
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome,
                        fallbackStarknetLedgerApp: true,
                        stepPrevious: stepPrevious + 1,
                        stepTotal: stepTotal,
                      });
                    }
                  } else {
                    sceneTransition.push("enable-chains", {
                      vaultId,
                      keyType,
                      candidateAddresses: [],
                      isFresh: false,
                      skipWelcome,
                      fallbackEthereumLedgerApp: true,
                      stepPrevious: stepPrevious + 1,
                      stepTotal: stepTotal,
                    });
                  }
                } else {
                  replaceToWelcomePage();
                }
              }
            }}
          />
          {fallbackEthereumLedgerApp || fallbackStarknetLedgerApp ? (
            <React.Fragment>
              <Gutter size="0.75rem" />
              <TextButton
                text={intl.formatMessage({
                  id: "pages.register.enable-chains.skip-button",
                })}
                onClick={() =>
                  fallbackEthereumLedgerApp
                    ? sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType: "ledger",
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome: true,
                        fallbackStarknetLedgerApp: true,
                        stepPrevious: stepPrevious + 1,
                        stepTotal: stepTotal,
                      })
                    : replaceToWelcomePage()
                }
              />
            </React.Fragment>
          ) : null}
        </Box>
      </RegisterSceneBox>
    );
  }
);

const NativeChainSection: FunctionComponent<{
  isCollapsed: boolean;
  isSelectAll: boolean;
  children: React.ReactNode;

  showTitleBox?: boolean;
  enabledNativeChainIdentifierList: string[];
  onClickCollapse: () => void;
  onClick: () => void;
  title: string;
  titleChainImage: React.ReactNode;
  paragraph: string;
}> = ({
  isCollapsed,
  isSelectAll,
  children,
  enabledNativeChainIdentifierList,
  onClick,
  onClickCollapse,
  showTitleBox,
  title,
  titleChainImage,
  paragraph,
}) => {
  const theme = useTheme();
  const nativeChainMarkColor = isSelectAll
    ? theme.mode === "light"
      ? ColorPalette["gray-10"]
      : ColorPalette["gray-550"]
    : theme.mode === "light"
    ? ColorPalette.white
    : ColorPalette["gray-600"];

  return (
    <React.Fragment>
      {showTitleBox && (
        <Box
          borderRadius="0.375rem"
          paddingX="1rem"
          paddingY="0.75rem"
          borderWidth="1.5px"
          borderColor={
            theme.mode === "light"
              ? ColorPalette["blue-200"]
              : ColorPalette["blue-600"]
          }
          backgroundColor={
            isSelectAll
              ? theme.mode === "light"
                ? ColorPalette["gray-10"]
                : ColorPalette["gray-550"]
              : theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          cursor={"pointer"}
          onClick={onClick}
        >
          <Columns sum={1} alignY="center">
            {isCollapsed ? (
              <NativeChainMarkIcon
                width="1.75rem"
                height="1.75rem"
                color={nativeChainMarkColor}
              />
            ) : (
              <Box position="relative">
                {titleChainImage}

                <Box
                  position="absolute"
                  style={{
                    bottom: "-0.125rem",
                    right: "-0.125rem",
                  }}
                >
                  <NativeChainMarkIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={nativeChainMarkColor}
                  />
                </Box>
              </Box>
            )}
            <Gutter size="0.5rem" />
            <YAxis>
              <XAxis alignY="center">
                <Subtitle2>{title}</Subtitle2>
                <Gutter size="0.25rem" />
                <Subtitle3 color={ColorPalette["blue-300"]}>
                  {enabledNativeChainIdentifierList.length}
                </Subtitle3>
              </XAxis>
              <Gutter size="0.25rem" />
              {isCollapsed ? null : (
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {" "}
                  {paragraph}
                </Subtitle3>
              )}
            </YAxis>
            <Column weight={1} />

            <Column weight={1} />
            <XAxis alignY="center">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onClickCollapse();
                }}
                padding="0.25rem"
                hoverColor={
                  theme.mode === "light"
                    ? hexToRgba(ColorPalette["gray-100"], 0.5)
                    : ColorPalette["gray-500"]
                }
              >
                {isCollapsed ? (
                  <LocalArrowDownIcon
                    width="1.5rem"
                    height="1.5rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  />
                ) : (
                  <LocalArrowUpIcon
                    width="1.5rem"
                    height="1.5rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  />
                )}
              </IconButton>
              <Gutter size="0.5rem" />
              <Checkbox
                checked={isSelectAll}
                onChange={() => {
                  onClick();
                }}
              />
            </XAxis>
          </Columns>
        </Box>
      )}
      <VerticalCollapseTransition
        collapsed={showTitleBox ? isCollapsed : false}
        opacityLeft={0}
        transitionAlign="top"
      >
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">{children}</Stack>
      </VerticalCollapseTransition>
    </React.Fragment>
  );
};

const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo | ModularChainInfo;
  balance?: CoinPretty;
  isNativeChain?: boolean;
  enabled: boolean;
  blockInteraction: boolean;

  onClick: () => void;

  isFresh: boolean;
  tokens?: ViewToken[];
  showTagText?: "EVM" | "Starknet";
}> = observer(
  ({
    chainInfo,
    balance,
    enabled,
    blockInteraction,
    isNativeChain,
    onClick,
    isFresh,
    tokens,
    showTagText,
  }) => {
    const { priceStore } = useStore();
    const theme = useTheme();
    const [isCollapsedTokenView, setIsCollapsedTokenView] = useState(true);

    const price = balance ? priceStore.calculatePrice(balance) : undefined;

    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

    const arrowAnimation = useSpring({
      transform: isCollapsedTokenView ? "rotate(0deg)" : "rotate(-180deg)",
      config: { tension: 300, friction: 25, clamp: true },
    });

    const isShowTokenView =
      !!tokens?.length &&
      (!balance?.toDec().isZero() ||
        tokens.some((token) => !token.token.toDec().isZero()));

    return (
      <Box
        borderRadius="0.375rem"
        paddingX="1rem"
        paddingY="0.75rem"
        backgroundColor={
          enabled
            ? theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-550"]
            : theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-600"]
        }
        cursor={blockInteraction ? "not-allowed" : "pointer"}
        onClick={() => {
          if (!blockInteraction) {
            onClick();
          }
        }}
      >
        <Columns sum={1}>
          <XAxis alignY="center">
            {isNativeChain ? (
              <Box position="relative">
                <ChainImageFallback chainInfo={chainInfo} size="3rem" />
                <Box
                  position="absolute"
                  style={{
                    bottom: "-0.125rem",
                    right: "-0.125rem",
                  }}
                >
                  <NativeChainMarkIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={
                      enabled
                        ? theme.mode === "light"
                          ? ColorPalette["gray-10"]
                          : ColorPalette["gray-550"]
                        : theme.mode === "light"
                        ? ColorPalette.white
                        : ColorPalette["gray-600"]
                    }
                  />
                </Box>
              </Box>
            ) : (
              <ChainImageFallback chainInfo={chainInfo} size="3rem" />
            )}

            <Gutter size="0.5rem" />

            <YAxis>
              <XAxis alignY="center">
                <XAxis alignY="center">
                  <Subtitle2>
                    {(() => {
                      // Noble의 경우만 약간 특수하게 표시해줌
                      if (chainIdentifier === "noble") {
                        return `${chainInfo.chainName} (USDC)`;
                      }

                      return chainInfo.chainName;
                    })()}
                  </Subtitle2>

                  {showTagText && (
                    <React.Fragment>
                      <Gutter size="0.375rem" />
                      <Tag text={showTagText} />
                    </React.Fragment>
                  )}
                </XAxis>
                {isShowTokenView && (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsCollapsedTokenView(!isCollapsedTokenView);
                      }}
                      hoverColor={
                        theme.mode === "light"
                          ? hexToRgba(ColorPalette["gray-100"], 0.5)
                          : ColorPalette["gray-500"]
                      }
                      padding="0.25rem"
                    >
                      <animated.div
                        style={{
                          ...arrowAnimation,
                          padding: "0",
                          height: "1rem",
                        }}
                      >
                        <LocalArrowDownIcon
                          width="1rem"
                          height="1rem"
                          color={
                            theme.mode === "light"
                              ? ColorPalette["gray-200"]
                              : ColorPalette["gray-300"]
                          }
                        />
                      </animated.div>
                    </IconButton>
                  </React.Fragment>
                )}
              </XAxis>
              {isShowTokenView && (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Subtitle3 color={ColorPalette["gray-300"]}>
                    {tokens?.length} Tokens
                  </Subtitle3>
                </React.Fragment>
              )}
            </YAxis>
          </XAxis>
          <Column weight={1} />
          <XAxis alignY="center">
            {isFresh ||
            balance == null ||
            (balance.toDec().isZero() && !isShowTokenView) ? null : (
              <YAxis alignX="right">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette.white
                  }
                >
                  {balance
                    .maxDecimals(6)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .toString()}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {price ? price.toString() : "-"}
                </Subtitle3>
              </YAxis>
            )}

            <Gutter size="1rem" />
            <Checkbox
              checked={enabled}
              onChange={() => {
                if (!blockInteraction) {
                  onClick();
                }
              }}
            />
          </XAxis>
        </Columns>
        {tokens && (
          <VerticalCollapseTransition
            collapsed={isCollapsedTokenView}
            opacityLeft={0}
          >
            <TokenView tokens={tokens} />
          </VerticalCollapseTransition>
        )}
      </Box>
    );
  }
);

const TokenView: FunctionComponent<{
  tokens: ViewToken[];
}> = ({ tokens }) => {
  const theme = useTheme();

  return (
    <Box
      paddingX="1rem"
      paddingY="0.75rem"
      marginTop="0.625rem"
      borderRadius="0.375rem"
      backgroundColor={
        theme.mode === "light"
          ? hexToRgba(ColorPalette["gray-100"], 0.5)
          : ColorPalette["gray-500"]
      }
    >
      <Stack gutter="0.5rem">
        {tokens?.map((token) => (
          <TokenItem
            key={token.token.currency.coinMinimalDenom}
            viewToken={token}
          />
        ))}
      </Stack>
    </Box>
  );
};

const TokenItem: FunctionComponent<{
  viewToken: ViewToken;
}> = ({ viewToken }) => {
  const theme = useTheme();

  const tag = useMemo(() => {
    const currency = viewToken.token.currency;
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    if (
      denomHelper.type === "native" &&
      currency.coinMinimalDenom.startsWith("ibc/")
    ) {
      return {
        text: "IBC",
        tooltip: (() => {
          const start = currency.coinDenom.indexOf("(");
          const end = currency.coinDenom.lastIndexOf(")");

          if (start < 0 || end < 0) {
            return "Unknown";
          }

          return currency.coinDenom.slice(start + 1, end);
        })(),
      };
    }
    if (denomHelper.type !== "native") {
      return {
        text: denomHelper.type,
      };
    }
  }, [viewToken.token.currency]);
  const coinDenom = useMemo(() => {
    if (
      "originCurrency" in viewToken.token.currency &&
      viewToken.token.currency.originCurrency
    ) {
      return viewToken.token.currency.originCurrency.coinDenom;
    }
    return viewToken.token.currency.coinDenom;
  }, [viewToken.token.currency]);

  return (
    <Columns
      alignY="center"
      sum={1}
      key={viewToken.token.currency.coinMinimalDenom}
    >
      <CurrencyImageFallback
        chainInfo={viewToken.chainInfo}
        currency={viewToken.token.currency}
        size="1.5rem"
      />
      <Gutter size="0.5rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-700"]
            : ColorPalette["gray-50"]
        }
        style={{
          wordBreak: "break-all",
        }}
      >
        {coinDenom}
      </Subtitle3>

      {tag ? (
        <React.Fragment>
          <Gutter size="0.25rem" />
          <Box alignY="center" height="1px">
            <TokenTag text={tag.text} tooltip={tag.tooltip} />
          </Box>
        </React.Fragment>
      ) : null}

      <Column weight={1} />
      <Gutter size="0.5rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {viewToken.token
          .hideDenom(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .shrink(true)
          .toString()}
      </Subtitle3>
    </Columns>
  );
};

const TokenTag: FunctionComponent<{
  text: string;
  tooltip?: string;
}> = ({ text, tooltip }) => {
  const theme = useTheme();

  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["blue-50"]
            : ColorPalette["gray-550"]
        }
        borderRadius="0.375rem"
        height="1rem"
        paddingX="0.375rem"
      >
        <BaseTypography
          style={{
            fontWeight: 400,
            fontSize: "0.6875rem",
          }}
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-200"]
          }
        >
          {text}
        </BaseTypography>
      </Box>
    </Tooltip>
  );
};

const NextStepChainItem: FunctionComponent<{
  modularChainInfo: ModularChainInfo | ChainInfo;
  tagText: string;
}> = ({ modularChainInfo, tagText }) => {
  return (
    <Box
      paddingX="1rem"
      paddingY="0.75rem"
      cursor="not-allowed"
      style={{ opacity: 0.5 }}
    >
      <Columns sum={1}>
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={modularChainInfo} size="3rem" />

          <Gutter size="0.5rem" />

          <YAxis>
            <XAxis alignY="center">
              <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

              <Gutter size="0.375rem" />

              <Tag text={tagText} />
            </XAxis>

            <Gutter size="0.25rem" />

            <Subtitle4 color={ColorPalette["gray-300"]}>
              {"starknet" in modularChainInfo ? (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-starknet-later-step" />
              ) : (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-evm-next-step" />
              )}
            </Subtitle4>
          </YAxis>
        </XAxis>
      </Columns>
    </Box>
  );
};

const LocalArrowDownIcon = ({
  width = "1rem",
  height = "1rem",
  color,
}: {
  width?: string;
  height?: string;
  color?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M13 6L8 11L3 6"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const LocalArrowUpIcon = ({
  width = "1rem",
  height = "1rem",
  color,
  strokeWidth = "2",
}: {
  width?: string;
  height?: string;
  color?: string;
  strokeWidth?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M4.5 16.25L12 8.75L19.5 16.25"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
