import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { ObservableChainQueryRPC } from "../../chain-rpc-query";
import { Int } from "@keplr-wallet/unit";

type RPCStatusResult = {
  node_info: {
    protocol_version: {
      p2p: string;
      block: string;
      app: string;
    };
    id: string;
    listen_addr: string;
    network: string;
    version: string;
    channels: string;
    moniker: string;
    other: {
      tx_index: "on" | "off";
      rpc_address: string;
    };
  };
  sync_info: {
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: string;
    latest_block_time: string;
    earliest_block_hash: string;
    earliest_app_hash: string;
    earliest_block_height: string;
    earliest_block_time: string;
    catching_up: boolean;
  };
  validator_info: {
    address: string;
    pub_key: {
      type: string;
      value: string;
    };
    voting_power: string;
  };
};

export class ObservableQueryRPCStatus extends ObservableChainQueryRPC<
  | {
      jsonrpc: "2.0";
      id: number;
      result: RPCStatusResult;
    }
  | RPCStatusResult
> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/status");
  }

  get network(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    if ("result" in this.response.data) {
      return this.response.data.result.node_info.network;
    }

    return this.response.data.node_info.network;
  }

  get latestBlockHeight(): Int | undefined {
    if (!this.response) {
      return undefined;
    }

    if ("result" in this.response.data) {
      return new Int(this.response.data.result.sync_info.latest_block_height);
    }

    return new Int(this.response.data.sync_info.latest_block_height);
  }
}
