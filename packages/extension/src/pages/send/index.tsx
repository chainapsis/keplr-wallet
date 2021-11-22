import React, { FunctionComponent, useEffect } from "react";
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput,
} from "../../components/form";
import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";
import { useNotification } from "../../components/notification";

import { useIntl } from "react-intl";
import { Button } from "reactstrap";

import { useHistory, useLocation } from "react-router";
import queryString from "querystring";

import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../config.ui";
import {
  fitPopupWindow,
  openPopupWindow,
  PopupSize,
} from "@keplr-wallet/popup";

export const SendPage: FunctionComponent = observer(() => {
  const history = useHistory();
  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    defaultDenom: string | undefined;
    initialRecipient: string | undefined;
    initialAmount: string | undefined;
    initialMemo: string | undefined;
    detached: string | undefined;
  };

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const intl = useIntl();

  const notification = useNotification();

  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    analyticsStore,
  } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    current.chainId,
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queriesStore.get(current.chainId).queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = current.currencies.find(
        (cur) => cur.coinMinimalDenom === query.defaultDenom
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [current.currencies, query.defaultDenom, sendConfigs.amountConfig]);

  const isDetachedPage = query.detached === "true";

  useEffect(() => {
    if (isDetachedPage) {
      fitPopupWindow();
    }
  }, [isDetachedPage]);

  useEffect(() => {
    if (query.initialRecipient) {
      sendConfigs.recipientConfig.setRawRecipient(query.initialRecipient);
    }
    if (query.initialAmount) {
      sendConfigs.amountConfig.setAmount(query.initialAmount);
    }
    if (query.initialMemo) {
      sendConfigs.memoConfig.setMemo(query.initialMemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.initialAmount, query.initialMemo, query.initialRecipient]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        isDetachedPage
          ? undefined
          : () => {
              history.goBack();
            }
      }
      rightRenderer={
        isDetachedPage ? undefined : (
          <div
            style={{
              height: "64px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingRight: "20px",
            }}
          >
            <i
              className="fas fa-external-link-alt"
              style={{
                cursor: "pointer",
                padding: "4px",
                color: "#8B8B9A",
              }}
              onClick={async (e) => {
                e.preventDefault();

                const windowInfo = await browser.windows.getCurrent();

                let queryString = `?detached=true&defaultDenom=${sendConfigs.amountConfig.sendCurrency.coinMinimalDenom}`;
                if (sendConfigs.recipientConfig.rawRecipient) {
                  queryString += `&initialRecipient=${sendConfigs.recipientConfig.rawRecipient}`;
                }
                if (sendConfigs.amountConfig.amount) {
                  queryString += `&initialAmount=${sendConfigs.amountConfig.amount}`;
                }
                if (sendConfigs.memoConfig.memo) {
                  queryString += `&initialMemo=${sendConfigs.memoConfig.memo}`;
                }

                await openPopupWindow(
                  browser.runtime.getURL(`/popup.html#/send${queryString}`),
                  undefined,
                  {
                    top: (windowInfo.top || 0) + 80,
                    left:
                      (windowInfo.left || 0) +
                      (windowInfo.width || 0) -
                      PopupSize.width -
                      20,
                  }
                );
                window.close();
              }}
            />
          </div>
        )
      }
    >
      <form
        className={style.formContainer}
        onSubmit={async (e) => {
          e.preventDefault();

          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              const stdFee = sendConfigs.feeConfig.toStdFee();

              await accountInfo.sendToken(
                sendConfigs.amountConfig.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sendConfigs.amountConfig.sendCurrency!,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                stdFee,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                (tx: any) => {
                  const isSuccess = tx.code == null || tx.code === 0;
                  analyticsStore.logEvent("Send token finished", {
                    chainId: chainStore.current.chainId,
                    chainName: chainStore.current.chainName,
                    feeType: sendConfigs.feeConfig.feeType,
                    isSuccess,
                  });
                }
              );
              if (!isDetachedPage) {
                history.replace("/");
              }
            } catch (e) {
              if (!isDetachedPage) {
                history.replace("/");
              }
              notification.push({
                type: "warning",
                placement: "top-center",
                duration: 5,
                content: `Fail to send token: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            } finally {
              // XXX: If the page is in detached state,
              // close the window without waiting for tx to commit. analytics won't work.
              if (isDetachedPage) {
                window.close();
              }
            }
          }
        }}
      >
        <div className={style.formInnerContainer}>
          <div>
            <AddressInput
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: "send.input.recipient" })}
            />
            <CoinInput
              amountConfig={sendConfigs.amountConfig}
              label={intl.formatMessage({ id: "send.input.amount" })}
              balanceText={intl.formatMessage({
                id: "send.input-button.balance",
              })}
            />
            <MemoInput
              memoConfig={sendConfigs.memoConfig}
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
            />
          </div>
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            color="primary"
            block
            data-loading={accountInfo.isSendingMsg === "send"}
            disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
          >
            {intl.formatMessage({
              id: "send.button.send",
            })}
          </Button>
        </div>
      </form>
    </HeaderLayout>
  );
});
