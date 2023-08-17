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
import { Body3, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { IIBCChannelConfig, IRecipientConfig } from "@keplr-wallet/hooks";
import { ChainImageFallback } from "../../../../components/image";
import { XAxis, YAxis } from "../../../../components/axis";
import { FormattedMessage, useIntl } from "react-intl";
import { EmptyView } from "../../../../components/empty-view";
import { HomeIcon } from "../../../../components/icon";
import { WalletStatus } from "@keplr-wallet/stores";

export const IBCTransferSelectDestinationModal: FunctionComponent<{
  chainId: string;
  denom: string;
  recipientConfig: IRecipientConfig;
  ibcChannelConfig: IIBCChannelConfig;
  setIsIBCTransfer: (value: boolean) => void;
  setAutomaticRecipient: (address: string) => void;
  close: () => void;
}> = observer(
  ({
    chainId,
    denom,
    recipientConfig,
    ibcChannelConfig,
    setIsIBCTransfer,
    setAutomaticRecipient,
    close,
  }) => {
    const { accountStore, chainStore, skipQueriesStore } = useStore();

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
          {filteredChannels.length === 0 ? (
            <React.Fragment>
              <Gutter size="6rem" direction="vertical" />
              <EmptyView>
                <Subtitle3>
                  <FormattedMessage id="page.send.amount.ibc-transfer.modal.no-search-data" />
                </Subtitle3>
              </EmptyView>
            </React.Fragment>
          ) : null}
          {filteredChannels
            .sort((a, b) => {
              const aIsToOrigin = a.destinationChainId === a.originChainId;
              const bIsToOrigin = b.destinationChainId === b.originChainId;

              if (aIsToOrigin && !bIsToOrigin) {
                return -1;
              }

              if (!aIsToOrigin && bIsToOrigin) {
                return 1;
              }

              return 0;
            })
            .map((channel) => {
              const isToOrigin =
                channel.destinationChainId === channel.originChainId;

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
                      const lastChainId =
                        channel.channels[channel.channels.length - 1]
                          .counterpartyChainId;

                      const account = accountStore.getAccount(lastChainId);

                      if (account.walletStatus === WalletStatus.NotInit) {
                        await account.init();
                      }

                      setIsIBCTransfer(true);
                      ibcChannelConfig.setChannels(channel.channels);
                      // ledger에서 evmos, injective같은 경우는 유저가 먼저 ethereum app을 init 해놓지 않으면 주소를 가져올 수 없음.
                      // 이런 경우 때문에 채널은 무조건 설정해주고 account는 loaded됐을때만 주소를 설정한다.
                      if (account.walletStatus === WalletStatus.Loaded) {
                        recipientConfig.setValue(account.bech32Address);
                        setAutomaticRecipient(account.bech32Address);
                      }
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
                    <YAxis>
                      <Subtitle2
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-600"]
                            : ColorPalette["gray-10"]
                        }
                      >
                        {chainInfo.chainName}
                      </Subtitle2>
                      {isToOrigin ? (
                        <React.Fragment>
                          <Gutter size="0.25rem" />
                          <XAxis alignY="center">
                            <Body3
                              color={
                                theme.mode === "light"
                                  ? ColorPalette["gray-300"]
                                  : ColorPalette["gray-200"]
                              }
                            >
                              <FormattedMessage id="page.send.amount.ibc-transfer.modal.origin-chain" />
                            </Body3>
                            <Gutter size="0.25rem" />
                            <HomeIcon
                              width="1rem"
                              height="1rem"
                              color={
                                theme.mode === "light"
                                  ? ColorPalette["gray-300"]
                                  : ColorPalette["gray-200"]
                              }
                            />
                          </XAxis>
                        </React.Fragment>
                      ) : null}
                    </YAxis>
                  </XAxis>
                </Box>
              );
            })}
        </SimpleBar>
      </Box>
    );
  }
);
