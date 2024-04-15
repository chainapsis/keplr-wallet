import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainsService } from "../chains";

export class JsonRpcEthereumService {
  constructor(protected readonly chainsService: ChainsService) {}

  init() {}

  async request(method: string, params?: any[]): Promise<any> {
    const chainInfos = this.chainsService.getChainInfos();
    const tempEvmChainInfo = chainInfos.find(
      (chainInfo) => chainInfo.evm !== undefined
    );

    if (tempEvmChainInfo === undefined || tempEvmChainInfo.evm === undefined) {
      throw new Error("No EVM chain info provided");
    }

    if (tempEvmChainInfo !== undefined && tempEvmChainInfo.evm !== undefined) {
      return (
        await simpleFetch<{
          jsonrpc: string;
          id: number;
          result: any;
          error?: Error;
        }>(tempEvmChainInfo.evm.rpc, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method,
            params,
            id: 1,
          }),
        })
      ).data.result;
    }
  }
}
