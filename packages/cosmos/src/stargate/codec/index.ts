import * as $protobuf from "protobufjs";
import {
  MsgProvision,
  MsgWalletSpendAction,
} from "@keplr-wallet/proto-types/agoric/swingset/msgs";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import {
  MsgMultiSend,
  MsgSend,
} from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  MsgExec,
  MsgGrant,
  MsgRevoke,
} from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
} from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
} from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { UnknownMessage } from "./unknown";
import { GenericAuthorization } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/authz";
import { StakeAuthorization } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/authz";
import { SendAuthorization } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/authz";
import { Buffer } from "buffer/";

export * from "./unknown";

export type AnyWithUnpacked = Any | (Any & { unpacked: unknown });

interface ProtoFactory {
  encode: (message: any, writer?: $protobuf.Writer) => $protobuf.Writer;
  decode: (r: $protobuf.Reader | Uint8Array, l?: number) => any;
  fromJSON: (object: any) => any;
  toJSON: (message: any) => unknown;
}

export class ProtoCodec {
  protected typeUrlMap: Map<string, ProtoFactory> = new Map();

  unpackAnyFactory(typeUrl: string): ProtoFactory | undefined {
    if (!this.typeUrlMap.has(typeUrl)) {
      return undefined;
    }

    return this.typeUrlMap.get(typeUrl);
  }

  /**
   * Unpack the any to the registered message.
   * NOTE: If there is no matched message, it will not throw an error but return the `UnknownMessage` class.
   * @param any
   */
  unpackAny(any: Any): AnyWithUnpacked {
    const factory = this.unpackAnyFactory(any.typeUrl);
    if (!factory) {
      return new UnknownMessage(any.typeUrl, any.value);
    }

    const unpacked = factory.decode(any.value);

    return {
      ...any,
      unpacked,
    };
  }

  unpackedAnyToJSONRecursive(unpacked: AnyWithUnpacked): unknown {
    if (unpacked instanceof UnknownMessage) {
      return unpacked.toJSON();
    }

    const factory = this.unpackAnyFactory(unpacked.typeUrl);
    if (factory && "unpacked" in unpacked && unpacked.unpacked) {
      const isJSONEncodedAny = (
        any: any
      ): any is {
        typeUrl: string;
        value: string;
      } => {
        const r =
          typeof any === "object" &&
          !(any instanceof UnknownMessage) &&
          "typeUrl" in any &&
          any.typeUrl &&
          typeof any.typeUrl === "string" &&
          "value" in any &&
          any.value &&
          typeof any.value === "string";

        if (r) {
          try {
            Buffer.from(any.value, "base64");
          } catch {
            return false;
          }
        }

        return r;
      };

      const unpackJSONEncodedAnyInner = (jsonEncodedAny: {
        typeUrl: string;
        value: string;
      }): {
        typeUrl: string;
        value: unknown;
      } => {
        const factory = this.unpackAnyFactory(jsonEncodedAny.typeUrl);

        const bz = Buffer.from(jsonEncodedAny.value, "base64");

        if (!factory) {
          return new UnknownMessage(jsonEncodedAny.typeUrl, bz).toJSON();
        }

        const unpacked = factory.decode(bz);
        return {
          typeUrl: jsonEncodedAny.typeUrl,
          value: factory.toJSON(unpacked),
        };
      };

      const unpackedJSONEncodedAnyRecursive = (obj: object): object => {
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const value = obj[i];
            if (isJSONEncodedAny(value)) {
              obj[i] = unpackJSONEncodedAnyInner(value);
            } else if (typeof value === "object") {
              obj[i] = unpackedJSONEncodedAnyRecursive(value);
            }
          }
        } else {
          for (const key in obj) {
            const value = (obj as any)[key];
            if (isJSONEncodedAny(value)) {
              (obj as any)[key] = unpackJSONEncodedAnyInner(value);
            } else if (typeof value === "object") {
              (obj as any)[key] = unpackedJSONEncodedAnyRecursive(value);
            }
          }
        }
        return obj;
      };

      // This is mutated by logic.
      let mutObj = factory.toJSON(unpacked.unpacked);
      if (mutObj && typeof mutObj === "object") {
        mutObj = unpackedJSONEncodedAnyRecursive(mutObj);
        return {
          typeUrl: unpacked.typeUrl,
          value: mutObj,
        };
      }
    }

    return new UnknownMessage(unpacked.typeUrl, unpacked.value).toJSON();
  }

  registerAny(typeUrl: string, message: ProtoFactory): void {
    this.typeUrlMap.set(typeUrl, message);
  }
}

export const defaultProtoCodec = new ProtoCodec();
defaultProtoCodec.registerAny(
  "/agoric.swingset.MsgWalletSpendAction",
  MsgWalletSpendAction
);
defaultProtoCodec.registerAny("/agoric.swingset.MsgProvision", MsgProvision);
defaultProtoCodec.registerAny("/cosmos.bank.v1beta1.MsgSend", MsgSend);
defaultProtoCodec.registerAny(
  "/cosmos.bank.v1beta1.MsgMultiSend",
  MsgMultiSend
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgDelegate",
  MsgDelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgUndelegate",
  MsgUndelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  MsgBeginRedelegate
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgExecuteContract",
  MsgExecuteContract
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgInstantiateContract",
  MsgInstantiateContract
);
defaultProtoCodec.registerAny(
  "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  MsgWithdrawDelegatorReward
);
defaultProtoCodec.registerAny(
  "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  MsgSetWithdrawAddress
);
defaultProtoCodec.registerAny(
  "/ibc.applications.transfer.v1.MsgTransfer",
  MsgTransfer
);
defaultProtoCodec.registerAny("/cosmos.gov.v1beta1.MsgVote", MsgVote);
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgGrant", MsgGrant);
// ----- Authz grants -----
defaultProtoCodec.registerAny(
  "/cosmos.authz.v1beta1.GenericAuthorization",
  GenericAuthorization
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.StakeAuthorization",
  StakeAuthorization
);
defaultProtoCodec.registerAny(
  "/cosmos.bank.v1beta1.SendAuthorization",
  SendAuthorization
);
// ----- Authz grants -----
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke);
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgExec", MsgExec);
