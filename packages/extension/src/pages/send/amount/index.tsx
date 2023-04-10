import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import {
  AmountInput,
  RecipientInput,
  TextInput,
} from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Button } from "../../../components/button";
import { Subtitle3 } from "../../../components/typography";
import { TransactionFee } from "../../../components/transaction-fee";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SendAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const coinMinimalDenom = searchParams.get("coinMinimalDenom");
  const chainId = searchParams.get("chainId");

  if (!coinMinimalDenom || !chainId) {
    navigate("/send/select-asset");
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

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    300000
  );

  return (
    <HeaderLayout title="Send" left={<BackButton />}>
      <Styles.Container gutter="0.75rem">
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

        <RecipientInput recipientConfig={sendConfigs.recipientConfig} />

        <AmountInput amountConfig={sendConfigs.amountConfig} />

        <TextInput
          label="Memo"
          placeholder="Required for sending to centralized exchanges"
        />

        <Styles.Flex1 />

        <TransactionFee />

        <Styles.BottomButton>
          <Button text="Go to Sign" color="primary" size="large" />
        </Styles.BottomButton>
      </Styles.Container>
    </HeaderLayout>
  );
});
