import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import {
  Subtitle1,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  ArrowRightSolidIcon,
  FolderMinusIcon,
} from "../../../../components/icon";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../../components/transition";
import {
  ChainInfo,
  ModularChainInfo,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { isRunningInSidePanel } from "../../../../utils";
import { useGetSearchChains } from "../../../../hooks/use-get-search-chains";
import { LookingForChainItem } from "../looking-for-chains";
import { useSearch } from "../../../../hooks/use-search";
import { getChainSearchResultClickAnalyticsProperties } from "../../../../analytics-amplitude";
import { CoinPretty } from "@keplr-wallet/unit";
import { Column, Columns } from "../../../../components/column";
import { TextButton } from "../../../../components/button-text";
import { useBuySupportServiceInfos } from "../../../../hooks/use-buy-support-service-infos";
import { CopyAddressItem } from "../copy-address-item";

type Address = {
  modularChainInfo: ModularChainInfo;
  bech32Address?: string;
  ethereumAddress?: string;
  starknetAddress?: string;
  bitcoinAddress?: {
    bech32Address: string;
    paymentType: SupportedPaymentType;
  };
};

const addressSearchFields = [
  "modularChainInfo.chainName",
  "modularChainInfo.chainId",
  {
    key: "bech32Address",
    function: (item: Address) => {
      if (item.bech32Address) {
        const bech32Split = item.bech32Address.split("1");
        return bech32Split.length > 0 ? bech32Split[0] : "";
      }
      return "";
    },
  },
  {
    key: "modularChainInfo.currency.coinDenom",
    function: (item: Address) => {
      if (
        "cosmos" in item.modularChainInfo &&
        item.modularChainInfo.cosmos != null
      ) {
        const cosmosChainInfo = item.modularChainInfo.cosmos;
        if (cosmosChainInfo.stakeCurrency) {
          return CoinPretty.makeCoinDenomPretty(
            cosmosChainInfo.stakeCurrency.coinDenom
          );
        }
        if (cosmosChainInfo.currencies.length > 0) {
          const currency = cosmosChainInfo.currencies[0];
          if (!currency.coinMinimalDenom.startsWith("ibc/")) {
            return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
          }
        }
      } else if (
        "starknet" in item.modularChainInfo &&
        item.modularChainInfo.starknet != null
      ) {
        const starknetChainInfo = item.modularChainInfo.starknet;
        if (starknetChainInfo.currencies.length > 0) {
          return CoinPretty.makeCoinDenomPretty(
            starknetChainInfo.currencies[0].coinDenom
          );
        }
      } else if (
        "bitcoin" in item.modularChainInfo &&
        item.modularChainInfo.bitcoin != null
      ) {
        const bitcoinChainInfo = item.modularChainInfo.bitcoin;
        if (bitcoinChainInfo.currencies.length > 0) {
          return CoinPretty.makeCoinDenomPretty(
            bitcoinChainInfo.currencies[0].coinDenom
          );
        }
      }
      return "";
    },
  },
];

const chainSearchFields = [
  "chainInfo.chainName",
  "chainInfo.chainId",
  {
    key: "ethereum-and-bitcoin",
    function: (item: { chainInfo: ChainInfo | ModularChainInfo }) => {
      if (
        "starknet" in item.chainInfo ||
        item.chainInfo.chainName.toLowerCase().includes("ethereum")
      ) {
        return "eth";
      }
      if (
        "bitcoin" in item.chainInfo ||
        item.chainInfo.chainName.toLowerCase().includes("bitcoin")
      ) {
        return "btc";
      }
      return "";
    },
  },
];

export const CopyAddressScene: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    uiConfigStore,
    analyticsAmplitudeStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const runInSidePanel = isRunningInSidePanel();

  const searchRef = useFocusOnMount<HTMLInputElement>();
  const sceneTransition = useSceneTransition();
  const buySupportServiceInfos = useBuySupportServiceInfos();

  useSceneEvents({
    onDidVisible: () => {
      if (searchRef.current) {
        // XXX: Scene transition 컴포넌트가 최초 scene의 경우 onDidVisible를 발생 못시키는 문제가 있다.
        //      이 문제 때문에 그냥 mount일때와 onDidVisible일때 모두 focus를 준다.
        searchRef.current.focus();
      }
    },
  });

  // 북마크된 체인과 sorting을 위한 state는 분리되어있다.
  // 이걸 분리하지 않고 북마크된 체인은 무조건 올린다고 가정하면
  // 유저 입장에서 북마크 버튼을 누르는 순간 그 체인은 위로 올라가게 되고
  // 아래에 있던 체인의 경우는 유저가 보기에 갑자기 사라진 것처럼 보일 수 있고
  // 그게 아니더라도 추가적인 인터렉션을 위해서 스크롤이 필요해진다.
  // 이 문제를 해결하기 위해서 state가 분리되어있다.
  // 처음 시자할때는 북마크된 체인 기준으로 하고 이후에 북마크가 해제된 체인의 경우만 정렬 우선순위에서 뺀다.
  const [sortPriorities, setSortPriorities] = useState<
    Record<string, true | undefined>
  >(() => {
    if (!keyRingStore.selectedKeyInfo) {
      return {};
    }
    const res: Record<string, true | undefined> = {};
    for (const modularChainInfo of chainStore.modularChainInfosInUI) {
      if (
        uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          modularChainInfo.chainId
        )
      ) {
        res[ChainIdHelper.parse(modularChainInfo.chainId).identifier] = true;
      }
    }
    return res;
  });

  const addresses: Address[] = useMemo(() => {
    return chainStore.modularChainInfosInUI.map((modularChainInfo) => {
      const accountInfo = accountStore.getAccount(modularChainInfo.chainId);

      const bech32Address = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("eip155")) {
          return undefined;
        }

        return accountInfo.bech32Address;
      })();
      const ethereumAddress = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("injective")) {
          return undefined;
        }

        return accountInfo.hasEthereumHexAddress
          ? accountInfo.ethereumHexAddress
          : undefined;
      })();
      const starknetAddress = (() => {
        if (!("starknet" in modularChainInfo)) {
          return undefined;
        }

        return accountInfo.starknetHexAddress;
      })();

      const bitcoinAddress = (() => {
        if (!("bitcoin" in modularChainInfo)) {
          return undefined;
        }

        return accountInfo.bitcoinAddress;
      })();

      return {
        modularChainInfo,
        bech32Address,
        ethereumAddress,
        starknetAddress,
        bitcoinAddress,
      };
    });
  }, [chainStore.modularChainInfosInUI, accountStore]);

  const searchedAddresses = useSearch(addresses, search, addressSearchFields);

  const sortedAddresses = useMemo(() => {
    return searchedAddresses.sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(
        a.modularChainInfo.chainId
      ).identifier;
      const bChainIdentifier = ChainIdHelper.parse(
        b.modularChainInfo.chainId
      ).identifier;

      const aPriority = sortPriorities[aChainIdentifier];
      const bPriority = sortPriorities[bChainIdentifier];

      if (aPriority && bPriority) {
        return 0;
      }
      if (aPriority) {
        return -1;
      }
      if (bPriority) {
        return 1;
      }
      return 0;
    });
  }, [searchedAddresses, sortPriorities]);

  const [blockInteraction, setBlockInteraction] = useState(false);

  const initialLookingForChains = useMemo(
    () =>
      chainStore.groupedModularChainInfosInListUI.filter(
        (modularChainInfo) =>
          !chainStore.isEnabledChain(modularChainInfo.chainId)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainStore.groupedModularChainInfosInListUI]
  );

  const { searchedChainInfos } = useGetSearchChains({
    search,
    searchOption: "all",
    filterOption: "chain",
    initialChainInfos: initialLookingForChains,
    minSearchLength: 1,
  });

  const lookingForChains = useMemo(() => {
    let disabledChainInfos: (ChainInfo | ModularChainInfo)[] =
      searchedChainInfos.filter(
        (chainInfo) => !chainStore.isEnabledChain(chainInfo.chainId)
      );

    const disabledModularChainInfos =
      chainStore.groupedModularChainInfos.filter(
        (modularChainInfo) =>
          ("starknet" in modularChainInfo || "bitcoin" in modularChainInfo) &&
          !chainStore.isEnabledChain(modularChainInfo.chainId)
      );

    disabledChainInfos = [
      ...new Set([...disabledChainInfos, ...disabledModularChainInfos]),
    ].sort((a, b) => a.chainName.localeCompare(b.chainName));

    return disabledChainInfos.reduce(
      (acc, chainInfo) => {
        let embedded: boolean | undefined = false;
        let stored: boolean = true;

        const isModular = "starknet" in chainInfo || "bitcoin" in chainInfo;

        try {
          if (isModular) {
            embedded = true;
          } else {
            const chainInfoInStore = chainStore.getChain(chainInfo.chainId);

            if (!chainInfoInStore) {
              stored = false;
            } else {
              if (chainInfoInStore.hideInUI) {
                return acc;
              }

              stored = true;
              embedded = chainInfoInStore.embedded?.embedded;
            }
          }
        } catch (e) {
          // got an error while getting chain info
          embedded = undefined;
          stored = false;
        }

        const chainItem = {
          embedded: !!embedded,
          stored,
          chainInfo,
        };

        acc.push(chainItem);

        return acc;
      },
      [] as {
        embedded: boolean;
        stored: boolean;
        chainInfo: ChainInfo | ModularChainInfo;
      }[]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedChainInfos, chainStore, chainStore.modularChainInfosInUI]);

  const searchedLookingForChains = useSearch(
    lookingForChains,
    search,
    chainSearchFields
  );

  const hasAddresses = sortedAddresses.length > 0;
  const hasLookingForChains = searchedLookingForChains.length > 0;
  const isShowNoResult = !(hasAddresses || hasLookingForChains);

  return (
    <Box
      paddingTop="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      height={runInSidePanel ? "70vh" : undefined}
    >
      <Columns sum={1} style={{ padding: "0 1rem" }} alignY="center">
        <Gutter size="0.5rem" />
        <Subtitle1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette.white
          }
        >
          <FormattedMessage id="page.main.components.deposit-modal.title" />
        </Subtitle1>
        <Column weight={1} />
        <TextButton
          text={intl.formatMessage({
            id: "page.main.components.deposit-modal.buy-crypto-button",
          })}
          color="blue"
          onClick={() => {
            sceneTransition.push("buy-crypto", {
              buySupportServiceInfos,
              showBackButton: true,
            });
          }}
          right={
            <ArrowRightSolidIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["blue-400"]}
            />
          }
          style={{
            margin: "0.5rem -0.75rem",
          }}
        />
      </Columns>

      <Gutter size="0.75rem" />

      <Box paddingX="0.75rem">
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder={intl.formatMessage({
            id: "page.main.components.deposit-modal.search-placeholder",
          })}
        />
      </Box>

      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: runInSidePanel ? "" : "21.5rem",
        }}
      >
        {isShowNoResult && <NoResultBox />}

        <Box paddingX="0.75rem">
          {sortedAddresses
            .map((address) => {
              // CopyAddressItem 컴포넌트는 ethereumAddress가 있냐 없냐에 따라서 다르게 동작한다.
              // ethereumAddress가 있으면 두개의 CopyAddressItem 컴포넌트를 각각 렌더링하기 위해서
              // ethereumAddress가 있으면 두개의 address로 쪼개서 리턴하고 flat으로 펼져서 렌더링한다.
              if (address.ethereumAddress && address.bech32Address) {
                return [
                  {
                    modularChainInfo: address.modularChainInfo,
                    bech32Address: address.bech32Address,
                  },
                  {
                    ...address,
                  },
                ];
              }

              return address;
            })
            .flat()
            .map((address, index) => {
              return (
                <CopyAddressItem
                  key={
                    ChainIdHelper.parse(address.modularChainInfo.chainId)
                      .identifier +
                    address.bech32Address +
                    (address.ethereumAddress || "") +
                    (address.bitcoinAddress?.bech32Address || "")
                  }
                  address={address}
                  close={close}
                  blockInteraction={blockInteraction}
                  setBlockInteraction={setBlockInteraction}
                  setSortPriorities={setSortPriorities}
                  onClick={() => {
                    if (search.trim().length > 0) {
                      analyticsAmplitudeStore.logEvent(
                        "click_copy_address_item_search_results_deposit_modal",
                        getChainSearchResultClickAnalyticsProperties(
                          address.modularChainInfo.chainName,
                          search,
                          sortedAddresses.map(
                            (address) => address.modularChainInfo.chainName
                          ),
                          index
                        )
                      );
                    }
                  }}
                />
              );
            })}
        </Box>

        {hasAddresses && hasLookingForChains && <Gutter size="1.25rem" />}
        {hasLookingForChains && (
          <Box paddingX="0.75rem">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.main.components.deposit-modal.look-for-chains" />
            </Subtitle4>
            {searchedLookingForChains.map((chainData, index) => {
              return (
                <React.Fragment key={chainData.chainInfo.chainId}>
                  <Gutter size="0.75rem" />
                  <LookingForChainItem
                    chainInfo={chainData.chainInfo}
                    stored={chainData.stored}
                    embedded={chainData.embedded}
                    onClick={() => {
                      if (search.trim().length > 0) {
                        analyticsAmplitudeStore.logEvent(
                          "click_looking_for_chain_search_results_deposit_modal",
                          getChainSearchResultClickAnalyticsProperties(
                            chainData.chainInfo.chainName,
                            search,
                            searchedLookingForChains.map(
                              (chain) => chain.chainInfo.chainName
                            ),
                            index
                          )
                        );
                      }
                    }}
                  />
                </React.Fragment>
              );
            })}
          </Box>
        )}
        <Gutter size="0.75rem" />
      </SimpleBar>
    </Box>
  );
});

const NoResultBox: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <Box alignX="center" alignY="center" paddingY="1.875rem">
      <FolderMinusIcon
        width="4.5rem"
        height="4.5rem"
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
      />
      <Gutter size="0.75rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
        style={{
          textAlign: "center",
          width: "17.25rem",
        }}
      >
        <FormattedMessage id="page.main.components.deposit-modal.empty-text" />
      </Subtitle3>
    </Box>
  );
};
