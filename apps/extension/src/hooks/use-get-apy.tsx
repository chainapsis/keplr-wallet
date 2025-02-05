import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";

export function useGetApy(chainId: string) {
  const { queriesStore, chainStore } = useStore();

  const queryAPR = queriesStore.simpleQuery.queryGet<{
    apr: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/apr/${chainStore.getChain(chainId).chainIdentifier}`
  );

  const aprAvailable =
    queryAPR.response &&
    "apr" in queryAPR.response.data &&
    typeof queryAPR.response.data.apr === "number" &&
    queryAPR.response.data.apr > 0;

  const apy = aprAvailable
    ? `${new Dec(queryAPR.response.data.apr ?? "0")
        .mul(new Dec(100))
        .toString(2)}%`
    : "-%";

  return { apy };
}
