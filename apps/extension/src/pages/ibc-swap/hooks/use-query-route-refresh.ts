import { ObservableQueryRouteInnerV2 } from "@keplr-wallet/stores-internal";
import { useEffect, useRef } from "react";

export function useQueryRouteRefresh(
  queryRoute: ObservableQueryRouteInnerV2 | undefined,
  isSwapExecuting: boolean,
  isButtonHolding: boolean
) {
  const prevIsSwapLoadingRef = useRef(isSwapExecuting);
  const prevIsButtonHoldingRef = useRef(isButtonHolding);

  // 사용자가 스왑 버튼을 홀딩하다가 중간에 손을 떼었을 때 (isButtonHolding이 true에서 false로 변경되었을 때)
  // 또는 tx 처리 중에 오류가 발생했을 때 (isSwapExecuting이 true에서 false로 변경되었을 때)
  // quote expired가 발생할 수 있으므로 3초 후 쿼리 리프레시
  useEffect(() => {
    const prevIsSwapLoading = prevIsSwapLoadingRef.current;
    const prevIsButtonHolding = prevIsButtonHoldingRef.current;
    const currentIsSwapLoading = isSwapExecuting;
    const currentIsButtonHolding = isButtonHolding;

    if (
      queryRoute &&
      !queryRoute.isFetching &&
      ((prevIsSwapLoading && !currentIsSwapLoading) ||
        (prevIsButtonHolding && !currentIsButtonHolding))
    ) {
      const timeoutId = setTimeout(() => {
        if (
          queryRoute &&
          !queryRoute.isFetching &&
          !isSwapExecuting &&
          !isButtonHolding
        ) {
          queryRoute.fetch();
        }
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    prevIsSwapLoadingRef.current = currentIsSwapLoading;
    prevIsButtonHoldingRef.current = currentIsButtonHolding;
  }, [queryRoute, queryRoute?.isFetching, isSwapExecuting, isButtonHolding]);

  // 10초마다 route query 자동 refresh
  useEffect(() => {
    if (
      queryRoute &&
      !queryRoute.isFetching &&
      !isSwapExecuting &&
      !isButtonHolding
    ) {
      const timeoutId = setTimeout(() => {
        if (!queryRoute.isFetching && !isSwapExecuting && !isButtonHolding) {
          queryRoute.fetch();
        }
      }, 10000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint가 자동으로 추천해주는 deps를 쓰면 안된다.
    // queryRoute는 amountConfig에서 필요할때마다 reference가 바뀌므로 deps에 넣는다.
    // queryRoute.isFetching는 현재 fetch중인지 아닌지를 알려주는 값이므로 deps에 꼭 넣어야한다.
    // queryRoute는 input이 같으면 reference가 같으므로 eslint에서 추천하는대로 queryRoute만 deps에 넣으면
    // queryRoute.isFetching이 무시되기 때문에 수동으로 넣어줌
  }, [queryRoute, queryRoute?.isFetching, isSwapExecuting, isButtonHolding]);
}
