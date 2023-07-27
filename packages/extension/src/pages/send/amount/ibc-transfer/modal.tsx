import React, { FunctionComponent, useState } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { SearchTextInput } from "../../../../components/input";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Gutter } from "../../../../components/gutter";
import SimpleBar from "simplebar-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Subtitle2 } from "../../../../components/typography";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";
import { ChainImageFallback } from "../../../../components/image";
import { XAxis } from "../../../../components/axis";
import { useIntl } from "react-intl";

export const IBCTransferSelectDestinationModal: FunctionComponent<{
  chainId: string;
  denom: string;
  ibcChannelConfig: IIBCChannelConfig;
  setIsIBCTransfer: (value: boolean) => void;
  close: () => void;
}> = observer(
  ({ chainId, denom, ibcChannelConfig, setIsIBCTransfer, close }) => {
    const { chainStore, skipQueriesStore } = useStore();

    const theme = useTheme();
    const intl = useIntl();

    const channels =
      skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
        chainId,
        denom
      );

    const [search, setSearch] = useState("");

    const searchRef = useFocusOnMount<HTMLInputElement>();

    const filteredChannels = channels.filter((c) => {
      const chainInfo = chainStore.getChain(c.destinationChainId);
      return chainInfo.chainName
        .trim()
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    });

    return (
      <Box
        width="100%"
        paddingTop="1.25rem"
        paddingX="0.75rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
        style={{
          overflowY: "auto",
        }}
      >
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder={intl.formatMessage({
            id: "page.send.amount.ibc-transfer.modal.search-placeholder",
          })}
        />

        <Gutter size="0.75rem" />

        <SimpleBar
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            height: "21.5rem",
          }}
        >
          {filteredChannels.map((channel) => {
            const chainInfo = chainStore.getChain(channel.destinationChainId);

            return (
              <Box
                key={chainInfo.chainId}
                height="4.125rem"
                alignY="center"
                paddingX="1rem"
                hover={{
                  backgroundColor:
                    theme.mode === "light"
                      ? ColorPalette["gray-10"]
                      : ColorPalette["gray-550"],
                }}
                borderRadius="0.375rem"
                cursor="pointer"
                onClick={async (e) => {
                  e.preventDefault();

                  if (channel.channels.length > 0) {
                    setIsIBCTransfer(true);
                    ibcChannelConfig.setChannels(channel.channels);
                    close();
                  } else {
                    close();
                  }
                }}
              >
                <XAxis alignY="center">
                  <ChainImageFallback
                    style={{
                      width: "2rem",
                      height: "2rem",
                    }}
                    src={chainInfo.chainSymbolImageUrl}
                    alt="chain image"
                  />
                  <Gutter size="0.75rem" />
                  <Subtitle2
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-600"]
                        : ColorPalette["gray-10"]
                    }
                  >
                    {chainInfo.chainName}
                  </Subtitle2>
                </XAxis>
              </Box>
            );
          })}
        </SimpleBar>
      </Box>
    );
  }
);
