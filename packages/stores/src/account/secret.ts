import { AccountSetBase, AccountSetOpts, MsgOpt } from "./base";
import { HasSecretQueries, QueriesSetBase, QueriesStore } from "../query";
import { Buffer } from "buffer/";
import { ChainGetter, CoinPrimitive } from "../common";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import { DeepReadonly, Optional } from "utility-types";

export interface HasSecretAccount {
  secret: DeepReadonly<SecretAccount>;
}

export interface SecretMsgOpts {
  readonly send: {
    readonly secret20: Pick<MsgOpt, "gas">;
  };

  readonly createSecret20ViewingKey: Pick<MsgOpt, "gas">;
  readonly executeSecretWasm: Pick<MsgOpt, "type">;
}

export class AccountWithSecret
  extends AccountSetBase<SecretMsgOpts, HasSecretQueries>
  implements HasSecretAccount {
  public readonly secret: DeepReadonly<SecretAccount>;

  static readonly defaultMsgOpts: SecretMsgOpts = {
    send: {
      secret20: {
        gas: 250000,
      },
    },

    createSecret20ViewingKey: {
      gas: 150000,
    },

    executeSecretWasm: {
      type: "wasm/MsgExecuteContract",
    },
  };

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasSecretQueries
    >,
    protected readonly opts: AccountSetOpts<SecretMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.secret = new SecretAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class SecretAccount {
  constructor(
    protected readonly base: AccountSetBase<SecretMsgOpts, HasSecretQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasSecretQueries
    >
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
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
      case "secret20":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        if (!("type" in currency) || currency.type !== "secret20") {
          throw new Error("Currency is not secret20");
        }
        await this.sendExecuteSecretContractMsg(
          "send",
          currency.contractAddress,
          {
            transfer: {
              recipient: recipient,
              amount: actualAmount,
            },
          },
          [],
          memo,
          {
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.base.msgOpts.send.secret20.gas.toString(),
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

  async createSecret20ViewingKey(
    contractAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any, viewingKey: string) => void
  ) {
    const random = new Uint8Array(15);
    crypto.getRandomValues(random);
    const entropy = Buffer.from(random).toString("hex");

    const encrypted = await this.sendExecuteSecretContractMsg(
      "createSecret20ViewingKey",
      contractAddress,
      {
        create_viewing_key: { entropy },
      },
      [],
      memo,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          this.base.msgOpts.createSecret20ViewingKey.gas.toString(),
      },
      signOptions,
      async (tx) => {
        let viewingKey = "";
        if (tx && "data" in tx && tx.data) {
          const dataOutputCipher = Buffer.from(tx.data as any, "base64");

          const keplr = await this.base.getKeplr();

          if (!keplr) {
            throw new Error("Can't get the Keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(this.chainId);

          const nonce = encrypted.slice(0, 32);

          const dataOutput = Buffer.from(
            Buffer.from(
              await enigmaUtils.decrypt(dataOutputCipher, nonce)
            ).toString(),
            "base64"
          ).toString();

          // Expected: {"create_viewing_key":{"key":"api_key_1k1T...btJQo="}}
          const data = JSON.parse(dataOutput);
          viewingKey = data["create_viewing_key"]["key"];
        }

        if (onFulfill) {
          onFulfill(tx, viewingKey);
        }
      }
    );
    return;
  }

  async sendExecuteSecretContractMsg(
    // This arg can be used to override the type of sending tx if needed.
    type: keyof SecretMsgOpts | "unknown" = "executeSecretWasm",
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object,
    sentFunds: CoinPrimitive[],
    memo: string = "",
    stdFee: Optional<StdFee, "amount">,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<Uint8Array> {
    let encryptedMsg: Uint8Array;

    await this.base.sendMsgs(
      type,
      async () => {
        encryptedMsg = await this.encryptSecretContractMsg(
          contractAddress,
          obj
        );

        const msg = {
          type: this.base.msgOpts.executeSecretWasm.type,
          value: {
            sender: this.base.bech32Address,
            contract: contractAddress,
            callback_code_hash: "",
            msg: Buffer.from(encryptedMsg).toString("base64"),
            sent_funds: sentFunds,
            callback_sig: null,
          },
        };

        return [msg];
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents)
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return encryptedMsg!;
  }

  protected async encryptSecretContractMsg(
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object
  ): Promise<Uint8Array> {
    const queryContractCodeHashResponse = await this.queries.secret.querySecretContractCodeHash
      .getQueryContract(contractAddress)
      .waitResponse();

    if (!queryContractCodeHashResponse) {
      throw new Error(
        `Can't get the code hash of the contract (${contractAddress})`
      );
    }

    const contractCodeHash = queryContractCodeHashResponse.data.result;

    const keplr = await this.base.getKeplr();
    if (!keplr) {
      throw new Error("Can't get the Keplr API");
    }

    const enigmaUtils = keplr.getEnigmaUtils(this.chainId);
    return await enigmaUtils.encrypt(contractCodeHash, obj);
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

  protected get queries(): DeepReadonly<QueriesSetBase & HasSecretQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
