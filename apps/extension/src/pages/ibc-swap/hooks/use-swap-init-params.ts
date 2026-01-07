import { useSearchParams } from "react-router-dom";
import { IBCSwapConfig } from "../../../stores/ui-config/ibc-swap";

/**
 * Hook to read initial chain/currency values from query parameters.
 * This hook should be called before useSwapConfig to properly initialize
 * the swap configuration with values from URL.
 */
export const useSwapInitParams = (ibcSwapConfig: IBCSwapConfig) => {
  const [searchParams] = useSearchParams();

  const searchParamsChainId = searchParams.get("chainId");
  const searchParamsCoinMinimalDenom = searchParams.get("coinMinimalDenom");
  const searchParamsOutChainId = searchParams.get("outChainId");
  const searchParamsOutCoinMinimalDenom = searchParams.get(
    "outCoinMinimalDenom"
  );

  // Store 자체에서 현재 없는 체인은 기본 체인으로 설정하는 등의 로직이 있으므로
  // 좀 복잡하더라도 아래처럼 처리해야한다.
  const inChainId = (() => {
    if (searchParamsChainId) {
      ibcSwapConfig.setAmountInChainId(searchParamsChainId);
    }
    return ibcSwapConfig.getAmountInChainInfo().chainId;
  })();

  const inCurrency = (() => {
    if (searchParamsCoinMinimalDenom) {
      ibcSwapConfig.setAmountInMinimalDenom(searchParamsCoinMinimalDenom);
    }
    return ibcSwapConfig.getAmountInCurrency();
  })();

  const outChainId = (() => {
    if (searchParamsOutChainId) {
      ibcSwapConfig.setAmountOutChainId(searchParamsOutChainId);
    }
    return ibcSwapConfig.getAmountOutChainInfo().chainId;
  })();

  const outCurrency = (() => {
    if (searchParamsOutCoinMinimalDenom) {
      ibcSwapConfig.setAmountOutMinimalDenom(searchParamsOutCoinMinimalDenom);
    }
    return ibcSwapConfig.getAmountOutCurrency();
  })();

  return {
    inChainId,
    inCurrency,
    outChainId,
    outCurrency,
  };
};
