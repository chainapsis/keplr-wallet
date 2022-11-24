import { AccountSetBaseSuper, MsgOpt, WalletStatus } from "./base";
import {
  AppCurrency,
  KeplrSignOptions,
  BroadcastMode,
  Msg,
  StdFee,
  StdSignDoc,
} from "@keplr-wallet/types";
import { DenomHelper, escapeHTML, sortObjectByKey } from "@keplr-wallet/common";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/gov";
import {
  BaseAccount,
  Bech32Address,
  ChainIdHelper,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";
import { CosmosQueries, IQueriesStore, QueriesSetBase } from "../query";
import { DeepPartial, DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import Axios, { AxiosInstance } from "axios";
import deepmerge from "deepmerge";
import { Buffer } from "buffer/";
import { MakeTxResponse, ProtoMsgsOrWithAminoMsgs } from "./types";
import {
  getEip712FeePayerPartialBasedOnChainId,
  getEip712SignaturesBasedOnChainId,
  getEip712SignDocBasedOnChainId,
  getEip712TypedDataBasedOnChainId,
  getEip712Web3ExtensionPartialBasedOnChainId,
  txEventsWithPreOnFulfill,
} from "./utils";
import { ExtensionOptionsWeb3Tx } from "@keplr-wallet/proto-types/ethermint/types/v1/web3";

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const CosmosAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<CosmosMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries>;
    wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    preTxEvents?: {
      onBroadcastFailed?: (chainId: string, e?: Error) => void;
      onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
      onFulfill?: (chainId: string, tx: any) => void;
    };
  }): (
    base: AccountSetBaseSuper,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmosAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        cosmos: new CosmosAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<CosmosMsgOpts, DeepPartial<CosmosMsgOpts>>(
            defaultCosmosMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          ),
          options
        ),
      };
    };
  },
};

/**
 * @deprecated Predict gas through simulation rather than using a fixed gas.
 */
export interface CosmosMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
  readonly ibcTransfer: MsgOpt;
  readonly delegate: MsgOpt;
  readonly undelegate: MsgOpt;
  readonly redelegate: MsgOpt;
  // The gas multiplication per rewards.
  readonly withdrawRewards: MsgOpt;
  readonly govVote: MsgOpt;
}

/**
 * @deprecated Predict gas through simulation rather than using a fixed gas.
 */
export const defaultCosmosMsgOpts: CosmosMsgOpts = {
  send: {
    native: {
      type: "cosmos-sdk/MsgSend",
      gas: 80000,
    },
  },
  ibcTransfer: {
    type: "cosmos-sdk/MsgTransfer",
    gas: 450000,
  },
  delegate: {
    type: "cosmos-sdk/MsgDelegate",
    gas: 250000,
  },
  undelegate: {
    type: "cosmos-sdk/MsgUndelegate",
    gas: 250000,
  },
  redelegate: {
    type: "cosmos-sdk/MsgBeginRedelegate",
    gas: 250000,
  },
  // The gas multiplication per rewards.
  withdrawRewards: {
    type: "cosmos-sdk/MsgWithdrawDelegationReward",
    gas: 140000,
  },
  govVote: {
    type: "cosmos-sdk/MsgVote",
    gas: 250000,
  },
};

export class CosmosAccountImpl {
  public broadcastMode: "sync" | "async" | "block" = "sync";

  constructor(
    protected readonly base: AccountSetBaseSuper,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly _msgOpts: CosmosMsgOpts,
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

  /**
   * @deprecated Predict gas through simulation rather than using a fixed gas.
   */
  get msgOpts(): CosmosMsgOpts {
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
          amount: [
            {
              denom: currency.coinMinimalDenom,
              amount: actualAmount,
            },
          ],
        },
      };

      return this.makeTx(
        "send",
        {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: MsgSend.encode({
                fromAddress: msg.value.from_address,
                toAddress: msg.value.to_address,
                amount: msg.value.amount,
              }).finish(),
            },
          ],
          rlpTypes: {
            MsgValue: [
              { name: "from_address", type: "string" },
              { name: "to_address", type: "string" },
              { name: "amount", type: "TypeAmount[]" },
            ],
            TypeAmount: [
              { name: "denom", type: "string" },
              { name: "amount", type: "string" },
            ],
          },
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

