import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts";
import { useHistory } from "react-router";

import style from "./style.module.scss";
import { Alert, Button } from "reactstrap";
import {
  AddressInput,
  CoinInput,
  FeeButtons,
  MemoInput,
  DestinationChainSelector,
} from "../../components/form";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IIBCChannelConfig,
  IMemoConfig,
  IRecipientConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint } from "../../config.ui";
import { useNotification } from "../../components/notification";
import { FormattedMessage, useIntl } from "react-intl";

export const IBCTransferPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [phase, setPhase] = useState<"channel" | "amount">("channel");

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const notification = useNotification();

  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.ibcTransfer,
    accountInfo.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const toChainId =
    (ibcTransferConfigs &&
      ibcTransferConfigs.channelConfig &&
      ibcTransferConfigs.channelConfig.channel &&
      ibcTransferConfigs.channelConfig.channel.counterpartyChainId) ||
    "";
  const toChainName =
    (toChainId && chainStore.getChain(toChainId).chainName) || "";

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={false}
      onBackButton={() => {
        history.goBack();
      }}
    >
      {phase === "channel" ? (
        <IBCTransferPageChannel
          channelConfig={ibcTransferConfigs.channelConfig}
          recipientConfig={ibcTransferConfigs.recipientConfig}
          memoConfig={ibcTransferConfigs.memoConfig}
          onNext={() => {
            setPhase("amount");
          }}
        />
      ) : null}
      {phase === "amount" ? (
        <IBCTransferPageAmount
          amountConfig={ibcTransferConfigs.amountConfig}
          feeConfig={ibcTransferConfigs.feeConfig}
          gasConfig={ibcTransferConfigs.gasConfig}
          onSubmit={async () => {
            if (ibcTransferConfigs.channelConfig.channel) {
              try {
                await accountInfo.cosmos.sendIBCTransferMsg(
                  ibcTransferConfigs.channelConfig.channel,
                  ibcTransferConfigs.amountConfig.amount,
                  ibcTransferConfigs.amountConfig.sendCurrency,
                  ibcTransferConfigs.recipientConfig.recipient,
                  ibcTransferConfigs.memoConfig.memo,
                  ibcTransferConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true,
                  },
                  (tx: any) => {
                    const isSuccess = tx.code == null || tx.code === 0;
                    analyticsStore.logEvent("Send token finished", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: ibcTransferConfigs.feeConfig.feeType,
                      toChainId,
                      toChainName,
                      isSuccess,
                    });
                  }
                );
                history.push("/");
              } catch (e) {
                history.replace("/");
                notification.push({
                  type: "warning",
                  placement: "top-center",
                  duration: 5,
                  content: `Fail to transfer token: ${e.message}`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              }
            }
          }}
        />
      ) : null}
    </HeaderLayout>
  );
});

export const IBCTransferPageChannel: FunctionComponent<{
  channelConfig: IIBCChannelConfig;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
  onNext: () => void;
}> = observer(({ channelConfig, recipientConfig, memoConfig, onNext }) => {
  const intl = useIntl();
  const isValid =
    channelConfig.getError() == null &&
    recipientConfig.getError() == null &&
    memoConfig.getError() == null;

  const isChannelSet = channelConfig.channel != null;

  return (
    <form className={style.formContainer}>
      <div className={style.formInnerContainer}>
        <DestinationChainSelector ibcChannelConfig={channelConfig} />
        <AddressInput
          label={intl.formatMessage({
            id: "send.input.recipient",
          })}
          recipientConfig={recipientConfig}
          memoConfig={memoConfig}
          ibcChannelConfig={channelConfig}
          disabled={!isChannelSet}
        />
        <MemoInput
          label={intl.formatMessage({
            id: "send.input.memo",
          })}
          memoConfig={memoConfig}
          disabled={!isChannelSet}
        />
        <div style={{ flex: 1 }} />
        <Alert className={style.alert}>
          <i className="fas fa-exclamation-circle" />
          <div>
            <h1>IBC is production ready</h1>
            <p>
              However, all new technologies should be used with caution. We
              recommend only transferring small amounts.
            </p>
          </div>
        </Alert>
        <Button
          type="submit"
          color="primary"
          block
          disabled={!isValid}
          onClick={(e) => {
            e.preventDefault();

            onNext();
          }}
        >
          <FormattedMessage id="ibc.transfer.next" />
        </Button>
      </div>
    </form>
  );
});

export const IBCTransferPageAmount: FunctionComponent<{
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  onSubmit: () => void;
}> = observer(({ amountConfig, feeConfig, gasConfig, onSubmit }) => {
  const intl = useIntl();
  const { accountStore, chainStore, priceStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const isValid =
    amountConfig.getError() == null &&
    feeConfig.getError() == null &&
    gasConfig.getError() == null;

  return (
    <form className={style.formContainer}>
      <div className={style.formInnerContainer}>
        <CoinInput
          label={intl.formatMessage({
            id: "send.input.amount",
          })}
          amountConfig={amountConfig}
        />
        <div style={{ flex: 1 }} />
        <FeeButtons
          label={intl.formatMessage({
            id: "send.input.fee",
          })}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          priceStore={priceStore}
        />
        <Button
          type="submit"
          color="primary"
          block
          disabled={!isValid}
          data-loading={accountInfo.isSendingMsg === "ibcTransfer"}
          onClick={(e) => {
            e.preventDefault();

            onSubmit();
          }}
        >
          <FormattedMessage id="ibc.transfer.submit" />
        </Button>
      </div>
    </form>
  );
});
