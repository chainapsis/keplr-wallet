import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button } from "../../../components/button";

import { observer } from "mobx-react";

import { useStore } from "../../stores";

import Modal from "react-modal";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

const DepositModal: FunctionComponent<{
  bech32Address: string;
}> = ({ bech32Address }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCodeRef.current && bech32Address) {
      QrCode.toCanvas(qrCodeRef.current, bech32Address);
    }
  }, [bech32Address]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "250px" }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }} />
        <canvas id="qrcode" ref={qrCodeRef} />
        <div style={{ flex: 1 }} />
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
};

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <div className={styleTxButton.containerTxButton}>
      <Modal
        style={{ content: { width: "300px", minWidth: "300px" } }}
        isOpen={isDepositOpen}
        onRequestClose={() => {
          setIsDepositOpen(false);
        }}
      >
        <DepositModal bech32Address={accountStore.bech32Address} />
      </Modal>
      <Button
        type="button"
        color="link"
        size="medium"
        outline
        onClick={() => setIsDepositOpen(!isDepositOpen)}
      >
        Deposit
      </Button>
      <Button color="primary" size="medium" to="/send" outline>
        Send
      </Button>
    </div>
  );
});
