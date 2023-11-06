import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { EthereumQueries } from "../queries";
import { AppCurrency } from "@keplr-wallet/types";
import { DenomHelper } from "@keplr-wallet/common";
import { erc20ContractInterface } from "../constants";
import { parseUnits } from "@ethersproject/units";

export class EthereumAccountBase {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<EthereumQueries>
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
    if (chainInfo.evm === undefined) {
      return {
        gasUsed: 0,
      };
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
}
