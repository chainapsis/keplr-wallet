import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainGetter } from "@keplr-wallet/stores";
import {
  AppCurrency,
  ChainInfo,
  EthSignType,
  EthTxReceipt,
  Keplr,
} from "@keplr-wallet/types";
import { DenomHelper, retry } from "@keplr-wallet/common";
import { erc20ContractInterface } from "../constants";
import { parseUnits } from "@ethersproject/units";
import {
  UnsignedTransaction,
  serialize,
  TransactionTypes,
} from "@ethersproject/transactions";
import { getAddress as getEthAddress } from "@ethersproject/address";

export class EthereumAccountBase {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {}

  static evmInfo(chainInfo: ChainInfo): ChainInfo["evm"] | undefined {
    return chainInfo.evm;
  }

  async simulateGas({
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
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = EthereumAccountBase.evmInfo(chainInfo);
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    if (!EthereumAccountBase.isEthereumHexAddressWithChecksum(sender)) {
      throw new Error("Invalid sender address");
    }

    // If the recipient address is invalid, the sender address will be used as the recipient for gas estimating gas.
    const tempRecipient = EthereumAccountBase.isEthereumHexAddressWithChecksum(
      recipient
    )
      ? recipient
      : sender;

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx =
      denomHelper.type === "erc20"
        ? {
            from: sender,
            to: denomHelper.contractAddress,
            data: erc20ContractInterface.encodeFunctionData("transfer", [
              tempRecipient,
              parsedAmount.toString(),
            ]),
            value: "0x0",
          }
        : {
            from: sender,
            to: tempRecipient,
            value: "0x0",
          };

    const estimateGasResponse = await simpleFetch<{
      result: string;
    }>(evmInfo.rpc, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_estimateGas",
        params: [unsignedTx],
        id: 1,
      }),
    });

    return {
      gasUsed: Number(estimateGasResponse.data.result),
    };
  }

  async makeSendTokenTx({
    currency,
    amount,
    from,
    to,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  }: {
    currency: AppCurrency;
    amount: string;
    from: string;
    to: string;
    gasLimit: number;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  }): Promise<UnsignedTransaction> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = EthereumAccountBase.evmInfo(chainInfo);
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    const transactionCountResponse = await simpleFetch<{
      result: string;
    }>(evmInfo.rpc, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [from, "pending"],
        id: 1,
      }),
    });

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const tx: UnsignedTransaction = {
      // Support EIP-1559 transaction only.
      type: TransactionTypes.eip1559,
      chainId: evmInfo.chainId,
      nonce: Number(transactionCountResponse.data.result),
      gasLimit: "0x" + gasLimit.toString(16),
      maxFeePerGas: "0x" + Number(maxFeePerGas).toString(16),
      maxPriorityFeePerGas: "0x" + Number(maxPriorityFeePerGas).toString(16),
      ...(denomHelper.type === "erc20"
        ? {
            to: denomHelper.contractAddress,
            value: "0x0",
            data: erc20ContractInterface.encodeFunctionData("transfer", [
              to,
              parsedAmount.toHexString(),
            ]),
          }
        : {
            to,
            value: parsedAmount.isZero() ? "0x0" : parsedAmount.toHexString(),
          }),
    };

    return tx;
  }

  async sendEthereumTx(
    sender: string,
    unsignedTx: UnsignedTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      const evmInfo = EthereumAccountBase.evmInfo(chainInfo);
      if (!evmInfo) {
        throw new Error("No EVM info provided");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keplr = (await this.getKeplr())!;
      const signEthereum = keplr.signEthereum.bind(keplr);
      const signature = await signEthereum(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx),
        EthSignType.TRANSACTION
      );

      const tx = Buffer.from(
        serialize(unsignedTx, signature).replace("0x", ""),
        "hex"
      );

      const sendEthereumTx = keplr.sendEthereumTx.bind(keplr);
      const txHash = await sendEthereumTx(this.chainId, tx);
      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            const txReceiptResponse = await simpleFetch<{
              result: EthTxReceipt | null;
              error?: Error;
            }>(evmInfo.rpc, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionReceipt",
                params: [txHash],
                id: 1,
              }),
            });

            if (txReceiptResponse.data.error) {
              console.error(txReceiptResponse.data.error);
              resolve();
            }

            const txReceipt = txReceiptResponse.data.result;
            if (txReceipt) {
              onTxEvents?.onFulfill?.(txReceipt);
              resolve();
            }

            reject();
          });
        },
        {
          maxRetries: 15,
          waitMsAfterError: 1000,
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
