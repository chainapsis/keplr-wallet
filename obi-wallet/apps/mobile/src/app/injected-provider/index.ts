import { Keplr } from "@keplr-wallet/provider";
import { MessageRequesterExternal } from "@obi-wallet/common";
import { useMemo } from "react";

class ConcreteKeplr extends Keplr {}

export function useKeplr({ url }: { url: string }) {
  const keplr = useMemo(() => {
    return new ConcreteKeplr(
      "0.10.10",
      "core",
      new MessageRequesterExternal({
        url: url,
        origin: new URL(url).origin,
      })
    );
  }, [url]);
  return keplr;
}
