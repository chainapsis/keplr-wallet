/* eslint-disable import/no-extraneous-dependencies */
import { createQueryClient } from "@azoyalabs/fns-client";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { FNS_CONFIG } from "../config.ui.var";

class CustomCosmWasmClient extends CosmWasmClient {
  constructor(tmClient: any) {
    super(tmClient);
  }
}

export const createFNSClient = async (chainId: string) => {
  const tmClient = await Tendermint34Client.connect(FNS_CONFIG[chainId].rpc);
  const client = new CustomCosmWasmClient(tmClient);
  const queryClient = createQueryClient(client, FNS_CONFIG[chainId].network);
  return queryClient;
};
