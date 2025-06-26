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
import {
  Interface,
  parseUnits,
  getAddress as getEthAddress,
  Transaction,
} from "ethers";
import { action, makeObservable, observable } from "mobx";
import { EthTransactionType } from "@keplr-wallet/types";

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

  async simulateGas(
    sender: string,
    unsignedTx: Transaction,
    stateOverride?: {
      [address: string]: {
        code?: string;
        balance?: string;
        nonce?: string;
        state?: { [slot: string]: string };
        stateDiff?: { [slot: string]: string };
      };
    }
  ) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    const { to, value, data } = unsignedTx;

    const params: any[] = [
      {
        from: sender,
        to,
        value: hexValue(value),
        data,
      },
      "latest",
    ];

    if (stateOverride) {
      params.push(stateOverride);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;
    const gasEstimated = await keplr.ethereum.request<string | undefined>({
      method: "eth_estimateGas",
      params,
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
    stateOverride,
  }: {
    currency: AppCurrency;
    amount: string;
    sender: string;
    recipient: string;
    stateOverride?: {
      [address: string]: {
        code?: string;
        balance?: string;
        nonce?: string;
        state?: { [slot: string]: string };
        stateDiff?: { [slot: string]: string };
      };
    };
  }) {
    // If the recipient address is invalid, the sender address will be used as the recipient for gas estimating gas.
    const tempRecipient = EthereumAccountBase.isEthereumHexAddressWithChecksum(
      recipient
    )
      ? recipient
      : sender;

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx = new Transaction();

    switch (denomHelper.type) {
      case "erc20":
        unsignedTx.to = denomHelper.contractAddress;
        unsignedTx.value = "0x0";
        unsignedTx.data = erc20ContractInterface.encodeFunctionData(
          "transfer",
          [tempRecipient, hexValue(parsedAmount)]
        );
        break;
      default:
        unsignedTx.to = tempRecipient;
        unsignedTx.value = hexValue(parsedAmount);
        unsignedTx.data = "0x";
        break;
    }

    return this.simulateGas(sender, unsignedTx, stateOverride);
  }

  async simulateOpStackL1Fee(unsignedTx: Transaction): Promise<string> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.features.includes("op-stack-l1-data-fee")) {
      throw new Error("The chain isn't built with OP Stack");
    }

    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const l1Fee = await keplr.ethereum.request<string>({
      method: "eth_call",
      params: [
        {
          to: opStackGasPriceOracleProxyAddress,
          data: opStackGasPriceOracleABI.encodeFunctionData("getL1Fee", [
            unsignedTx.unsignedSerialized,
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
  }): Transaction {
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
    switch (denomHelper.type) {
      case "erc20":
        return this.makeTx(
          denomHelper.contractAddress,
          "0x0",
          erc20ContractInterface.encodeFunctionData("transfer", [
            to,
            hexValue(parsedAmount),
          ]),
          feeObject
        );
      default:
        return this.makeTx(to, hexValue(parsedAmount), undefined, feeObject);
    }
  }

  makeErc20ApprovalTx(
    currency: ERC20Currency,
    spender: string,
    amount: string
  ): Transaction {
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

  makeTx(
    to: string,
    value: string,
    data?: string,
    fee?: {
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      gasPrice?: string;
      gasLimit?: string;
    }
  ): Transaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    const tx = new Transaction();

    tx.chainId = evmInfo.chainId;
    tx.to = to;
    tx.value = value;
    tx.data = data ?? "0x";

    if (fee) {
      if (fee.maxFeePerGas && fee.maxPriorityFeePerGas) {
        tx.type = EthTransactionType.eip1559;
        tx.maxFeePerGas = fee.maxFeePerGas;
        tx.maxPriorityFeePerGas = fee.maxPriorityFeePerGas;
      } else if (fee.gasPrice) {
        tx.type = EthTransactionType.legacy;
        tx.gasPrice = fee.gasPrice;
      }
      tx.gasLimit = fee.gasLimit ?? 0;
    }

    return tx;
  }

  async sendEthereumTx(
    sender: string,
    unsignedTx: Transaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    },
    options?: {
      sendTx?: (chainId: string, signedTx: Buffer) => Promise<string>;
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        throw new Error("No EVM info provided");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keplr = (await this.getKeplr())!;

      const transactionCount = await keplr.ethereum.request<string>({
        method: "eth_getTransactionCount",
        params: [sender, "pending"],
        chainId: this.chainId,
      });

      unsignedTx.nonce = parseInt(transactionCount);

      const signEthereum = keplr.signEthereum.bind(keplr);

      const signature = await signEthereum(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx.toJSON()),
        EthSignType.TRANSACTION
      );

      const isEIP1559 =
        !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
      if (isEIP1559) {
        unsignedTx.type = EthTransactionType.eip1559;
      }

      unsignedTx.signature = "0x" + Buffer.from(signature).toString("hex");

      const signedTx = Buffer.from(
        unsignedTx.serialized.replace("0x", ""),
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
