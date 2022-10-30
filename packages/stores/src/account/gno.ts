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
import { DenomHelper, escapeHTML } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import { DeepPartial, DeepReadonly } from "utility-types";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { MsgSend } from "@keplr-wallet/proto-types/gnoland/bank/msg";
import { Tx, Signature, Fee } from "@keplr-wallet/proto-types/gnoland/tx/tx";
import { PubKeySecp256k1 } from "@keplr-wallet/proto-types/gnoland/tm/keys";

import { Buffer } from "buffer/";
import deepmerge from "deepmerge";
import {
  BaseAccount,
  Bech32Address,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import { CosmosAccount } from "./cosmos";
import { MakeTxResponse, ProtoMsgsOrWithAminoMsgs } from "./types";
import { txEventsWithPreOnFulfill } from "./utils";

export interface GnoAccount {
  gno: GnoAccountImpl;
}

export const GnoAccount = {
  use(options: {
    msgOptsCreator?: (chainId: string) => DeepPartial<GnoMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries>;
    wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    preTxEvents?: {
      onBroadcastFailed?: (chainId: string, e?: Error) => void;
      onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
      onFulfill?: (chainId: string, tx: any) => void;
    };
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
          ),
          options
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
    protected readonly _msgOpts: GnoMsgOpts,
    protected readonly txOpts: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
      preTxEvents?: {
        onBroadcastFailed?: (chainId: string, e?: Error) => void;
        onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
        onFulfill?: (chainId: string, tx: any) => void;
      };
    }
  ) {
    this.base.registerMakeSendTokenFn(this.processMakeSendTokenTx.bind(this));
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  get msgOpts(): GnoMsgOpts {
    return this._msgOpts;
  }

  protected processMakeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    if (denomHelper.type === "native") {
      const actualAmount = (() => {
        let dec = new Dec(amount);
        dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
        return dec.truncate().toString();
      })();

      Bech32Address.validate(
        recipient,
        this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixAccAddr
      );

      const msg = {
        type: this.msgOpts.send.native.type,
        value: {
          from_address: this.base.bech32Address,
          to_address: recipient,
          amount: `${actualAmount}${currency.coinMinimalDenom}`,
        },
      };

      return this.makeTx(
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
        (tx) => {
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
        }
      );
    }
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

        Bech32Address.validate(
          recipient,
          this.chainGetter.getChain(this.chainId).bech32Config
            .bech32PrefixAccAddr
        );

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
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.msgOpts.send.native.gas.toString(),
          },
          signOptions,
          txEventsWithPreOnFulfill(onTxEvents, (tx) => {
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
    msgs:
      | ProtoMsgsOrWithAminoMsgs
      | (() => Promise<ProtoMsgsOrWithAminoMsgs> | ProtoMsgsOrWithAminoMsgs),
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
    let signDoc: StdSignDoc;
    try {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.base.cosmos.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
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

    const txTracer = new TendermintTxTracer(
      this.chainGetter.getChain(this.chainId).rpc,
      "/websocket",
      {
        wsObject: this.txOpts.wsObject,
      }
    );
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      this.base.setTxTypeInProgress("");

      // After sending tx, the balances is probably changed due to the fee.
      for (const feeAmount of signDoc.fee.amount) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.base.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      // Always add the tx hash data.
      if (tx && !tx.hash) {
        tx.hash = Buffer.from(txHash).toString("hex");
      }

      if (this.txOpts.preTxEvents?.onFulfill) {
        this.txOpts.preTxEvents.onFulfill(this.chainId, tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
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
      escapeHTML(memo),
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
        gasFee: signResponse.signed.fee.amount
          .map((val) => `${val.amount}${val.denom}`)
          .join(","),
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


  async simulateTx(
    msgs: Any[],
    fee: Omit<StdFee, "gas">,
    memo: string = ""
  ): Promise<{
    gasUsed: number;
  }> {
    const unsignedTx = Tx.encode({
      messages: msgs,
      fee: Fee.fromPartial({
        gasWanted: "0",
        gasFee: fee.amount.map((val) => `${val.amount}${val.denom}`).join(","),
      }),
      signatures: [
        Signature.fromPartial({
          pubKey: Any.fromPartial({
            typeUrl: "/tm.PubKeySecp256k1",
            value: PubKeySecp256k1.encode({
              key: new Uint8Array(33),
            }).finish(),
          }),
          signature: new Uint8Array(64),
        }),
      ],
      memo: memo,
    }).finish();

    const result = await this.base.cosmos.instance.post(
      "/cosmos/tx/v1beta1/simulate",
      {
        tx_bytes: Buffer.from(unsignedTx).toString("base64"),
      }
    );

    const gasUsed = parseInt(result.data.gas_info.gas_used);
    if (Number.isNaN(gasUsed)) {
      throw new Error(`Invalid integer gas: ${result.data.gas_info.gas_used}`);
    }

    return {
      gasUsed,
    };
  }

  makeTx(
    type: string | "unknown",
    msgs: ProtoMsgsOrWithAminoMsgs | (() => Promise<ProtoMsgsOrWithAminoMsgs>),
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): MakeTxResponse {
    const simulate = async (
      fee: Partial<Omit<StdFee, "gas">> = {},
      memo: string = ""
    ): Promise<{
      gasUsed: number;
    }> => {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      return this.simulateTx(
        msgs.protoMsgs,
        {
          amount: fee.amount ?? [],
        },
        memo
      );
    };

    const sendWithGasPrice = async (
      gasInfo: {
        gas: number;
        gasPrice?: {
          denom: string;
          amount: Dec;
        };
      },
      memo: string = "",
      signOptions?: KeplrSignOptions,
      onTxEvents?:
        | ((tx: any) => void)
        | {
            onBroadcastFailed?: (e?: Error) => void;
            onBroadcasted?: (txHash: Uint8Array) => void;
            onFulfill?: (tx: any) => void;
          }
    ): Promise<void> => {
      if (gasInfo.gas < 0) {
        throw new Error("Gas is zero or negative");
      }

      const fee = {
        gas: gasInfo.gas.toString(),
        amount: gasInfo.gasPrice
          ? [
              {
                denom: gasInfo.gasPrice.denom,
                amount: gasInfo.gasPrice.amount
                  .mul(new Dec(gasInfo.gas))
                  .truncate()
                  .toString(),
              },
            ]
          : [],
      };

      return this.sendMsgs(
        type,
        msgs,
        memo,
        fee,
        signOptions,
        txEventsWithPreOnFulfill(onTxEvents, preOnTxEvents)
      );
    };

    return {
      msgs: async (): Promise<ProtoMsgsOrWithAminoMsgs> => {
        if (typeof msgs === "function") {
          msgs = await msgs();
        }
        return msgs;
      },
      simulate,
      simulateAndSend: async (
        feeOptions: {
          gasAdjustment: number;
          gasPrice?: {
            denom: string;
            amount: Dec;
          };
        },
        memo: string = "",
        signOptions?: KeplrSignOptions,
        onTxEvents?:
          | ((tx: any) => void)
          | {
              onBroadcastFailed?: (e?: Error) => void;
              onBroadcasted?: (txHash: Uint8Array) => void;
              onFulfill?: (tx: any) => void;
            }
      ): Promise<void> => {
        this.base.setTxTypeInProgress(type);

        try {
          const { gasUsed } = await simulate({}, memo);

          if (gasUsed < 0) {
            throw new Error("Gas estimated is zero or negative");
          }

          const gasAdjusted = Math.floor(feeOptions.gasAdjustment * gasUsed);

          return sendWithGasPrice(
            {
              gas: gasAdjusted,
              gasPrice: feeOptions.gasPrice,
            },
            memo,
            signOptions,
            onTxEvents
          );
        } catch (e) {
          this.base.setTxTypeInProgress("");
          throw e;
        }
      },
      send: async (
        fee: StdFee,
        memo: string = "",
        signOptions?: KeplrSignOptions,
        onTxEvents?:
          | ((tx: any) => void)
          | {
              onBroadcastFailed?: (e?: Error) => void;
              onBroadcasted?: (txHash: Uint8Array) => void;
              onFulfill?: (tx: any) => void;
            }
      ): Promise<void> => {
        return this.sendMsgs(
          type,
          msgs,
          memo,
          fee,
          signOptions,
          txEventsWithPreOnFulfill(onTxEvents, preOnTxEvents)
        );
      },
      sendWithGasPrice,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
