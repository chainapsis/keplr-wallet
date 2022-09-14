import React, { FunctionComponent, useCallback } from "react";
import StyleQrCode from "./qr-code.module.scss";
import Modal from "react-modal";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

export const DepositModal: FunctionComponent<{
  chainName: string;
  bech32Address: string;
  isDepositOpen: boolean;
  setIsDepositOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ chainName, bech32Address, isDepositOpen, setIsDepositOpen }) => {
  const qrCodeRef = useCallback(
    (node) => {
      if (node !== null && bech32Address) {
        QrCode.toCanvas(node, bech32Address);
      }
    },
    [bech32Address]
  );

  return (
    <Modal
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(50, 50, 50, 0.75)",
        },
        content: {
          width: "330px",
          minWidth: "330px",
          minHeight: "unset",
          maxHeight: "unset",
        },
      }}
      isOpen={isDepositOpen}
      onRequestClose={() => {
        setIsDepositOpen(false);
      }}
    >
      <div className={StyleQrCode.depositModal}>
        <h3 style={{ marginBottom: "8px" }}>
          Deposit to your address to receive tokens
        </h3>
        <div
          style={{
            marginBottom: "8px",
            fontSize: "14px",
            overflowWrap: "anywhere",
          }}
        >
          {bech32Address}
        </div>
        <div
          style={{
            marginBottom: 0,
            fontSize: "14px",
            color: "white",
            backgroundColor: "#FC7C5F",
            padding: "5px 8px",
          }}
        >
          Deposits must be using the {chainName} Network. Do not send token from
          other networks to this address or they may be lost.
        </div>
        <canvas id="qrcode" ref={qrCodeRef} />
        <div style={{ marginBottom: 0, fontSize: "16px" }}>
          Scan to copy address to device
        </div>
      </div>
    </Modal>
  );
};
