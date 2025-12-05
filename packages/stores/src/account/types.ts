import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Dec } from "@keplr-wallet/unit";
import {
  BroadcastMode,
  Keplr,
  KeplrSignOptions,
  Msg,
  StdFee,
  SignDoc,
  StdSignDoc,
} from "@keplr-wallet/types";

export type ProtoMsgsOrWithAminoMsgs = {
  aminoMsgs?: Msg[];
  protoMsgs: Any[];

  // Add rlp types data if you need to support ethermint with ledger.
  // Must include `MsgValue`.
  rlpTypes?: Record<
    string,
    Array<{
      name: string;
      type: string;
    }>
  >;
};

export interface KeplrSignOptionsWithAltSignMethods extends KeplrSignOptions {
  readonly signAmino?: Keplr["signAmino"];
  readonly signDirect?: Keplr["signDirect"];
  readonly experimentalSignEIP712CosmosTx_v0?: Keplr["experimentalSignEIP712CosmosTx_v0"];
  readonly sendTx?: (
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ) => Promise<Uint8Array>;
}

export interface MakeTxResponse {
  ui: {
    type(): string;
    overrideType(type: string): void;
  };
  msgs(): Promise<ProtoMsgsOrWithAminoMsgs>;
  simulate(
    fee?: Partial<Omit<StdFee, "gas">>,
    memo?: string
  ): Promise<{
    gasUsed: number;
  }>;
  simulateAndSend(
    feeOptions: {
      gasAdjustment: number;
      gasPrice?: {
        denom: string;
        amount: Dec;
      };
    },
    memo?: string,
    signOptions?: KeplrSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
  sign(
    fee: StdFee,
    memo?: string,
    signOptions?: KeplrSignOptionsWithAltSignMethods
  ): Promise<{
    tx: Uint8Array;
    signDoc: StdSignDoc | SignDoc;
  }>;
  send(
    fee: StdFee,
    memo?: string,
    signOptions?: KeplrSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
  sendWithGasPrice(
    gasInfo: {
      gas: number;
      gasPrice?: {
        denom: string;
        amount: Dec;
      };
    },
    memo?: string,
    signOptions?: KeplrSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
}
