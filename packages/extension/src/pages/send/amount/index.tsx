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
import { ICNSInfo } from "../../../config.ui";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SendTxAndRecordMsg } from "@keplr-wallet/background";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SendAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate("/send/select-asset");
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;

  const currency = chainStore
    .getChain(chainId)
    .forceFindCurrency(coinMinimalDenom);

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(sender)
    .getBalance(currency);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    300000,
    {
      allowHexAddressOnEthermint: true,
      icns: ICNSInfo,
      computeTerraClassicTax: true,
    }
  );

  sendConfigs.amountConfig.setCurrency(currency);

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

  useEffectOnce(() => {
    const initialAmountFraction = searchParams.get("initialAmountFraction");
    if (
      initialAmountFraction &&
      !Number.isNaN(parseFloat(initialAmountFraction))
    ) {
      sendConfigs.amountConfig.setFraction(
        Number.parseFloat(initialAmountFraction)
      );
    }
    const initialAmount = searchParams.get("initialAmount");
    if (initialAmount) {
      // AmountInput에는 price based 모드가 있다.
      // 하지만 이 state는 AmountInput Component에서 다뤄지므로 여기서 처리하기가 힘들다.
      // 어쨋든 처음에는 non price mode로 시작히므로 이렇게 해도 큰 문제는 없다.
      // TODO: 나중에 해결한다.
      sendConfigs.amountConfig.setValue(initialAmount);
    }
    const initialRecipient = searchParams.get("initialRecipient");
    if (initialRecipient) {
      sendConfigs.recipientConfig.setValue(initialRecipient);
    }
    const initialMemo = searchParams.get("initialMemo");
    if (initialMemo) {
      sendConfigs.memoConfig.setValue(initialMemo);
    }

    const initialFeeCurrency = searchParams.get("initialFeeCurrency");
    const initialFeeType = searchParams.get("initialFeeType");
    if (initialFeeCurrency && initialFeeType) {
      const currency = chainStore
        .getChain(chainId)
        .findCurrency(initialFeeCurrency);
      if (currency) {
        sendConfigs.feeConfig.setFee({
          currency,
          // XXX: 일단 귀찮아서 any로 처리...
          type: initialFeeType as any,
        });
      }
    }

    const initialGasAmount = searchParams.get("initialGasAmount");
    if (initialGasAmount) {
      sendConfigs.gasConfig.setValue(initialGasAmount);
      gasSimulator.setEnabled(false);
    } else {
      const initialGasAdjustment = searchParams.get("initialGasAdjustment");
      if (initialGasAdjustment) {
        gasSimulator.setGasAdjustmentValue(initialGasAdjustment);
        gasSimulator.setEnabled(true);
      }
    }
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (sendConfigs.recipientConfig.value.trim().length > 0) {
          prev.set("initialRecipient", sendConfigs.recipientConfig.value);
        } else {
          prev.delete("initialRecipient");
        }
        // Fraction and amount value are exclusive
        if (sendConfigs.amountConfig.fraction <= 0) {
          prev.delete("initialAmountFraction");
          if (sendConfigs.amountConfig.value.trim().length > 0) {
            prev.set("initialAmount", sendConfigs.amountConfig.value);
          } else {
            prev.delete("initialAmount");
          }
        } else {
          prev.delete("initialAmount");
          prev.set(
            "initialAmountFraction",
            sendConfigs.amountConfig.fraction.toString()
          );
        }
        if (sendConfigs.memoConfig.value.trim().length > 0) {
          prev.set("initialMemo", sendConfigs.memoConfig.value);
        } else {
          prev.delete("initialMemo");
        }

        // XXX: Manual type에 대해서는 처리하지 않음.
        if (
          sendConfigs.feeConfig.fees.length > 0 &&
          sendConfigs.feeConfig.type !== "manual"
        ) {
          prev.set(
            "initialFeeCurrency",
            sendConfigs.feeConfig.fees[0].currency.coinMinimalDenom
          );
          prev.set("initialFeeType", sendConfigs.feeConfig.type);
        } else {
          prev.delete("initialFeeCurrency");
          prev.delete("initialFeeType");
        }

        if (gasSimulator.enabled) {
          prev.set(
            "initialGasAdjustment",
            gasSimulator.gasAdjustment.toString()
          );
          prev.delete("initialGasAmount");
        } else {
          prev.set("initialGasAmount", sendConfigs.gasConfig.value.toString());
          prev.delete("initialGasAdjustment");
        }
        return prev;
      },
      {
        replace: true,
      }
    );
  }, [
    gasSimulator.enabled,
    gasSimulator.gasAdjustment,
    sendConfigs.amountConfig.fraction,
    sendConfigs.amountConfig.value,
    sendConfigs.feeConfig.fees,
    sendConfigs.feeConfig.type,
    sendConfigs.gasConfig.value,
    sendConfigs.memoConfig.value,
    sendConfigs.recipientConfig.value,
    setSearchParams,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType = "basic-send";

  return (
    <HeaderLayout
      title="Send"
      left={<BackButton />}
      right={
        !isDetachedMode ? (
          <Box
            paddingRight="1rem"
            cursor="pointer"
            onClick={async (e) => {
              e.preventDefault();

              const url = window.location.href + "&detached=true";

              await openPopupWindow(url, undefined);
              window.close();
            }}
          >
            <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
          </Box>
        ) : null
      }
      bottomButton={{
        disabled: txConfigsValidate.interactionBlocked,
        text: "Next",
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
                  sendTx: async (chainId, tx, mode) => {
                    const msg = new SendTxAndRecordMsg(
                      historyType,
                      chainId,
                      sendConfigs.recipientConfig.chainId,
                      tx,
                      mode,
                      false,
                      sendConfigs.senderConfig.sender,
                      sendConfigs.recipientConfig.recipient,
                      sendConfigs.amountConfig.amount.map((amount) => {
                        return {
                          amount: DecUtils.getTenExponentN(
                            amount.currency.coinDecimals
                          )
                            .mul(amount.toDec())
                            .toString(),
                          denom: amount.currency.coinMinimalDenom,
                        };
                      }),
                      sendConfigs.memoConfig.memo
                    );
                    return await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );
                  },
                },
                {
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      console.log(tx.log ?? tx.raw_log);
                      notification.show("failed", "Transaction Failed", "");
                      return;
                    }
                    notification.show("success", "Transaction Success", "");
                  },
                }
              );

            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              window.close();
            }
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }

            console.log(e);
            notification.show("failed", "Transaction Failed", "");
            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              window.close();
            }
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
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              forChange
              onClick={() => navigate("/send/select-asset")}
            />
          </YAxis>

          <RecipientInput
            historyType={historyType}
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

const DetachIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};
