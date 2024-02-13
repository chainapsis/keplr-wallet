import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";

import style from "./style.module.scss";
import { Button } from "reactstrap";
import {
  AddressInput,
  CoinInput,
  FeeButtons,
  Input,
  MemoInput,
} from "@components/form";
import { useGasSimulator, useNativeBridgeConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useNotification } from "@components/notification";
import { FormattedMessage, useIntl } from "react-intl";
import { ExtensionKVStore } from "@keplr-wallet/common";

export const FetchhubBridge: FunctionComponent<{
  limit: string;
  fee?: string;
}> = observer(({ limit, fee }) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const {
    chainStore,
    accountStore,
    queriesStore,
    keyRingStore,
    analyticsStore,
    priceStore,
  } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const notification = useNotification();

  const nativeBridgeConfig = useNativeBridgeConfig(
    chainStore,
    queriesStore,
    chainStore.current.chainId,
    accountInfo.bech32Address
  );
  const bridgeGasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.native-bridge.send"),
    chainStore,
    chainStore.current.chainId,
    nativeBridgeConfig.gasConfig,
    nativeBridgeConfig.feeConfig,
    "bridge",
    () => {
      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        nativeBridgeConfig.amountConfig.error != null ||
        nativeBridgeConfig.recipientConfig.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      return accountInfo.cosmwasm.makeNativeBridgeTx(
        nativeBridgeConfig.amountConfig.amount,
        nativeBridgeConfig.recipientConfig.recipient
      );
    }
  );

  const isValid =
    nativeBridgeConfig.recipientConfig.error == null &&
    nativeBridgeConfig.memoConfig.error == null &&
    nativeBridgeConfig.amountConfig.error == null &&
    nativeBridgeConfig.feeConfig.error == null &&
    nativeBridgeConfig.gasConfig.error == null;

  if (accountInfo.txTypeInProgress === "nativeBridgeSend") {
    return (
      <p
        style={{
          textAlign: "center",
          position: "relative",
          top: "45%",
        }}
      >
        Bridging in progress <i className="fa fa-spinner fa-spin fa-fw" />{" "}
      </p>
    );
  }

  const onSubmit = async () => {
    try {
      analyticsStore.logEvent("bridge_txn_click", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      });
      const tx = accountInfo.cosmwasm.makeNativeBridgeTx(
        nativeBridgeConfig.amountConfig.amount,
        nativeBridgeConfig.recipientConfig.recipient
      );

      await tx.send(
        nativeBridgeConfig.feeConfig.toStdFee(),
        nativeBridgeConfig.memoConfig.memo,
        {
          preferNoSetFee: true,
          preferNoSetMemo: true,
        },
        {
          onBroadcasted() {
            navigate("/bridge");
            analyticsStore.logEvent("bridge_txn_broadcasted", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
              feeType: nativeBridgeConfig.feeConfig.feeType,
            });
          },
          onFulfill(tx) {
            if (tx.code == null || tx.code === 0) {
              notification.push({
                placement: "top-center",
                type: "success",
                duration: 2,
                content: "Bridging Successful",
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
                content: "Bridging Failed",
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            }
            navigate("/");
          },
        }
      );
    } catch (e) {
      analyticsStore.logEvent("bridge_txn_broadcasted_fail", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
        feeType: nativeBridgeConfig.feeConfig.feeType,
        message: e?.message ?? "",
      });
      navigate("/", { replace: true });
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Fail to bridge token: ${e.message}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  return (
    <form className={style["formContainer"]}>
      <div className={style["bridgeLimit"]}>
        Native to ERC20 Limit: {limit} FET
      </div>
      <div className={style["formInnerContainer"]}>
        <AddressInput
          label={"Recipient (Ethereum address)"}
          recipientConfig={nativeBridgeConfig.recipientConfig}
          // memoConfig={nativeBridgeConfig.memoConfig}
          // ibcChannelConfig={nativeBridgeConfig.channelConfig}
          // disabled={!isChannelSet}
          value={""}
          pageName={"Bridge"}
        />
        {keyRingStore.keyRingType !== "ledger" && (
          <div
            style={{
              overflowWrap: "anywhere",
              fontSize: "small",
              marginTop: "-15px",
              marginBottom: "15px",
              cursor: "pointer",
              textDecoration: "underline",
              color: "#555555",
            }}
            onClick={(e) => {
              e.preventDefault();
              nativeBridgeConfig.recipientConfig.setRawRecipient(
                accountStore.getAccount("1").ethereumHexAddress
              );
            }}
          >
            Bridge to your Ethereum address:{" "}
            {accountStore.getAccount("1").ethereumHexAddress}
          </div>
        )}
        <MemoInput
          label={intl.formatMessage({
            id: "send.input.memo",
          })}
          memoConfig={nativeBridgeConfig.memoConfig}
          // disabled={!isChannelSet}
        />
        <div style={{ flex: 1 }} />

        <CoinInput
          label={intl.formatMessage({
            id: "send.input.amount",
          })}
          amountConfig={nativeBridgeConfig.amountConfig}
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
        <FeeButtons
          label={intl.formatMessage({
            id: "send.input.fee",
          })}
          feeConfig={nativeBridgeConfig.feeConfig}
          gasConfig={nativeBridgeConfig.gasConfig}
          priceStore={priceStore}
          gasSimulator={bridgeGasSimulator}
        />

        <Button
          type="submit"
          color="primary"
          block
          disabled={!isValid}
          onClick={(e) => {
            e.preventDefault();

            onSubmit();
          }}
        >
          <FormattedMessage id="ibc.transfer.next" />
        </Button>
      </div>
    </form>
  );
});
