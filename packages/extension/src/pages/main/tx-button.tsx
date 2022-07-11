import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, Tooltip } from "reactstrap";

import styleTxButton from "./tx-button.module.scss";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";

import Modal from "react-modal";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import { Dec } from "@keplr-wallet/unit";
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

  return (
    <div className={styleTxButton.depositModal}>
      <h1 style={{ marginBottom: 0 }}>Scan QR code</h1>
      <canvas className={styleTxButton.qrcode} id="qrcode" ref={qrCodeRef} />
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

  const [sendTooltipOpen, setSendTooltipOpen] = useState(false);
  const [stakeTooltipOpen, setStakeTooltipOpen] = useState(false);
  const history = useHistory();

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const isRewardExist = rewards.rewards.length > 0;

  const isStakableExist = useMemo(() => {
    return stakable.balance.toDec().gt(new Dec(0));
  }, [stakable.balance]);
  const stakeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styleTxButton.containerTxButton}>
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
      <Button
        className={styleTxButton.button}
        color="primary"
        outline
        onClick={(e) => {
          e.preventDefault();

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
      <a
        href={chainStore.current.walletUrlForStaking}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!isStakableExist) {
            e.preventDefault();
          } else {
            analyticsStore.logEvent("Stake button clicked", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
            });
          }
        }}
      >
        {/*
            "Disabled" property in button tag will block the mouse enter/leave events.
            So, tooltip will not work as expected.
            To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
          */}
        <Button
          innerRef={stakeBtnRef}
          className={classnames(styleTxButton.button, {
            disabled: !isStakableExist,
          })}
          color="primary"
          outline={isRewardExist}
        >
          <FormattedMessage id="main.stake.button.stake" />
        </Button>
        {!isStakableExist ? (
          <Tooltip
            placement="bottom"
            isOpen={stakeTooltipOpen}
            target={stakeBtnRef}
            toggle={() => setStakeTooltipOpen((value) => !value)}
            fade
          >
            <FormattedMessage id="main.stake.tooltip.no-asset" />
          </Tooltip>
        ) : null}
      </a>
    </div>
  );
});
