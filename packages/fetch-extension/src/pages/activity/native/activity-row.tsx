import style from "./style.module.scss";
import sendIcon from "@assets/icon/send-grey.png";
import stakeIcon from "@assets/icon/stake-grey.png";
import contractIcon from "@assets/icon/contract-grey.png";
import claimIcon from "@assets/icon/claim-grey.png";
import success from "@assets/icon/success.png";
import cancel from "@assets/icon/cancel.png";
import React from "react";
import { formatActivityHash } from "@utils/format";
import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "../../../stores";

const getActivityIcon = (type: string): string => {
  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend":
      return sendIcon;
    case "/cosmos.staking.v1beta1.MsgDelegate":
    case "/cosmos.staking.v1beta1.MsgUndelegate":
      return stakeIcon;
    case "contract":
      return contractIcon;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      return claimIcon;
    default:
      return contractIcon;
  }
};

const getHash = (node: any): any => {
  const { typeUrl, json } = node.transaction.messages.nodes[0];

  switch (typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend":
    case "/cosmwasm.wasm.v1.MsgExecuteContract":
    case "/cosmos.authz.v1beta1.MsgRevoke":
    case "/ibc.applications.transfer.v1.MsgTransfer":
      return formatActivityHash(node.transaction.id) || null;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      return formatActivityHash(JSON.parse(json).validatorAddress) || null;
    case "/cosmos.staking.v1beta1.MsgDelegate":
    case "/cosmos.staking.v1beta1.MsgUndelegate":
      return formatActivityHash(JSON.parse(json).validatorAddress) || null;
    default:
      return formatActivityHash(node.transaction.id);
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case "Success":
      return success;
    case "Error":
      return cancel;
    default:
      return cancel;
  }
};

export const shortenNumber = (value: string, decimal = 18) => {
  const number = Math.abs(parseFloat(value)) / 10 ** decimal;
  let result = "";
  if (number >= 1000000) {
    result = (number / 1000000).toFixed(2) + " M";
  } else if (number >= 1000) {
    result = (number / 1000).toFixed(2) + " K";
  } else if (number >= 1) {
    result = number.toFixed(2) + " ";
  } else if (number >= 10 ** -3) {
    result = (number * 1000).toFixed(2) + " m";
  } else if (number >= 10 ** -6) {
    result = (number * 10 ** 6).toFixed(2) + " u";
  } else if (number >= 10 ** -9) {
    result = (number * 10 ** 9).toFixed(2) + " n";
  } else if (number >= 10 ** -12) {
    result = (number * 10 ** 9).toFixed(3) + " n";
  } else if (number >= 10 ** -18) {
    result = (number * 10 ** 18).toFixed(0) + " a";
  } else {
    result = number.toFixed(2) + " ";
  }

  return result;
};

export const ActivityRow = ({ node }: { node: any }) => {
  const { chainStore } = useStore();

  const getAmount = (denom: string, amount: string) => {
    const amountCurrency = chainStore.current.currencies.find(
      (currency: AppCurrency) => currency.coinMinimalDenom === denom
    );
    if (amountCurrency) {
      const amountValue = shortenNumber(amount, amountCurrency?.coinDecimals);

      return `${amountValue}${amountCurrency.coinDenom}`;
    } else return `${amount} ${denom}`;
  };

  const getDetails = (node: any): any => {
    const { nodes } = node.transaction.messages;
    const { typeUrl, json } = nodes[0];
    const parsedJson = JSON.parse(json);
    let currency = "afet";
    const isAmountDeducted = parseFloat(node.balanceOffset) < 0;

    if (parsedJson.amount) {
      currency = Array.isArray(parsedJson.amount)
        ? parsedJson.amount[0].denom
        : parsedJson.amount.denom;
    } else if (parsedJson.token) {
      currency = parsedJson.token.denom;
    }

    let verb = "Spent";

    switch (typeUrl) {
      case "/cosmos.bank.v1beta1.MsgSend":
        verb = isAmountDeducted ? "Send" : "Received";
        break;
      case "/ibc.applications.transfer.v1.MsgTransfer":
        verb = "IBC transfer";
        break;
      case "/cosmos.staking.v1beta1.MsgDelegate":
      case "/cosmos.staking.v1beta1.MsgUndelegate":
        verb = isAmountDeducted ? "Staked" : "Unstaked";
        break;
      case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
        verb = "Claimed";
        break;
      case "/cosmos.authz.v1beta1.MsgExec":
      case "/cosmwasm.wasm.v1.MsgExecuteContract":
      case "/cosmos.authz.v1beta1.MsgRevoke":
        verb = isAmountDeducted ? "Transferred" : "Received";
        break;
      default:
        verb = isAmountDeducted ? "Transferred" : "Received";
    }

    return getAmount(currency, node.balanceOffset) + " " + verb;
  };

  const details = getDetails(node);
  const hash = getHash(node);
  const { typeUrl } = node.transaction.messages.nodes[0];
  return (
    <a
      href={
        "https://fetchstation.azoyalabs.com/mainnet/explorer/transactions/" +
        node.transaction.id
      }
      target="_blank"
      rel="noreferrer"
    >
      <div className={style["activityRow"]}>
        <div className={style["activityCol"]} style={{ width: "7%" }}>
          <img src={getActivityIcon(typeUrl)} alt={typeUrl} />
        </div>
        <div className={style["activityCol"]} style={{ width: "33%" }}>
          {hash}
        </div>
        <div className={style["activityCol"]} style={{ width: "53%" }}>
          {details}
        </div>
        <div className={style["activityCol"]} style={{ width: "7%" }}>
          <img src={getStatusIcon(node.transaction.status)} alt={node.status} />
        </div>
      </div>
    </a>
  );
};
