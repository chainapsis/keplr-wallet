import { AppCurrency } from "@keplr-wallet/types";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import {
  MsgProvision,
  MsgWalletSpendAction,
} from "@keplr-wallet/proto-types/agoric/swingset/msgs";
import { MsgExecuteContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { AnyWithUnpacked, defaultProtoCodec } from "@keplr-wallet/cosmos";
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
import { renderMsgProvisionSmartWallet } from "./agoric/msg-provision";
import { renderMsgWalletSpendAction } from "./agoric/msg-wallet-spend-action";

export function renderDirectMessage(
  msg: AnyWithUnpacked,
  currencies: AppCurrency[],
  chainId: string
) {
  const protoCodec = defaultProtoCodec;

  try {
    if ("unpacked" in msg) {
      switch (msg.typeUrl) {
        case "/agoric.swingset.MsgWalletSpendAction": {
          const walletSpendActionMsg = msg.unpacked as MsgWalletSpendAction;
          return renderMsgWalletSpendAction(
            chainId,
            walletSpendActionMsg.spendAction
          );
        }
        case "/agoric.swingset.MsgProvision": {
          const provisionMsg = msg.unpacked as MsgProvision;
          if (!provisionMsg.powerFlags?.includes("SMART_WALLET")) {
            break;
          }
          return renderMsgProvisionSmartWallet(provisionMsg.address.toString());
        }
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

    return renderUnknownMessage({
      typeUrl: msg.typeUrl || "Unknown",
      value: protoCodec.unpackedAnyToJSONRecursive(msg),
    });
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || "Unknown",
    value: Buffer.from(msg.value).toString("base64"),
  });
}
