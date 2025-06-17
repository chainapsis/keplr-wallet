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
import { XAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { SearchTextInput } from "../../../components/input";
import { Body3, Subtitle3, Subtitle4 } from "../../../components/typography";
import { Button } from "../../../components/button";
import { ColorPalette } from "../../../styles";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { useNavigate } from "react-router";
import { ChainImageFallback } from "../../../components/image";
import { KeyRingCosmosService, KeyRingService } from "@keplr-wallet/background";
import { WalletStatus } from "@keplr-wallet/stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TextButton } from "../../../components/button-text";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { checkButtonPositionAndScrollToButton } from "../utils/check-button-position-and-scroll-to-button";
import { EmbedChainInfos } from "../../../config";
import { useGetAllNonNativeChain } from "../../../hooks/use-get-all-non-native-chain";
import { hexToRgba } from "../../../utils";
import { NativeChainSection } from "./components/native-chain-section";
import { NativeChainSectionIconDM } from "./components/native-chain-section-icon-dm";
import { NativeChainSectionIconLM } from "./components/native-chain-section-icon-lm";
import { NextStepChainItem } from "./components/next-step-chain-item";
import { ChainItem } from "./components/chain-item";
import { INITIA_CHAIN_ID } from "../../../config.ui";
import { useSearch } from "../../../hooks/use-search";
import { getChainSearchResultClickAnalyticsProperties } from "../../../analytics-amplitude";
import { AnalyticsAmplitudeStore } from "@keplr-wallet/analytics";
import debounce from "lodash.debounce";

const logChainSearchClick = (
  analyticsStore: AnalyticsAmplitudeStore,
  chainInfo: { chainName: string; chainId: string },
  search: string,
  allSearchResults: { chainName: string; chainId: string }[]
) => {
  if (!search?.trim()) return;

  analyticsStore.logEvent(
    "click_chain_item_search_results_register",
    getChainSearchResultClickAnalyticsProperties(
      chainInfo.chainName,
      search,
      allSearchResults.map((chain) => chain.chainName),
      allSearchResults.findIndex((chain) => chain.chainId === chainInfo.chainId)
    )
  );
};

const debouncedLogChainSearchClick = debounce(logChainSearchClick, 100);

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
  fallbackBitcoinLedgerApp?: boolean;
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({
    vaultId,
    candidateAddresses: propCandiateAddresses,
    isFresh,
    fallbackEthereumLedgerApp,
    fallbackStarknetLedgerApp,
    fallbackBitcoinLedgerApp,
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
      bitcoinQueriesStore,
      hugeQueriesStore,
      analyticsAmplitudeStore,
    } = useStore();

    const navigate = useNavigate();
    const intl = useIntl();
    const theme = useTheme();

    const searchRef = useRef<HTMLInputElement | null>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const pageMountedAtRef = useRef(performance.now());
    useScrollDownWhenCantSeeSaveButton(buttonContainerRef);

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

    const embedChainIdentifierSet = useMemo(
      () =>
        new Set(
          EmbedChainInfos.map(
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
            } else if ("bitcoin" in modularChainInfo) {
              const account = accountStore.getAccount(modularChainInfo.chainId);
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

        // modular chain들은 `candidateAddresses`에 추가되지 않으므로 여기서 enable 할지 판단한다.
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

          if ("bitcoin" in modularChainInfo) {
            const mainCurrency = modularChainInfo.bitcoin.currencies[0];
            const account = accountStore.getAccount(modularChainInfo.chainId);

            const queryBalance = bitcoinQueriesStore
              .get(modularChainInfo.chainId)
              .queryBitcoinBalance.getBalance(
                modularChainInfo.chainId,
                chainStore,
                account.bitcoinAddress?.bech32Address ?? "",
                mainCurrency.coinMinimalDenom
              );

            if (queryBalance && queryBalance.balance.toDec().gt(new Dec(0))) {
              enableAllChains = false;
              enabledChainIdentifiers.push(
                ChainIdHelper.parse(modularChainInfo.chainId).identifier
              );
            } else {
              // Taproot 혹은 Native Segwit 중 하나라도 밸런스가 있으면 둘 다 enable한다.
              const paymentType = modularChainInfo.chainId.split(":")[2];
              const chainIdWithAnotherPaymentType =
                modularChainInfo.chainId.replace(
                  paymentType,
                  paymentType === "taproot" ? "native-segwit" : "taproot"
                );
              const accountWithAnotherPaymentType = accountStore.getAccount(
                chainIdWithAnotherPaymentType
              );

              const queryBalanceWithAnotherPaymentType = bitcoinQueriesStore
                .get(chainIdWithAnotherPaymentType)
                .queryBitcoinBalance.getBalance(
                  chainIdWithAnotherPaymentType,
                  chainStore,
                  accountWithAnotherPaymentType.bitcoinAddress?.bech32Address ??
                    "",
                  mainCurrency.coinMinimalDenom
                );
              if (
                queryBalanceWithAnotherPaymentType &&
                queryBalanceWithAnotherPaymentType.balance
                  .toDec()
                  .gt(new Dec(0))
              ) {
                enableAllChains = false;
                enabledChainIdentifiers.push(
                  ChainIdHelper.parse(modularChainInfo.chainId).identifier
                );
              }
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
              const isInitia = chainInfo.chainId === INITIA_CHAIN_ID;
              const queryDelegations = isInitia
                ? queries.cosmos.queryInitiaDelegations.getQueryBech32Address(
                    bech32Address.address
                  )
                : queries.cosmos.queryDelegations.getQueryBech32Address(
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
    // linkedChainKey를 기반으로 그룹화된 체인을 `linkedModularChainInfos`로 가지고 있다.
    const preSortGroupedModularChainInfos = useMemo(() => {
      let modularChainInfos =
        chainStore.groupedModularChainInfosInListUI.slice();

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
                if (chainInfo.features?.includes("force-enable-evm-ledger")) {
                  return true;
                }
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
            if (fallbackStarknetLedgerApp || fallbackBitcoinLedgerApp) {
              return false;
            }

            return true;
          } else if ("starknet" in modularChainInfo) {
            return fallbackStarknetLedgerApp;
          } else if ("bitcoin" in modularChainInfo) {
            return fallbackBitcoinLedgerApp;
          } else {
            return false;
          }
        });
      }

      if (keyType === "keystone") {
        modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
          // keystone은 스타크넷을 지원하지 않는다.
          // CHECK: 비트코인 지원 여부 확인 필요
          if ("starknet" in modularChainInfo || "bitcoin" in modularChainInfo) {
            return false;
          }
          return true;
        });
      }

      return modularChainInfos;
    }, [
      chainStore,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      fallbackBitcoinLedgerApp,
      keyType,
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
            bChainIdentifier !== "eip155:1"
          ) {
            return -1;
          }

          if (
            aChainIdentifier !== "eip155:1" &&
            bChainIdentifier === "eip155:1"
          ) {
            return 1;
          }
        }

        const isNotEthereum =
          aChainIdentifier !== "eip155:1" && bChainIdentifier !== "eip155:1";
        if (isNotCosmosHub && isNotEthereum) {
          if (
            aChainIdentifier.startsWith(
              "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
            ) &&
            !bChainIdentifier.startsWith(
              "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
            )
          ) {
            return -1;
          }

          if (
            !aChainIdentifier.startsWith(
              "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
            ) &&
            bChainIdentifier.startsWith(
              "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
            )
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

        const getBalance = (
          modularChainInfo: ModularChainInfo & {
            linkedModularChainInfos?: ModularChainInfo[];
          },
          chainIdentifier: string
        ) => {
          if ("cosmos" in modularChainInfo) {
            const addresses = candidateAddressesMap.get(chainIdentifier);
            const chainInfo = chainStore.getChain(modularChainInfo.chainId);
            const queries = queriesStore.get(modularChainInfo.chainId);

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
          } else if ("starknet" in modularChainInfo) {
            const account = accountStore.getAccount(modularChainInfo.chainId);
            const mainCurrency = modularChainInfo.starknet.currencies[0];

            const balance = starknetQueriesStore
              .get(modularChainInfo.chainId)
              .queryStarknetERC20Balance.getBalance(
                modularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                mainCurrency.coinMinimalDenom
              )?.balance;

            if (balance) {
              return balance;
            }
          } else if ("bitcoin" in modularChainInfo) {
            const account = accountStore.getAccount(modularChainInfo.chainId);
            const getBitcoinBalance = (
              chainId: string,
              address: string,
              coinMinimalDenom: string
            ) => {
              return bitcoinQueriesStore
                .get(chainId)
                .queryBitcoinBalance.getBalance(
                  chainId,
                  chainStore,
                  address,
                  coinMinimalDenom
                );
            };

            const addBalance = (balance: Dec, queryBalance: any) => {
              return queryBalance
                ? balance.add(queryBalance.balance.toDec())
                : balance;
            };

            const mainCurrency = modularChainInfo.bitcoin.currencies[0];
            let totalBalance = new Dec(0);

            const mainBalance = getBitcoinBalance(
              modularChainInfo.chainId,
              account.bitcoinAddress?.bech32Address ?? "",
              mainCurrency.coinMinimalDenom
            );

            totalBalance = addBalance(totalBalance, mainBalance);

            if (modularChainInfo.linkedModularChainInfos) {
              totalBalance = modularChainInfo.linkedModularChainInfos.reduce(
                (acc, linkedChain) => {
                  if ("bitcoin" in linkedChain) {
                    const linkedAccount = accountStore.getAccount(
                      linkedChain.chainId
                    );
                    const linkedMainCurrency =
                      linkedChain.bitcoin.currencies[0];
                    const linkedBalance = getBitcoinBalance(
                      linkedChain.chainId,
                      linkedAccount.bitcoinAddress?.bech32Address ?? "",
                      linkedMainCurrency.coinMinimalDenom
                    );
                    return addBalance(acc, linkedBalance);
                  }
                  return acc;
                },
                totalBalance
              );
            }

            return new CoinPretty(
              mainCurrency,
              totalBalance.mul(new Dec(10 ** mainCurrency.coinDecimals))
            );
          }
        };

        const aBalance = getBalance(aModularChainInfo, aChainIdentifier);
        const bBalance = getBalance(bModularChainInfo, bChainIdentifier);

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
        bitcoinQueriesStore,
        priceStore,
      ]
    );

    const nativeGroupedModularChainInfos = preSortGroupedModularChainInfos
      .filter((modularChainInfo) =>
        nativeChainIdentifierSet.has(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier
        )
      )
      .sort(chainSort);

    const suggestGroupedModularChainInfos = preSortGroupedModularChainInfos
      .filter(
        (modularChainInfo) =>
          !nativeChainIdentifierSet.has(
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          )
      )
      .sort(chainSort);

    const searchFields = useMemo(
      () => [
        "chainName",
        {
          key: "modularChainInfo.currency.coinDenom",
          function: (modularChainInfo: ModularChainInfo) => {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = chainStore.getChain(
                modularChainInfo.cosmos.chainId
              );
              return CoinPretty.makeCoinDenomPretty(
                (chainInfo.stakeCurrency || chainInfo.currencies[0]).coinDenom
              );
            } else if ("starknet" in modularChainInfo) {
              return CoinPretty.makeCoinDenomPretty(
                modularChainInfo.starknet.currencies[0].coinDenom
              );
            } else if ("bitcoin" in modularChainInfo) {
              return CoinPretty.makeCoinDenomPretty(
                modularChainInfo.bitcoin.currencies[0].coinDenom
              );
            }
            return "";
          },
        },
      ],
      [chainStore]
    );

    const searchedNativeGroupedModularChainInfos = useSearch(
      nativeGroupedModularChainInfos,
      search,
      searchFields
    );

    const searchedSuggestGroupedModularChainInfos = useSearch(
      suggestGroupedModularChainInfos,
      search,
      searchFields
    );

    const searchedLedgerChains = useSearch(
      chainStore.groupedModularChainInfos,
      search,
      searchFields
    );

    const showLedgerChains =
      !fallbackStarknetLedgerApp &&
      !fallbackEthereumLedgerApp &&
      !fallbackBitcoinLedgerApp &&
      keyType === "ledger";

    const { chains: searchedNonNativeChainInfos, infiniteScrollTriggerRef } =
      useGetAllNonNativeChain({
        search,
        fallbackEthereumLedgerApp,
        fallbackStarknetLedgerApp,
        keyType,
      });

    const searchedAllChains = [
      ...searchedNativeGroupedModularChainInfos,
      ...searchedSuggestGroupedModularChainInfos,
      ...(showLedgerChains ? searchedLedgerChains : []),
      ...searchedNonNativeChainInfos,
    ];

    const numSelected = useMemo(() => {
      const modularChainInfoMap = new Map<string, ModularChainInfo>();
      for (const modularChainInfo of chainStore.groupedModularChainInfosInListUI) {
        modularChainInfoMap.set(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier,
          modularChainInfo
        );
      }

      // Grouped chain의 여러 체인 Identifier를 하나의 체인으로 묶어서 인식하기 위해서 사용
      const linkedChainKeySet = new Set<string>();

      let numSelected = 0;
      for (const enabledChainIdentifier of enabledChainIdentifiers) {
        const enabledModularChainInfo = modularChainInfoMap.get(
          enabledChainIdentifier
        );
        if (enabledModularChainInfo) {
          if (linkedChainKeySet.has(enabledChainIdentifier)) {
            continue;
          }

          linkedChainKeySet.add(enabledChainIdentifier);

          if (keyType === "ledger") {
            const isCosmosAppNeed = "cosmos" in enabledModularChainInfo;
            const isEthereumAppNeed =
              isCosmosAppNeed &&
              (enabledModularChainInfo.cosmos.bip44.coinType === 60 ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-address-gen"
                ) ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-key-sign"
                ));
            const isStarknetAppNeed = "starknet" in enabledModularChainInfo;
            const isBitcoinAppNeed = "bitcoin" in enabledModularChainInfo;

            if (fallbackStarknetLedgerApp) {
              if (isStarknetAppNeed) {
                numSelected++;
              }
            } else if (fallbackBitcoinLedgerApp) {
              if (isBitcoinAppNeed) {
                numSelected++;
              }
            } else if (fallbackEthereumLedgerApp) {
              if (isEthereumAppNeed) {
                numSelected++;
              }
            } else if (isCosmosAppNeed && !isEthereumAppNeed) {
              numSelected++;
            }
          } else {
            numSelected++;
          }
        }
      }
      return numSelected;
    }, [
      chainStore.groupedModularChainInfosInListUI,
      enabledChainIdentifiers,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      fallbackBitcoinLedgerApp,
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

    // 사용자에게 보여지는 요소 (선택된 체인의 수, 체인 목록)는 그룹화된 체인 목록을 기준으로 처리한다.
    // linked 상태인 체인의 선택 여부 등을 함께 보여주지 않는다.
    const enabledNativeChainIdentifiersInPage = useMemo(() => {
      return enabledChainIdentifiers.filter(
        (chainIdentifier) =>
          nativeGroupedModularChainInfos.some(
            (modularChainInfo) =>
              chainIdentifier ===
              ChainIdHelper.parse(modularChainInfo.chainId).identifier
          ) && nativeChainIdentifierSet.has(chainIdentifier)
      );
    }, [
      nativeChainIdentifierSet,
      enabledChainIdentifiers,
      nativeGroupedModularChainInfos,
    ]);

    const [
      backupSelectedNativeChainIdentifiers,
      setBackupSelectedNativeChainIdentifiers,
    ] = useState<string[]>([]);

    const getChainItemInfoForView = useCallback(
      (
        modularChainInfo: ModularChainInfo & {
          linkedModularChainInfos?: ModularChainInfo[];
        }
      ) => {
        const account = accountStore.getAccount(modularChainInfo.chainId);
        const baseChainId =
          "bitcoin" in modularChainInfo
            ? modularChainInfo.bitcoin.chainId
            : modularChainInfo.chainId;

        const tokens =
          tokensByChainIdentifier.get(
            ChainIdHelper.parse(baseChainId).identifier
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
          } else if ("bitcoin" in modularChainInfo) {
            const getBitcoinBalance = (
              chainId: string,
              address: string,
              coinMinimalDenom: string
            ) => {
              return bitcoinQueriesStore
                .get(chainId)
                .queryBitcoinBalance.getBalance(
                  chainId,
                  chainStore,
                  address,
                  coinMinimalDenom
                );
            };

            const addBalance = (balance: Dec, queryBalance: any) => {
              return queryBalance
                ? balance.add(queryBalance.balance.toDec())
                : balance;
            };

            const mainCurrency = modularChainInfo.bitcoin.currencies[0];
            let totalBalance = new Dec(0);

            const mainBalance = getBitcoinBalance(
              modularChainInfo.chainId,
              account.bitcoinAddress?.bech32Address ?? "",
              mainCurrency.coinMinimalDenom
            );

            totalBalance = addBalance(totalBalance, mainBalance);

            if (modularChainInfo.linkedModularChainInfos) {
              totalBalance = modularChainInfo.linkedModularChainInfos.reduce(
                (acc, linkedChain) => {
                  if ("bitcoin" in linkedChain) {
                    const linkedAccount = accountStore.getAccount(
                      linkedChain.chainId
                    );
                    const linkedMainCurrency =
                      linkedChain.bitcoin.currencies[0];
                    const linkedBalance = getBitcoinBalance(
                      linkedChain.chainId,
                      linkedAccount.bitcoinAddress?.bech32Address ?? "",
                      linkedMainCurrency.coinMinimalDenom
                    );
                    return addBalance(acc, linkedBalance);
                  }
                  return acc;
                },
                totalBalance
              );
            }

            // TODO: coinMinimalDenom을 다르게 지정을 해놔서 로직이 복잡하고 직관적이지 않음.
            // linked 상태인 체인들은 coinMinimalDenom을 하나로 통일할 필요가 있음.
            return new CoinPretty(
              mainCurrency,
              totalBalance.mul(new Dec(10 ** mainCurrency.coinDecimals))
            );
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
        bitcoinQueriesStore,
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

        if (fallbackBitcoinLedgerApp) {
          return (
            <ChainImageFallback
              chainInfo={chainStore.getModularChain(
                "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f:taproot"
              )}
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
            backgroundColor:
              theme.mode === "light"
                ? hexToRgba(ColorPalette["gray-100"], 0.5)
                : ColorPalette["gray-650"],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme.mode === "light" ? (
            <NativeChainSectionIconLM />
          ) : (
            <NativeChainSectionIconDM />
          )}
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

        if (fallbackBitcoinLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-bitcoin-title",
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

        if (fallbackBitcoinLedgerApp) {
          return intl.formatMessage({
            id: "pages.register.enable-chains.native-chain-view.ledger-bitcoin-paragraph",
          });
        }

        return intl.formatMessage({
          id: "pages.register.enable-chains.native-chain-view.ledger-cosmos-paragraph",
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
                nativeGroupedModularChainInfos.length ===
                enabledNativeChainIdentifiersInPage.length
              }
              onClick={() => {
                if (
                  nativeGroupedModularChainInfos.length ===
                  enabledNativeChainIdentifiersInPage.length
                ) {
                  analyticsAmplitudeStore.logEvent(
                    "click_all_native_chain_btn_register"
                  );
                }

                if (
                  nativeGroupedModularChainInfos.length ===
                  enabledNativeChainIdentifiersInPage.length
                ) {
                  if (backupSelectedNativeChainIdentifiers.length > 0) {
                    setEnabledChainIdentifiers([
                      ...enabledSuggestChainIdentifiers,
                      ...backupSelectedNativeChainIdentifiers,
                    ]);
                  } else {
                    if (nativeGroupedModularChainInfos.length > 0) {
                      const firstNativeChainInfo =
                        nativeGroupedModularChainInfos[0];

                      const chainIdentifiers: string[] = [
                        ChainIdHelper.parse(firstNativeChainInfo.chainId)
                          .identifier,
                      ];

                      if (firstNativeChainInfo.linkedModularChainInfos) {
                        for (const linkedChain of firstNativeChainInfo.linkedModularChainInfos) {
                          chainIdentifiers.push(
                            ChainIdHelper.parse(linkedChain.chainId).identifier
                          );
                        }
                      }

                      setEnabledChainIdentifiers([
                        ...chainIdentifiers,
                        ...enabledSuggestChainIdentifiers,
                      ]);
                    }
                  }
                } else {
                  setBackupSelectedNativeChainIdentifiers([
                    ...enabledNativeChainIdentifiers,
                  ]);

                  const newEnabledNativeChainIdentifiers: string[] =
                    enabledNativeChainIdentifiers.slice();

                  for (const modularChainInfo of nativeGroupedModularChainInfos) {
                    const chainIdentifiers: string[] = [
                      ChainIdHelper.parse(modularChainInfo.chainId).identifier,
                    ];

                    if (modularChainInfo.linkedModularChainInfos) {
                      for (const linkedChain of modularChainInfo.linkedModularChainInfos) {
                        chainIdentifiers.push(
                          ChainIdHelper.parse(linkedChain.chainId).identifier
                        );
                      }
                    }

                    for (const chainIdentifier of chainIdentifiers) {
                      if (
                        !enabledNativeChainIdentifiers.includes(chainIdentifier)
                      ) {
                        newEnabledNativeChainIdentifiers.push(chainIdentifier);
                      }
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
              {searchedNativeGroupedModularChainInfos.map(
                (modularChainInfo) => {
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
                          : fallbackBitcoinLedgerApp
                          ? "Bitcoin"
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
                        debouncedLogChainSearchClick(
                          analyticsAmplitudeStore,
                          modularChainInfo,
                          search,
                          searchedAllChains
                        );

                        const isEnabled =
                          enabledChainIdentifierMap.get(chainIdentifier);
                        const linkedChainIdentifiers = new Set<string>([
                          chainIdentifier,
                        ]);

                        if ("linkedChainKey" in modularChainInfo) {
                          const linkedChainKey =
                            modularChainInfo.linkedChainKey;
                          chainStore.modularChainInfos.forEach(
                            (modularChainInfo) => {
                              if (
                                "linkedChainKey" in modularChainInfo &&
                                modularChainInfo.linkedChainKey ===
                                  linkedChainKey
                              ) {
                                linkedChainIdentifiers.add(
                                  modularChainInfo.chainId
                                );
                              }
                            }
                          );
                        }

                        setEnabledChainIdentifiers((prev) => {
                          const result = new Set(prev);

                          // If selected chain is enabled, disable all linked chains.
                          // Otherwise, enable all linked chains including selected chain.
                          const shouldEnable = !isEnabled;

                          linkedChainIdentifiers.forEach((id) =>
                            shouldEnable ? result.add(id) : result.delete(id)
                          );

                          return Array.from(result);
                        });
                      }}
                    />
                  );
                }
              )}
            </NativeChainSection>

            {searchedSuggestGroupedModularChainInfos.map((modularChainInfo) => {
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
                    debouncedLogChainSearchClick(
                      analyticsAmplitudeStore,
                      modularChainInfo,
                      search,
                      searchedAllChains
                    );

                    const isEnabled =
                      enabledChainIdentifierMap.get(chainIdentifier);
                    const linkedChainIdentifiers = new Set<string>([
                      chainIdentifier,
                    ]);

                    if ("linkedChainKey" in modularChainInfo) {
                      const linkedChainKey = modularChainInfo.linkedChainKey;
                      chainStore.modularChainInfos.forEach(
                        (modularChainInfo) => {
                          if (
                            "linkedChainKey" in modularChainInfo &&
                            modularChainInfo.linkedChainKey === linkedChainKey
                          ) {
                            linkedChainIdentifiers.add(
                              modularChainInfo.chainId
                            );
                          }
                        }
                      );
                    }

                    setEnabledChainIdentifiers((prev) => {
                      const result = new Set(prev);

                      // If selected chain is enabled, disable all linked chains.
                      // Otherwise, enable all linked chains including selected chain.
                      const shouldEnable = !isEnabled;

                      linkedChainIdentifiers.forEach((id) =>
                        shouldEnable ? result.add(id) : result.delete(id)
                      );

                      return Array.from(result);
                    });
                  }}
                  tokens={tokens}
                />
              );
            })}
            {showLedgerChains &&
              searchedLedgerChains.map((modularChainInfo) => {
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
                      if (
                        chainInfo.features?.includes("force-enable-evm-ledger")
                      ) {
                        return true;
                      }
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
                } else if ("bitcoin" in modularChainInfo) {
                  return (
                    <NextStepChainItem
                      key={modularChainInfo.chainId}
                      modularChainInfo={modularChainInfo}
                      tagText="Bitcoin"
                    />
                  );
                }

                return null;
              })}

            {!fallbackStarknetLedgerApp &&
              !fallbackBitcoinLedgerApp &&
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
                        : fallbackBitcoinLedgerApp
                        ? "Bitcoin"
                        : undefined
                    }
                    key={chainIdentifier}
                    chainInfo={modularChainInfo}
                    enabled={isChecked}
                    isFresh={true}
                    blockInteraction={false}
                    onClick={() => {
                      debouncedLogChainSearchClick(
                        analyticsAmplitudeStore,
                        modularChainInfo,
                        search,
                        searchedAllChains
                      );

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
          <div ref={buttonContainerRef}>
            <Button
              text={intl.formatMessage({
                id: "button.save",
              })}
              size="large"
              onClick={async () => {
                const enablesSet: Set<string> = new Set();
                const disablesSet: Set<string> = new Set();
                const enableLinkedChainKeys: Set<string> = new Set();

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
                    dispatchGlobalEventExceptSelf(
                      "keplr_suggested_chain_added"
                    );
                  } catch {
                    console.error(
                      "Failed to suggest chain",
                      successSuggestChainIdentifiers
                    );
                  }

                  successSuggestChainIdentifiers.forEach((chainIdentifier) => {
                    enablesSet.add(chainIdentifier);
                  });
                }

                for (const modularChainInfo of chainStore.modularChainInfos) {
                  const chainIdentifier = ChainIdHelper.parse(
                    modularChainInfo.chainId
                  ).identifier;
                  const enabled =
                    enabledChainIdentifierMap.get(chainIdentifier) || false;

                  if (enabled) {
                    enablesSet.add(chainIdentifier);

                    if ("linkedChainKey" in modularChainInfo) {
                      enableLinkedChainKeys.add(
                        modularChainInfo.linkedChainKey
                      );
                    }
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

                    disablesSet.add(chainIdentifier);
                  }
                }

                // 페이지가 로드되었을 때 간혹 체인이 선택되어 있는 경우 또는 전체 선택을 눌렀을 때
                // 이 경우 바로 저장 버튼을 누르면 linkedChainKey에 대한 처리가 이루어지지 않아서
                // 일부만 활성화되는 경우가 있다. 따라서 linkedChainKey에 대한 처리를 먼저 한다.
                // disable로 분류되어 있더라도 활성화된 체인이면 활성화 처리해야 한다.
                for (const linkedChainKey of enableLinkedChainKeys) {
                  for (const modularChainInfo of chainStore.modularChainInfos) {
                    if (
                      "linkedChainKey" in modularChainInfo &&
                      modularChainInfo.linkedChainKey === linkedChainKey
                    ) {
                      const chainIdentifier = ChainIdHelper.parse(
                        modularChainInfo.chainId
                      ).identifier;
                      enablesSet.add(chainIdentifier);

                      if (disablesSet.has(chainIdentifier)) {
                        disablesSet.delete(chainIdentifier);
                      }
                    }
                  }
                }

                const enables = Array.from(enablesSet);
                const disables = Array.from(disablesSet);

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

                const isCosmosChainId = (chainId: string) => {
                  const modularChainInfo = chainStore.getModularChain(chainId);
                  if ("cosmos" in modularChainInfo) {
                    const chainInfo = chainStore.getChain(chainId);
                    const isEthermintLike =
                      chainInfo.bip44.coinType === 60 ||
                      !!chainInfo.features?.includes("eth-address-gen") ||
                      !!chainInfo.features?.includes("eth-key-sign");
                    return !isEthermintLike;
                  }
                  return false;
                };
                const isEthereumChainId = (chainId: string) => {
                  const modularChainInfo = chainStore.getModularChain(chainId);
                  if ("cosmos" in modularChainInfo) {
                    const chainInfo = chainStore.getChain(chainId);
                    const isEthermintLike =
                      chainInfo.bip44.coinType === 60 ||
                      !!chainInfo.features?.includes("eth-address-gen") ||
                      !!chainInfo.features?.includes("eth-key-sign");
                    return isEthermintLike;
                  }
                  return false;
                };
                const isStarknetChainId = (chainId: string) => {
                  const modularChainInfo = chainStore.getModularChain(chainId);
                  return "starknet" in modularChainInfo;
                };
                const isBitcoinChainId = (chainId: string) => {
                  const modularChainInfo = chainStore.getModularChain(chainId);
                  return "bitcoin" in modularChainInfo;
                };

                const ledgerEthereumAppNeeds: string[] = [];
                for (let i = 0; i < enables.length; i++) {
                  if (!fallbackEthereumLedgerApp) {
                    break;
                  }

                  const enable = enables[i];
                  if (isEthereumChainId(enable)) {
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

                const ledgerStarknetAppNeeds: string[] = [];
                for (let i = 0; i < enables.length; i++) {
                  if (!fallbackStarknetLedgerApp) {
                    break;
                  }

                  const enable = enables[i];
                  if (isStarknetChainId(enable)) {
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    ledgerStarknetAppNeeds.push(enable);
                  }
                }

                const ledgerBitcoinAppNeeds: string[] = [];
                for (let i = 0; i < enables.length; i++) {
                  if (!fallbackBitcoinLedgerApp) {
                    break;
                  }

                  const enable = enables[i];
                  if (isBitcoinChainId(enable)) {
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    ledgerBitcoinAppNeeds.push(enable);
                  }
                }

                // ledger 연결시, 각 생태계의 페이지에서 해당 생태계의 체인만을 활성화/비활성화 처리하도록 필터링하는 함수
                // ledger의 경우 최초 연결, needFinalizeCoinType 처리 시 cosmos 앱은 반드시 연결이 되어 있지만,
                // 다른 앱(Ethereum, Bitcoin 등)의 활성화/비활성화 여부는 불분명하므로 cosmos chain만 활성화/비활성화 처리한다.
                // 나머지 체인은 아래에서 ledger**AppNeeds를 통해 각 단계에서 처리된다.
                const filterChainIdsForLedger = (
                  chainIds: string[],
                  isEnable?: boolean
                ) => {
                  return chainIds.filter((chainId) => {
                    if (fallbackBitcoinLedgerApp) {
                      return isBitcoinChainId(chainId);
                    } else if (fallbackStarknetLedgerApp) {
                      return isStarknetChainId(chainId);
                    } else if (fallbackEthereumLedgerApp) {
                      return isEthereumChainId(chainId);
                    } else if (needFinalizeCoinType.length > 0 || isEnable) {
                      return isCosmosChainId(chainId);
                    }
                    return true;
                  });
                };

                await Promise.all([
                  (async () => {
                    const adjustedEnables =
                      keyType === "ledger"
                        ? filterChainIdsForLedger(enables, true)
                        : enables;
                    if (adjustedEnables.length > 0) {
                      await chainStore.enableChainInfoInUIWithVaultId(
                        vaultId,
                        ...adjustedEnables
                      );
                    }
                  })(),
                  (async () => {
                    const adjustedDisables =
                      keyType === "ledger"
                        ? filterChainIdsForLedger(disables)
                        : disables;
                    if (adjustedDisables.length > 0) {
                      await chainStore.disableChainInfoInUIWithVaultId(
                        vaultId,
                        ...adjustedDisables
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
                    if (fallbackBitcoinLedgerApp) {
                      if (ledgerBitcoinAppNeeds.length > 0) {
                        const keyInfo = keyRingStore.keyInfos.find(
                          (keyInfo) => keyInfo.id === vaultId
                        );

                        if (!keyInfo) {
                          throw new Error("KeyInfo not found");
                        }

                        const bip44Path = keyInfo.insensitive["bip44Path"] as {
                          account: number;
                          change: number;
                          addressIndex: number;
                        };
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }

                        const { mainnet, testnet } =
                          ledgerBitcoinAppNeeds.reduce<{
                            mainnet: {
                              derivationPath: string;
                              chainId: string;
                            }[];
                            testnet: {
                              derivationPath: string;
                              chainId: string;
                            }[];
                          }>(
                            (acc, chainId) => {
                              const modularChainInfo =
                                chainStore.getModularChain(chainId);
                              if (!("bitcoin" in modularChainInfo)) {
                                throw new Error("Bitcoin not found");
                              }

                              const { purpose, coinType } =
                                modularChainInfo.bitcoin.bip44;
                              if (!purpose) {
                                throw new Error("Purpose not found");
                              }

                              const derivationPath = `${purpose}'/${coinType}'/${bip44Path.account}'`;

                              return {
                                mainnet:
                                  coinType === 0
                                    ? [
                                        ...acc.mainnet,
                                        {
                                          derivationPath,
                                          chainId,
                                        },
                                      ]
                                    : acc.mainnet,
                                testnet:
                                  coinType === 1
                                    ? [
                                        ...acc.testnet,
                                        {
                                          derivationPath,
                                          chainId,
                                        },
                                      ]
                                    : acc.testnet,
                              };
                            },
                            {
                              mainnet: [],
                              testnet: [],
                            }
                          );

                        const hasMainnetExtendedKeys = mainnet.every((key) => {
                          const bitcoinKeys = keyInfo.insensitive[
                            "Bitcoin"
                          ] as any;
                          if (!bitcoinKeys) {
                            return false;
                          }
                          return (
                            !!bitcoinKeys[`m/${key.derivationPath}`] ||
                            !!bitcoinKeys[key.derivationPath]
                          );
                        });

                        const hasTestnetExtendedKeys = testnet.every((key) => {
                          const bitcoinKeys = keyInfo.insensitive[
                            "Bitcoin Test"
                          ] as any;
                          if (!bitcoinKeys) {
                            return false;
                          }
                          return (
                            !!bitcoinKeys[`m/${key.derivationPath}`] ||
                            !!bitcoinKeys[key.derivationPath]
                          );
                        });

                        if (hasMainnetExtendedKeys && hasTestnetExtendedKeys) {
                          await chainStore.enableChainInfoInUI(
                            ...ledgerBitcoinAppNeeds
                          );
                          dispatchGlobalEventExceptSelf(
                            "keplr_enabled_chain_changed",
                            keyInfo.id
                          );
                          replaceToWelcomePage();
                        } else if (!hasMainnetExtendedKeys) {
                          const bip44Path = keyInfo.insensitive["bip44Path"];
                          if (!bip44Path) {
                            throw new Error("bip44Path not found");
                          }

                          // 테스트넷 키가 존재하고, 메인넷 키가 존재하지 않으면 테스트넷을 먼저 활성화하고 메인넷 연결 페이지로 이동
                          if (hasTestnetExtendedKeys && testnet.length > 0) {
                            await chainStore.enableChainInfoInUI(
                              ...testnet.map((key) => key.chainId)
                            );
                            dispatchGlobalEventExceptSelf(
                              "keplr_enabled_chain_changed",
                              keyInfo.id
                            );
                          }

                          sceneTransition.push("connect-ledger", {
                            name: "",
                            password: "",
                            app: "Bitcoin",
                            bip44Path,

                            appendModeInfo: {
                              vaultId,
                              afterEnableChains: ledgerBitcoinAppNeeds,
                            },
                            stepPrevious: stepPrevious,
                            stepTotal: stepTotal,
                          });
                        } else if (!hasTestnetExtendedKeys) {
                          const bip44Path = keyInfo.insensitive["bip44Path"];
                          if (!bip44Path) {
                            throw new Error("bip44Path not found");
                          }

                          // 메인넷 키가 존재하고, 테스트넷 키가 존재하지 않으면 테스트넷을 먼저 활성화하고 메인넷 연결 페이지로 이동
                          if (hasMainnetExtendedKeys && mainnet.length > 0) {
                            await chainStore.enableChainInfoInUI(
                              ...mainnet.map((key) => key.chainId)
                            );
                            dispatchGlobalEventExceptSelf(
                              "keplr_enabled_chain_changed",
                              keyInfo.id
                            );
                          }

                          sceneTransition.push("connect-ledger", {
                            name: "",
                            password: "",
                            app: "Bitcoin Test",
                            bip44Path,

                            appendModeInfo: {
                              vaultId,
                              afterEnableChains: testnet.map(
                                (key) => key.chainId
                              ),
                            },
                            stepPrevious: stepPrevious,
                            stepTotal: stepTotal,
                          });
                        }
                      } else {
                        replaceToWelcomePage();
                      }
                    } else if (fallbackStarknetLedgerApp) {
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
                          sceneTransition.push("enable-chains", {
                            vaultId,
                            keyType,
                            candidateAddresses: [],
                            isFresh: false,
                            skipWelcome,
                            fallbackBitcoinLedgerApp: true,
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
                        sceneTransition.push("enable-chains", {
                          vaultId,
                          keyType,
                          candidateAddresses: [],
                          isFresh: false,
                          skipWelcome,
                          fallbackBitcoinLedgerApp: true,
                          stepPrevious: stepPrevious + 1,
                          stepTotal: stepTotal,
                        });
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

                // Amplitude Analytics
                try {
                  const enabledIds = Array.from(enablesSet);

                  const nonKcrChainCount = enabledIds.filter(
                    (id) => !embedChainIdentifierSet.has(id)
                  ).length;

                  const ecosystemCounts: {
                    cosmos: number;
                    evm: number;
                    starknet: number;
                    bitcoin: number;
                  } = {
                    cosmos: 0,
                    evm: 0,
                    starknet: 0,
                    bitcoin: 0,
                  };
                  const ecosystemMix: (keyof typeof ecosystemCounts)[] = [];

                  enabledIds.forEach((id) => {
                    let eco: keyof typeof ecosystemCounts = "cosmos";
                    const modularInfo = chainStore.getModularChain(id);

                    if ("bitcoin" in modularInfo) {
                      eco = "bitcoin";
                    } else if ("starknet" in modularInfo) {
                      eco = "starknet";
                    } else if ("cosmos" in modularInfo) {
                      const chainInfo = chainStore.getChain(id);
                      const isEthermintLike =
                        KeyRingService.isEthermintLike(chainInfo);
                      eco = isEthermintLike ? "evm" : "cosmos";
                    }

                    ecosystemCounts[eco] += 1;
                    if (!ecosystemMix.includes(eco)) {
                      ecosystemMix.push(eco);
                    }
                  });

                  analyticsAmplitudeStore.logEvent(
                    "save_enable_chains_btn_register",
                    {
                      durationMs: performance.now() - pageMountedAtRef.current,
                      enabledChainCount: enabledIds.length,
                      nonKcrChainCount,
                      ecosystemMix,
                      cosmosEnabledCount: ecosystemCounts.cosmos,
                      evmEnabledCount: ecosystemCounts.evm,
                      starknetEnabledCount: ecosystemCounts.starknet,
                      bitcoinEnabledCount: ecosystemCounts.bitcoin,
                    }
                  );

                  analyticsAmplitudeStore.setUserProperties({
                    enabled_chain_count: enabledIds.length,
                    non_kcr_chain_count: nonKcrChainCount,
                    ecosystem_mix: ecosystemMix,
                    cosmos_enabled_count: ecosystemCounts.cosmos,
                    evm_enabled_count: ecosystemCounts.evm,
                    starknet_enabled_count: ecosystemCounts.starknet,
                    bitcoin_enabled_count: ecosystemCounts.bitcoin,
                  });
                } catch (e) {
                  console.error(
                    "[Analytics] Failed to log save_enable_chains_btn_register",
                    e
                  );
                }
              }}
            />
          </div>

          {fallbackEthereumLedgerApp ||
          fallbackStarknetLedgerApp ||
          fallbackBitcoinLedgerApp ? (
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
                    : fallbackStarknetLedgerApp
                    ? sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType: "ledger",
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome: true,
                        fallbackBitcoinLedgerApp: true,
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

function useScrollDownWhenCantSeeSaveButton(
  ref: React.RefObject<HTMLDivElement>
) {
  useEffectOnce(() => {
    setTimeout(() => {
      checkButtonPositionAndScrollToButton(ref);
      // NOTE - the time is set arbitrarily to waiting for chains to be loaded
    }, 500);
  });
}
