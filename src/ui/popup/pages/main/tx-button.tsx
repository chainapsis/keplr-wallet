import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button, Tooltip } from "reactstrap";
import { Address } from "../../../components/address";

import { observer } from "mobx-react";

import { useStore } from "../../stores";

import Modal from "react-modal";
import { useNotification } from "../../../components/notification";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import classnames from "classnames";

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

  const copyAddress = useCallback(
    async (e: MouseEvent) => {
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

      e.preventDefault();
    },
    [notification, bech32Address]
  );

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

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toogleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  const history = useHistory();

  const onSendButton = useCallback(
    (e: MouseEvent) => {
      if (accountStore.assets.length !== 0) {
        history.push("/send");
      }

      e.preventDefault();
    },
    [accountStore.assets.length, history]
  );

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
        className={styleTxButton.button}
        color="primary"
        outline
        onClick={toggleDepositModal}
      >
        <FormattedMessage id="main.account.button.deposit" />
      </Button>
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <Button
        id="btn-send"
        className={classnames(styleTxButton.button, {
          disabled: accountStore.assets.length === 0
        })}
        color="primary"
        outline
        onClick={onSendButton}
      >
        <FormattedMessage id="main.account.button.send" />
      </Button>
      {accountStore.assets.length === 0 ? (
        <Tooltip
          placement="bottom"
          isOpen={tooltipOpen}
          target="btn-send"
          toggle={toogleTooltip}
          fade
        >
          <FormattedMessage id="main.account.tooltip.no-asset" />
        </Tooltip>
      ) : null}
    </div>
  );
});
