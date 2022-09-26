import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";

import { Chain, chains } from "./chains";

export async function createStargateClient(chainId: Chain) {
  const { rpcs } = chains[chainId];
  for (const rpc of rpcs) {
    try {
      return await StargateClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

export async function createCosmWasmClient(chainId: Chain) {
  const { rpcs } = chains[chainId];
  for (const rpc of rpcs) {
    try {
      return await CosmWasmClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}
