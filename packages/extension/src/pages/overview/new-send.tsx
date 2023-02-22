import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import style from "./style.module.scss";
import { useHistory, useRouteMatch } from "react-router";
import { useStore } from "../../stores";
import { useGasSimulator, useSendTxConfig } from "@keplr-wallet/hooks";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";
import { AppCurrency } from "@keplr-wallet/types";
import { HeaderLayout } from "../../layouts";
import classnames from "classnames";
import { AddressInput } from "../../components/form";
import { useIntl } from "react-intl";
import styleCoinInput from "../../components/form/coin-input.module.scss";
import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Input } from "reactstrap";
import { autorun } from "mobx";

export const NewSendPage: FunctionComponent = observer(() => {
  const match = useRouteMatch<{ currency: string }>();

  const intl = useIntl();
  const history = useHistory();

  const [currency, setCurrency] = useState<AppCurrency>();

  useEffect(() => {
    const recievedCurrency = JSON.parse(match.params.currency);
    setCurrency(recievedCurrency);
    sendConfigs.amountConfig.setSendCurrency(recievedCurrency);
  }, [match.params.currency]);

  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();

  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
      computeTerraClassicTax: true,
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
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    current.chainId,
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

      return accountInfo.makeSendTokenTx(
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
      sendConfigs.gasConfig.setGas(
        accountInfo.secret.msgOpts.send.secret20.gas
      );
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [
    accountInfo.secret.msgOpts.send.secret20.gas,
    gasSimulator,
    sendConfigs.amountConfig.sendCurrency,
    sendConfigs.gasConfig,
  ]);

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

        // Basically, `FeeConfig` implementation select the first fee currency as default.
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

  useEffect(() => {
    if (
      sendConfigs.feeConfig.chainInfo.features &&
      sendConfigs.feeConfig.chainInfo.features.includes("terra-classic-fee")
    ) {
      // When considering stability tax for terra classic.
      // Simulation itself doesn't consider the stability tax send.
      // Thus, it always returns fairly lower gas.
      // To adjust this, for terra classic, increase the default gas adjustment
      gasSimulator.setGasAdjustment(1.6);
    }
  }, [gasSimulator, sendConfigs.feeConfig.chainInfo]);

  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
  }, [
    sendConfigs.feeConfig,
    sendConfigs.feeConfig.feeCurrency,
    sendConfigs.feeConfig.fee,
  ]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const queryBalances = queriesStore
    .get(current.chainId)
    .queryBalances.getQueryBech32Address(sendConfigs.amountConfig.sender);

  const queryBalance = queryBalances.balances.find(
    (bal) =>
      sendConfigs.amountConfig.sendCurrency.coinMinimalDenom ===
      bal.currency.coinMinimalDenom
  );

  const balance = queryBalance
    ? queryBalance.balance
    : new CoinPretty(sendConfigs.amountConfig.sendCurrency, new Int(0));

  return (
    <HeaderLayout
      showChainName={false}
      alternativeTitle={"Select Asset"}
      canChangeChainInfo={false}
      style={{ height: "auto", minHeight: "100%" }}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <form
        className={style.formContainer}
        onSubmit={async (e) => {
          e.preventDefault();

          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              const stdFee = sendConfigs.feeConfig.toStdFee();

              const tx = accountInfo.makeSendTokenTx(
                sendConfigs.amountConfig.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sendConfigs.amountConfig.sendCurrency!,
                sendConfigs.recipientConfig.recipient
              );

              console.log(
                "sendConfigs.amountConfig.amount",
                sendConfigs.amountConfig.amount
              );

              await tx.send(
                stdFee,
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onBroadcasted: () => {},
                }
              );

              history.replace("/");
            } catch (e) {
              console.log(e);
            }
          }
        }}
      >
        <div className={style.container}>
          <div
            className={classnames(
              style.flexRow,
              style.spaceBetween,
              style.cursorPointer
            )}
            onClick={() => history.replace("/select-asset")}
          >
            <div>Asset</div>
            <div>{currency?.coinDenom}</div>
          </div>
          <div>
            <div
              onClick={() => {
                sendConfigs.amountConfig.toggleIsMax();
              }}
            >
              Max {balance.trim(true).maxDecimals(6).toString()}
            </div>
            <Input
              className={classnames(
                "form-control-alternative",
                styleCoinInput.input
              )}
              type="number"
              value={sendConfigs.amountConfig.amount}
              onChange={(e) => {
                e.preventDefault();

                console.log("setAmount", e.target.value);
                sendConfigs.amountConfig.setAmount(e.target.value);
              }}
              step={new Dec(1)
                .quo(
                  DecUtils.getPrecisionDec(
                    sendConfigs.amountConfig.sendCurrency?.coinDecimals ?? 0
                  )
                )
                .toString(
                  sendConfigs.amountConfig.sendCurrency?.coinDecimals ?? 0
                )}
              min={0}
              autoComplete="off"
            />
          </div>

          <AddressInput
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            label={intl.formatMessage({ id: "send.input.recipient" })}
          />

          <div className={style.flex1} />

          <button className={style.bottomButton}>Send</button>
        </div>
      </form>
    </HeaderLayout>
  );
});
