import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";

import style from "./style.module.scss";
import {
  AddressInput,
  CoinInput,
  FeeButtons,
  MemoInput,
} from "@components-v2/form";
import { useGasSimulator, useNativeBridgeConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useNotification } from "@components/notification";
import { useIntl } from "react-intl";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { ButtonV2 } from "@components-v2/buttons/button";
import { Card } from "@components-v2/card";

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

  analyticsStore.logEvent("Native bridge page opened", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
  });

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
            analyticsStore.logEvent("Bridge token tx broadcasted", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
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
      <Card
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "18px" }}
        heading={`Native to ERC20 Limit: ${limit} FET`}
      />
      <div className={style["formInnerContainer"]}>
        <CoinInput
          label={intl.formatMessage({
            id: "send.input.amount",
          })}
          amountConfig={nativeBridgeConfig.amountConfig}
          dropdownDisabled
        />
        <AddressInput
          label={"Recipient (Ethereum address)"}
          recipientConfig={nativeBridgeConfig.recipientConfig}
          value={""}
        />
        {keyRingStore.keyRingType !== "ledger" && (
          <div
            className={style["addressSelector"]}
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
        <div className={style["hr"]} />
        <MemoInput
          label={intl.formatMessage({
            id: "send.input.memo",
          })}
          memoConfig={nativeBridgeConfig.memoConfig}
        />
        {fee && (
          <Card
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              marginTop: "18px",
              color: "rgba(255,255,255,0.8)",
            }}
            heading={"Bridging fee"}
            subheading={
              <input
                className={style["input"]}
                readOnly
                disabled
                value={`${fee} FET`}
              />
            }
          />
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

        <ButtonV2
          disabled={!isValid}
          onClick={(e: any) => {
            e.preventDefault();

            onSubmit();
          }}
          text={"Next"}
        />
      </div>
    </form>
  );
});
