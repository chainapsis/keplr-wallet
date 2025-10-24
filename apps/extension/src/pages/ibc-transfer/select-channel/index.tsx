import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../../components/stack";
import { Body2, Subtitle3 } from "../../../components/typography";
import { TokenItem } from "../../main/components";
import { Box } from "../../../components/box";
import { useStore } from "../../../stores";
import { RecipientInput } from "../../../components/input";
import {
  IIBCChannelConfig,
  IMemoConfig,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { GuideBox } from "../../../components/guide-box";
import { Dropdown, DropdownItemProps } from "../../../components/dropdown";
import { Modal } from "../../../components/modal";
import { IBCAddChannelModal } from "../add-channel-modal";
import { Columns } from "../../../components/column";
import { CoinPretty } from "@keplr-wallet/unit";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";

export const IBCTransferSelectChannelView: FunctionComponent<{
  historyType: string;

  chainId: string;
  coinMinimalDenom: string;
  channelConfig: IIBCChannelConfig;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
}> = observer(
  ({
    historyType,
    chainId,
    coinMinimalDenom,
    channelConfig,
    recipientConfig,
    memoConfig,
  }) => {
    const { accountStore, chainStore, queriesStore, ibcChannelStore } =
      useStore();
    const navigate = useNavigate();
    const intl = useIntl();
    const theme = useTheme();

    if (channelConfig.channels.length > 1) {
      throw new Error("IBC channel config must have only one channel");
    }

    const [isOpenSelectChannel, setIsOpenSelectChannel] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState<
      string | undefined
    >(
      channelConfig.channels.length === 1
        ? channelConfig.channels[0].channelId
        : undefined
    );

    useEffect(() => {
      if (
        channelConfig.channels.length === 1 &&
        channelConfig.channels[0].channelId !== selectedChannelId
      ) {
        // channel이 다른 컴포넌트에서 바꼈을때를 대비해서
        // 여기서 selectedChannelId를 업데이트 해준다.
        setSelectedChannelId(channelConfig.channels[0].channelId);
      }
    }, [channelConfig.channels, selectedChannelId]);

    const sender = accountStore.getAccount(
      chainStore.getModularChainInfoImpl(chainId).chainId
    ).bech32Address;

    const currency = chainStore
      .getModularChainInfoImpl(chainId)
      .forceFindCurrency(coinMinimalDenom);

    const queryBalance = queriesStore
      .get(chainId)
      .queryBalances.getQueryBech32Address(sender)
      .getBalance(currency);

    return (
      <Box
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem">
          <Stack gutter="0.375rem">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-100"]
              }
            >
              <FormattedMessage id="page.ibc-transfer.select-channel.asset-title" />
            </Subtitle3>
            <TokenItem
              viewToken={{
                token: queryBalance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getModularChain(chainId),
                isFetching: queryBalance?.isFetching ?? true,
                error: queryBalance?.error,
              }}
              forChange
              onClick={() => {
                navigate(
                  `/send/select-asset?isIBCTransfer=true&navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/ibc-transfer?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            />
          </Stack>

          <Stack gutter="0.375rem">
            <Dropdown
              size="large"
              label={intl.formatMessage({
                id: "page.ibc-transfer.select-channel.destination-chain-label",
              })}
              menuContainerMaxHeight="10rem"
              items={ibcChannelStore
                .getTransferChannels(chainId)
                .filter((channel) =>
                  chainStore.hasModularChain(channel.counterpartyChainId)
                )
                .map((channel) => {
                  const chainInfo = chainStore.getChain(
                    channel.counterpartyChainId
                  );

                  return {
                    key: channel.channelId,
                    label: `${chainInfo.chainName} (${channel.channelId})`,
                  } as DropdownItemProps;
                })
                .concat([
                  {
                    key: "add-channel",
                    label: (
                      <Columns sum={1} alignY="center" gutter="0.25rem">
                        <PlusFillIcon />
                        <Body2>
                          <FormattedMessage id="page.ibc-transfer.select-channel.new-ibc-channel-item" />
                        </Body2>
                      </Columns>
                    ),
                  },
                ])}
              placeholder={intl.formatMessage({
                id: "page.ibc-transfer.select-channel.destination-chain-placeholder",
              })}
              selectedItemKey={selectedChannelId}
              onSelect={(key) => {
                if (key === "add-channel") {
                  setIsOpenSelectChannel(true);
                } else {
                  const channel = ibcChannelStore
                    .getTransferChannels(chainId)
                    .find((channel) => channel.channelId === key);
                  if (channel) {
                    channelConfig.setChannels([channel]);
                    setSelectedChannelId(key);
                  } else {
                    channelConfig.setChannels([]);
                    setSelectedChannelId(undefined);
                  }
                }
              }}
              allowSearch={true}
            />
          </Stack>

          <RecipientInput
            historyType={historyType}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            permitAddressBookSelfKeyInfo={true}
            currency={currency}
          />
        </Stack>

        <div style={{ flex: 1 }} />
        <GuideBox
          color="warning"
          title={intl.formatMessage({
            id: "page.ibc-transfer.select-channel.warning-title",
          })}
          paragraph={intl.formatMessage({
            id: "page.ibc-transfer.select-channel.warning-paragraph",
          })}
        />

        <Modal
          isOpen={isOpenSelectChannel}
          align="center"
          close={() => setIsOpenSelectChannel(false)}
        >
          <IBCAddChannelModal
            chainId={chainId}
            close={() => setIsOpenSelectChannel(false)}
          />
        </Modal>
      </Box>
    );
  }
);

const PlusFillIcon: FunctionComponent = () => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2.375C5.51269 2.375 1.875 6.01269 1.875 10.5C1.875 14.9873 5.51269 18.625 10 18.625C14.4873 18.625 18.125 14.9873 18.125 10.5C18.125 6.01269 14.4873 2.375 10 2.375ZM10.625 8C10.625 7.65482 10.3452 7.375 10 7.375C9.65482 7.375 9.375 7.65482 9.375 8V9.875H7.5C7.15482 9.875 6.875 10.1548 6.875 10.5C6.875 10.8452 7.15482 11.125 7.5 11.125H9.375V13C9.375 13.3452 9.65482 13.625 10 13.625C10.3452 13.625 10.625 13.3452 10.625 13V11.125H12.5C12.8452 11.125 13.125 10.8452 13.125 10.5C13.125 10.1548 12.8452 9.875 12.5 9.875H10.625V8Z"
        fill="#72747B"
      />
    </svg>
  );
};
