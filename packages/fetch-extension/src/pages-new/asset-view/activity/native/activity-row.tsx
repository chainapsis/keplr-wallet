import style from "./style.module.scss";
import sendIcon from "@assets/icon/send-grey.png";
import stakeIcon from "@assets/icon/stake-grey.png";
import contractIcon from "@assets/icon/contract-grey.png";
import claimIcon from "@assets/icon/claim-grey.png";
import React from "react";
import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "../../../../stores";

const getActivityIcon = (type: string): string => {
  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend":
      return sendIcon;
    case "/cosmos.staking.v1beta1.MsgDelegate":
    case "/cosmos.staking.v1beta1.MsgUndelegate":
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
      return stakeIcon;
    case "contract":
      return contractIcon;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      return claimIcon;
    default:
      return contractIcon;
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
      case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
        verb = "Redelegated";
        break;
      case "/cosmos.bank.v1beta1.MsgSend":
        verb = isAmountDeducted ? "Sent" : "Received";
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
    const amount = getAmount(currency, node.balanceOffset);
    const [amountNumber, amountAlphabetic] = parseAmount(amount);

    return { amountNumber, amountAlphabetic, verb };
  };

  const parseAmount = (amount: string): [string, string] => {
    const matches = amount.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);

    if (matches) {
      const [, numberPart, alphabeticPart] = matches;
      return [numberPart, alphabeticPart];
    }

    return ["", ""];
  };

  const details = getDetails(node);
  const { typeUrl } = node.transaction.messages.nodes[0];
  return (
    <React.Fragment>
      <a
        href={
          "https://fetchstation.azoyalabs.com/mainnet/explorer/transactions/" +
          node.transaction.id
        }
        target="_blank"
        rel="noreferrer"
      >
        <div className={style["activityRow"]}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className={style["leftImage"]}>
              <img
                className={style["img"]}
                src={getActivityIcon(typeUrl)}
                alt={typeUrl}
              />
            </div>
            <div className={style["middleSection"]}>
              <div className={style["title"]}>{details.verb}</div>
              <div className={style["subTitle"]}>
                {node.transaction.status === "Success" ? (
                  <div className={style["confirmed"]}>Confirmed</div>
                ) : (
                  <div className={style["error"]}>Error</div>
                )}
              </div>
            </div>
          </div>
          <div className={style["rightContent"]}>
            <div className={style["amountWrapper"]}>
              <div className={style["amountNumber"]}>
                {details.amountNumber}
              </div>
              <div className={style["amountAlphabetic"]}>
                {details.amountAlphabetic}
              </div>
            </div>
          </div>
        </div>
      </a>
      <div className={style["hr"]} />
    </React.Fragment>
  );
};
