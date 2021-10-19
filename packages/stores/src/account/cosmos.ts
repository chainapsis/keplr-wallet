import { AccountSetBase, AccountSetOpts, MsgOpt } from "./base";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { ChainIdHelper, cosmos, ibc } from "@keplr-wallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";
import { HasCosmosQueries, QueriesSetBase, QueriesStore } from "../query";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import Long from "long";

export interface HasCosmosAccount {
  cosmos: DeepReadonly<CosmosAccount>;
}

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

export class AccountWithCosmos
  extends AccountSetBase<CosmosMsgOpts, HasCosmosQueries>
  implements HasCosmosAccount {
  public readonly cosmos: DeepReadonly<CosmosAccount>;

  static readonly defaultMsgOpts: CosmosMsgOpts = {
    send: {
      native: {
        type: "cosmos-sdk/MsgSend",
        gas: 80000,
      },
    },
    ibcTransfer: {
      type: "cosmos-sdk/MsgTransfer",
      gas: 120000,
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

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries
    >,
    protected readonly opts: AccountSetOpts<CosmosMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class CosmosAccount {
  constructor(
    protected readonly base: AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries
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
      case "native":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        const msg = {
          type: this.base.msgOpts.send.native.type,
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

        await this.base.sendMsgs(
          "send",
          {
            aminoMsgs: [msg],
            protoMsgs: this.hasNoLegacyStdFeature()
              ? [
                  {
                    type_url: "/cosmos.bank.v1beta1.MsgSend",
                    value: cosmos.bank.v1beta1.MsgSend.encode({
                      fromAddress: msg.value.from_address,
                      toAddress: msg.value.to_address,
                      amount: msg.value.amount,
                    }).finish(),
                  },
                ]
              : undefined,
          },
          memo,
          {
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.base.msgOpts.send.native.gas.toString(),
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

    const destinationBlockHeight = this.queriesStore
      .get(channel.counterpartyChainId)
      .cosmos.queryBlock.getBlock("latest");

    await this.base.sendMsgs(
      "ibcTransfer",
      async () => {
        // Wait until fetching complete.
        await destinationBlockHeight.waitFreshResponse();

        if (destinationBlockHeight.height.equals(new Int("0"))) {
          throw new Error(
            `Failed to fetch the latest block of ${channel.counterpartyChainId}`
          );
        }

        const msg = {
          type: this.base.msgOpts.ibcTransfer.type,
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
                channel.counterpartyChainId
              ).version.toString() as string | undefined,
              // Set the timeout height as the current height + 150.
              revision_height: destinationBlockHeight.height
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
              type_url: "/ibc.applications.transfer.v1.MsgTransfer",
              value: ibc.applications.transfer.v1.MsgTransfer.encode({
                sourcePort: msg.value.source_port,
                sourceChannel: msg.value.source_channel,
                token: msg.value.token,
                sender: msg.value.sender,
                receiver: msg.value.receiver,
                timeoutHeight: {
                  revisionNumber: msg.value.timeout_height.revision_number
                    ? Long.fromString(msg.value.timeout_height.revision_number)
                    : null,
                  revisionHeight: Long.fromString(
                    msg.value.timeout_height.revision_height
                  ),
                },
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.ibcTransfer.gas.toString(),
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
      type: this.base.msgOpts.delegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.base.sendMsgs(
      "delegate",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                type_url: "/cosmos.staking.v1beta1.MsgDelegate",
                value: cosmos.staking.v1beta1.MsgDelegate.encode({
                  delegatorAddress: msg.value.delegator_address,
                  validatorAddress: msg.value.validator_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ]
          : undefined,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.delegate.gas.toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
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
      type: this.base.msgOpts.undelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.base.sendMsgs(
      "undelegate",
      [msg],
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.undelegate.gas.toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
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
      type: this.base.msgOpts.redelegate.type,
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

    await this.base.sendMsgs(
      "redelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                type_url: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
                value: cosmos.staking.v1beta1.MsgBeginRedelegate.encode({
                  delegatorAddress: msg.value.delegator_address,
                  validatorSrcAddress: msg.value.validator_src_address,
                  validatorDstAddress: msg.value.validator_dst_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ]
          : undefined,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.redelegate.gas.toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
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
        type: this.base.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    await this.base.sendMsgs(
      "withdrawRewards",
      {
        aminoMsgs: msgs,
        protoMsgs: this.hasNoLegacyStdFeature()
          ? msgs.map((msg) => {
              return {
                type_url:
                  "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                value: cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward.encode(
                  {
                    delegatorAddress: msg.value.delegator_address,
                    validatorAddress: msg.value.validator_address,
                  }
                ).finish(),
              };
            })
          : undefined,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          (
            this.base.msgOpts.withdrawRewards.gas * validatorAddresses.length
          ).toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

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
      type: this.base.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.base.bech32Address,
      },
    };

    await this.base.sendMsgs(
      "govVote",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                type_url: "/cosmos.gov.v1beta1.MsgVote",
                value: cosmos.gov.v1beta1.MsgVote.encode({
                  proposalId: Long.fromString(msg.value.proposal_id),
                  voter: msg.value.voter,
                  option: (() => {
                    switch (msg.value.option) {
                      case "Yes":
                      case 1:
                        return cosmos.gov.v1beta1.VoteOption.VOTE_OPTION_YES;
                      case "Abstain":
                      case 2:
                        return cosmos.gov.v1beta1.VoteOption
                          .VOTE_OPTION_ABSTAIN;
                      case "No":
                      case 3:
                        return cosmos.gov.v1beta1.VoteOption.VOTE_OPTION_NO;
                      case "NoWithVeto":
                      case 4:
                        return cosmos.gov.v1beta1.VoteOption
                          .VOTE_OPTION_NO_WITH_VETO;
                      default:
                        return cosmos.gov.v1beta1.VoteOption
                          .VOTE_OPTION_UNSPECIFIED;
                    }
                  })(),
                }).finish(),
              },
            ]
          : undefined,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.govVote.gas.toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
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
      onFulfill:
        onFulfill || preOnFulfill
          ? (tx: any) => {
              if (preOnFulfill) {
                preOnFulfill(tx);
              }

              if (onFulfill) {
                onFulfill(tx);
              }
            }
          : undefined,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & HasCosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }
}
