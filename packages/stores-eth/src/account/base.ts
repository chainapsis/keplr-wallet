import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainGetter } from "@keplr-wallet/stores";
import { AppCurrency, EthSignType, Keplr } from "@keplr-wallet/types";
import { DenomHelper } from "@keplr-wallet/common";
import { erc20ContractInterface } from "../constants";
import { parseUnits } from "@ethersproject/units";
import {
  UnsignedTransaction,
  serialize,
  TransactionTypes,
} from "@ethersproject/transactions";

export class EthereumAccountBase {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {}

  async simulateGas({
    currency,
    amount,
    to,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
  }) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.evm) {
      throw new Error("No EVM chain info provided");
    }

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx =
      denomHelper.type === "erc20"
        ? {
            to: denomHelper.contractAddress,
            data: erc20ContractInterface.encodeFunctionData("transfer", [
              to,
              parsedAmount.toHexString(),
            ]),
          }
        : {
            to,
          };

    const estimateGasResponse = await simpleFetch<{
      result: string;
    }>(chainInfo.evm.rpc, {
      method: "POST",
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
    if (chainInfo.evm === undefined) {
      throw new Error("No EVM chain info provided");
    }

    const transactionCountResponse = await simpleFetch<{
      result: string;
    }>(chainInfo.evm.rpc, {
      method: "POST",
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
      chainId: chainInfo.evm.chainId,
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
            value: parsedAmount.toHexString(),
          }),
    };

    return tx;
  }

  async sendEthereumTx(sender: string, unsignedTx: UnsignedTransaction) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.evm) {
      throw new Error("No EVM chain info provided");
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

    const rawTransaction = serialize(unsignedTx, signature);

    const sendTx = keplr.sendEthereumTx.bind(keplr);
    const result = await sendTx(this.chainId, rawTransaction);

    return result;
  }
}
