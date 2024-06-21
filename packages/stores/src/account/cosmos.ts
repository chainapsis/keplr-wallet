import { AccountSetBaseSuper, MsgOpt, WalletStatus } from "./base";
import {
  AminoSignResponse,
  AppCurrency,
  BroadcastMode,
  Coin,
  Keplr,
  KeplrSignOptions,
  Msg,
  SignDoc,
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
import {
  BaseAccount,
  Bech32Address,
  ChainIdHelper,
  EthermintChainIdHelper,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";
import { CosmosQueries, IQueriesStore, QueriesSetBase } from "../query";
import { DeepPartial, DeepReadonly, Mutable } from "utility-types";
import { ChainGetter } from "../chain";
import deepmerge from "deepmerge";
import { Buffer } from "buffer/";
import {
  KeplrSignOptionsWithAltSignMethods,
  MakeTxResponse,
  ProtoMsgsOrWithAminoMsgs,
} from "./types";
import {
  getEip712TypedDataBasedOnChainId,
  txEventsWithPreOnFulfill,
} from "./utils";
import { ExtensionOptionsWeb3Tx } from "@keplr-wallet/proto-types/ethermint/types/v1/web3";
import { MsgRevoke } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import Long from "long";
import { IAccountStore } from "./store";
import { autorun } from "mobx";

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
        this.chainGetter.getChain(this.chainId).bech32Config
          ?.bech32PrefixAccAddr
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

  async sendMsgs(
    type: string | "unknown",
    msgs:
      | ProtoMsgsOrWithAminoMsgs
      | (() => Promise<ProtoMsgsOrWithAminoMsgs> | ProtoMsgsOrWithAminoMsgs),
    memo: string = "",
    fee: StdFee,
    signOptions?: KeplrSignOptionsWithAltSignMethods,
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
    let signDoc: StdSignDoc | SignDoc;
    try {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(msgs, fee, memo, signOptions);
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
      const feeDenoms: string[] = (() => {
        if ("fee" in signDoc) {
          return signDoc.fee.amount.map((amount) => amount.denom);
        } else if ("authInfoBytes" in signDoc) {
          const authInfo = AuthInfo.decode(signDoc.authInfoBytes);
          return authInfo.fee?.amount.map((amount) => amount.denom) ?? [];
        } else {
          return [];
        }
      })();
      for (const feeDenom of feeDenoms) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.base.bech32Address)
          .balances.find((bal) => bal.currency.coinMinimalDenom === feeDenom);

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
    signOptions?: KeplrSignOptionsWithAltSignMethods
  ): Promise<{
    txHash: Uint8Array;
    signDoc: StdSignDoc | SignDoc;
  }> {
    if (this.base.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
    }

    const isDirectSign = !msgs.aminoMsgs || msgs.aminoMsgs.length === 0;

    const aminoMsgs: Msg[] = msgs.aminoMsgs || [];
    const protoMsgs: Any[] = msgs.protoMsgs;

    if (protoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    if (!isDirectSign) {
      if (aminoMsgs.length !== protoMsgs.length) {
        throw new Error("The length of aminoMsgs and protoMsgs are different");
      }
    }

    const account = await BaseAccount.fetchFromRest(
      this.chainGetter.getChain(this.chainId).rest,
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

    if (eip712Signing && isDirectSign) {
      throw new Error("EIP712 signing is not supported for proto signing");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.base.getKeplr())!;

    const signedTx = await (async () => {
      if (isDirectSign) {
        return await this.createSignedTxWithDirectSign(
          keplr,
          account,
          msgs.protoMsgs,
          fee,
          memo,
          signOptions
        );
      } else {
        const signDocRaw: StdSignDoc = {
          chain_id: this.chainId,
          account_number: account.getAccountNumber().toString(),
          sequence: account.getSequence().toString(),
          fee: fee,
          msgs: aminoMsgs,
          memo: escapeHTML(memo),
        };

        const chainIsInjective = this.chainId.startsWith("injective");
        const chainIsStratos = this.chainId.startsWith("stratos");

        if (eip712Signing) {
          if (chainIsInjective) {
            // Due to injective's problem, it should exist if injective with ledger.
            // There is currently no effective way to handle this in keplr. Just set a very large number.
            (signDocRaw as Mutable<StdSignDoc>).timeout_height =
              Number.MAX_SAFE_INTEGER.toString();
          } else {
            // If not injective (evmos), they require fee payer.
            // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
            //      That means this part is not standard.
            (signDocRaw as Mutable<StdSignDoc>).fee = {
              ...signDocRaw.fee,
              feePayer: this.base.bech32Address,
            };
          }
        }

        const signDoc = sortObjectByKey(signDocRaw);

        // Should use bind to avoid "this" problem
        let signAmino = keplr.signAmino.bind(keplr);
        if (signOptions?.signAmino) {
          signAmino = signOptions.signAmino;
        }

        // Should use bind to avoid "this" problem
        let experimentalSignEIP712CosmosTx_v0 =
          keplr.experimentalSignEIP712CosmosTx_v0.bind(keplr);
        if (signOptions?.experimentalSignEIP712CosmosTx_v0) {
          experimentalSignEIP712CosmosTx_v0 =
            signOptions.experimentalSignEIP712CosmosTx_v0;
        }

        const signResponse: AminoSignResponse = await (async () => {
          if (!eip712Signing) {
            return await signAmino(
              this.chainId,
              this.base.bech32Address,
              signDoc,
              signOptions
            );
          }

          return await experimentalSignEIP712CosmosTx_v0(
            this.chainId,
            this.base.bech32Address,
            getEip712TypedDataBasedOnChainId(this.chainId, msgs),
            signDoc,
            signOptions
          );
        })();

        return {
          tx: TxRaw.encode({
            bodyBytes: TxBody.encode(
              TxBody.fromPartial({
                messages: protoMsgs,
                timeoutHeight: signResponse.signed.timeout_height,
                memo: signResponse.signed.memo,
                extensionOptions: eip712Signing
                  ? [
                      {
                        typeUrl: (() => {
                          if (chainIsInjective) {
                            return "/injective.types.v1beta1.ExtensionOptionsWeb3Tx";
                          }

                          return "/ethermint.types.v1.ExtensionOptionsWeb3Tx";
                        })(),
                        value: ExtensionOptionsWeb3Tx.encode(
                          ExtensionOptionsWeb3Tx.fromPartial({
                            typedDataChainId: EthermintChainIdHelper.parse(
                              this.chainId
                            ).ethChainId.toString(),
                            feePayer: !chainIsInjective
                              ? signResponse.signed.fee.feePayer
                              : undefined,
                            feePayerSig: !chainIsInjective
                              ? Buffer.from(
                                  signResponse.signature.signature,
                                  "base64"
                                )
                              : undefined,
                          })
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

                      if (chainIsInjective) {
                        return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                      }

                      if (chainIsStratos) {
                        return "/stratos.crypto.v1.ethsecp256k1.PubKey";
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
              fee: Fee.fromPartial({
                amount: signResponse.signed.fee.amount as Coin[],
                gasLimit: signResponse.signed.fee.gas,
                payer:
                  eip712Signing && !chainIsInjective
                    ? // Fee delegation feature not yet supported. But, for eip712 ethermint signing, we must set fee payer.
                      signResponse.signed.fee.feePayer
                    : undefined,
              }),
            }).finish(),
            signatures:
              // Injective needs the signature in the signatures list even if eip712
              !eip712Signing || chainIsInjective
                ? [Buffer.from(signResponse.signature.signature, "base64")]
                : [new Uint8Array(0)],
          }).finish(),
          signDoc: signResponse.signed,
        };
      }
    })();

    // Should use bind to avoid "this" problem
    let sendTx = keplr.sendTx.bind(keplr);
    if (signOptions?.sendTx) {
      sendTx = signOptions.sendTx;
    }

    return {
      txHash: await sendTx(this.chainId, signedTx.tx, "sync" as BroadcastMode),
      signDoc: signedTx.signDoc,
    };
  }

  protected async createSignedTxWithDirectSign(
    keplr: Keplr,
    account: BaseAccount,
    protoMsgs: Any[],
    fee: StdFee,
    memo: string,
    signOptions: KeplrSignOptionsWithAltSignMethods | undefined
  ): Promise<{
    tx: Uint8Array;
    signDoc: SignDoc;
  }> {
    const useEthereumSign =
      this.chainGetter
        .getChain(this.chainId)
        .features?.includes("eth-key-sign") === true;

    const chainIsInjective = this.chainId.startsWith("injective");
    const chainIsStratos = this.chainId.startsWith("stratos");

    // Should use bind to avoid "this" problem
    let signDirect = keplr.signDirect.bind(keplr);
    if (signOptions?.signDirect) {
      signDirect = signOptions.signDirect;
    }

    const signed = await signDirect(
      this.chainId,
      this.base.bech32Address,
      {
        bodyBytes: TxBody.encode(
          TxBody.fromPartial({
            messages: protoMsgs,
            memo,
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

                  if (chainIsInjective) {
                    return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                  }

                  if (chainIsStratos) {
                    return "/stratos.crypto.v1.ethsecp256k1.PubKey";
                  }

                  return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
                })(),
                value: PubKey.encode({
                  key: this.base.pubKey,
                }).finish(),
              },
              modeInfo: {
                single: {
                  mode: SignMode.SIGN_MODE_DIRECT,
                },
                multi: undefined,
              },
              sequence: account.getSequence().toString(),
            },
          ],
          fee: Fee.fromPartial({
            amount: fee.amount.map((coin) => {
              return {
                denom: coin.denom,
                amount: coin.amount.toString(),
              };
            }),
            gasLimit: fee.gas,
          }),
        }).finish(),
        chainId: this.chainId,
        accountNumber: Long.fromString(account.getAccountNumber().toString()),
      },
      signOptions
    );

    return {
      tx: TxRaw.encode({
        bodyBytes: signed.signed.bodyBytes,
        authInfoBytes: signed.signed.authInfoBytes,
        signatures: [Buffer.from(signed.signature.signature, "base64")],
      }).finish(),
      signDoc: signed.signed,
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
      this.chainGetter.getChain(this.chainId).rest,
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

    // TODO: Add response type
    const result = await simpleFetch<any>(
      this.chainGetter.getChain(this.chainId).rest,
      "/cosmos/tx/v1beta1/simulate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          tx_bytes: Buffer.from(unsignedTx).toString("base64"),
        }),
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
    defaultType: string | "unknown",
    msgs: ProtoMsgsOrWithAminoMsgs | (() => Promise<ProtoMsgsOrWithAminoMsgs>),
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): MakeTxResponse {
    let type = defaultType;

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
      signOptions?: KeplrSignOptionsWithAltSignMethods,
      onTxEvents?:
        | ((tx: any) => void)
        | {
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
      ui: {
        type: () => type,
        overrideType: (paramType: string) => {
          type = paramType;
        },
      },
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
        signOptions?: KeplrSignOptionsWithAltSignMethods,
        onTxEvents?:
          | ((tx: any) => void)
          | {
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
        signOptions?: KeplrSignOptionsWithAltSignMethods,
        onTxEvents?:
          | ((tx: any) => void)
          | {
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

  makePacketForwardIBCTransferTx(
    accountStore: IAccountStore,
    channels: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    }[],
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) {
    if (channels.length === 0) {
      throw new Error("No channels");
    }

    const destinationChainId =
      channels[channels.length - 1].counterpartyChainId;

    const destinationChainInfo = this.chainGetter.getChain(destinationChainId);

    Bech32Address.validate(
      recipient,
      destinationChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const counterpartyChainBech32Config = this.chainGetter.getChain(
      channels[0].counterpartyChainId
    ).bech32Config;
    if (counterpartyChainBech32Config == null) {
      throw new Error("Counterparty chain bech32 config is not set");
    }

    return this.makeIBCTransferTxWithAsyncMemoConstructor(
      channels[0],
      amount,
      currency,
      Bech32Address.fromBech32(recipient).toBech32(
        counterpartyChainBech32Config.bech32PrefixAccAddr
      ),
      async () => {
        const memo: any = {};
        let lastForward: any = undefined;
        if (channels.length > 1) {
          for (const channel of channels.slice(1)) {
            const destChainInfo = this.chainGetter.getChain(
              channel.counterpartyChainId
            );

            const account = accountStore.getAccount(destChainInfo.chainId);
            if (account.walletStatus !== WalletStatus.Loaded) {
              account.init();
            }
            if (account.walletStatus === WalletStatus.Loading) {
              await (() => {
                return new Promise<void>((resolve) => {
                  if (account.walletStatus === WalletStatus.Loaded) {
                    resolve();
                    return;
                  }
                  autorun(() => {
                    if (account.walletStatus === WalletStatus.Loaded) {
                      resolve();
                    }
                  });
                });
              })();
            }
            if (account.walletStatus !== WalletStatus.Loaded) {
              throw new Error(
                `The account of ${destChainInfo.chainId} is not loaded: ${account.walletStatus}`
              );
            }

            const forward = {
              receiver: account.bech32Address,
              port: channel.portId,
              channel: channel.channelId,
              // TODO: Support timeout
            };

            if (!lastForward) {
              memo["forward"] = forward;
            } else {
              lastForward["next"] = {
                forward: forward,
              };
            }

            lastForward = forward;
          }
        }

        return Object.keys(memo).length > 0 ? JSON.stringify(memo) : undefined;
      }
    );
  }

  makeIBCTransferTx(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo?: string
  ) {
    return this.makeIBCTransferTxWithAsyncMemoConstructor(
      channel,
      amount,
      currency,
      recipient,
      async () => memo
    );
  }

  makeIBCTransferTxWithAsyncMemoConstructor(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memoConstructor: () => Promise<string | undefined>
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
        const chainIsInjective = this.chainId.startsWith("injective");

        let memo = await memoConstructor();

        if (eip712Signing && chainIsInjective) {
          // I don't know why, but memo is required when injective and eip712
          if (!memo) {
            memo = "IBC Transfer";
          }
        }

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
            memo,
          },
        };

        if (msg.value.timeout_height.revision_number === "0") {
          delete msg.value.timeout_height.revision_number;
        }

        if (msg.value.timeout_timestamp === "0") {
          delete msg.value.timeout_timestamp;
        }

        if (!memo) {
          delete msg.value.memo;
        }

        const forceDirectSign = (() => {
          if (!this.base.isNanoLedger) {
            if (
              this.chainId.startsWith("injective") ||
              this.chainId.startsWith("stride") ||
              this.chainGetter
                .getChain(this.chainId)
                .hasFeature("ibc-go-v7-hot-fix")
            ) {
              return true;
            }
          }
          return false;
        })();

        return {
          aminoMsgs: forceDirectSign ? undefined : [msg],
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
                  memo: msg.value.memo,
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
              ...(() => {
                if (memo != null) {
                  return [
                    {
                      name: "memo",
                      type: "string",
                    },
                  ];
                }

                return [];
              })(),
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

  makeRevokeMsg(grantee: string, messageType: string) {
    Bech32Address.validate(
      grantee,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixAccAddr
    );

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const msg =
      chainInfo.chainIdentifier === "osmosis" ||
      chainInfo.hasFeature("authz-msg-revoke-fixed")
        ? {
            type: "cosmos-sdk/MsgRevoke",
            value: {
              granter: this.base.bech32Address,
              grantee,
              msg_type_url: messageType,
            },
          }
        : {
            granter: this.base.bech32Address,
            grantee,
            msg_type_url: messageType,
          };

    return this.makeTx(
      "revoke",
      {
        aminoMsgs: [msg as any],
        protoMsgs: [
          {
            typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
            value: MsgRevoke.encode({
              granter: this.base.bech32Address,
              grantee,
              msgTypeUrl: messageType,
            }).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          this.queries.cosmos.queryAuthZGranter
            .getGranter(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  makeDelegateTx(amount: string, validatorAddress: string) {
    Bech32Address.validate(
      validatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

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

    if (!currency) {
      throw new Error("Stake currency is null");
    }

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
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

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

  makeBeginRedelegateTx(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string
  ) {
    Bech32Address.validate(
      srcValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );
    Bech32Address.validate(
      dstValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

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

  makeWithdrawDelegationRewardTx(validatorAddresses: string[]) {
    for (const validatorAddress of validatorAddresses) {
      Bech32Address.validate(
        validatorAddress,
        this.chainGetter.getChain(this.chainId).bech32Config
          ?.bech32PrefixValAddr
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

  protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
