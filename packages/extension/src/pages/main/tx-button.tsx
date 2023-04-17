import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button, Tooltip } from "reactstrap";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";

import Modal from "react-modal";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import classnames from "classnames";
import { Dec } from "@keplr-wallet/unit";
import { BuySupportServiceInfo, useBuy } from "../../hooks";
import classNames from "classnames";

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const [sendTooltipOpen, setSendTooltipOpen] = useState(false);
  const [buyTooltipOpen, setBuyTooltipOpen] = useState(false);

  const history = useHistory();

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const buyBtnRef = useRef<HTMLButtonElement>(null);

  const { isBuySupportChain, buySupportServiceInfos } = useBuy();

  return (
    <div className={styleTxButton.containerTxButton}>
      <Button
        innerRef={buyBtnRef}
        className={classnames(styleTxButton.button, {
          disabled: !isBuySupportChain,
        })}
        color="primary"
        outline
        onClick={(e) => {
          e.preventDefault();

          if (isBuySupportChain) {
            setIsBuyModalOpen(true);
          }
        }}
      >
        <FormattedMessage id="main.account.button.buy" />
      </Button>
      {!isBuySupportChain ? (
        <Tooltip
          placement="bottom"
          isOpen={buyTooltipOpen}
          target={buyBtnRef}
          toggle={() => setBuyTooltipOpen((value) => !value)}
          fade
        >
          <FormattedMessage id="main.account.button.buy.not-support" />
        </Tooltip>
      ) : null}
      <Button
        className={styleTxButton.button}
        color="primary"
        outline
        onClick={(e) => {
          e.preventDefault();

          setIsDepositModalOpen(true);
        }}
      >
        <FormattedMessage id="main.account.button.deposit" />
      </Button>
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <Button
        innerRef={sendBtnRef}
        className={classnames(styleTxButton.button, {
          disabled: !hasAssets,
        })}
        color="primary"
        outline
        data-loading={accountInfo.isSendingMsg === "send"}
        onClick={(e) => {
          e.preventDefault();

          if (hasAssets) {
            history.push("/send");
          }
        }}
      >
        <FormattedMessage id="main.account.button.send" />
      </Button>
      {!hasAssets ? (
        <Tooltip
          placement="bottom"
          isOpen={sendTooltipOpen}
          target={sendBtnRef}
          toggle={() => setSendTooltipOpen((value) => !value)}
          fade
        >
          <FormattedMessage id="main.account.tooltip.no-asset" />
        </Tooltip>
      ) : null}
      <Modal
        style={{
          content: {
            width: "330px",
            minWidth: "330px",
            minHeight: "unset",
            maxHeight: "unset",
          },
        }}
        isOpen={isDepositModalOpen}
        onRequestClose={() => {
          setIsDepositModalOpen(false);
        }}
      >
        <DepositModalContent bech32Address={accountInfo.bech32Address} />
      </Modal>
      <Modal
        style={{
          content: {
            width: "330px",
            minWidth: "330px",
            minHeight: "unset",
            maxHeight: "unset",
            padding: "24px 12px",
          },
        }}
        isOpen={isBuyModalOpen}
        onRequestClose={() => {
          setIsBuyModalOpen(false);
        }}
      >
        <BuyModalContent buySupportServiceInfos={buySupportServiceInfos} />
      </Modal>
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

const DepositModalContent: FunctionComponent<{
  bech32Address: string;
}> = ({ bech32Address }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCodeRef.current && bech32Address) {
      QrCode.toCanvas(qrCodeRef.current, bech32Address);
    }
  }, [bech32Address]);

  return (
    <div className={styleTxButton.modalContent}>
      <h1 style={{ marginBottom: 0 }}>Scan QR code</h1>
      <canvas className={styleTxButton.qrcode} id="qrcode" ref={qrCodeRef} />
    </div>
  );
};

const BuyModalContent: FunctionComponent<{
  buySupportServiceInfos: BuySupportServiceInfo[];
}> = ({ buySupportServiceInfos }) => {
  return (
    <div className={styleTxButton.modalContent}>
      <h1 style={{ marginBottom: 0 }}>Buy Crypto</h1>
      <div className={styleTxButton.buySupportServices}>
        {buySupportServiceInfos.map((serviceInfo) => (
          <a
            key={serviceInfo.serviceId}
            href={serviceInfo.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(styleTxButton.service, {
              [styleTxButton.disabled]: !serviceInfo.buyUrl,
            })}
            onClick={(e) => !serviceInfo.buyUrl && e.preventDefault()}
          >
            <div className={styleTxButton.serviceLogoContainer}>
              <img
                src={require(`../../public/assets/img/fiat-on-ramp/${serviceInfo.serviceId}.svg`)}
              />
            </div>
            <div className={styleTxButton.serviceName}>
              {serviceInfo.serviceName}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
