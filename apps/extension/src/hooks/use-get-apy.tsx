import { useEffect, useState } from "react";
import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";
import { autorun } from "mobx";

export function useGetEarnApy(chainId: string) {
  const { queriesStore, chainStore } = useStore();
  const [apy, setApy] = useState<string>("-%");

  const queryAPY = queriesStore.simpleQuery.queryGet<{
    earnApy: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/earn-apy/${chainStore.getChain(chainId).chainIdentifier}`
  );

  useEffect(() => {
    const disposer = autorun(() => {
      const apyAvailable =
        queryAPY.response &&
        "earnApy" in queryAPY.response.data &&
        typeof queryAPY.response.data.earnApy === "number" &&
        queryAPY.response.data.earnApy > 0;

      if (apyAvailable) {
        setApy(
          `${new Dec(queryAPY.response.data.earnApy ?? "0")
            .mul(new Dec(100))
            .toString(2)}%`
        );
      }
    });

    return () => disposer();
  }, [queryAPY.response]);

  return { apy };
}
