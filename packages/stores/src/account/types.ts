import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Dec } from "@keplr-wallet/unit";
import { Keplr, KeplrSignOptions, Msg, StdFee } from "@keplr-wallet/types";

export type ProtoMsgsOrWithAminoMsgs = {
  // TODO: Make `aminoMsgs` nullable
  //       And, make proto sign doc if `aminoMsgs` is null
  aminoMsgs: Msg[];
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
  readonly experimentalSignEIP712CosmosTx_v0?: Keplr["experimentalSignEIP712CosmosTx_v0"];
}

export interface MakeTxResponse {
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
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
  send(
    fee: StdFee,
    memo?: string,
    signOptions?: KeplrSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
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
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
}
