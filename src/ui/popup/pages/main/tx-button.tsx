import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button } from "../../../components/button";
import { Address } from "../../../components/address";

import { observer } from "mobx-react";

import { useStore } from "../../stores";

import Modal from "react-modal";
import { useNotification } from "../../../components/notification";

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

  const notification = useNotification();

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(bech32Address);
    // TODO: Show success tooltip.
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: "Address copied!",
      canDelete: true,
      transition: {
        duration: 0.25
      }
    });
  }, [notification, bech32Address]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "250px" }}
      className={styleTxButton.depositModal}
    >
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }} />
        <canvas id="qrcode" ref={qrCodeRef} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleTxButton.address} onClick={copyAddress}>
        <Address
          maxCharacters={28}
          lineBreakBeforePrefix={false}
          tooltipFontSize="12px"
        >
          {bech32Address}
        </Address>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
};

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const toggleDepositModal = useCallback(() => {
    setIsDepositOpen(!isDepositOpen);
  }, [isDepositOpen]);

  return (
    <div className={styleTxButton.containerTxButton}>
      <Modal
        style={{ content: { width: "330px", minWidth: "330px" } }}
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
        onClick={toggleDepositModal}
      >
        Deposit
      </Button>
      <Button
        color="primary"
        size="medium"
        to="/send"
        outline
        disabled={accountStore.assets.length === 0}
      >
        Send
      </Button>
    </div>
  );
});
