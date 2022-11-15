import React, { FunctionComponent, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useGasSimulator, useSendTxConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint } from "../../config";
import { PageWithScrollView } from "../../components/page";
import { View } from "react-native";
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  FeeSelector,
} from "../../components/input";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../navigation";
import { Buffer } from "buffer/";
import { DenomHelper } from "@keplr-wallet/common";
import { AsyncKVStore } from "../../common";
import { autorun } from "mobx";

export const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    account.bech32Address,
    {
      ensEndpoint: EthereumEndpoint,
      allowHexAddressOnEthermint: true,
    }
  );

  const gasSimulatorKey = useMemo(() => {
    if (sendConfigs.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom
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
  }, [sendConfigs.amountConfig.sendCurrency]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore("gas-simulator.screen.send/send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.sendCurrency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.error != null ||
        sendConfigs.recipientConfig.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sendConfigs.amountConfig.sendCurrency!,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.sendCurrency &&
      new DenomHelper(sendConfigs.amountConfig.sendCurrency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulator.forceDisable(
        new Error("Simulating secret20 is not supported")
      );
      sendConfigs.gasConfig.setGas(account.secret.msgOpts.send.secret20.gas);
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [
    account.secret.msgOpts.send.secret20.gas,
    gasSimulator,
    sendConfigs.amountConfig.sendCurrency,
    sendConfigs.gasConfig,
  ]);

  useEffect(() => {
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  useEffect(() => {
    // Try to find other fee currency if the account doesn't have enough fee to pay.
    // This logic can be slightly complex, so use mobx's `autorun`.
    // This part fairly different with the approach of react's hook.
    let skip = false;
    // Try until 500ms to avoid the confusion to user.
    const timeoutId = setTimeout(() => {
      skip = true;
    }, 500);

    const disposer = autorun(() => {
      if (
        !skip &&
        !sendConfigs.feeConfig.isManual &&
        sendConfigs.feeConfig.feeCurrencies.length > 1 &&
        sendConfigs.feeConfig.feeCurrency &&
        sendConfigs.feeConfig.feeCurrencies[0].coinMinimalDenom ===
          sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
      ) {
        const queryBalances = queriesStore
          .get(sendConfigs.feeConfig.chainId)
          .queryBalances.getQueryBech32Address(sendConfigs.feeConfig.sender);

        // Basically, `sendConfig.feeConfig` implementation select the first fee currency as default.
        // So, let's put the priority to first fee currency.
        const firstFeeCurrency = sendConfigs.feeConfig.feeCurrencies[0];
        const firstFeeCurrencyBal = queryBalances.getBalanceFromCurrency(
          firstFeeCurrency
        );

        if (sendConfigs.feeConfig.feeType) {
          const fee = sendConfigs.feeConfig.getFeeTypePrettyForFeeCurrency(
            firstFeeCurrency,
            sendConfigs.feeConfig.feeType
          );
          if (firstFeeCurrencyBal.toDec().lt(fee.toDec())) {
            // Not enough balances for fee.
            // Try to find other fee currency to send.
            for (const feeCurrency of sendConfigs.feeConfig.feeCurrencies) {
              const feeCurrencyBal = queryBalances.getBalanceFromCurrency(
                feeCurrency
              );
              const fee = sendConfigs.feeConfig.getFeeTypePrettyForFeeCurrency(
                feeCurrency,
                sendConfigs.feeConfig.feeType
              );

              if (feeCurrencyBal.toDec().gte(fee.toDec())) {
                sendConfigs.feeConfig.setAutoFeeCoinMinimalDenom(
                  feeCurrency.coinMinimalDenom
                );
                skip = true;
                return;
              }
            }
          }
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      disposer();
    };
  }, [sendConfigs.feeConfig, queriesStore]);

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AddressInput
        label="Recipient"
        recipientConfig={sendConfigs.recipientConfig}
        memoConfig={sendConfigs.memoConfig}
      />
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      {sendConfigs.feeConfig.feeCurrencies.length > 1 ? (
        <FeeSelector label="Fee Token" feeConfig={sendConfigs.feeConfig} />
      ) : null}
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
        gasSimulator={gasSimulator}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Send"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "send"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
              await account.sendToken(
                sendConfigs.amountConfig.amount,
                sendConfigs.amountConfig.sendCurrency,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onBroadcasted: (txHash) => {
                    analyticsStore.logEvent("Send token tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: sendConfigs.feeConfig.feeType,
                    });
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
                    });
                  },
                }
              );
            } catch (e) {
              if (e?.message === "Request rejected") {
                return;
              }
              console.log(e);
              smartNavigation.navigateSmart("Home", {});
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
