/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Coin } from "../../../cosmos/base/v1beta1/coin";

export const protobufPackage = "secret.compute.v1beta1";

export interface MsgStoreCode {
  sender: Uint8Array;
  /** WASMByteCode can be raw or gzip compressed */
  wasmByteCode: Uint8Array;
  /** Source is a valid absolute HTTPS URI to the contract's source code, optional */
  source: string;
  /** Builder is a valid docker image name with tag, optional */
  builder: string;
}

export interface MsgInstantiateContract {
  sender: Uint8Array;
  /**
   * Admin is an optional address that can execute migrations
   *  bytes admin = 2 [(gogoproto.casttype) = "github.com/cosmos/cosmos-sdk/types.AccAddress"];
   */
  callbackCodeHash: string;
  codeId: string;
  label: string;
  initMsg: Uint8Array;
  initFunds: Coin[];
  callbackSig: Uint8Array;
}

export interface MsgExecuteContract {
  sender: Uint8Array;
  contract: Uint8Array;
  msg: Uint8Array;
  callbackCodeHash: string;
  sentFunds: Coin[];
  callbackSig: Uint8Array;
}

function createBaseMsgStoreCode(): MsgStoreCode {
  return {
    sender: new Uint8Array(),
    wasmByteCode: new Uint8Array(),
    source: "",
    builder: "",
  };
}

