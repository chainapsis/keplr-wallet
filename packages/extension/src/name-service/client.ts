/* eslint-disable import/no-extraneous-dependencies */
import { createQueryClient, createSigningClient } from "@azoyalabs/fns-client";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from "@cosmjs/cosmwasm-stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { FNS_NETWORK, FNS_RPC } from "../config.ui.var";

class CustomCosmWasmClient extends CosmWasmClient {
  constructor(tmClient: any) {
    super(tmClient);
  }
}
class CustomCosmWasmSigningClient extends SigningCosmWasmClient {
  constructor(
    tmClient: any,
    signer: any,
    Option: SigningCosmWasmClientOptions
  ) {
    super(tmClient, signer, Option);
  }
}
export const createFNSClient = async () => {
  const tmClient = await Tendermint34Client.connect(FNS_RPC);
  const client = new CustomCosmWasmClient(tmClient);
  const queryClient = createQueryClient(client, FNS_NETWORK);
  return queryClient;
};

export const createFNSsigningClient = async (signer: any, sender: string) => {
  const tmClient = await Tendermint34Client.connect(FNS_RPC);
  const client: SigningCosmWasmClient = new CustomCosmWasmSigningClient(
    tmClient,
    signer,
    {}
  );
  const signingClient = createSigningClient(client, sender, FNS_NETWORK);
  return signingClient;
};
