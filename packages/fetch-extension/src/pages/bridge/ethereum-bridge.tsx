import React, { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router";

import style from "./style.module.scss";
import { Button } from "reactstrap";
import { AddressInput, CoinInput, FeeButtons, Input } from "@components/form";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  IRecipientConfig,
  useGasSimulator,
  useNativeBridgeConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useNotification } from "@components/notification";
import { FormattedMessage, useIntl } from "react-intl";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import queryString from "querystring";

import { BigNumber } from "@ethersproject/bignumber";

export const EthereumBridge: FunctionComponent<{
  limit: string;
  fee?: string;
}> = observer(({ limit, fee }) => {
  const [phase, setPhase] = useState<"configure" | "approve" | "bridge">(
    "configure"
  );

  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    defaultRecipient: string | undefined;
    defaultAmount: string | undefined;
  };

  const { chainStore, accountStore, queriesStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const nativeBridgeConfig = useNativeBridgeConfig(
    chainStore,
    queriesStore,
    chainStore.current.chainId,
    accountInfo.bech32Address
  );

  useEffect(() => {
    if (query.defaultRecipient) {
      nativeBridgeConfig.recipientConfig.setRawRecipient(
        query.defaultRecipient
      );
    }
    if (query.defaultAmount) {
      nativeBridgeConfig.amountConfig.setAmount(query.defaultAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.defaultAmount, query.defaultRecipient]);

  if (accountInfo.txTypeInProgress === "nativeBridgeSend") {
    return (
      <p className={style["loaderScreen"]}>
        Bridging in progress <i className="fa fa-spinner fa-spin fa-fw" />{" "}
      </p>
    );
  }

  return (
    <div>
      {phase === "configure" ? (
        <Configure
          amountConfig={nativeBridgeConfig.amountConfig}
          recipientConfig={nativeBridgeConfig.recipientConfig}
          memoConfig={nativeBridgeConfig.memoConfig}
          setPhase={setPhase}
          limit={limit}
          fee={fee}
        />
      ) : null}
      {phase === "approve" ? (
        <Approve
          amountConfig={nativeBridgeConfig.amountConfig}
          recipientConfig={nativeBridgeConfig.recipientConfig}
          feeConfig={nativeBridgeConfig.feeConfig}
          gasConfig={nativeBridgeConfig.gasConfig}
          currency={nativeBridgeConfig.amountConfig.sendCurrency}
        />
      ) : null}
      {phase === "bridge" ? (
        <Bridge
          feeConfig={nativeBridgeConfig.feeConfig}
          gasConfig={nativeBridgeConfig.gasConfig}
          bridgeAmount={nativeBridgeConfig.amountConfig.amount}
          currency={nativeBridgeConfig.amountConfig.sendCurrency}
          recipient={nativeBridgeConfig.recipientConfig.recipient}
        />
      ) : null}
    </div>
  );
});

export const Configure: FunctionComponent<{
  amountConfig: IAmountConfig;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
  setPhase: React.Dispatch<
    React.SetStateAction<"configure" | "approve" | "bridge">
  >;
  limit: string;
  fee?: string;
}> = observer(
  ({ amountConfig, recipientConfig, memoConfig, setPhase, limit, fee }) => {
    const intl = useIntl();

    const { chainStore, queriesStore, accountStore } = useStore();

    const navigate = useNavigate();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const allowanceQuery = queriesStore
      .get(chainStore.current.chainId)
      .evm.queryERC20Allowance.getQueryAllowance(
        accountInfo.bech32Address,
        queriesStore.get(chainStore.current.chainId).evm.queryNativeFetBridge
          .nativeBridgeAddress,
        "contractAddress" in amountConfig.sendCurrency
          ? amountConfig.sendCurrency.contractAddress
          : ""
      );

    const isValid =
      recipientConfig.error == null &&
      memoConfig.error == null &&
      amountConfig.error == null &&
      !allowanceQuery.isFetching &&
      accountInfo.txTypeInProgress !== "approval";

    return (
      <form className={style["formContainer"]}>
        <div className={style["bridgeLimit"]}>
          ERC20 to Native Limit: {limit} FET
        </div>
        <div className={style["formInnerContainer"]}>
          <AddressInput
            label="Recipient (Fetchhub address)"
            recipientConfig={recipientConfig}
            disableAddressBook
            value={""}
            pageName={"Bridge"}
          />
          <div
            className={style["addressSelector"]}
            onClick={(e) => {
              e.preventDefault();
              recipientConfig.setRawRecipient(
                accountStore.getAccount("fetchhub-4").bech32Address
              );
            }}
          >
            Bridge to your Fetchhub address:{" "}
            {accountStore.getAccount("fetchhub-4").bech32Address}
          </div>

          <div style={{ flex: 1 }} />

          <CoinInput
            label={intl.formatMessage({
              id: "send.input.amount",
            })}
            amountConfig={amountConfig}
            dropdownDisabled
            pageName={"Bridge"}
          />
          <div style={{ flex: 1 }} />
          {fee && (
            <div>
              <Input
                label="Bridging fee"
                readOnly
                disabled
                value={`${fee} FET`}
              />
              <div style={{ flex: 1 }} />
            </div>
          )}
          <Button
            type="submit"
            color="primary"
            block
            disabled={!isValid}
            data-loading={allowanceQuery.isFetching}
            onClick={(e) => {
              e.preventDefault();
              if (!allowanceQuery.allowance || allowanceQuery.error) {
                navigate(-1);
                throw new Error("Failed to fetch allowance");
                // TODO: Add error notification
              }

              const currentAllowance = BigNumber.from(allowanceQuery.allowance);
              const currencyDecimals = amountConfig.sendCurrency.coinDecimals;

              let dec = new Dec(amountConfig.amount);
              dec = dec.mul(
                DecUtils.getTenExponentNInPrecisionRange(currencyDecimals)
              );
              const amountToBridge = BigNumber.from(dec.truncate().toString());

              if (currentAllowance.gte(amountToBridge)) {
                // Open bridge page directly
                return setPhase("bridge");
              }

              setPhase("approve");
            }}
          >
            {accountInfo.txTypeInProgress === "approval" ? (
              <p style={{ marginBottom: 0 }}>
                Approve txn in progress{" "}
                <i className="fa fa-spinner fa-spin fa-fw" />
              </p>
            ) : (
              <FormattedMessage id="ibc.transfer.next" />
            )}
          </Button>
        </div>
      </form>
    );
  }
);

export const Approve: FunctionComponent<{
  amountConfig: IAmountConfig;
  recipientConfig: IRecipientConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  currency: AppCurrency;
}> = observer(
  ({ amountConfig, recipientConfig, feeConfig, gasConfig, currency }) => {
    const intl = useIntl();
    const notification = useNotification();

    const isValid = feeConfig.error == null && gasConfig.error == null;

    const navigate = useNavigate();

    const {
      chainStore,
      priceStore,
      accountStore,
      queriesStore,
      analyticsStore,
    } = useStore();

    const approveGasSimulator = useGasSimulator(
      new ExtensionKVStore("gas-simulator.native-bridge.approve"),
      chainStore,
      chainStore.current.chainId,
      gasConfig,
      feeConfig,
      "bridge-approve",
      () => {
        return accountStore
          .getAccount(chainStore.current.chainId)
          .ethereum.makeApprovalTx(
            amountConfig.amount,
            queriesStore.get(chainStore.current.chainId).evm
              .queryNativeFetBridge.nativeBridgeAddress,
            currency
          );
      }
    );

    return (
      <form className={style["formContainer"]}>
        <h2>Approve</h2>
        <div className={style["formInnerContainer"]}>
          <div style={{ marginBottom: "20px" }}>
            Allow the bridge contract to spend{" "}
            <span style={{ fontWeight: "bold" }}>
              {new IntPretty(amountConfig.amount).trim(true).toString()} FET
            </span>{" "}
            on your behalf.
          </div>

          <FeeButtons
            label={intl.formatMessage({
              id: "send.input.fee",
            })}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            priceStore={priceStore}
            gasSimulator={approveGasSimulator}
          />

          <Button
            type="submit"
            color="primary"
            block
            disabled={!isValid}
            onClick={async (e) => {
              e.preventDefault();

              try {
                const stdFee = feeConfig.toStdFee();

                const tx = accountStore
                  .getAccount(chainStore.current.chainId)
                  .ethereum.makeApprovalTx(
                    amountConfig.amount,
                    queriesStore.get(chainStore.current.chainId).evm
                      .queryNativeFetBridge.nativeBridgeAddress,
                    currency
                  );

                await tx.send(
                  stdFee,
                  "",
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true,
                  },
                  {
                    onFulfill(tx) {
                      if (tx.status && tx.status === 1) {
                        notification.push({
                          placement: "top-center",
                          type: "success",
                          duration: 2,
                          content: "Approval Successful",
                          canDelete: true,
                          transition: {
                            duration: 0.25,
                          },
                        });
                      } else {
                        notification.push({
                          placement: "top-center",
                          type: "danger",
                          duration: 2,
                          content: "Approval Failed, try again",
                          canDelete: true,
                          transition: {
                            duration: 0.25,
                          },
                        });
                      }
                    },
                    onBroadcasted() {
                      gasConfig.setGas(0);
                      navigate(
                        `/bridge?defaultRecipient=${recipientConfig.recipient}&defaultAmount=${amountConfig.amount}`
                      );
                      analyticsStore.logEvent(
                        "bridge_txn_approval_broadcasted",
                        {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          feeType: feeConfig.feeType,
                        }
                      );
                    },
                  }
                );
              } catch (e) {
                analyticsStore.logEvent(
                  "bridge_txn_approval_broadcasted_fail",
                  {
                    chainId: chainStore.current.chainId,
                    chainName: chainStore.current.chainName,
                    feeType: feeConfig.feeType,
                    message: e?.message ?? "",
                  }
                );
                navigate(
                  `/bridge?defaultRecipient=${recipientConfig.recipient}&defaultAmount=${amountConfig.amount}`
                );
                notification.push({
                  placement: "top-center",
                  type: "danger",
                  duration: 2,
                  content: `Approval Failed: ${e.message}`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              }
            }}
          >
            <FormattedMessage id="ibc.transfer.next" />
          </Button>
        </div>
      </form>
    );
  }
);

export const Bridge: FunctionComponent<{
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  bridgeAmount: string;
  recipient: string;
  currency: AppCurrency;
}> = observer(({ feeConfig, gasConfig, bridgeAmount, currency, recipient }) => {
  const intl = useIntl();
  const isValid = feeConfig.error == null && gasConfig.error == null;

  const navigate = useNavigate();
  const notification = useNotification();

  const { chainStore, priceStore, accountStore, analyticsStore } = useStore();

  const bridgeGasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.native-bridge.bridge"),
    chainStore,
    chainStore.current.chainId,
    gasConfig,
    feeConfig,
    "bridge",
    () => {
      return accountStore
        .getAccount(chainStore.current.chainId)
        .ethereum.makeNativeBridgeTx(bridgeAmount, recipient);
    }
  );

  return (
    <form className={style["formContainer"]}>
      <h2>Bridge</h2>
      <div className={style["formInnerContainer"]}>
        <p style={{ overflowWrap: "break-word" }}>
          Sending{" "}
          <span style={{ fontWeight: "bold" }}>
            {new IntPretty(bridgeAmount).trim(true).toString()}{" "}
            {currency.coinDenom}
          </span>{" "}
          to <span style={{ fontWeight: "bold" }}>{recipient}</span> on Fetch
          network.
        </p>
        <FeeButtons
          label={intl.formatMessage({
            id: "send.input.fee",
          })}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          priceStore={priceStore}
          gasSimulator={bridgeGasSimulator}
        />

        <Button
          type="submit"
          color="primary"
          block
          disabled={!isValid}
          onClick={async (e) => {
            e.preventDefault();

            try {
              const stdFee = feeConfig.toStdFee();

              const tx = accountStore
                .getAccount(chainStore.current.chainId)
                .ethereum.makeNativeBridgeTx(bridgeAmount, recipient);

              await tx.send(
                stdFee,
                "",
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onFulfill(tx) {
                    if (tx.status && tx.status === 1) {
                      notification.push({
                        placement: "top-center",
                        type: "success",
                        duration: 2,
                        content: "Bridge Successful",
                        canDelete: true,
                        transition: {
                          duration: 0.25,
                        },
                      });
                    } else {
                      notification.push({
                        placement: "top-center",
                        type: "danger",
                        duration: 2,
                        content: "Bridge Failed, try again",
                        canDelete: true,
                        transition: {
                          duration: 0.25,
                        },
                      });
                    }
                    navigate("/");
                  },
                  onBroadcasted() {
                    navigate(`/bridge`);
                    analyticsStore.logEvent("bridge_txn_broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: feeConfig.feeType,
                    });
                  },
                }
              );
            } catch (e) {
              analyticsStore.logEvent("bridge_txn_broadcasted_fail", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                feeType: feeConfig.feeType,
                message: e?.message ?? "",
              });
              navigate(
                `/bridge?defaultRecipient=${recipient}&defaultAmount=${bridgeAmount}`
              );
              notification.push({
                placement: "top-center",
                type: "danger",
                duration: 2,
                content: `Bridge Failed: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            }
          }}
        >
          <FormattedMessage id="ibc.transfer.next" />
        </Button>
      </div>
    </form>
  );
});
