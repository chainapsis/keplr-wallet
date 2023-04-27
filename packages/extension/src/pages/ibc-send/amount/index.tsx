import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import { Stack } from "../../../components/stack";
import { Subtitle3 } from "../../../components/typography";
import { TokenItem } from "../../main/components";
import { Box } from "../../../components/box";
import { AmountInput } from "../../../components/input";
import { useIBCTransferConfig } from "@keplr-wallet/hooks";
import { MemoInput } from "../../../components/input/memo-input";

export const IBCSendAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, uiConfigStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
        text: "Go to sign",
        size: "large",
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

          <AmountInput amountConfig={ibcTransferConfigs.amountConfig} />

          <MemoInput memoConfig={ibcTransferConfigs.memoConfig} />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
