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

export function useStargateClient() {
  const { multisigStore } = useStore();
  const [client, setClient] = useState(null);

  const { rcp } = multisigStore.currentChainInformation;

  useEffect(() => {
    let client = null;
    (async () => {
      client = await StargateClient.connect(rcp);
      setClient(client);
    })();
    return () => {
      if (client) {
        client.disconnect();
        setClient(null);
      }
    };
  }, [rcp]);

  return client;
}
