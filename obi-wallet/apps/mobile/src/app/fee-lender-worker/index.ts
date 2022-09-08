import { Chain } from "@obi-wallet/common";

export async function lendFees({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string;
}) {
  const response = await fetch(
    "https://fee-lender-worker.obiwallet.workers.dev/",
    {
      method: "POST",
      body: `${chainId},${address}`,
    }
  );
  if (response.status !== 200) {
    console.log(response);
    throw new Error("Lending fees failed");
  }
}
