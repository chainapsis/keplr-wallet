import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Subtitle1, Subtitle4 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ArrowRightSolidIcon } from "../../../../components/icon";
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
import { Column, Columns } from "../../../../components/column";
import { TextButton } from "../../../../components/button-text";
import { useBuySupportServiceInfos } from "../../../../hooks/use-buy-support-service-infos";
import { useGetAddressesOnCopyAddress } from "../../hooks/use-get-addresses-copy-address";
import { NoResultBox } from "../deposit-modal-no-search-box";
import { CopyAddressItemList } from "../copy-address-item/copy-address-item-list";

export type Address = {
  modularChainInfo: ModularChainInfo;
  bech32Address?: string;
  ethereumAddress?: string;
  starknetAddress?: string;
  bitcoinAddress?: {
    bech32Address: string;
    paymentType: SupportedPaymentType;
  };
};

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
  const { chainStore, analyticsAmplitudeStore } = useStore();

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

  const { sortedAddresses, setSortPriorities } =
    useGetAddressesOnCopyAddress(search);

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

        <CopyAddressItemList
          sortedAddresses={sortedAddresses}
          close={close}
          blockInteraction={blockInteraction}
          setBlockInteraction={setBlockInteraction}
          setSortPriorities={setSortPriorities}
          search={search}
          onClickIcon={(address: Address) => {
            sceneTransition.push("qr-code", {
              chainId: address.modularChainInfo.chainId,
              address:
                address.starknetAddress ||
                address.ethereumAddress ||
                address.bech32Address ||
                address.bitcoinAddress?.bech32Address,
              close,
            });
          }}
        />

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
