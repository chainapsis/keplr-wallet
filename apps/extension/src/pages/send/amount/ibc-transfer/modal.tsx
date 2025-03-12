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
import { IBCChannel, NoneIBCBridgeInfo } from "@keplr-wallet/stores-internal";
import { AppCurrency } from "@keplr-wallet/types";
import { SendType } from "..";
import { DenomHelper } from "@keplr-wallet/common";

export const IBCTransferSelectDestinationModal: FunctionComponent<{
  chainId: string;
  denom: string;
  recipientConfig: IRecipientConfig;
  recipientConfigForBridge: IRecipientConfig;
  ibcChannelConfig: IIBCChannelConfig;
  setSendType: (value: SendType) => void;
  close: () => void;
  setDestinationChainInfoOfBridge: (value: {
    chainId: string;
    currency: AppCurrency;
  }) => void;
  // 이 컴포넌트는 사실 send page에서만 쓰이기 때문에 사용하는 쪽에서 필요한 로직을 위해서 몇몇 이상한(?) prop을 넘겨준다.
  // setAutomaticRecipient는 send page에서 recipient가 자동으로 설정되었을때 유저에게 UI를 보여주기 위해서 필요하다.
  setAutomaticRecipient: (address: string) => void;
  // setIBCChannelsInfoFluent는 send page에서 analytics로 넘길 정보를 전달하기 위해서 필요하다.
  setIBCChannelsInfoFluent: (channel: {
    destinationChainId: string;
    originDenom: string;
    originChainId: string;

    channels: {
      portId: string;
      channelId: string;

      counterpartyChainId: string;
    }[];
  }) => void;
}> = observer(
  ({
    chainId,
    denom,
    recipientConfig,
    recipientConfigForBridge,
    ibcChannelConfig,
    setSendType,
    close,
    setAutomaticRecipient,
    setIBCChannelsInfoFluent,
    setDestinationChainInfoOfBridge,
  }) => {
    const { accountStore, chainStore, skipQueriesStore } = useStore();

    const theme = useTheme();
    const intl = useIntl();

    const bridgeInfos: (NoneIBCBridgeInfo | IBCChannel)[] =
      skipQueriesStore.queryIBCPacketForwardingTransfer.getBridges(
        chainId,
        denom
      );

    const channels =
      skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
        chainId,
        denom
      );

    const bridgeOrIBCList = bridgeInfos.concat(channels).sort((a, b) => {
      // Sort by chain name.
      return chainStore
        .getChain(a.destinationChainId)
        .chainName.trim()
        .localeCompare(
          chainStore.getChain(b.destinationChainId).chainName.trim()
        );
    });

    const [search, setSearch] = useState("");

    const searchRef = useFocusOnMount<HTMLInputElement>();

    const filteredChannels = bridgeOrIBCList.filter((c) => {
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
              const isIBCChainOfA = "originChainId" in a;
              const isIBCChainOfB = "originChainId" in b;

              const aIsToOrigin = isIBCChainOfA
                ? a.destinationChainId === a.originChainId
                : false;
              const bIsToOrigin = isIBCChainOfB
                ? b.destinationChainId === b.originChainId
                : false;

              if (aIsToOrigin && !bIsToOrigin) {
                return -1;
              }

              if (!aIsToOrigin && bIsToOrigin) {
                return 1;
              }

              return 0;
            })
            .map((bridgeOrChannel) => {
              const isIBCChain = "originChainId" in bridgeOrChannel;
              const isToOrigin = isIBCChain
                ? bridgeOrChannel.destinationChainId ===
                  bridgeOrChannel.originChainId
                : false;

              const chainInfo = chainStore.getChain(
                bridgeOrChannel.destinationChainId
              );

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

                    const isIBCChain = "channels" in bridgeOrChannel;

                    if (!isIBCChain) {
                      const isEVMOnlyChain = chainStore.isEvmOnlyChain(
                        bridgeOrChannel.destinationChainId
                      );
                      const isEvmChain = chainStore.isEvmChain(chainId);

                      const sendingDenomHelper = new DenomHelper(
                        bridgeOrChannel.denom
                      );
                      const isERC20 = sendingDenomHelper.type === "erc20";

                      const isDestinationEvmAddress =
                        isEVMOnlyChain || (isERC20 && isEvmChain);

                      const account = accountStore.getAccount(
                        bridgeOrChannel.destinationChainId
                      );

                      if (account.walletStatus === WalletStatus.NotInit) {
                        await account.init();
                      }

                      setDestinationChainInfoOfBridge({
                        chainId: bridgeOrChannel.destinationChainId,
                        currency: chainInfo.forceFindCurrency(
                          bridgeOrChannel.denom
                        ),
                      });
                      setSendType("bridge");

                      if (isDestinationEvmAddress) {
                        recipientConfigForBridge.setValue(
                          account.ethereumHexAddress
                        );
                        setAutomaticRecipient(account.ethereumHexAddress);
                      } else {
                        recipientConfigForBridge.setValue(
                          account.bech32Address
                        );
                        setAutomaticRecipient(account.bech32Address);
                      }
                      close();
                      return;
                    }

                    if (bridgeOrChannel.channels.length > 0) {
                      const lastChainId =
                        bridgeOrChannel.channels[
                          bridgeOrChannel.channels.length - 1
                        ].counterpartyChainId;

                      const account = accountStore.getAccount(lastChainId);

                      if (account.walletStatus === WalletStatus.NotInit) {
                        await account.init();
                      }

                      setSendType("ibc-transfer");
                      ibcChannelConfig.setChannels(bridgeOrChannel.channels);
                      setIBCChannelsInfoFluent(bridgeOrChannel);
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
                    <ChainImageFallback chainInfo={chainInfo} size="2rem" />
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
