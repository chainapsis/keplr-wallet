import { AccountSetBaseSuper, WalletStatus } from "./base";
import { EvmQueries, IQueriesStore, QueriesSetBase } from "../query";
import {
  ChainGetter,
  erc20MetadataInterface,
  nativeFetBridgeInterface,
} from "../common";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import {
  AppCurrency,
  EthSignType,
  KeplrSignOptions,
  StdFee,
} from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { Buffer } from "buffer/";
import { CosmosAccount } from "./cosmos";
import { txEventsWithPreOnFulfill } from "./utils";
import Axios, { AxiosInstance } from "axios";
import { MakeTxResponse } from "./types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  JsonRpcProvider,
  TransactionReceipt,
  TransactionRequest,
} from "@ethersproject/providers";
import { isAddress } from "@ethersproject/address";

export interface EthereumAccount {
  ethereum: EthereumAccountImpl;
}

export const EthereumAccount = {
  use(options: {
    queriesStore: IQueriesStore<EvmQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => EthereumAccount {
    return (base, chainGetter, chainId) => {
      return {
        ethereum: new EthereumAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class EthereumAccountImpl {
  public broadcastMode: "sync" | "async" | "block" = "sync";

  constructor(
    protected readonly base: AccountSetBaseSuper & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<EvmQueries>
  ) {
    this.base.registerMakeSendTokenFn(this.processMakeSendTokenTx.bind(this));
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rpc,
      },
    });
  }

  get ethersInstance(): JsonRpcProvider {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return new JsonRpcProvider(chainInfo.rpc);
  }

  protected processMakeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    const isEvm =
      this.chainGetter.getChain(this.chainId).features?.includes("evm") ??
      false;
    if (denomHelper.type === "native" && isEvm) {
      if (!isAddress(recipient)) {
        throw new Error("Invalid receipient address");
      }

      return this.makeEthereumTx("send", {
        to: recipient,
        value: actualAmount,
      });
    } else if (denomHelper.type === "erc20") {
      return this.makeEthereumTx(
        "send",
        {
          to: denomHelper.contractAddress,
          data: erc20MetadataInterface.encodeFunctionData("transfer", [
            recipient,
            actualAmount,
          ]),
        },
        (tx: TransactionReceipt) => {
          if (tx.status && tx.status === 1) {
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

  makeEthereumTx(
    type: string | "unknown",
    params: TransactionRequest,
    // eslint-disable-next-line @typescript-eslint/ban-types
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): MakeTxResponse {
    return {
      simulate: () => {
        return this.simulateTx(params);
      },
      msgs: async () => {
        return {
          aminoMsgs: [],
          protoMsgs: [],
        };
      },
      send: async (
        fee: StdFee,
        _?: string,
        __?: KeplrSignOptions,
        onTxEvents?:
          | ((tx: any) => void)
          | {
              onBroadcastFailed?: (e?: Error) => void;
              onBroadcasted?: (txHash: Uint8Array) => void;
              onFulfill?: (tx: any) => void;
            }
      ): Promise<void> => {
        return this.sendTx(
          type,
          params,
          fee,
          txEventsWithPreOnFulfill(onTxEvents, preOnTxEvents)
        );
      },
      simulateAndSend: async () => {},
      sendWithGasPrice: async () => {},
    };
  }

  async simulateTx(params: TransactionRequest): Promise<{
    gasUsed: number;
  }> {
    const result = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_estimateGas",
      params: [{ from: this.base.ethereumHexAddress, ...params }],
    });

    if (result.data.error && result.data.error.message) {
      throw new Error(result.data.error.message);
    }

    if (!result.data.result) {
      throw new Error("Unknown error");
    }

    const gasUsed = parseInt(result.data.result);
    if (Number.isNaN(gasUsed)) {
      throw new Error(`Invalid integer gas: ${result.data.result}`);
    }

    return {
      gasUsed,
    };
  }

  async sendTx(
    type: string | "unknown",
    params: TransactionRequest,
    fee: StdFee,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    this.base.setTxTypeInProgress(type);

    let txHash: string;
    try {
      txHash = await this.broadcastTx(params, fee);
    } catch (e: any) {
      this.base.setTxTypeInProgress("");

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

    if (onBroadcasted) {
      onBroadcasted(Uint8Array.from(Buffer.from(txHash, "hex")));
    }

    const provider = this.ethersInstance;
    provider.once(txHash, (tx) => {
      this.base.setTxTypeInProgress("");

      for (const feeAmount of fee.amount) {
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
        tx.hash = txHash;
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }

  async broadcastTx(params: TransactionRequest, fee: StdFee): Promise<string> {
    if (this.base.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
    }

    const txCountResult = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_getTransactionCount",
      params: [this.base.ethereumHexAddress, "latest"],
    });

    if (!(txCountResult.data && txCountResult.data.result)) {
      throw new Error("Issue fetching nonce");
    }

    const nonce = parseInt(txCountResult.data.result, 16);

    const encoder = new TextEncoder();
    const gasPrice = BigNumber.from(fee.amount[0].amount)
      .div(BigNumber.from(fee.gas))
      .toNumber();
    const rawTxn = encoder.encode(
      JSON.stringify({
        ...params,
        nonce,
        gasLimit: parseInt(fee.gas),
        gasPrice,
      })
    );

    const keplr = (await this.base.getKeplr())!;

    const signResponse = await keplr.signEthereum(
      this.chainId,
      this.base.bech32Address,
      rawTxn,
      EthSignType.TRANSACTION
    );

    const result = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_sendRawTransaction",
      params: [`0x${Buffer.from(signResponse).toString("hex")}`],
    });

    if (!(result.data && result.data.result)) {
      throw new Error("Issue sending transaction");
    }

    return result.data.result as string;
  }

  makeApprovalTx(amount: string, spender: string, currency: AppCurrency) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "erc20") {
      throw new Error("Currency needs to be erc20");
    }

    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    return this.makeEthereumTx(
      "approval",
      {
        to: new DenomHelper(currency.coinMinimalDenom).contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("approve", [
          spender,
          actualAmount,
        ]),
      },
      (tx: TransactionReceipt) => {
        if (tx.status && tx.status === 1) {
          // After succeeding to send token, refresh the allowance.
          const queryAllowance =
            this.queries.evm.queryERC20Allowance.getQueryAllowance(
              this.base.bech32Address,
              spender,
              new DenomHelper(currency.coinMinimalDenom).contractAddress
            );

          if (queryAllowance) {
            queryAllowance.fetch();
          }
        }
      }
    );
  }

  makeNativeBridgeTx(amount: string, recipient: string) {
    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(18));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    return this.makeEthereumTx(
      "nativeBridgeSend",
      {
        to: this.queries.evm.queryNativeFetBridge.nativeBridgeAddress,
        data: nativeFetBridgeInterface.encodeFunctionData("swap", [
          actualAmount,
          recipient,
        ]),
      },
      (tx: TransactionReceipt) => {
        if (tx.status && tx.status === 1) {
          // After succeeding to send token, refresh the balance.
          const queryBalance = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.find((bal) => {
              return bal.currency.coinDenom === "FET";
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
        }
      }
    );
  }

  protected get queries(): DeepReadonly<QueriesSetBase & EvmQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
