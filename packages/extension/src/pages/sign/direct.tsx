import { Currency } from "@keplr-wallet/types";
import { IntlShape } from "react-intl";
import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";
import {
  renderGenericMsgGrant,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgInstantiateContract,
  renderMsgRevoke,
  renderMsgSend,
  renderMsgTransfer,
  renderMsgUndelegate,
  renderMsgVote,
  renderMsgWithdrawDelegatorReward,
  renderSendMsgGrant,
  renderStakeMsgGrant,
  renderUnknownMessage,
} from "./messages";
import { Buffer } from "buffer/";
import { fromUtf8 } from "@cosmjs/encoding";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { MsgExecuteContract, MsgInstantiateContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import {
  MsgGrant,
  MsgRevoke,
} from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { GenericAuthorization } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/authz";
import { SendAuthorization } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/authz";
import { StakeAuthorization } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/authz";

export function renderDirectMessage(
  msg: AnyWithUnpacked,
  currencies: Currency[],
  intl: IntlShape
) {
  try {
    if (msg instanceof UnknownMessage) {
      return renderUnknownMessage(msg.toJSON());
    }

    if ("unpacked" in msg) {
      switch (msg.typeUrl) {
        case "/cosmos.bank.v1beta1.MsgSend": {
          const sendMsg = msg.unpacked as MsgSend;
          return renderMsgSend(
            currencies,
            intl,
            sendMsg.amount,
            sendMsg.toAddress
          );
        }
        case "/cosmos.staking.v1beta1.MsgDelegate": {
          const delegateMsg = msg.unpacked as MsgDelegate;
          if (delegateMsg.amount) {
            return renderMsgDelegate(
              currencies,
              intl,
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
              intl,
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
              intl,
              undelegateMsg.amount,
              undelegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmwasm.wasm.v1.MsgInstantiateContract": {
          const instantiateContractMsg = msg.unpacked as MsgInstantiateContract;
          return renderMsgInstantiateContract(
            currencies,
            intl,
            instantiateContractMsg.funds,
            instantiateContractMsg.admin,
            instantiateContractMsg.codeId,
            instantiateContractMsg.label,
            JSON.parse(fromUtf8(instantiateContractMsg.msg))
          );
        }
        case "/cosmwasm.wasm.v1.MsgExecuteContract": {
          const executeContractMsg = msg.unpacked as MsgExecuteContract;
          return renderMsgExecuteContract(
            currencies,
            intl,
            executeContractMsg.funds,
            undefined,
            executeContractMsg.contract,
            JSON.parse(fromUtf8(executeContractMsg.msg))
          );
        }
        case "/cosmos.authz.v1beta1.MsgGrant": {
          const grantMsg = msg.unpacked as MsgGrant;

          switch (grantMsg.grant?.authorization?.typeUrl) {
            case "/cosmos.bank.v1beta1.SendAuthorization":
              return renderSendMsgGrant(
                currencies,
                intl,
                grantMsg.grantee,
                grantMsg.grant.expiration,
                SendAuthorization.decode(grantMsg.grant.authorization.value)
              );

            case "/cosmos.staking.v1beta1.StakeAuthorization":
              return renderStakeMsgGrant(
                currencies,
                intl,
                grantMsg.grantee,
                grantMsg.grant.expiration,
                StakeAuthorization.decode(grantMsg.grant?.authorization.value)
              );

            default:
              return renderGenericMsgGrant(
                intl,
                grantMsg.grantee,
                grantMsg.grant?.expiration,
                grantMsg.grant?.authorization?.typeUrl ===
                  "/cosmos.authz.v1beta1.GenericAuthorization"
                  ? GenericAuthorization.decode(
                      grantMsg.grant!.authorization!.value
                    ).msg
                  : grantMsg.grant!.authorization!.typeUrl
              );
          }
        }
        case "/cosmos.authz.v1beta1.MsgRevoke": {
          const revokeMsg = msg.unpacked as MsgRevoke;
          return renderMsgRevoke(intl, revokeMsg.msgTypeUrl, revokeMsg.grantee);
        }
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
          const withdrawMsg = msg.unpacked as MsgWithdrawDelegatorReward;
          return renderMsgWithdrawDelegatorReward(intl, withdrawMsg.validatorAddress);
        }
        case "/cosmos.gov.v1beta1.MsgVote": {
          const voteMsg = msg.unpacked as MsgVote;
          return renderMsgVote(intl, voteMsg.proposalId, voteMsg.option);
        }
        case "/ibc.applications.transfer.v1.MsgTransfer": {
          const transferMsg = msg.unpacked as MsgTransfer;
          if (transferMsg.token) {
            return renderMsgTransfer(
              currencies,
              intl,
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
