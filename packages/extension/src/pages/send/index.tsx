import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../stores";
import { Stack } from "../../components/stack";
import { RecipientInput, AmountInput } from "../../components/input";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { Button } from "../../components/button";

export const SendPage: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const [searchParams] = useSearchParams();

  const coinMinimalDenom = searchParams.get("coinMinimalDenom");
  const chainId = searchParams.get("chainId");
  if (!coinMinimalDenom || !chainId) {
    // TODO: Route to token select page?
    throw new Error("Invalid params");
  }

  const currency = chainStore
    .getChain(chainId)
    .forceFindCurrency(coinMinimalDenom);

  const sender = accountStore.getAccount(
    chainStore.getChain(chainId).chainId
  ).bech32Address;

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

  // TODO: Use layout
  return (
    <Stack gutter="0.75rem">
      <form
        onSubmit={(e) => {
          e.preventDefault();

          accountStore
            .getAccount(chainId)
            .makeSendTokenTx(
              sendConfigs.amountConfig.amount[0].toDec().toString(),
              sendConfigs.amountConfig.amount[0].currency,
              sendConfigs.recipientConfig.recipient
            )
            .send(
              sendConfigs.feeConfig.toStdFee(),
              sendConfigs.memoConfig.memo
            );
        }}
      >
        <div>
          <div>Asset</div>
          <div>{balance.toString()}</div>
          <div>{currency.coinDenom}</div>
        </div>
        <RecipientInput recipientConfig={sendConfigs.recipientConfig} />
        <AmountInput amountConfig={sendConfigs.amountConfig} />
        <Button
          text="Send"
          disabled={(() => {
            if (
              sendConfigs.recipientConfig.uiProperties.error ||
              sendConfigs.amountConfig.uiProperties.error
            ) {
              return true;
            }

            if (
              sendConfigs.recipientConfig.uiProperties.loadingState ===
                "loading-block" ||
              sendConfigs.amountConfig.uiProperties.loadingState ===
                "loading-block"
            ) {
              return true;
            }
          })()}
        />
      </form>
    </Stack>
  );
});
