import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { EthereumQueries } from "../queries";
import { UnsignedTransaction } from "@ethersproject/transactions";

export class EthereumAccountBase {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<EthereumQueries>
  ) {}

  async simulateGas(unsignedTx: UnsignedTransaction) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (chainInfo.evm === undefined) {
      return {
        gasUsed: 0,
      };
    }

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
