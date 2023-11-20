import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Dec } from "@keplr-wallet/unit";
import { KeplrSignOptions, Msg, StdFee } from "@keplr-wallet/types";
import { TransactionRequest } from "@ethersproject/providers";

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
    signOptions?: KeplrSignOptions,
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
    signOptions?: KeplrSignOptions,
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
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
}

export interface ITxn {
  hash: string;
  type?: "ContractInteraction" | "Send" | "Bridge" | "Approve";
  status: "pending" | "success" | "failed" | "cancelled";
  amount?: string;
  symbol?: string;
  createdAt?: Date;
  lastSpeedUpAt?: Date;
  cancelled?: boolean;
  rawTxData?: TransactionRequest;
}
