import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import {
  ObservableEvmChainJsonRpcQuery,
  ObservableEvmChainJsonRpcQueryMap,
} from "./evm-chain-json-rpc";

export class ObservableQueryEthereumBlockInner extends ObservableEvmChainJsonRpcQuery<EthereumBlock> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    blockNumberOrTagParam?: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_getBlockByNumber", [
      blockNumberOrTagParam,
      true,
    ]);

    makeObservable(this);
  }

  @computed
  get block(): EthereumBlock | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data;
  }
}

export class ObservableQueryEthereumBlock extends ObservableEvmChainJsonRpcQueryMap<EthereumBlock> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      (blockNumberOrTagParam: string) => {
        return new ObservableQueryEthereumBlockInner(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
          blockNumberOrTagParam
        );
      }
    );
  }

  getQueryByBlockNumberOrTag(
    blockNumberOrTag?: number | string
  ): ObservableQueryEthereumBlockInner {
    const blockNumberOrTagParam =
      typeof blockNumberOrTag === "number"
        ? `0x${Number(blockNumberOrTag).toString(16)}`
        : blockNumberOrTag;

    return this.get(
      blockNumberOrTagParam ?? "latest"
    ) as ObservableQueryEthereumBlockInner;
  }
}

interface Transaction {
  accessList?: string[];
  blockHash: string;
  blockNumber: string;
  chainId: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  r: string;
  s: string;
  to: string;
  transactionIndex: string;
  type: string;
  v: string;
  value: string;
}

interface EthereumBlock {
  baseFeePerGas: string;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: Transaction[];
  transactionsRoot: string;
  uncles: string[];
}
