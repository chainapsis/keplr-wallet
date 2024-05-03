import { AppCurrency } from "@keplr-wallet/types";
import { shortenNumber } from "@utils/format";
import sendIcon from "@assets/svg/wireframe/activity-send.svg";
import recieveIcon from "@assets/svg/wireframe/activity-recieve.svg";
import stakeIcon from "@assets/svg/wireframe/activity-stake.svg";

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

export const getActivityIcon = (
  type: string,
  isAmountDeducted: boolean | undefined
): string => {
  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend":
      return isAmountDeducted ? sendIcon : recieveIcon;
    case "/cosmos.staking.v1beta1.MsgDelegate":
    case "/cosmos.staking.v1beta1.MsgUndelegate":
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
    case "contract":
      return stakeIcon;
    default:
      return stakeIcon;
  }
};

//gov utils
export const govOptions = [
  { value: "YES", label: "Voted Yes" },
  { value: "NO", label: "Voted No" },
  { value: "ABSTAIN", label: "Voted Abstain" },
  { value: "NO_WITH_VETO", label: "Voted No With Veto" },
];
