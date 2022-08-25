import React, { useEffect, useState, FunctionComponent, useRef } from "react";
import { Button } from "reactstrap";
import Modal from "react-modal";

import styleDeposit from "./deposit.module.scss";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FormattedMessage } from "react-intl";

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
    <div className={styleDeposit.depositModal}>
      <h1 style={{ marginBottom: 0 }}>Scan QR code</h1>
      <canvas className={styleDeposit.qrcode} id="qrcode" ref={qrCodeRef} />
    </div>
  );
};

export const DepositView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <div>
      <div className={styleDeposit.containerInner}>
        <Modal
          style={{
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
          <DepositModal bech32Address={accountInfo.bech32Address} />
        </Modal>

        <div className={styleDeposit.vertical}>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleDeposit.paragraphMain
            )}
          >
            <FormattedMessage id="main.account.button.deposit" />{" "}
            {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
          </p>
          <p
            className={classnames(
              "h5",
              "my-0",
              "font-weight-normal",
              styleDeposit.paragraphSub
            )}
          >
            <FormattedMessage id="main.account.deposit.paragraph" />
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <Button
          className={styleDeposit.button}
          color="primary"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setIsDepositOpen(true);
          }}
        >
          <FormattedMessage id="main.account.button.deposit" />
        </Button>
      </div>

      {chainStore.current.chainId == "fetchhub-4" && (
        <div>
          <hr className={styleDeposit.hr} />

          <div className={styleDeposit.containerInner}>
            <div className={styleDeposit.vertical}>
              <p
                className={classnames(
                  "h4",
                  "my-0",
                  "font-weight-normal",
                  styleDeposit.paragraphMain
                )}
              >
                <FormattedMessage id="main.account.button.buy" />{" "}
                {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
              </p>
              <p
                className={classnames(
                  "h5",
                  "my-0",
                  "font-weight-normal",
                  styleDeposit.paragraphSub
                )}
              >
                <FormattedMessage id="main.account.buy.paragraph" />
              </p>
            </div>
            <div style={{ flex: 1 }} />
            <a
              href={"https://indacoin.io/buy-fetch.ai-with-card"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className={styleDeposit.button} color="primary" size="sm">
                <FormattedMessage id="main.account.button.buy" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
});
