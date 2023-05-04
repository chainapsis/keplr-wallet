import React, { FunctionComponent, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  useGasSimulator,
  useSendTxConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { AmountInput, RecipientInput } from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { MemoInput } from "../../../components/input/memo-input";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { FeeControl } from "../../../components/input/fee-control";
import { useNotification } from "../../../hooks/notification";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SendAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const paramChainId = searchParams.get("chainId");
  const paramCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = paramChainId || chainStore.chainInfosInUI[0].chainId;
  const coinMinimalDenom =
    paramCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

  useEffect(() => {
    if (!paramChainId || !paramCoinMinimalDenom) {
      navigate("/send/select-asset");
    }
  }, [navigate, paramChainId, paramCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;

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

  const gasSimulatorKey = useMemo(() => {
    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );

      if (denomHelper.type !== "native") {
        if (denomHelper.type === "cw20") {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return denomHelper.type;
      }
    }

    return "native";
  }, [sendConfigs.amountConfig.currency]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulator.forceDisable(
        new Error("Simulating secret20 is not supported")
      );
      sendConfigs.gasConfig.setValue(
        // TODO: 이 값을 config 밑으로 빼자
        250000
      );
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [gasSimulator, sendConfigs.amountConfig.currency, sendConfigs.gasConfig]);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  return (
    <HeaderLayout
      title="Send"
      left={<BackButton />}
      bottomButton={{
        disabled: txConfigsValidate.interactionBlocked,
        text: "Go to Sign",
        color: "primary",
        size: "large",
        isLoading: accountStore.getAccount(chainId).isSendingMsg === "send",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!txConfigsValidate.interactionBlocked) {
          try {
            await accountStore
              .getAccount(chainId)
              .makeSendTokenTx(
                sendConfigs.amountConfig.amount[0].toDec().toString(),
                sendConfigs.amountConfig.amount[0].currency,
                sendConfigs.recipientConfig.recipient
              )
              .send(
                sendConfigs.feeConfig.toStdFee(),
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      const log = tx.log ?? tx.raw_log;
                      notification.show("failed", "Transaction Failed", log);
                      return;
                    }
                    notification.show("success", "Transaction Success", "");
                  },
                }
              );

            navigate("/", {
              replace: true,
            });
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }

            console.log(e);
            notification.show(
              "failed",
              "Transaction Failed",
              e.message || e.toString()
            );
            navigate("/", {
              replace: true,
            });
          }
        }
      }}
    >
      <Box paddingX="0.75rem" paddingBottom="0.75rem">
        <Stack gutter="0.75rem">
          <YAxis>
            <Subtitle3>Asset</Subtitle3>
            <Gutter size="0.375rem" />
            <TokenItem
              viewToken={{
                token: balance,
                chainInfo: chainStore.getChain(chainId),
              }}
              forChange
            />
          </YAxis>

          <RecipientInput
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
          />

          <AmountInput amountConfig={sendConfigs.amountConfig} />

          <MemoInput
            memoConfig={sendConfigs.memoConfig}
            placeholder="Required for sending to centralized exchanges"
          />

          <Styles.Flex1 />

          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            gasSimulator={gasSimulator}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
