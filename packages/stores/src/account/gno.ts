import { AccountSetBaseSuper, MsgOpt, WalletStatus } from "./base";
import { CosmosQueries, IQueriesStore, QueriesSetBase } from "../query";
import { ChainGetter } from "../common";
import {
  BroadcastMode,
  makeSignDoc,
  Msg,
  StdFee,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import { DeepPartial, DeepReadonly } from "utility-types";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { MsgSend } from "@keplr-wallet/proto-types/gnoland/bank/msg";
import { Tx, Signature, Fee } from "@keplr-wallet/proto-types/gnoland/tx/tx";
import { PubKeySecp256k1 } from "@keplr-wallet/proto-types/gnoland/tm/keys";

import { Buffer } from "buffer/";
import deepmerge from "deepmerge";
import { BaseAccount } from "@keplr-wallet/cosmos";
import { CosmosAccount, ProtoMsgsOrWithAminoMsgs } from "./cosmos";

export interface GnoAccount {
  gno: GnoAccountImpl;
}

export const GnoAccount = {
  use(options: {
    msgOptsCreator?: (chainId: string) => DeepPartial<GnoMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => GnoAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        gno: new GnoAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<GnoMsgOpts, DeepPartial<GnoMsgOpts>>(
            defaultGnoMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          )
        ),
      };
    };
  },
};

export interface GnoMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
}

export const defaultGnoMsgOpts: GnoMsgOpts = {
  send: {
    native: {
      type: "/bank.MsgSend",
      gas: 60000,
    },
  },
};

export class GnoAccountImpl {
  constructor(
    protected readonly base: AccountSetBaseSuper & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly _msgOpts: GnoMsgOpts
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  get msgOpts(): GnoMsgOpts {
    return this._msgOpts;
  }

  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    switch (denomHelper.type) {
      case "native":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        const msg = {
          type: this.msgOpts.send.native.type,
          value: {
            from_address: this.base.bech32Address,
            to_address: recipient,
            amount: `${actualAmount}${currency.coinMinimalDenom}`,
          },
        };

        await this.sendMsgs(
          "send",
          {
            aminoMsgs: [msg],
            protoMsgs: [
              {
                typeUrl: "/bank.MsgSend",
                value: MsgSend.encode({
                  fromAddress: msg.value.from_address,
                  toAddress: msg.value.to_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ],
          },
          memo,
          {
            amount: [{ amount: "1", denom: currency.coinMinimalDenom }],
            gas: stdFee.gas ?? this.msgOpts.send.native.gas.toString(),
          },
          signOptions,
          this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries.queryBalances
                .getQueryBech32Address(this.base.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }
          })
        );

        return true;
    }

    return false;
  }

  async sendMsgs(
    type: string | "unknown",
    msgs: ProtoMsgsOrWithAminoMsgs,
    memo: string = "",
    fee: StdFee,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    this.base.setTxTypeInProgress(type);

    let txHash: Uint8Array;
    try {
      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.base.cosmos.broadcastMode
      );
      txHash = result.txHash;
    } catch (e) {
      this.base.setTxTypeInProgress("");

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e as any);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (onBroadcasted) {
      onBroadcasted(txHash);
    }

    // TODO: Gno tx-index
    this.base.setTxTypeInProgress("");
    const tx = {
      mode: this.base.cosmos.broadcastMode,
      hash: Buffer.from(txHash).toString("hex"),
    };

    if (onFulfill) {
      onFulfill(tx);
    }
  }

  protected async broadcastMsgs(
    msgs: ProtoMsgsOrWithAminoMsgs,
    fee: StdFee,
    memo: string = "",
    signOptions?: KeplrSignOptions,
    mode: "block" | "async" | "sync" = "async"
  ): Promise<{
    txHash: Uint8Array;
    signDoc: StdSignDoc;
  }> {
    if (this.base.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
    }

    const aminoMsgs: Msg[] = msgs.aminoMsgs;
    const protoMsgs: Any[] = msgs.protoMsgs;

    // TODO: Make proto sign doc if `aminoMsgs` is empty or null
    if (aminoMsgs.length === 0 || protoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    if (aminoMsgs.length !== protoMsgs.length) {
      throw new Error("The length of aminoMsgs and protoMsgs are different");
    }

    const account = await BaseAccount.fetchFromRest(
      this.base.cosmos.instance,
      this.base.bech32Address,
      true
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.base.getKeplr())!;

    const signDoc = makeSignDoc(
      aminoMsgs,
      fee,
      this.chainId,
      memo,
      account.getAccountNumber().toString(),
      account.getSequence().toString()
    );

    const signResponse = await keplr.signAmino(
      this.chainId,
      this.base.bech32Address,
      signDoc,
      signOptions
    );

    const signedTx = Tx.encode({
      messages: protoMsgs,
      fee: Fee.fromPartial({
        gasWanted: signResponse.signed.fee.gas,
        gasFee: `${signResponse.signed.fee.amount[0].amount}${signResponse.signed.fee.amount[0].denom}`,
      }),
      signatures: [
        Signature.fromPartial({
          pubKey: Any.fromPartial({
            typeUrl: "/tm.PubKeySecp256k1",
            value: PubKeySecp256k1.encode({
              key: Buffer.from(signResponse.signature.pub_key.value, "base64"),
            }).finish(),
          }),
          signature: Buffer.from(signResponse.signature.signature, "base64"),
        }),
      ],
      memo: signResponse.signed.memo,
    }).finish();

    return {
      txHash: await keplr.sendTx(this.chainId, signedTx, mode as BroadcastMode),
      signDoc: signResponse.signed,
    };
  }

  protected txEventsWithPreOnFulfill(
    onTxEvents:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
      | undefined,
    preOnFulfill?: (tx: any) => void
  ):
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined {
    if (!onTxEvents) {
      return;
    }

    const onBroadcasted =
      typeof onTxEvents === "function" ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === "function" ? onTxEvents : onTxEvents.onFulfill;

    return {
      onBroadcasted,
      onFulfill: onFulfill
        ? (tx: any) => {
            if (preOnFulfill) {
              preOnFulfill(tx);
            }

            onFulfill(tx);
          }
        : undefined,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
