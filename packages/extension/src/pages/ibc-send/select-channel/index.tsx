import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Stack } from "../../../components/stack";
import { Subtitle3 } from "../../../components/typography";
import { TokenItem } from "../../main/components";
import { Box } from "../../../components/box";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { RecipientInput } from "../../../components/input";
import { useIBCTransferConfig } from "@keplr-wallet/hooks";
import { GuideBox } from "../../../components/guide-box";
import { ColorPalette } from "../../../styles";
import { Dropdown } from "../../../components/dropdown";
import { Modal } from "../../../components/modal";
import { IBCAddChannelModal } from "../add-channel-modal";

export const IBCSendSelectChannelPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, uiConfigStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isOpenSelectChannel, setIsOpenSelectChannel] = useState(false);

  const coinMinimalDenom = searchParams.get("coinMinimalDenom");
  const chainId = searchParams.get("chainId");

  if (!coinMinimalDenom || !chainId) {
    navigate(-1);
    return null;
  }

  const sender = accountStore.getAccount(
    chainStore.getChain(chainId).chainId
  ).bech32Address;

  const currency = chainStore
    .getChain(chainId)
    .forceFindCurrency(coinMinimalDenom);

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(sender)
    .getBalanceFromCurrency(currency);

  const accountInfo = accountStore.getAccount(chainId);

  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    chainStore.getChain(chainId).chainId,
    accountInfo.bech32Address,
    // TODO: 이 값을 config 밑으로 빼자
    300000,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );

  return (
    <HeaderLayout
      title="IBC Send"
      left={<BackButton />}
      bottomButton={{
        text: "Next",
        size: "large",
        onClick: () =>
          navigate(
            `/ibc-send/amount?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
          ),
      }}
    >
      <Box paddingX="0.75rem">
        <Stack gutter="0.75rem">
          <Stack gutter="0.375rem">
            <Subtitle3>Asset</Subtitle3>
            <TokenItem
              viewToken={{
                token: balance,
                chainInfo: chainStore.getChain(chainId),
              }}
              forChange
            />
          </Stack>

          <Stack gutter="0.375rem">
            <Subtitle3 color={ColorPalette["gray-100"]}>
              Destination Chain
            </Subtitle3>

            <Dropdown
              size="large"
              items={[{ key: "add-channel", label: "Add" }]}
              placeholder="Select Chain"
              onSelect={(key) => {
                if (key === "add-channel") {
                  setIsOpenSelectChannel(true);
                }
              }}
            />
          </Stack>

          <RecipientInput
            recipientConfig={ibcTransferConfigs.recipientConfig}
            memoConfig={ibcTransferConfigs.memoConfig}
          />

          <GuideBox
            color="danger"
            title=" Most of the centralized exchanges do not support IBC transfers"
            paragraph="We advise you not to perform IBC transfers to these exchanges, as your assets may be lost. Please check with the exchange's policies before initiating any IBC transfers. "
          />
        </Stack>

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
    </HeaderLayout>
  );
});
