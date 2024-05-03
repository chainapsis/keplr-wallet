import { AppCurrency } from "@keplr-wallet/types";
import { shortenNumber } from "utils/format/format";
import { ArrowUpIcon } from "components/new/icon/arrow-up";
import { ArrowDownIcon } from "components/new/icon/arrow-down";
import { StakeIcon } from "components/new/icon/stake-icon";
import React from "react";
import { UnstakedIcon } from "components/new/icon/unstaked";
import { EditIcon } from "components/new/icon/edit";
import { ClaimIcon } from "components/new/icon/claim-icon";
import { IbcUpDownIcon } from "components/new/icon/ibc-up-down";
import { LeftRightCrossIcon } from "components/new/icon/left-right-cross";
import { WalletIcon } from "components/new/icon/wallet";

export function stableSort<Item>(
  arr: ReadonlyArray<Item>,
  compareFn: (a: Item, b: Item) => number
): Array<Item> {
  const itemsWithIndex = arr.map<{
    index: number;
    item: Item;
  }>((item, index) => {
    return {
      index,
      item,
    };
  });

  return itemsWithIndex
    .sort((a, b) => {
      const compared = compareFn(a.item, b.item);
      if (compared === 0) {
        return a.index < b.index ? -1 : 1;
      }
      return compared;
    })
    .map(({ item }) => item);
}

const getAmount = (denom: string, amount: string, chainStore: any) => {
  const amountCurrency = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === denom
  );
  if (amountCurrency) {
    const amountValue = shortenNumber(amount, amountCurrency?.coinDecimals);

    return `${amountValue}${amountCurrency.coinDenom}`;
  } else return `${amount} ${denom}`;
};
const parseAmount = (amount: string): [string, string] => {
  const matches = amount.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);

  if (matches) {
    const [, numberPart, alphabeticPart] = matches;
    return [numberPart, alphabeticPart];
  }

  return ["", ""];
};
export const getDetails = (node: any, chainStore: any): any => {
  const { nodes } = node.transaction.messages;
  const { timestamp } = node.block;
  const { typeUrl, json } = nodes[0];
  const parsedJson = JSON.parse(json);
  const toAddress = parsedJson.toAddress;
  const { delegatorAddress, validatorAddress, validatorDstAddress, receiver } =
    parsedJson;
  const { fees, memo, id: hash, signerAddress, gasUsed } = node.transaction;
  const amt = parsedJson.amount;
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
      verb = "Staked";
      break;
    case "/cosmos.staking.v1beta1.MsgUndelegate":
      verb = "Unstaked";
      break;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      verb = "Claimed";
      break;
    case "/cosmos.authz.v1beta1.MsgExec":
    case "/cosmwasm.wasm.v1.MsgExecuteContract":
    case "/cosmos.authz.v1beta1.MsgRevoke":
      verb = "Smart Contract Interaction";
      break;
    default:
      verb = isAmountDeducted ? "Transferred" : "Received";
  }
  const amount = getAmount(currency, node.balanceOffset, chainStore);
  const [amountNumber, amountAlphabetic] = parseAmount(amount);
  return {
    amountNumber,
    amountAlphabetic,
    verb,
    timestamp,
    fees,
    memo,
    signerAddress,
    hash,
    amt,
    gasUsed,
    toAddress,
    validatorAddress,
    delegatorAddress,
    validatorDstAddress,
    receiver,
  };
};

export const getActivityIcon = (verb: string) => {
  switch (verb) {
    case "Sent":
      return <ArrowUpIcon size={14} />;
    case "Received":
      return <ArrowDownIcon size={14} />;
    case "Staked":
      return <StakeIcon size={14} />;
    case "Unstaked":
      return <UnstakedIcon />;
    case "Redelegated":
      return <EditIcon />;
    case "Claimed":
      return <ClaimIcon />;
    case "IBC transfer":
      return <IbcUpDownIcon size={20} />;
    case "Smart Contract Interaction":
      return <LeftRightCrossIcon size={20} />;
    default:
      return <WalletIcon size={16} />;
  }
};
