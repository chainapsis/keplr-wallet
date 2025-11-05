import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Subtitle3 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { FolderMinusIcon } from "../../../../components/icon";
import { useSceneEvents } from "../../../../components/transition";
import { getChainSearchResultClickAnalyticsProperties } from "../../../../analytics-amplitude";
import { CopyAddressItem } from "../copy-address-item";
import { useGetAddressesOnCopyAddress } from "../../hooks/use-get-addresses-copy-address";

export const CopyAddressSceneForFloatModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { analyticsAmplitudeStore } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const searchRef = useFocusOnMount<HTMLInputElement>();

  useSceneEvents({
    onDidVisible: () => {
      if (searchRef.current) {
        // XXX: Scene transition 컴포넌트가 최초 scene의 경우 onDidVisible를 발생 못시키는 문제가 있다.
        //      이 문제 때문에 그냥 mount일때와 onDidVisible일때 모두 focus를 준다.
        searchRef.current.focus();
      }
    },
  });

  const [blockInteraction, setBlockInteraction] = useState(false);
  const { sortedAddresses, setSortPriorities } =
    useGetAddressesOnCopyAddress(search);

  const hasAddresses = sortedAddresses.length > 0;
  const isShowNoResult = !hasAddresses;

  return (
    <Box
      paddingTop="1rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-650"]
      }
    >
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
          height: "21.5rem",
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
                  hoverColor={
                    theme.mode === "light"
                      ? ColorPalette["gray-75"]
                      : ColorPalette["gray-600"]
                  }
                />
              );
            })}
        </Box>
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
