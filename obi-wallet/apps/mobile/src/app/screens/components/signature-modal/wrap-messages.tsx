import {
  isMsgClearAdminEncodeObject,
  isMsgExecuteEncodeObject,
  isMsgInstantiateContractEncodeObject,
  isMsgMigrateEncodeObject,
  isMsgUpdateAdminEncodeObject,
  MsgExecuteContractEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import {
  isMsgDelegateEncodeObject,
  isMsgSendEncodeObject,
  isMsgUndelegateEncodeObject,
} from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";

export function wrapMessages({
  messages,
  sender,
  contract,
}: {
  messages: EncodeObject[];
  sender: string;
  contract: string;
}): MsgExecuteContractEncodeObject {
  const rawMessage = {
    execute: {
      msgs: messages.map((message) => {
        return wrapMessage(message);
      }),
    },
  };

  const value: MsgExecuteContract = {
    sender,
    contract,
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  };

  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value,
  };
}

export function wrapMessage(message: EncodeObject) {
  if (isMsgSendEncodeObject(message)) {
    const { amount, toAddress } = message.value;
    return {
      bank: {
        send: {
          amount,
          to_address: toAddress,
        },
      },
    };
  }

  if (isMsgExecuteEncodeObject(message)) {
    const { contract, funds, msg } = message.value;
    return {
      wasm: {
        execute: {
          contract_addr: contract,
          funds,
          msg: msg ? new Buffer(msg.buffer).toString("base64") : undefined,
        },
      },
    };
  }

  if (isMsgInstantiateContractEncodeObject(message)) {
    const { admin, codeId, funds, label, msg } = message.value;

    return {
      wasm: {
        instantiate: {
          admin,
          code_id: codeId,
          funds,
          label,
          msg: msg ? new Buffer(msg.buffer).toString("base64") : undefined,
        },
      },
    };
  }

  if (isMsgMigrateEncodeObject(message)) {
    const { contract, codeId, msg } = message.value;

    return {
      wasm: {
        migrate: {
          contract_addr: contract,
          msg: msg ? new Buffer(msg.buffer).toString("base64") : undefined,
          new_code_id: codeId,
        },
      },
    };
  }

  if (isMsgUpdateAdminEncodeObject(message)) {
    const { newAdmin, contract } = message.value;

    return {
      wasm: {
        update_admin: {
          admin: newAdmin,
          contract_addr: contract,
        },
      },
    };
  }

  if (isMsgClearAdminEncodeObject(message)) {
    const { contract } = message.value;

    return {
      wasm: {
        clear_admin: {
          contract_addr: contract,
        },
      },
    };
  }

  if (isMsgDelegateEncodeObject(message)) {
    const { amount, delegatorAddress, validatorAddress } = message.value;

    if (delegatorAddress) {
      return {
        redelegate: {
          amount,
          src_validator: delegatorAddress,
          dst_validator: validatorAddress,
        },
      };
    }

    return {
      delegate: {
        amount,
        validator: validatorAddress,
      },
    };
  }

  if (isMsgUndelegateEncodeObject(message)) {
    const { amount, validatorAddress } = message.value;

    return {
      undelegate: {
        amount,
        validator: validatorAddress,
      },
    };
  }

  throw new Error(`Unknown encode object of type ${message.typeUrl}`);
}
