import { useMemo } from "react";
import { useStore } from "../stores";
import { RatePretty } from "@keplr-wallet/unit";

// 얘가 값이 있냐 없냐에 따라서 price change를 보여줄지 말지를 결정한다.
// prop에서 showPrice24HChange가 null 또는 false거나
// currency에 coingeckoId가 없다면 보여줄 수 없다.
// 또한 잘못된 coingeckoId일때는 response에 값이 있을 수 없으므로 안보여준다.
export function usePriceChange(
  showPrice24HChange: boolean | undefined,
  coinGeckoId: string | undefined
): RatePretty | undefined {
  const { price24HChangesStore } = useStore();

  return useMemo(() => {
    if (!showPrice24HChange) {
      return undefined;
    }
    if (!coinGeckoId) {
      return undefined;
    }
    return price24HChangesStore.get24HChange(coinGeckoId);
  }, [showPrice24HChange, coinGeckoId, price24HChangesStore]);
}
