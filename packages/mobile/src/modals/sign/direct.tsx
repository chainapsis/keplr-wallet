import { AppCurrency } from "@keplr-wallet/types";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { MsgExecuteContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgUndelegate,
  renderMsgTransfer,
  renderMsgVote,
  renderMsgWithdrawDelegatorReward,
  renderUnknownMessage,
} from "./messages";
import { Buffer } from "buffer/";

export function renderDirectMessage(
  msg: AnyWithUnpacked,
  currencies: AppCurrency[]
) {
  try {
    if (msg instanceof UnknownMessage) {
      return renderUnknownMessage(msg.toJSON());
    }

    if ("unpacked" in msg) {
      switch (msg.typeUrl) {
        case "/cosmos.bank.v1beta1.MsgSend": {
          const sendMsg = msg.unpacked as MsgSend;
          return renderMsgSend(currencies, sendMsg.amount, sendMsg.toAddress);
        }
        case "/cosmos.staking.v1beta1.MsgDelegate": {
          const delegateMsg = msg.unpacked as MsgDelegate;
          if (delegateMsg.amount) {
            return renderMsgDelegate(
              currencies,
              delegateMsg.amount,
              delegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
          const redelegateMsg = msg.unpacked as MsgBeginRedelegate;
          if (redelegateMsg.amount) {
            return renderMsgBeginRedelegate(
              currencies,
              redelegateMsg.amount,
              redelegateMsg.validatorSrcAddress,
              redelegateMsg.validatorDstAddress
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgUndelegate": {
          const undelegateMsg = msg.unpacked as MsgUndelegate;
          if (undelegateMsg.amount) {
            return renderMsgUndelegate(
              currencies,
              undelegateMsg.amount,
              undelegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmwasm.wasm.v1.MsgExecuteContract": {
          const executeMsg = msg.unpacked as MsgExecuteContract;
          return renderMsgExecuteContract(
            currencies,
            executeMsg.funds,
            undefined,
            executeMsg.contract,
            JSON.parse(
              Buffer.from(
                Buffer.from(executeMsg.msg).toString(),
                "utf8"
              ).toString()
            )
          );
        }
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
          const withdrawMsg = msg.unpacked as MsgWithdrawDelegatorReward;
          return renderMsgWithdrawDelegatorReward(withdrawMsg.validatorAddress);
        }
        case "/cosmos.gov.v1beta1.MsgVote": {
          const voteMsg = msg.unpacked as MsgVote;
          return renderMsgVote(voteMsg.proposalId, voteMsg.option);
        }
        case "/ibc.applications.transfer.v1.MsgTransfer": {
          const transferMsg = msg.unpacked as MsgTransfer;
          if (transferMsg.token) {
            return renderMsgTransfer(
              currencies,
              transferMsg.token,
              transferMsg.receiver,
              transferMsg.sourceChannel
            );
          }
          break;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || "Unknown",
    value: Buffer.from(msg.value).toString("base64"),
  });
}
