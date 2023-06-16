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

    const ibcChannelInfo = ibcChannelStore.get(chainId);

    const [isOpenSelectChannel, setIsOpenSelectChannel] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState<
      string | undefined
    >(channelConfig.channel?.channelId);

    useEffect(() => {
      if (channelConfig.channel?.channelId !== selectedChannelId) {
        // channel이 다른 컴포넌트에서 바꼈을때를 대비해서
        // 여기서 selectedChannelId를 업데이트 해준다.
        setSelectedChannelId(channelConfig.channel?.channelId);
      }
    }, [channelConfig.channel?.channelId, selectedChannelId]);

    const sender = accountStore.getAccount(
      chainStore.getChain(chainId).chainId
    ).bech32Address;

    const currency = chainStore
      .getChain(chainId)
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
            <Subtitle3>Asset</Subtitle3>
            <TokenItem
              viewToken={{
                token: queryBalance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: queryBalance?.isFetching ?? true,
                error: queryBalance?.error,
              }}
              forChange
              onClick={() => navigate(`/send/select-asset?isIBCTransfer=true`)}
            />
          </Stack>

          <Stack gutter="0.375rem">
            <Dropdown
              size="large"
              label="Destination Chain"
              menuContainerMaxHeight="10rem"
              items={ibcChannelInfo
                .getTransferChannels()
                .filter((channel) =>
                  chainStore.hasChain(channel.counterpartyChainId)
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
                        <PlusFillIcon /> <Body2>New IBC Transfer Channel</Body2>
                      </Columns>
                    ),
                  },
                ])}
              placeholder="Select Chain"
              selectedItemKey={selectedChannelId}
              onSelect={(key) => {
                if (key === "add-channel") {
                  setIsOpenSelectChannel(true);
                } else {
                  const channel = ibcChannelInfo
                    .getTransferChannels()
                    .find((channel) => channel.channelId === key);
                  if (channel) {
                    channelConfig.setChannel(channel);
                    setSelectedChannelId(key);
                  } else {
                    channelConfig.setChannel(undefined);
                    setSelectedChannelId(undefined);
                  }
                }
              }}
            />
          </Stack>

          <RecipientInput
            historyType={historyType}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            permitAddressBookSelfKeyInfo={true}
          />
        </Stack>

        <div style={{ flex: 1 }} />
        <GuideBox
          color="danger"
          title=" Most of the centralized exchanges do not support IBC transfers"
          paragraph="We advise you not to perform IBC transfers to these exchanges, as your assets may be lost. Please check with the exchange's policies before initiating any IBC transfers. "
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