export const MsgStoreCode = {
  encode(
    message: MsgStoreCode,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender.length !== 0) {
      writer.uint32(10).bytes(message.sender);
    }
    if (message.wasmByteCode.length !== 0) {
      writer.uint32(18).bytes(message.wasmByteCode);
    }
    if (message.source !== "") {
      writer.uint32(26).string(message.source);
    }
    if (message.builder !== "") {
      writer.uint32(34).string(message.builder);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgStoreCode {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgStoreCode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.bytes();
          break;
        case 2:
          message.wasmByteCode = reader.bytes();
          break;
        case 3:
          message.source = reader.string();
          break;
        case 4:
          message.builder = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgStoreCode {
    return {
      sender: isSet(object.sender)
        ? bytesFromBase64(object.sender)
        : new Uint8Array(),
      wasmByteCode: isSet(object.wasmByteCode)
        ? bytesFromBase64(object.wasmByteCode)
        : new Uint8Array(),
      source: isSet(object.source) ? String(object.source) : "",
      builder: isSet(object.builder) ? String(object.builder) : "",
    };
  },

  toJSON(message: MsgStoreCode): unknown {
    const obj: any = {};
    message.sender !== undefined &&
      (obj.sender = base64FromBytes(
        message.sender !== undefined ? message.sender : new Uint8Array()
      ));
    message.wasmByteCode !== undefined &&
      (obj.wasmByteCode = base64FromBytes(
        message.wasmByteCode !== undefined
          ? message.wasmByteCode
          : new Uint8Array()
      ));
    message.source !== undefined && (obj.source = message.source);
    message.builder !== undefined && (obj.builder = message.builder);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgStoreCode>, I>>(
    object: I
  ): MsgStoreCode {
    const message = createBaseMsgStoreCode();
    message.sender = object.sender ?? new Uint8Array();
    message.wasmByteCode = object.wasmByteCode ?? new Uint8Array();
    message.source = object.source ?? "";
    message.builder = object.builder ?? "";
    return message;
  },
};

function createBaseMsgInstantiateContract(): MsgInstantiateContract {
  return {
    sender: new Uint8Array(),
    callbackCodeHash: "",
    codeId: "0",
    label: "",
    initMsg: new Uint8Array(),
    initFunds: [],
    callbackSig: new Uint8Array(),
  };
}

export const MsgInstantiateContract = {
  encode(
    message: MsgInstantiateContract,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender.length !== 0) {
      writer.uint32(10).bytes(message.sender);
    }
    if (message.callbackCodeHash !== "") {
      writer.uint32(18).string(message.callbackCodeHash);
    }
    if (message.codeId !== "0") {
      writer.uint32(24).uint64(message.codeId);
    }
    if (message.label !== "") {
      writer.uint32(34).string(message.label);
    }
    if (message.initMsg.length !== 0) {
      writer.uint32(42).bytes(message.initMsg);
    }
    for (const v of message.initFunds) {
      Coin.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.callbackSig.length !== 0) {
      writer.uint32(58).bytes(message.callbackSig);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgInstantiateContract {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantiateContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.bytes();
          break;
        case 2:
          message.callbackCodeHash = reader.string();
          break;
        case 3:
          message.codeId = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.label = reader.string();
          break;
        case 5:
          message.initMsg = reader.bytes();
          break;
        case 6:
          message.initFunds.push(Coin.decode(reader, reader.uint32()));
          break;
        case 7:
          message.callbackSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgInstantiateContract {
    return {
      sender: isSet(object.sender)
        ? bytesFromBase64(object.sender)
        : new Uint8Array(),
      callbackCodeHash: isSet(object.callbackCodeHash)
        ? String(object.callbackCodeHash)
        : "",
      codeId: isSet(object.codeId) ? String(object.codeId) : "0",
      label: isSet(object.label) ? String(object.label) : "",
      initMsg: isSet(object.initMsg)
        ? bytesFromBase64(object.initMsg)
        : new Uint8Array(),
      initFunds: Array.isArray(object?.initFunds)
        ? object.initFunds.map((e: any) => Coin.fromJSON(e))
        : [],
      callbackSig: isSet(object.callbackSig)
        ? bytesFromBase64(object.callbackSig)
        : new Uint8Array(),
    };
  },

  toJSON(message: MsgInstantiateContract): unknown {
    const obj: any = {};
    message.sender !== undefined &&
      (obj.sender = base64FromBytes(
        message.sender !== undefined ? message.sender : new Uint8Array()
      ));
    message.callbackCodeHash !== undefined &&
      (obj.callbackCodeHash = message.callbackCodeHash);
    message.codeId !== undefined && (obj.codeId = message.codeId);
    message.label !== undefined && (obj.label = message.label);
    message.initMsg !== undefined &&
      (obj.initMsg = base64FromBytes(
        message.initMsg !== undefined ? message.initMsg : new Uint8Array()
      ));
    if (message.initFunds) {
      obj.initFunds = message.initFunds.map((e) =>
        e ? Coin.toJSON(e) : undefined
      );
    } else {
      obj.initFunds = [];
    }
    message.callbackSig !== undefined &&
      (obj.callbackSig = base64FromBytes(
        message.callbackSig !== undefined
          ? message.callbackSig
          : new Uint8Array()
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgInstantiateContract>, I>>(
    object: I
  ): MsgInstantiateContract {
    const message = createBaseMsgInstantiateContract();
    message.sender = object.sender ?? new Uint8Array();
    message.callbackCodeHash = object.callbackCodeHash ?? "";
    message.codeId = object.codeId ?? "0";
    message.label = object.label ?? "";
    message.initMsg = object.initMsg ?? new Uint8Array();
    message.initFunds = object.initFunds?.map((e) => Coin.fromPartial(e)) || [];
    message.callbackSig = object.callbackSig ?? new Uint8Array();
    return message;
  },
};

function createBaseMsgExecuteContract(): MsgExecuteContract {
  return {
    sender: new Uint8Array(),
    contract: new Uint8Array(),
    msg: new Uint8Array(),
    callbackCodeHash: "",
    sentFunds: [],
    callbackSig: new Uint8Array(),
  };
}

export const MsgExecuteContract = {
  encode(
    message: MsgExecuteContract,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender.length !== 0) {
      writer.uint32(10).bytes(message.sender);
    }
    if (message.contract.length !== 0) {
      writer.uint32(18).bytes(message.contract);
    }
    if (message.msg.length !== 0) {
      writer.uint32(26).bytes(message.msg);
    }
    if (message.callbackCodeHash !== "") {
      writer.uint32(34).string(message.callbackCodeHash);
    }
    for (const v of message.sentFunds) {
      Coin.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.callbackSig.length !== 0) {
      writer.uint32(50).bytes(message.callbackSig);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExecuteContract {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.bytes();
          break;
        case 2:
          message.contract = reader.bytes();
          break;
        case 3:
          message.msg = reader.bytes();
          break;
        case 4:
          message.callbackCodeHash = reader.string();
          break;
        case 5:
          message.sentFunds.push(Coin.decode(reader, reader.uint32()));
          break;
        case 6:
          message.callbackSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgExecuteContract {
    return {
      sender: isSet(object.sender)
        ? bytesFromBase64(object.sender)
        : new Uint8Array(),
      contract: isSet(object.contract)
        ? bytesFromBase64(object.contract)
        : new Uint8Array(),
      msg: isSet(object.msg) ? bytesFromBase64(object.msg) : new Uint8Array(),
      callbackCodeHash: isSet(object.callbackCodeHash)
        ? String(object.callbackCodeHash)
        : "",
      sentFunds: Array.isArray(object?.sentFunds)
        ? object.sentFunds.map((e: any) => Coin.fromJSON(e))
        : [],
      callbackSig: isSet(object.callbackSig)
        ? bytesFromBase64(object.callbackSig)
        : new Uint8Array(),
    };
  },

  toJSON(message: MsgExecuteContract): unknown {
    const obj: any = {};
    message.sender !== undefined &&
      (obj.sender = base64FromBytes(
        message.sender !== undefined ? message.sender : new Uint8Array()
      ));
    message.contract !== undefined &&
      (obj.contract = base64FromBytes(
        message.contract !== undefined ? message.contract : new Uint8Array()
      ));
    message.msg !== undefined &&
      (obj.msg = base64FromBytes(
        message.msg !== undefined ? message.msg : new Uint8Array()
      ));
    message.callbackCodeHash !== undefined &&
      (obj.callbackCodeHash = message.callbackCodeHash);
    if (message.sentFunds) {
      obj.sentFunds = message.sentFunds.map((e) =>
        e ? Coin.toJSON(e) : undefined
      );
    } else {
      obj.sentFunds = [];
    }
    message.callbackSig !== undefined &&
      (obj.callbackSig = base64FromBytes(
        message.callbackSig !== undefined
          ? message.callbackSig
          : new Uint8Array()
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgExecuteContract>, I>>(
    object: I
  ): MsgExecuteContract {
    const message = createBaseMsgExecuteContract();
    message.sender = object.sender ?? new Uint8Array();
    message.contract = object.contract ?? new Uint8Array();
    message.msg = object.msg ?? new Uint8Array();
    message.callbackCodeHash = object.callbackCodeHash ?? "";
    message.sentFunds = object.sentFunds?.map((e) => Coin.fromPartial(e)) || [];
    message.callbackSig = object.callbackSig ?? new Uint8Array();
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte));
  }
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

function longToString(long: Long) {
  return long.toString();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
