import { Decimal } from "@cosmjs/math/build/decimal";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Chain, chains } from "@obi-wallet/common";

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
  const { denom, prefix, rpc } = chains[chainId];
  return await SigningStargateClient.connectWithSigner(rpc, signer, {
    prefix,
    gasPrice: {
      // low: 10, average: 25, high: 40
      amount: Decimal.fromAtomics("25", 4),
      denom,
    },
  });
}
