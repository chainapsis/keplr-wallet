import {
  isMsgExecuteEncodeObject,
  MsgExecuteContractEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { isMsgSendEncodeObject } from "@cosmjs/stargate";
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

  throw new Error(`Unknown encode object of type ${message.typeUrl}`);
}
