import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router";

import { ButtonV2 } from "@components-v2/buttons/button";
import {
  AddressInput,
  CoinInput,
  DestinationChainSelector,
  FeeButtons,
  IBCChannelRegistrar,
  MemoInput,
} from "@components-v2/form";
import { useNotification } from "@components/notification";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IIBCChannelConfig,
  IMemoConfig,
  IRecipientConfig,
  useGasSimulator,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert } from "reactstrap";
import { useStore } from "../../../stores";
import style from "./style.module.scss";

export const IBCTransferPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"channel" | "amount">("channel");

  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    analyticsStore,
  } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const notification = useNotification();

  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );
  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc.transfer"),
    chainStore,
    chainStore.current.chainId,
    ibcTransferConfigs.gasConfig,
    ibcTransferConfigs.feeConfig,
    "native",
    () => {
      if (!ibcTransferConfigs.channelConfig.channel) {
        throw new Error("Channel not set yet");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        ibcTransferConfigs.amountConfig.error != null ||
        ibcTransferConfigs.recipientConfig.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      return accountInfo.cosmos.makeIBCTransferTx(
        ibcTransferConfigs.channelConfig.channel,
        ibcTransferConfigs.amountConfig.amount,
        ibcTransferConfigs.amountConfig.sendCurrency,
        ibcTransferConfigs.recipientConfig.recipient
      );
    }
  );

  const toChainId =
    (ibcTransferConfigs &&
      ibcTransferConfigs.channelConfig &&
      ibcTransferConfigs.channelConfig.channel &&
      ibcTransferConfigs.channelConfig.channel.counterpartyChainId) ||
    "";
  const toChainName =
    (toChainId && chainStore.getChain(toChainId).chainName) || "";
  const [isIBCRegisterPageOpen, setIsIBCRegisterPageOpen] = useState(false);

  return (
    <HeaderLayout
      showTopMenu={true}
      smallTitle={true}
      alternativeTitle={
        isIBCRegisterPageOpen ? "Add IBC Chain" : "IBC Transfer"
      }
      canChangeChainInfo={false}
      onBackButton={() => {
        isIBCRegisterPageOpen
          ? setIsIBCRegisterPageOpen(false)
          : analyticsStore.logEvent("back_click", { pageName: "IBC Transfer" });
        navigate(-1);
      }}
    >
      {phase === "channel" ? (
        <IBCTransferPageChannel
          isIBCRegisterPageOpen={isIBCRegisterPageOpen}
          setIsIBCRegisterPageOpen={setIsIBCRegisterPageOpen}
          channelConfig={ibcTransferConfigs.channelConfig}
          recipientConfig={ibcTransferConfigs.recipientConfig}
          memoConfig={ibcTransferConfigs.memoConfig}
          onNext={() => {
            analyticsStore.logEvent("ibc_next_click");
            setPhase("amount");
          }}
        />
      ) : null}
      {phase === "amount" ? (
        <IBCTransferPageAmount
          amountConfig={ibcTransferConfigs.amountConfig}
          feeConfig={ibcTransferConfigs.feeConfig}
          gasConfig={ibcTransferConfigs.gasConfig}
          gasSimulator={gasSimulator}
          onSubmit={async () => {
            if (ibcTransferConfigs.channelConfig.channel) {
              try {
                analyticsStore.logEvent("ibc_txn_submit_click");
                const tx = accountInfo.cosmos.makeIBCTransferTx(
                  ibcTransferConfigs.channelConfig.channel,
                  ibcTransferConfigs.amountConfig.amount,
                  ibcTransferConfigs.amountConfig.sendCurrency,
                  ibcTransferConfigs.recipientConfig.recipient
                );

                await tx.send(
                  ibcTransferConfigs.feeConfig.toStdFee(),
                  ibcTransferConfigs.memoConfig.memo,
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true,
                  },
                  {
                    onBroadcasted: () => {
                      analyticsStore.logEvent("ibc_txn_broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        feeType: ibcTransferConfigs.feeConfig.feeType,
                        toChainId,
                        toChainName,
                      });
                    },
                  }
                );

                navigate("/");
              } catch (e) {
                analyticsStore.logEvent("ibc_txn_broadcasted_fail", {
                  chainId: chainStore.current.chainId,
                  chainName: chainStore.current.chainName,
                  feeType: ibcTransferConfigs.feeConfig.feeType,
                  toChainId,
                  toChainName,
                  message: e?.message ?? "",
                });
                navigate("/", { replace: true });
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
  isIBCRegisterPageOpen: boolean;
  setIsIBCRegisterPageOpen: any;
}> = observer(
  ({
    channelConfig,
    recipientConfig,
    memoConfig,
    onNext,
    isIBCRegisterPageOpen,
    setIsIBCRegisterPageOpen,
  }) => {
    const intl = useIntl();
    const isValid =
      channelConfig.error == null &&
      recipientConfig.error == null &&
      memoConfig.error == null;

    const isChannelSet = channelConfig.channel != null;
    return (
      <form className={style["formContainer"]}>
        <div className={style["formInnerContainer"]}>
          {isIBCRegisterPageOpen ? (
            <IBCChannelRegistrar
              isOpen={isIBCRegisterPageOpen}
              closeModal={() => setIsIBCRegisterPageOpen(false)}
              toggle={() =>
                setIsIBCRegisterPageOpen((value: boolean) => !value)
              }
            />
          ) : (
            <React.Fragment>
              <DestinationChainSelector
                ibcChannelConfig={channelConfig}
                setIsIBCRegisterPageOpen={setIsIBCRegisterPageOpen}
              />
              <AddressInput
                label={intl.formatMessage({
                  id: "send.input.recipient",
                })}
                recipientConfig={recipientConfig}
                memoConfig={memoConfig}
                ibcChannelConfig={channelConfig}
                disabled={!isChannelSet}
                value={""}
                // pageName={"IBC Transfer"}
              />
              <MemoInput
                label={intl.formatMessage({
                  id: "send.input.memo",
                })}
                memoConfig={memoConfig}
                disabled={!isChannelSet}
              />
              <div />
              <Alert className={style["alert"]}>
                <img src={require("@assets/svg/wireframe/alert.svg")} alt="" />
                <div>
                  <div className={style["text"]}>IBC is production ready</div>
                  <p className={style["lightText"]}>
                    However, all new technologies should be used with caution.
                    We recommend only transferring small amounts.
                  </p>
                </div>
              </Alert>
              <ButtonV2
                text=""
                disabled={!isValid}
                onClick={(e: any) => {
                  e.preventDefault();
                  onNext();
                }}
              >
                <FormattedMessage id="ibc.transfer.next" />
              </ButtonV2>
            </React.Fragment>
          )}
        </div>
      </form>
    );
  }
);

export const IBCTransferPageAmount: FunctionComponent<{
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
  onSubmit: () => void;
}> = observer(
  ({ amountConfig, feeConfig, gasConfig, gasSimulator, onSubmit }) => {
    const intl = useIntl();
    const { accountStore, chainStore, priceStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const [loading, setLoading] = useState(false);
    const isValid =
      amountConfig.error == null &&
      feeConfig.error == null &&
      gasConfig.error == null;

    return (
      <form className={style["formContainer"]}>
        <div className={style["formInnerContainer"]}>
          <CoinInput
            label={intl.formatMessage({
              id: "send.input.amount",
            })}
            amountConfig={amountConfig}
            // pageName={"IBC Transfer"}
          />
          <div style={{ flex: 1 }} />
          <FeeButtons
            label={intl.formatMessage({
              id: "send.input.fee",
            })}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            priceStore={priceStore}
            gasSimulator={gasSimulator}
          />
          <ButtonV2
            disabled={!isValid || loading}
            data-loading={accountInfo.txTypeInProgress === "ibcTransfer"}
            text={
              loading ? (
                <i className="fas fa-spinner fa-spin ml-2" />
              ) : (
                <FormattedMessage id="ibc.transfer.submit" />
              )
            }
            onClick={(e: any) => {
              e.preventDefault();
              setLoading(true);
              onSubmit();
            }}
            styleProps={{
              marginTop: "12px",
            }}
          />
        </div>
      </form>
    );
  }
);
