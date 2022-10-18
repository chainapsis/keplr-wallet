import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import { chains, createStargateClient } from "@obi-wallet/common";
import secp256k1 from "secp256k1";

import { rootStore } from "../../background/root-store";
import { createSigningStargateClient } from "../clients";
import { lendFees } from "../fee-lender-worker";

export async function prepareWalletAndSign({
  publicKey,
  privateKey,
  payload,
}: {
  publicKey: string;
  privateKey: string;
  payload: Uint8Array;
}): Promise<ReturnType<typeof secp256k1.ecdsaSign>> {
  const privateKeyUint8Array = new Uint8Array(
    Buffer.from(privateKey, "base64")
  );

  const { chainStore } = rootStore;
  const chainId = chainStore.currentChain;
  const { prefix, denom } = chains[chainId];
  const client = await createStargateClient(chainId);

  const address = pubkeyToAddress(
    {
      type: pubkeyType.secp256k1,
      value: publicKey,
    },
    prefix
  );

  if (!(await client.getAccount(address))) {
    await lendFees({ chainId, address });
  }

  if (!(await client.getAccount(address))?.pubkey) {
    const signer = await Secp256k1Wallet.fromKey(privateKeyUint8Array, prefix);
    const signingClient = await createSigningStargateClient({
      chainId,
      signer,
    });
    await signingClient.sendTokens(
      address,
      address,
      coins(1, denom),
      "auto",
      ""
    );
  }

  return secp256k1.ecdsaSign(payload, privateKeyUint8Array);
}
