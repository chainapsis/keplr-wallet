import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";

export function useGetEarnApy(chainId: string) {
  const { queriesStore, chainStore } = useStore();

  const queryAPY = queriesStore.simpleQuery.queryGet<{
    earnApy: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/earn-apy/${chainStore.getChain(chainId).chainIdentifier}`
  );

  const aprAvailable =
    queryAPY.response &&
    "earnApy" in queryAPY.response.data &&
    typeof queryAPY.response.data.earnApy === "number" &&
    queryAPY.response.data.earnApy > 0;

  const apy = aprAvailable
    ? `${new Dec(queryAPY.response.data.earnApy ?? "0")
        .mul(new Dec(100))
        .toString(2)}%`
    : "-%";

  return { apy };
}
