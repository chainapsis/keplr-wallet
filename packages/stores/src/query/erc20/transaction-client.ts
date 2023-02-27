import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { BigNumber } from "@ethersproject/bignumber";
import { isAddress } from "@ethersproject/address";
import { erc20MetadataInterface } from "./contract-query";
import {
  JsonRpcProvider,
  Provider,
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/providers";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";

export type SignableTx = {
  to?: string;
  nonce?: number;

  gasLimit?: string;
  gasPrice?: string;

  data?: string;
  value?: string;
  chainId?: number;
  type?: number | null;
  accessList?: Array<[string, Array<string>]>;

  // EIP-1559; Type 2 (Default)
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};

export class ERC20TxClient {
  protected provider?: Provider;

  constructor(
    readonly kvStore: KVStore,
    readonly chainId: string,
    readonly chainGetter: ChainGetter
  ) {
    const ethereumUrl = this.chainGetter.getChain(chainId).ethereumJsonRpc;
    if (ethereumUrl) {
      this.provider = new JsonRpcProvider(ethereumUrl);
    }
  }

  protected createSignableEthereumTx(
    to: string,
    nonce: number,
    value: BigNumber,
    data: string,
    maxFeePerGas?: BigNumber,
    gasLimit?: BigNumber,
    chainId?: number,
    type?: number,
    accessList?: Array<[string, Array<string>]>
  ): SignableTx {
    if (!isAddress(to)) {
      throw new Error("cannot generate transaction: malformed address");
    }

    // Fill the chain's numerical chainId by default.
    const defaultChainId = EthermintChainIdHelper.parse(this.chainId)
      .ethChainId;

    const defaultType = 2;
    const defaultAccessList: [string, string[]][] = [];

    return {
      chainId: chainId ?? defaultChainId,
      to,
      nonce,
      value: value.toHexString(),
      maxFeePerGas: maxFeePerGas?.toHexString(),
      gasLimit: gasLimit?.toHexString(),
      data,
      type: type ?? defaultType,
      accessList: accessList ?? defaultAccessList,
    };
  }

  protected encodeContractData(method: string, params?: Array<any>): string {
    return erc20MetadataInterface.encodeFunctionData(method, params);
  }

  public async createERC20TokenTransferTx(
    contractAddress: string,
    sender: string,
    recipient: string,
    value: BigNumber,
    maxFeePerGas: BigNumber,
    gasLimit: BigNumber
  ): Promise<SignableTx> {
    if (!this.provider) {
      throw new Error(
        "chain does not have Ethereum URL, could not initialize provider"
      );
    }

    // Fetch nonce from network
    const nonce = await this.provider.getTransactionCount(sender);

    // Convert contract data to hex string using ABCI encoding.
    const contractData = this.encodeContractData("transfer", [
      recipient,
      value.toHexString(),
    ]);

    const txValue = BigNumber.from(0);

    const tx = this.createSignableEthereumTx(
      contractAddress,
      nonce,
      txValue,
      contractData,
      maxFeePerGas,
      gasLimit
    );

    return tx;
  }

  public async broadcastSignedTx(
    bytes: Uint8Array
  ): Promise<TransactionResponse> {
    if (!this.provider) {
      throw new Error(
        "chain does not have Ethereum URL, could not initialize provider"
      );
    }

    const signedHex = `0x${Buffer.from(bytes).toString("hex")}`;
    return await this.provider.sendTransaction(signedHex);
  }

  public async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    if (!this.provider) {
      throw new Error(
        "chain does not have Ethereum URL, could not initialize provider"
      );
    }

    // Timeout after 5 seconds by default
    return await this.provider.waitForTransaction(hash, 1, 5000);
  }
}
