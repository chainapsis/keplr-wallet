import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { getAddress as getEthAddressWithMixedCaseChecksum } from "@ethersproject/address";

export class JsonRpcEthereumService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService
  ) {}

  init() {}

  async request(
    defaultChainId: string,
    method: string,
    params?: any[]
  ): Promise<any> {
    const chainInfo = this.chainsService.getChainInfo(defaultChainId);
    if (chainInfo === undefined || chainInfo.evm === undefined) {
      throw new Error("No chain info or EVM info provided");
    }

    const pubkey = await this.keyRingService.getPubKeySelected(
      chainInfo.chainId
    );
    const ethereumHexAddress = getEthAddressWithMixedCaseChecksum(
      `0x${Buffer.from(pubkey.getEthAddress()).toString("hex")}`
    );
    const evmInfo = chainInfo.evm;

    switch (method) {
      case "eth_chainId":
        return `0x${evmInfo.chainId.toString(16)}`;
      case "eth_accounts":
      case "eth_requestAccounts":
        return [ethereumHexAddress];
      default:
        return (
          await simpleFetch<{
            jsonrpc: string;
            id: number;
            result: any;
            error?: Error;
          }>(evmInfo.rpc, {
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
