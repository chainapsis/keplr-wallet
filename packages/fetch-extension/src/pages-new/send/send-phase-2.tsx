import React, { useEffect, useMemo } from "react";
import style from "./style.module.scss";
import { useIntl } from "react-intl";
import { AddressInput, FeeButtons, MemoInput } from "@components-v2/form";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";
import { useStore } from "../../stores";
import { ButtonV2 } from "@components-v2/buttons/button";
import { useGasSimulator } from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { useLanguage } from "../../languages";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { TransxStatus } from "@components-v2/transx-status";
import { useLocation } from "react-router";
interface SendPhase2Props {
  sendConfigs?: any;
  setIsNext?: any;
  isDetachedPage: any;
  trnsxStatus: string;
  fromPhase1: boolean;
  configs: any;
  setFromPhase1: any;
}

export const SendPhase2: React.FC<SendPhase2Props> = observer(
  ({
    sendConfigs,
    isDetachedPage,
    setIsNext,
    trnsxStatus,
    fromPhase1,
    configs,
    setFromPhase1,
  }) => {
    const { chainStore, accountStore, priceStore, analyticsStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const navigate = useNavigate();
    const location = useLocation();
    const { isFromPhase1 } = location.state || {};
    const language = useLanguage();
    const fiatCurrency = language.fiatCurrency;
    const convertToUsd = (currency: any) => {
      const value = priceStore.calculatePrice(currency, fiatCurrency);
      const inUsd = value && value.shrink(true).maxDecimals(6).toString();
      return inUsd;
    };
    const intl = useIntl();

    useEffect(() => {
      if (isFromPhase1 !== undefined) setFromPhase1(isFromPhase1);
      if (configs?.amount && fromPhase1 == false && sendConfigs) {
        sendConfigs.amountConfig.setAmount(configs.amount);
        sendConfigs.amountConfig.setSendCurrency(configs.sendCurr);
      }
    }, [configs, fromPhase1, sendConfigs]);

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
      chainStore.current.chainId,
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
    const sendConfigError =
      sendConfigs.recipientConfig.error ??
      sendConfigs.amountConfig.error ??
      sendConfigs.memoConfig.error ??
      sendConfigs.gasConfig.error ??
      sendConfigs.feeConfig.error;
    const txStateIsValid = sendConfigError == null;

    const decimals = sendConfigs.amountConfig.sendCurrency.coinDecimals;
    console.log({
      amount: sendConfigs.amountConfig.amount,
      sendCurr: sendConfigs.amountConfig.sendCurrency,
      recipient: sendConfigs.recipientConfig.recipient,
      memo: sendConfigs.memoConfig.memo,
    });
    return (
      <div>
        <div className={style["editCard"]}>
          <div>
            <div className={style["amountInUsd"]}>
              {convertToUsd(
                sendConfigs.amountConfig
                  ? new CoinPretty(
                      sendConfigs.amountConfig?.sendCurrency,
                      new Int(sendConfigs.amountConfig.amount * 10 ** decimals)
                    )
                  : new CoinPretty(
                      sendConfigs.amountConfig?.sendCurrency,
                      new Int(0)
                    )
              )}{" "}
              USD
            </div>
            <div className={style["amount"]}>
              {parseFloat(sendConfigs.amountConfig.amount)
                .toFixed(6)
                .toString()}{" "}
              {sendConfigs.amountConfig.sendCurrency.coinDenom}
            </div>
          </div>
          <button onClick={() => setIsNext(false)} className={style["edit"]}>
            Edit
          </button>
        </div>
        <AddressInput
          recipientConfig={sendConfigs.recipientConfig}
          memoConfig={configs ? configs.memo : sendConfigs.memoConfig}
          label={intl.formatMessage({ id: "send.input.recipient" })}
          value={configs ? configs.recipient : ""}
        />

        <MemoInput
          memoConfig={configs ? configs.memo : sendConfigs.memoConfig}
          label={intl.formatMessage({ id: "send.input.memo" })}
        />
        <FeeButtons
          feeConfig={sendConfigs.feeConfig}
          gasConfig={sendConfigs.gasConfig}
          priceStore={priceStore}
          label={intl.formatMessage({ id: "send.input.fee" })}
          feeSelectLabels={{
            low: intl.formatMessage({ id: "fee-buttons.select.low" }),
            average: intl.formatMessage({
              id: "fee-buttons.select.average",
            }),
            high: intl.formatMessage({ id: "fee-buttons.select.high" }),
          }}
          gasLabel={intl.formatMessage({ id: "send.input.gas" })}
          gasSimulator={gasSimulator}
        />
        <ButtonV2
          text="Review transaction"
          gradientText=""
          styleProps={{
            height: "56px",
            position: "sticky",
            bottom: "5px",
          }}
          onClick={async (e: any) => {
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

                await tx.send(
                  stdFee,
                  sendConfigs.memoConfig.memo,
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true,
                  },
                  {
                    onBroadcastFailed: (e: any) => {
                      console.log(e);
                      navigate("/send", {
                        replace: true,
                        state: { trnsxStatus: "failed", isNext: true },
                      });
                    },
                    onBroadcasted: () => {
                      analyticsStore.logEvent("Send token tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        feeType: sendConfigs.feeConfig.feeType,
                      });
                      navigate("/send", {
                        replace: true,
                        state: { trnsxStatus: "pending", isNext: true },
                      });
                    },
                    onFulfill: () => {
                      navigate("/send", {
                        replace: true,
                        state: { trnsxStatus: "success", isNext: true },
                      });
                    },
                  }
                );
                if (!isDetachedPage) {
                  navigate("/send", {
                    replace: true,
                    state: { trnsxStatus: "pending", isNext: true },
                  });
                }
              } catch (e) {
                if (!isDetachedPage) {
                  navigate("/send", {
                    replace: true,
                    state: {
                      isNext: true,
                      isFromPhase1: false,
                      configs: {
                        amount: sendConfigs.amountConfig.amount,
                        sendCurr: sendConfigs.amountConfig.sendCurrency,
                        recipient: sendConfigs.recipientConfig.recipient,
                        memo: sendConfigs.memoConfig.memo,
                      },
                    },
                  });
                }
              } finally {
                // XXX: If the page is in detached state,
                // close the window without waiting for tx to commit. analytics won't work.
                if (isDetachedPage) {
                  window.close();
                }
              }
            }
          }}
          data-loading={accountInfo.isSendingMsg === "send"}
          disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
        />
        {trnsxStatus !== undefined && <TransxStatus status={trnsxStatus} />}
      </div>
    );
  }
);
