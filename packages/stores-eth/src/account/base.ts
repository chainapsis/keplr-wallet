import { ChainGetter } from "@keplr-wallet/stores";
import {
  AppCurrency,
  ERC20Currency,
  EthSignType,
  EthTxReceipt,
  Keplr,
} from "@keplr-wallet/types";
import { DenomHelper, retry } from "@keplr-wallet/common";
import { erc20ContractInterface } from "../constants";
import { hexValue } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import {
  TransactionTypes,
  UnsignedTransaction,
  serialize,
} from "@ethersproject/transactions";
import { getAddress as getEthAddress } from "@ethersproject/address";
import { action, makeObservable, observable } from "mobx";
import { Interface } from "@ethersproject/abi";

const opStackGasPriceOracleProxyAddress =
  "0x420000000000000000000000000000000000000F";

const opStackGasPriceOracleABI = new Interface([
  {
    inputs: [{ internalType: "bytes", name: "_data", type: "bytes" }],
    name: "getL1Fee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]);

export class EthereumAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  async simulateGas(sender: string, unsignedTx: UnsignedTransaction) {
    const chainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("evm" in chainInfo)) {
      throw new Error("No EVM chain info provided");
    }

    const { to, value, data } = unsignedTx;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;
    const gasEstimated = await keplr.ethereum.request<string | undefined>({
      method: "eth_estimateGas",
      params: [
        {
          from: sender,
          to,
          value,
          data,
        },
      ],
      chainId: this.chainId,
    });

    if (!gasEstimated) {
      throw new Error("Failed to estimate gas");
    }

    return {
      gasUsed: parseInt(gasEstimated),
    };
  }

  async simulateGasForSendTokenTx({
    currency,
    amount,
    sender,
    recipient,
  }: {
    currency: AppCurrency;
    amount: string;
    sender: string;
    recipient: string;
  }) {
    // If the recipient address is invalid, the sender address will be used as the recipient for gas estimating gas.
    const tempRecipient = EthereumAccountBase.isEthereumHexAddressWithChecksum(
      recipient
    )
      ? recipient
      : sender;

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx: UnsignedTransaction = (() => {
      switch (denomHelper.type) {
        case "erc20":
          return {
            to: denomHelper.contractAddress,
            value: "0x0",
            data: erc20ContractInterface.encodeFunctionData("transfer", [
              tempRecipient,
              hexValue(parsedAmount),
            ]),
          };
        default:
          return {
            to: tempRecipient,
            value: hexValue(parsedAmount),
          };
      }
    })();

    return this.simulateGas(sender, unsignedTx);
  }

  async simulateOpStackL1Fee(unsignedTx: UnsignedTransaction): Promise<string> {
    const chainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("evm" in chainInfo)) {
      throw new Error("No EVM chain info provided");
    }

    if (!chainInfo.evm.features?.includes("op-stack-l1-data-fee")) {
      throw new Error("The chain isn't built with OP Stack");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const l1Fee = await keplr.ethereum.request<string>({
      method: "eth_call",
      params: [
        {
          to: opStackGasPriceOracleProxyAddress,
          data: opStackGasPriceOracleABI.encodeFunctionData("getL1Fee", [
            serialize(unsignedTx),
          ]),
        },
        "latest",
      ],
      chainId: this.chainId,
    });

    return l1Fee;
  }

  makeSendTokenTx({
    currency,
    amount,
    to,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
    gasLimit: number;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
  }): UnsignedTransaction {
    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    const feeObject =
      maxFeePerGas && maxPriorityFeePerGas
        ? {
            maxFeePerGas: hexValue(Number(maxFeePerGas)),
            maxPriorityFeePerGas: hexValue(Number(maxPriorityFeePerGas)),
            gasLimit: hexValue(gasLimit),
          }
        : {
            gasPrice: hexValue(Number(gasPrice ?? "0")),
            gasLimit: hexValue(gasLimit),
          };

    // Support EIP-1559 transaction only.
    const unsignedTx: UnsignedTransaction = (() => {
      switch (denomHelper.type) {
        case "erc20":
          return {
            ...this.makeTx(
              denomHelper.contractAddress,
              "0x0",
              erc20ContractInterface.encodeFunctionData("transfer", [
                to,
                hexValue(parsedAmount),
              ])
            ),
            ...feeObject,
          };
        default:
          return {
            ...this.makeTx(to, hexValue(parsedAmount)),
            ...feeObject,
          };
      }
    })();

    return unsignedTx;
  }

  makeErc20ApprovalTx(
    currency: ERC20Currency,
    spender: string,
    amount: string
  ): UnsignedTransaction {
    const parsedAmount = parseUnits(amount, currency.coinDecimals);

    return this.makeTx(
      currency.contractAddress,
      "0x0",
      erc20ContractInterface.encodeFunctionData("approve", [
        spender,
        hexValue(parsedAmount),
      ])
    );
  }

  makeTx(to: string, value: string, data?: string): UnsignedTransaction {
    const chainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("evm" in chainInfo)) {
      throw new Error("No EVM chain info provided");
    }

    return {
      chainId: chainInfo.evm.chainId,
      to,
      value,
      data,
    };
  }

  async sendEthereumTx(
    sender: string,
    unsignedTx: UnsignedTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    },
    options?: {
      sendTx?: (chainId: string, signedTx: Buffer) => Promise<string>;
      nonceMethod?: "pending" | "latest";
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getModularChain(this.chainId);
      if (!("evm" in chainInfo)) {
        throw new Error("No EVM chain info provided");
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keplr = (await this.getKeplr())!;

      const transactionCount = await keplr.ethereum.request<string>({
        method: "eth_getTransactionCount",
        params: [sender, options?.nonceMethod || "pending"],
        chainId: this.chainId,
      });
      unsignedTx = {
        ...unsignedTx,
        nonce: parseInt(transactionCount),
      };

      const signEthereum = keplr.signEthereum.bind(keplr);

      const signature = await signEthereum(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx),
        EthSignType.TRANSACTION
      );

      const isEIP1559 =
        !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
      if (isEIP1559) {
        unsignedTx.type = TransactionTypes.eip1559;
      }

      const signedTx = Buffer.from(
        serialize(unsignedTx, signature).replace("0x", ""),
        "hex"
      );

      const sendEthereumTx = keplr.sendEthereumTx.bind(keplr);
      const txHash = options?.sendTx
        ? await options.sendTx(this.chainId, signedTx)
        : await sendEthereumTx(this.chainId, signedTx);

      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            const txReceipt = await keplr.ethereum.request<EthTxReceipt>({
              method: "eth_getTransactionReceipt",
              params: [txHash],
              chainId: this.chainId,
            });
            if (txReceipt) {
              onTxEvents?.onFulfill?.(txReceipt);
              resolve();
            }

            reject();
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 500,
          maxWaitMsAfterError: 4000,
        }
      );

      return txHash;
    } catch (e) {
      if (onTxEvents?.onBroadcastFailed) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }
  }

  static isEthereumHexAddressWithChecksum(hexAddress: string): boolean {
    const isHexAddress = !!hexAddress.match(/^0x[0-9A-Fa-f]*$/);
    const isChecksumAddress = !!hexAddress.match(
      /([A-F].*[a-f])|([a-f].*[A-F])/
    );
    if (!isHexAddress || hexAddress.length !== 42) {
      return false;
    }

    const checksumHexAddress = getEthAddress(hexAddress.toLowerCase());
    if (isChecksumAddress && checksumHexAddress !== hexAddress) {
      return false;
    }

    return true;
  }
}
