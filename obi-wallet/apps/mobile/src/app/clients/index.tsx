import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Chain, chains } from "@obi-wallet/common";
import { useEffect, useState } from "react";

import { useStore } from "../stores";

export async function createStargateClient(chainId: Chain) {
  const { rcp } = chains[chainId];
  return await StargateClient.connect(rcp);
}

export async function createSigningStargateClient({
  chainId,
  signer,
}: {
  chainId: Chain;
  signer: OfflineSigner;
}) {
  const { prefix, rcp } = chains[chainId];
  return await SigningStargateClient.connectWithSigner(rcp, signer, {
    prefix,
  });
}

export function useCosmWasmClient() {
  const { multisigStore } = useStore();
  const [client, setClient] = useState(null);

  useEffect(() => {
    let client = null;
    (async () => {
      const { rcp } = multisigStore.currentChainInformation;
      client = await CosmWasmClient.connect(rcp);
      setClient(client);
    })();
    return () => {
      if (client) {
        client.disconnect();
        setClient(null);
      }
    };
  }, [multisigStore.currentChainInformation]);

  return client;
}

export function useStargateClient() {
  const { multisigStore } = useStore();
  const [client, setClient] = useState(null);

  useEffect(() => {
    let client = null;
    (async () => {
      const { rcp } = multisigStore.currentChainInformation;
      client = await StargateClient.connect(rcp);
      setClient(client);
    })();
    return () => {
      if (client) {
        client.disconnect();
        setClient(null);
      }
    };
  }, [multisigStore.currentChainInformation]);

  return client;
}
