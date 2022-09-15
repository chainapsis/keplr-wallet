import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Chain, chains } from "@obi-wallet/common";
import { useEffect, useState } from "react";

import { useStore } from "../stores";

export async function createStargateClient(chainId: Chain) {
  const { rpc } = chains[chainId];
  return await StargateClient.connect(rpc);
}

export async function createSigningStargateClient({
  chainId,
  signer,
}: {
  chainId: Chain;
  signer: OfflineSigner;
}) {
  const { prefix, rpc } = chains[chainId];
  return await SigningStargateClient.connectWithSigner(rpc, signer, {
    prefix,
  });
}

export function useStargateClient() {
  const { multisigStore } = useStore();
  const [client, setClient] = useState<StargateClient | null>(null);

  useEffect(() => {
    let client: StargateClient | null = null;
    (async () => {
      const { rpc } = multisigStore.currentChainInformation;
      client = await StargateClient.connect(rpc);
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
