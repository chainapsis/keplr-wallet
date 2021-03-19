import { CoinPrimitive, HasMapStore } from "../common";
import { DenomHelper, toGenerator } from "@keplr-wallet/common";
import { ChainGetter } from "../common";
import { computed, flow, makeObservable, observable, runInAction } from "mobx";
import { AppCurrency, Keplr } from "@keplr-wallet/types";
import {
  BaseAccount,
  ChainIdHelper,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import Axios, { AxiosInstance } from "axios";
import {
  BroadcastMode,
  makeSignDoc,
  makeStdTx,
  Msg,
  StdFee,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { QueriesStore } from "../query";
import { Queries } from "../query/queries";

import { BondStatus } from "../query/cosmos/staking/types";

import { Buffer } from "buffer/";
import { DeepPartial, DeepReadonly } from "utility-types";
import deepmerge from "deepmerge";

export enum WalletStatus {
  Loading = "Loading",
  Loaded = "Loaded",
  NotExist = "NotExist",
}

interface MsgOpt {
  type: string;
  gas: number;
}

export interface MsgOpts {
  send: {
    native: MsgOpt;
    cw20: Pick<MsgOpt, "gas">;
    secret20: Pick<MsgOpt, "gas">;
  };
  ibc: {
    transfer: MsgOpt;
  };
  delegate: MsgOpt;
  undelegate: MsgOpt;
  redelegate: MsgOpt;
  // The gas multiplication per rewards.
  withdrawRewards: MsgOpt;
  govVote: MsgOpt;

  createSecret20ViewingKey: Pick<MsgOpt, "gas">;

  executeSecretWasm: Pick<MsgOpt, "type">;
}

export interface AccountStoreInnerOpts {
  prefetching: boolean;
  suggestChain: boolean;
  msgOpts: MsgOpts;
}

export interface AccountStoreOpts {
  defaultOpts?: DeepPartial<AccountStoreInnerOpts>;
  chainOpts?: (DeepPartial<AccountStoreInnerOpts> & { chainId: string })[];
}

export class AccountStoreInner {
  @observable
  protected _walletVersion: string | undefined = undefined;

  @observable
  protected _walletStatus: WalletStatus = WalletStatus.Loading;

  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";

  @observable
  protected _isSendingMsg: keyof MsgOpts | "unknown" | false = false;

  public broadcastMode: "sync" | "async" | "block" = "sync";

  protected pubKey: Uint8Array;

  public static readonly defaultOpts: DeepReadonly<AccountStoreInnerOpts> = {
    prefetching: false,
    suggestChain: false,
    msgOpts: {
      send: {
        native: {
          type: "cosmos-sdk/MsgSend",
          gas: 80000,
        },
        cw20: {
          gas: 250000,
        },
        secret20: {
          gas: 250000,
        },
      },
      ibc: {
        transfer: {
          type: "cosmos-sdk/MsgTransfer",
          gas: 120000,
        },
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

      createSecret20ViewingKey: {
        gas: 150000,
      },

      executeSecretWasm: {
        type: "wasm/MsgExecuteContract",
      },
    },
  };

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queries: Queries,
    protected readonly opts: AccountStoreInnerOpts
  ) {
    makeObservable(this);

    this.pubKey = new Uint8Array();

    this.init();
  }

  get msgOpts(): MsgOpts {
    return this.opts.msgOpts;
  }

  protected async enable(keplr: Keplr, chainId: string): Promise<void> {
    const chainInfo = this.chainGetter.getChain(chainId);

    if (this.opts.suggestChain) {
      await keplr.experimentalSuggestChain(chainInfo);
    }
    await keplr.enable(chainId);
  }

  @flow
  protected *init() {
    // If wallet status is not exist, there is no need to try to init because it always fails.
    if (this.walletStatus === WalletStatus.NotExist) {
      return;
    }

    // If key store in the keplr extension is changed, this event will be dispatched.
    window.addEventListener("keplr_keystorechange", () => this.init(), {
      once: true,
    });

    // Set wallet status as loading whenever try to init.
    this._walletStatus = WalletStatus.Loading;

    const keplr = yield* toGenerator(AccountStore.getKeplr());
    if (!keplr) {
      this._walletStatus = WalletStatus.NotExist;
      return;
    }

    this._walletVersion = keplr.version;

    // TODO: Handle not approved.
    yield this.enable(keplr, this.chainId);

    const key = yield* toGenerator(keplr.getKey(this.chainId));
    this._bech32Address = key.bech32Address;
    this._name = key.name;
    this.pubKey = key.pubKey;

    // Set the wallet status as loaded after getting all necessary infos.
    this._walletStatus = WalletStatus.Loaded;
  }

  get walletVersion(): string | undefined {
    return this._walletVersion;
  }

  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  async sendMsgs(
    type: keyof MsgOpts | "unknown",
    msgs: Msg[],
    fee: StdFee,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    runInAction(() => {
      this._isSendingMsg = type;
    });

    let txHash: Uint8Array;
    let signDoc: StdSignDoc;
    try {
      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        this.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
    } catch (e) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      throw e;
    }

    const txTracer = new TendermintTxTracer(
      this.chainGetter.getChain(this.chainId).rpc,
      "/websocket"
    );
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      runInAction(() => {
        this._isSendingMsg = false;
      });

      // After sending tx, the balances is probably changed due to the fee.
      for (const feeAmount of signDoc.fee.amount) {
        const bal = this.queries
          .getQueryBalances()
          .getQueryBech32Address(this.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }

  async sendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: StdFee,
    onFulfill?: (tx: any) => void
  ) {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    switch (denomHelper.type) {
      case "native":
        await this.sendMsgs(
          "send",
          [
            {
              type: this.opts.msgOpts.send.native.type,
              value: {
                from_address: this.bech32Address,
                to_address: recipient,
                amount: [
                  {
                    denom: currency.coinMinimalDenom,
                    amount: actualAmount,
                  },
                ],
              },
            },
          ],
          stdFee,
          memo,
          (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries
                .getQueryBalances()
                .getQueryBech32Address(this.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }

            if (onFulfill) {
              onFulfill(tx);
            }
          }
        );
        return;
      case "secret20":
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
          stdFee,
          memo,
          (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries
                .getQueryBalances()
                .getQueryBech32Address(this.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }

            if (onFulfill) {
              onFulfill(tx);
            }
          }
        );
        return;
      default:
        throw new Error(`Unsupported type of currency (${denomHelper.type})`);
    }
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
    stdFee: StdFee,
    onFulfill?: (tx: any) => void
  ) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "native") {
      throw new Error("Only native token can be sent via IBC");
    }

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    const msg = {
      type: this.opts.msgOpts.ibc.transfer.type,
      value: {
        source_port: channel.portId,
        source_channel: channel.channelId,
        token: {
          denom: currency.coinMinimalDenom,
          amount: actualAmount,
        },
        sender: this.bech32Address,
        receiver: recipient,
        timeout_height: {
          revision_number: ChainIdHelper.parse(
            channel.counterpartyChainId
          ).version.toString() as string | undefined,
          revision_height: "9999999999",
        },
      },
    };

    if (msg.value.timeout_height.revision_number === "0") {
      delete msg.value.timeout_height.revision_number;
    }

    await this.sendMsgs("send", [msg], stdFee, memo, (tx) => {
      if (tx.code == null || tx.code === 0) {
        // After succeeding to send token, refresh the balance.
        const queryBalance = this.queries
          .getQueryBalances()
          .getQueryBech32Address(this.bech32Address)
          .balances.find((bal) => {
            return bal.currency.coinMinimalDenom === currency.coinMinimalDenom;
          });

        if (queryBalance) {
          queryBalance.fetch();
        }
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
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
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.opts.msgOpts.delegate.type,
      value: {
        delegator_address: this.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.sendMsgs(
      "delegate",
      [msg],
      {
        amount: [],
        gas: this.opts.msgOpts.delegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the validators and delegations, rewards.
          this.queries
            .getQueryValidators()
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries
            .getQueryDelegations()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
          this.queries
            .getQueryRewards()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
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
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.opts.msgOpts.undelegate.type,
      value: {
        delegator_address: this.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.sendMsgs(
      "undelegate",
      [msg],
      {
        amount: [],
        gas: this.opts.msgOpts.undelegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to unbond, refresh the validators and delegations, unbonding delegations, rewards.
          this.queries
            .getQueryValidators()
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries
            .getQueryDelegations()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
          this.queries
            .getQueryUnbondingDelegations()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
          this.queries
            .getQueryRewards()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
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
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.opts.msgOpts.redelegate.type,
      value: {
        delegator_address: this.bech32Address,
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
      [msg],
      {
        amount: [],
        gas: this.opts.msgOpts.redelegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the validators and delegations, rewards.
          this.queries
            .getQueryValidators()
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries
            .getQueryDelegations()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
          this.queries
            .getQueryRewards()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  async sendWithdrawDelegationRewardMsgs(
    validatorAddresses: string[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.opts.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    await this.sendMsgs(
      "withdrawRewards",
      msgs,
      {
        amount: [],
        gas: (
          this.opts.msgOpts.withdrawRewards.gas * validatorAddresses.length
        ).toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries
            .getQueryRewards()
            .getQueryBech32Address(this.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  async sendGovVoteMsg(
    proposalId: string,
    option: "Yes" | "No" | "Abstain" | "NoWithVeto",
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const voteOption = (() => {
      if (
        this.chainGetter.getChain(this.chainId).features?.includes("stargate")
      ) {
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
      } else {
        return option;
      }
    })();

    const msg = {
      type: this.opts.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.bech32Address,
      },
    };

    await this.sendMsgs(
      "govVote",
      [msg],
      {
        amount: [],
        gas: this.opts.msgOpts.govVote.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to vote, refresh the proposal.
          const proposal = this.queries
            .getQueryGovernance()
            .proposals.find((proposal) => proposal.id === proposalId);
          if (proposal) {
            proposal.fetch();
          }
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  async createSecret20ViewingKey(
    contractAddress: string,
    memo: string = "",
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
      {
        amount: [],
        gas: this.opts.msgOpts.createSecret20ViewingKey.gas.toString(),
      },
      memo,
      async (tx) => {
        let viewingKey = "";
        if (tx && "data" in tx && tx.data) {
          const dataOutputCipher = Buffer.from(tx.data as any, "base64");

          const keplr = await AccountStore.getKeplr();

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
    type: keyof MsgOpts | "unknown" = "executeSecretWasm",
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object,
    sentFunds: CoinPrimitive[],
    fee: StdFee,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ): Promise<Uint8Array> {
    const encryptedMsg = await (async () => {
      runInAction(() => {
        this._isSendingMsg = type;
      });
      try {
        return await this.encryptSecretContractMsg(contractAddress, obj);
      } finally {
        runInAction(() => {
          this._isSendingMsg = false;
        });
      }
    })();

    const msg = {
      type: this.opts.msgOpts.executeSecretWasm.type,
      value: {
        sender: this.bech32Address,
        contract: contractAddress,
        callback_code_hash: "",
        msg: Buffer.from(encryptedMsg).toString("base64"),
        sent_funds: sentFunds,
        callback_sig: null,
      },
    };

    await this.sendMsgs(type, [msg], fee, memo, onFulfill);

    return encryptedMsg;
  }

  protected async encryptSecretContractMsg(
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object
  ): Promise<Uint8Array> {
    const queryContractCodeHashResponse = await this.queries
      .getQuerySecretContractCodeHash()
      .getQueryContract(contractAddress)
      .waitResponse();

    if (!queryContractCodeHashResponse) {
      throw new Error(
        `Can't get the code hash of the contract (${contractAddress})`
      );
    }

    const contractCodeHash = queryContractCodeHashResponse.data.result;

    const keplr = await AccountStore.getKeplr();
    if (!keplr) {
      throw new Error("Can't get the Keplr API");
    }

    const enigmaUtils = keplr.getEnigmaUtils(this.chainId);
    return await enigmaUtils.encrypt(contractCodeHash, obj);
  }

  // Return the tx hash.
  protected async broadcastMsgs(
    msgs: Msg[],
    fee: StdFee,
    memo: string = "",
    mode: "block" | "async" | "sync" = "async"
  ): Promise<{
    txHash: Uint8Array;
    signDoc: StdSignDoc;
  }> {
    if (this.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
    }

    if (msgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    const account = await BaseAccount.fetchFromRest(
      this.instance,
      this.bech32Address,
      true
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await AccountStore.getKeplr())!;

    const signDoc = makeSignDoc(
      msgs,
      fee,
      this.chainId,
      memo,
      account.getAccountNumber().toString(),
      account.getSequence().toString()
    );

    const signResponse = await keplr.signAmino(
      this.chainId,
      this.bech32Address,
      signDoc
    );

    const signedTx = makeStdTx(signResponse.signed, signResponse.signature);

    return {
      txHash: await keplr.sendTx(this.chainId, signedTx, mode as BroadcastMode),
      signDoc: signResponse.signed,
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

  get walletStatus(): WalletStatus {
    return this._walletStatus;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get isSendingMsg(): keyof MsgOpts | "unknown" | false {
    return this._isSendingMsg;
  }
}

export class AccountStore extends HasMapStore<AccountStoreInner> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    protected readonly opts: AccountStoreOpts = {}
  ) {
    super((chainId: string) => {
      return new AccountStoreInner(
        this.chainGetter,
        chainId,
        this.queriesStore.get(chainId),
        deepmerge(
          AccountStoreInner.defaultOpts,
          this.opts.chainOpts?.find((opts) => opts.chainId === chainId) ?? {}
        )
      );
    });

    const defaultOpts = deepmerge(
      AccountStoreInner.defaultOpts,
      this.opts.defaultOpts ?? {}
    );
    for (const opts of this.opts.chainOpts ?? []) {
      if (opts.prefetching || defaultOpts.prefetching) {
        this.getAccount(opts.chainId);
      }
    }
  }

  getAccount(chainId: string): AccountStoreInner {
    return this.get(chainId);
  }

  hasAccount(chainId: string): boolean {
    return this.has(chainId);
  }

  static async getKeplr(): Promise<Keplr | undefined> {
    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === "complete") {
      return window.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }
}
