import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button, Tooltip } from "reactstrap";
import { Address } from "../../components/address";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";

import Modal from "react-modal";
import { useNotification } from "../../components/notification";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import classnames from "classnames";
import { Dec } from "@keplr-wallet/unit";

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
          duration: 0.25,
        },
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
  const { accountStore, chainStore, queriesStore, analyticsStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const history = useHistory();

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const sendBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styleTxButton.containerTxButton}>
      <Modal
        style={{ content: { width: "330px", minWidth: "330px" } }}
        isOpen={isDepositOpen}
        onRequestClose={() => {
          setIsDepositOpen(false);
        }}
      >
        <DepositModal bech32Address={accountInfo.bech32Address} />
      </Modal>
      <Button
        className={styleTxButton.button}
        color="primary"
        outline
        onClick={(e) => {
          e.preventDefault();
          analyticsStore.logEvent("Deposit button clicked", {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
          });

          setIsDepositOpen(true);
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
          analyticsStore.logEvent("Send token started", {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
          });

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
          isOpen={tooltipOpen}
          target={sendBtnRef}
          toggle={() => setTooltipOpen((value) => !value)}
          fade
        >
          <FormattedMessage id="main.account.tooltip.no-asset" />
        </Tooltip>
      ) : null}
    </div>
  );
});
