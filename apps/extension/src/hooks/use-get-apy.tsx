import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";

export function useGetApy(chainId: string) {
  const { queriesStore, chainStore } = useStore();

  const queryAPY = queriesStore.simpleQuery.queryGet<{
    apy: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/apy/${chainStore.getChain(chainId).chainIdentifier}`
  );

  const aprAvailable =
    queryAPY.response &&
    "apr" in queryAPY.response.data &&
    typeof queryAPY.response.data.apr === "number" &&
    queryAPY.response.data.apr > 0;

  const apy = aprAvailable
    ? `${new Dec(queryAPY.response.data.apy ?? "0")
        .mul(new Dec(100))
        .toString(2)}%`
    : "-%";

  return { apy };
}