  /**
   * @deprecated
   */
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
            amount: [
              {
                denom: currency.coinMinimalDenom,
                amount: actualAmount,
              },
            ],
          },
        };

        await this.sendMsgs(
          "send",
          {
            aminoMsgs: [msg],
            protoMsgs: [
              {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
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
        this.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
    } catch (e) {
      this.base.setTxTypeInProgress("");

      if (this.txOpts.preTxEvents?.onBroadcastFailed) {
        this.txOpts.preTxEvents.onBroadcastFailed(this.chainId, e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
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

    if (this.txOpts.preTxEvents?.onBroadcasted) {
      this.txOpts.preTxEvents.onBroadcasted(this.chainId, txHash);
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

  // Return the tx hash.
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
      this.instance,
      this.base.bech32Address,
      true
    );

    const useEthereumSign =
      this.chainGetter
        .getChain(this.chainId)
        .features?.includes("eth-key-sign") === true;

    const eip712Signing = useEthereumSign && this.base.isNanoLedger;

    if (eip712Signing && !msgs.rlpTypes) {
      throw new Error(
        "RLP types information is needed for signing tx for ethermint chain with ledger"
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.base.getKeplr())!;

    const signDocRaw: StdSignDoc = {
      chain_id: this.chainId,
      account_number: account.getAccountNumber().toString(),
      sequence: account.getSequence().toString(),
      fee: fee,
      msgs: aminoMsgs,
      memo: escapeHTML(memo),
    };

    const signDoc = sortObjectByKey(signDocRaw);

    const chainInfo = this.queriesStore.get(this.chainId).cosmos.queryRPCStatus;
    await chainInfo.waitFreshResponse();
    const timeoutHeightBuffer = 40; /* 40 blocks for the transaction to be included */
    const timeoutHeight = new Int(
      chainInfo.latestBlockHeight?.toBigNumber() || 0
    )
      .toBigNumber()
      .add(timeoutHeightBuffer)
      .toString();

    const signResponse = await (async () => {
      if (!eip712Signing) {
        return await keplr.signAmino(
          this.chainId,
          this.base.bech32Address,
          signDoc,
          signOptions
        );
      }
      
      return await keplr.experimentalSignEIP712CosmosTx_v0(
        this.chainId,
        this.base.bech32Address,
        getEip712TypedDataBasedOnChainId(this.chainId, msgs),
        getEip712SignDocBasedOnChainId(signDoc, {
          chainId: this.chainId,
          timeoutHeight: timeoutHeight,
          bech32Address: this.base.bech32Address,
        }),
        signOptions
      );
    })();

    const signedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: protoMsgs,
          timeoutHeight: (() => {
            if (!useEthereumSign) {
              return undefined;
            }

            if (this.chainId.startsWith("injective")) {
              return timeoutHeight.toString();
            }

            return undefined;
          })(),
          memo: signResponse.signed.memo,
          extensionOptions: eip712Signing
            ? [
                {
                  typeUrl: (() => {
                    if (this.chainId.startsWith("injective")) {
                      return "/injective.types.v1beta1.ExtensionOptionsWeb3Tx";
                    }

                    return "/ethermint.types.v1.ExtensionOptionsWeb3Tx";
                  })(),
                  value: ExtensionOptionsWeb3Tx.encode(
                    ExtensionOptionsWeb3Tx.fromPartial(
                      getEip712Web3ExtensionPartialBasedOnChainId({
                        chainId: this.chainId,
                        bech32Address: this.base.bech32Address,
                        signature: signResponse.signature.signature,
                      })
                    )
                  ).finish(),
                },
              ]
            : undefined,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl: (() => {
                if (!useEthereumSign) {
                  return "/cosmos.crypto.secp256k1.PubKey";
                }

                if (this.chainId.startsWith("injective")) {
                  return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                }

                return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
              })(),
              value: PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  "base64"
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: signResponse.signed.sequence,
          },
        ],
        fee: Fee.fromPartial(
          getEip712FeePayerPartialBasedOnChainId({
            signResponse,
            eip712Signing,
            chainId: this.chainId,
          }) as any /** Fee partial nagging about the types even tho they are correct */
        ),
      }).finish(),
      signatures: getEip712SignaturesBasedOnChainId({
        signResponse,
        eip712Signing,
        chainId: this.chainId,
      }),
    }).finish();

    return {
      txHash: await keplr.sendTx(this.chainId, signedTx, mode as BroadcastMode),
      signDoc: signResponse.signed,
    };
  }

  /**
   * Simulate tx without making state transition on chain or not waiting the tx committed.
   * Mainly used to estimate the gas needed to process tx.
   * You should multiply arbitrary number (gas adjustment) for gas before sending tx.
   *
   * NOTE: "/cosmos/tx/v1beta1/simulate" returns 400, 500 or (more?) status and error code as a response when tx fails on stimulate.
   *       Currently, non 200~300 status is handled as error, thus error would be thrown.
   *
   * XXX: Uses the simulate request format for cosmos-sdk@0.43+
   *      Thus, may throw an error if the chain is below cosmos-sdk@0.43
   *      And, for simplicity, doesn't set the public key to tx bytes.
   *      Thus, the gas estimated doesn't include the tx bytes size of public key.
   *
   * @param msgs
   * @param fee
   * @param memo
   */
  async simulateTx(
    msgs: Any[],
    fee: Omit<StdFee, "gas">,
    memo: string = ""
  ): Promise<{
    gasUsed: number;
  }> {
    const account = await BaseAccount.fetchFromRest(
      this.instance,
      this.base.bech32Address,
      true
    );

    const unsignedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: msgs,
          memo: memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          SignerInfo.fromPartial({
            // Pub key is ignored.
            // It is fine to ignore the pub key when simulating tx.
            // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: account.getSequence().toString(),
          }),
        ],
        fee: Fee.fromPartial({
          amount: fee.amount.map((amount) => {
            return { amount: amount.amount, denom: amount.denom };
          }),
        }),
      }).finish(),
      // Because of the validation of tx itself, the signature must exist.
      // However, since they do not actually verify the signature, it is okay to use any value.
      signatures: [new Uint8Array(64)],
    }).finish();

    const result = await this.instance.post("/cosmos/tx/v1beta1/simulate", {
      tx_bytes: Buffer.from(unsignedTx).toString("base64"),
    });

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

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }

  makeIBCTransferTx(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "native") {
      throw new Error("Only native token can be sent via IBC");
    }

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    const destinationInfo = this.queriesStore.get(channel.counterpartyChainId)
      .cosmos.queryRPCStatus;

    return this.makeTx(
      "ibcTransfer",
      async () => {
        // Wait until fetching complete.
        await destinationInfo.waitFreshResponse();

        if (!destinationInfo.network) {
          throw new Error(
            `Failed to fetch the network chain id of ${channel.counterpartyChainId}`
          );
        }

        if (
          ChainIdHelper.parse(destinationInfo.network).identifier !==
          ChainIdHelper.parse(channel.counterpartyChainId).identifier
        ) {
          throw new Error(
            `Fetched the network chain id is different with counterparty chain id (${destinationInfo.network}, ${channel.counterpartyChainId})`
          );
        }

        if (
          !destinationInfo.latestBlockHeight ||
          destinationInfo.latestBlockHeight.equals(new Int("0"))
        ) {
          throw new Error(
            `Failed to fetch the latest block of ${channel.counterpartyChainId}`
          );
        }

        const useEthereumSign =
          this.chainGetter
            .getChain(this.chainId)
            .features?.includes("eth-key-sign") === true;

        const eip712Signing = useEthereumSign && this.base.isNanoLedger;

        // On ledger with ethermint, eip712 types are required and we can't omit `timeoutTimestamp`.
        // Although we are not using `timeoutTimestamp` at present, just set it as mas uint64 only for eip712 cosmos tx.
        const timeoutTimestamp = eip712Signing ? "18446744073709551615" : "0";

        const msg = {
          type: this.msgOpts.ibcTransfer.type,
          value: {
            source_port: channel.portId,
            source_channel: channel.channelId,
            token: {
              denom: currency.coinMinimalDenom,
              amount: actualAmount,
            },
            sender: this.base.bech32Address,
            receiver: recipient,
            timeout_height: {
              revision_number: ChainIdHelper.parse(
                destinationInfo.network
              ).version.toString() as string | undefined,
              // Set the timeout height as the current height + 150.
              revision_height: destinationInfo.latestBlockHeight
                .add(new Int("150"))
                .toString(),
            },
            timeout_timestamp: timeoutTimestamp as string | undefined,
          },
        };

        if (msg.value.timeout_height.revision_number === "0") {
          delete msg.value.timeout_height.revision_number;
        }

        if (msg.value.timeout_timestamp === "0") {
          delete msg.value.timeout_timestamp;
        }

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
              value: MsgTransfer.encode(
                MsgTransfer.fromPartial({
                  sourcePort: msg.value.source_port,
                  sourceChannel: msg.value.source_channel,
                  token: msg.value.token,
                  sender: msg.value.sender,
                  receiver: msg.value.receiver,
                  timeoutHeight: {
                    revisionNumber: msg.value.timeout_height.revision_number
                      ? msg.value.timeout_height.revision_number
                      : "0",
                    revisionHeight: msg.value.timeout_height.revision_height,
                  },
                  timeoutTimestamp: msg.value.timeout_timestamp,
                })
              ).finish(),
            },
          ],
          rlpTypes: {
            MsgValue: [
              { name: "source_port", type: "string" },
              { name: "source_channel", type: "string" },
              { name: "token", type: "TypeToken" },
              { name: "sender", type: "string" },
              { name: "receiver", type: "string" },
              { name: "timeout_height", type: "TypeTimeoutHeight" },
              { name: "timeout_timestamp", type: "uint64" },
            ],
            TypeToken: [
              { name: "denom", type: "string" },
              { name: "amount", type: "string" },
            ],
            TypeTimeoutHeight: [
              { name: "revision_number", type: "uint64" },
              { name: "revision_height", type: "uint64" },
            ],
          },
        };
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

  async sendIBCTransferMsg(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "native") {
      throw new Error("Only native token can be sent via IBC");
    }

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    const destinationInfo = this.queriesStore.get(channel.counterpartyChainId)
      .cosmos.queryRPCStatus;

    await this.sendMsgs(
      "ibcTransfer",
      async () => {
        // Wait until fetching complete.
        await destinationInfo.waitFreshResponse();

        if (!destinationInfo.network) {
          throw new Error(
            `Failed to fetch the network chain id of ${channel.counterpartyChainId}`
          );
        }

        if (
          ChainIdHelper.parse(destinationInfo.network).identifier !==
          ChainIdHelper.parse(channel.counterpartyChainId).identifier
        ) {
          throw new Error(
            `Fetched the network chain id is different with counterparty chain id (${destinationInfo.network}, ${channel.counterpartyChainId})`
          );
        }

        if (
          !destinationInfo.latestBlockHeight ||
          destinationInfo.latestBlockHeight.equals(new Int("0"))
        ) {
          throw new Error(
            `Failed to fetch the latest block of ${channel.counterpartyChainId}`
          );
        }

        const msg = {
          type: this.msgOpts.ibcTransfer.type,
          value: {
            source_port: channel.portId,
            source_channel: channel.channelId,
            token: {
              denom: currency.coinMinimalDenom,
              amount: actualAmount,
            },
            sender: this.base.bech32Address,
            receiver: recipient,
            timeout_height: {
              revision_number: ChainIdHelper.parse(
                destinationInfo.network
              ).version.toString() as string | undefined,
              // Set the timeout height as the current height + 150.
              revision_height: destinationInfo.latestBlockHeight
                .add(new Int("150"))
                .toString(),
            },
          },
        };

        if (msg.value.timeout_height.revision_number === "0") {
          delete msg.value.timeout_height.revision_number;
        }

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
              value: MsgTransfer.encode(
                MsgTransfer.fromPartial({
                  sourcePort: msg.value.source_port,
                  sourceChannel: msg.value.source_channel,
                  token: msg.value.token,
                  sender: msg.value.sender,
                  receiver: msg.value.receiver,
                  timeoutHeight: {
                    revisionNumber: msg.value.timeout_height.revision_number
                      ? msg.value.timeout_height.revision_number
                      : "0",
                    revisionHeight: msg.value.timeout_height.revision_height,
                  },
                })
              ).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.ibcTransfer.gas.toString(),
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
  }

  makeDelegateTx(amount: string, validatorAddress: string) {
    Bech32Address.validate(
      validatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.delegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    return this.makeTx(
      "delegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
            value: MsgDelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  /**
   * Send `MsgDelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendDelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.delegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.sendMsgs(
      "delegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
            value: MsgDelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.delegate.gas.toString(),
      },
      signOptions,
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  makeUndelegateTx(amount: string, validatorAddress: string) {
    Bech32Address.validate(
      validatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.undelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    return this.makeTx(
      "undelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
            value: MsgUndelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to unbond, refresh the validators and delegations, unbonding delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryUnbondingDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  /**
   * @deprecated
   * Send `MsgUndelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendUndelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.undelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.sendMsgs(
      "undelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
            value: MsgUndelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.undelegate.gas.toString(),
      },
      signOptions,
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to unbond, refresh the validators and delegations, unbonding delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryUnbondingDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  makeBeginRedelegateTx(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string
  ) {
    Bech32Address.validate(
      srcValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixValAddr
    );
    Bech32Address.validate(
      dstValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.redelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    return this.makeTx(
      "redelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
            value: MsgBeginRedelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorSrcAddress: msg.value.validator_src_address,
              validatorDstAddress: msg.value.validator_dst_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_src_address", type: "string" },
            { name: "validator_dst_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  /**
   * @deprecated
   * Send `MsgBeginRedelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param srcValidatorAddress
   * @param dstValidatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendBeginRedelegateMsg(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.msgOpts.redelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.sendMsgs(
      "redelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
            value: MsgBeginRedelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorSrcAddress: msg.value.validator_src_address,
              validatorDstAddress: msg.value.validator_dst_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.redelegate.gas.toString(),
      },
      signOptions,
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  makeWithdrawDelegationRewardTx(validatorAddresses: string[]) {
    for (const validatorAddress of validatorAddresses) {
      Bech32Address.validate(
        validatorAddress,
        this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixValAddr
      );
    }

    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    return this.makeTx(
      "withdrawRewards",
      {
        aminoMsgs: msgs,
        protoMsgs: msgs.map((msg) => {
          return {
            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
            value: MsgWithdrawDelegatorReward.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
            }).finish(),
          };
        }),
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
          ],
        },
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  /**
   * @deprecated
   */
  async sendWithdrawDelegationRewardMsgs(
    validatorAddresses: string[],
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    await this.sendMsgs(
      "withdrawRewards",
      {
        aminoMsgs: msgs,
        protoMsgs: msgs.map((msg) => {
          return {
            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
            value: MsgWithdrawDelegatorReward.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
            }).finish(),
          };
        }),
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          (
            this.msgOpts.withdrawRewards.gas * validatorAddresses.length
          ).toString(),
      },
      signOptions,
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  makeGovVoteTx(
    proposalId: string,
    option: "Yes" | "No" | "Abstain" | "NoWithVeto"
  ) {
    const voteOption = (() => {
      switch (option) {
        case "Yes":
          return 1;
        case "Abstain":
          return 2;
        case "No":
          return 3;
        case "NoWithVeto":
          return 4;
      }
    })();

    const msg = {
      type: this.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.base.bech32Address,
      },
    };

    return this.makeTx(
      "govVote",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.gov.v1beta1.MsgVote",
            value: MsgVote.encode({
              proposalId: msg.value.proposal_id,
              voter: msg.value.voter,
              option: (() => {
                switch (msg.value.option) {
                  case 1:
                    return VoteOption.VOTE_OPTION_YES;
                  case 2:
                    return VoteOption.VOTE_OPTION_ABSTAIN;
                  case 3:
                    return VoteOption.VOTE_OPTION_NO;
                  case 4:
                    return VoteOption.VOTE_OPTION_NO_WITH_VETO;
                  default:
                    return VoteOption.VOTE_OPTION_UNSPECIFIED;
                }
              })(),
            }).finish(),
          },
        ],
        rlpTypes: {
          MsgValue: [
            { name: "proposal_id", type: "uint64" },
            { name: "voter", type: "string" },
            { name: "option", type: "int32" },
          ],
        },
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to vote, refresh the proposal.
          const proposal = this.queries.cosmos.queryGovernance.proposals.find(
            (proposal) => proposal.id === proposalId
          );
          if (proposal) {
            proposal.fetch();
          }

          const vote = this.queries.cosmos.queryProposalVote.getVote(
            proposalId,
            this.base.bech32Address
          );
          vote.fetch();
        }
      }
    );
  }

  /**
   * @deprecated
   */
  async sendGovVoteMsg(
    proposalId: string,
    option: "Yes" | "No" | "Abstain" | "NoWithVeto",
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const voteOption = (() => {
      switch (option) {
        case "Yes":
          return 1;
        case "Abstain":
          return 2;
        case "No":
          return 3;
        case "NoWithVeto":
          return 4;
      }
    })();

    const msg = {
      type: this.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.base.bech32Address,
      },
    };

    await this.sendMsgs(
      "govVote",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.gov.v1beta1.MsgVote",
            value: MsgVote.encode({
              proposalId: msg.value.proposal_id,
              voter: msg.value.voter,
              option: (() => {
                switch (msg.value.option) {
                  case 1:
                    return VoteOption.VOTE_OPTION_YES;
                  case 2:
                    return VoteOption.VOTE_OPTION_ABSTAIN;
                  case 3:
                    return VoteOption.VOTE_OPTION_NO;
                  case 4:
                    return VoteOption.VOTE_OPTION_NO_WITH_VETO;
                  default:
                    return VoteOption.VOTE_OPTION_UNSPECIFIED;
                }
              })(),
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.govVote.gas.toString(),
      },
      signOptions,
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to vote, refresh the proposal.
          const proposal = this.queries.cosmos.queryGovernance.proposals.find(
            (proposal) => proposal.id === proposalId
          );
          if (proposal) {
            proposal.fetch();
          }

          const vote = this.queries.cosmos.queryProposalVote.getVote(
            proposalId,
            this.base.bech32Address
          );
          vote.fetch();
        }
      })
    );
  }

  protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
