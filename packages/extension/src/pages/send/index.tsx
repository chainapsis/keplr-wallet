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

export const SendPage: FunctionComponent = observer(() => {
  const history = useHistory();
  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    defaultDenom: string | undefined;
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
              history.replace("/");
            } catch (e) {
              history.replace("/");
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
