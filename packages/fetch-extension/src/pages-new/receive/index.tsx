import React, { FunctionComponent, useCallback } from "react";
import StyleQrCode from "./qr-code.module.scss";
import { useStore } from "../../stores";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { useNavigate } from "react-router";
import { Card } from "@components-v2/card";
import { WalletStatus } from "@keplr-wallet/stores";
import { useNotification } from "@components/notification";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

export const Receive: FunctionComponent = () => {
  const { chainStore, accountStore } = useStore();
  const navigate = useNavigate();
  const notification = useNotification();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const qrCodeRef = useCallback(
    (node) => {
      if (node !== null && accountInfo.bech32Address) {
        QrCode.toCanvas(node, accountInfo.bech32Address);
      }
    },
    [accountInfo.bech32Address]
  );

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: "Copied Address",
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }
    },
    [accountInfo.walletStatus, notification]
  );

  return (
    <HeaderLayout
      onBackButton={() => navigate("/")}
      smallTitle={true}
      alternativeTitle="Receive"
      showBottomMenu={false}
      showTopMenu={true}
    >
      <div>
        <div className={StyleQrCode["depositModal"]}>
          <h3
            className={StyleQrCode["depositTitle"]}
            style={{ marginBottom: "6px" }}
          >
            Deposit to your address <br /> to receive tokens
            <br />
          </h3>
          <div className={StyleQrCode["depositSubtitle"]}>
            Scan to code or use the address below <br /> to copy your deposit
            address
          </div>
          <div style={{ margin: "24px 0px" }}>
            {" "}
            <canvas id="qrcode" ref={qrCodeRef} />
          </div>
        </div>
        <Card
          style={{
            background: "rgba(255, 255, 255, 0.10)",
            marginBottom: "24px",
          }}
          headingStyle={{
            width: "270px",
          }}
          heading={accountInfo.bech32Address}
          rightContent={require("@assets/svg/wireframe/copy.svg")}
          rightContentOnClick={() => copyAddress(accountInfo.bech32Address)}
        />
        <div className={StyleQrCode["depositWarning"]}>
          Deposits must be using the {chainStore.current.chainName} Network. Do
          not send token from other networks to this address or they may be
          lost.
        </div>
      </div>
    </HeaderLayout>
  );
};
