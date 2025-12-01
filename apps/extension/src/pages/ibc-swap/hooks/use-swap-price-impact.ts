import {
  IBCSwapAmountConfig,
  SwapAmountConfig,
} from "@keplr-wallet/hooks-internal";
import { useEffect, useState } from "react";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { autorun } from "mobx";
import { useStore } from "../../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export const useSwapPriceImpact = (
  amountConfig: IBCSwapAmountConfig | SwapAmountConfig
) => {
  const { priceStore } = useStore();

  const [isHighPriceImpact, setIsHighPriceImpact] = useState(false);
  // --------------------------
  // from or to 중에서 coingecko로부터 가격을 알 수 없는 경우 price impact를 알 수 없기 때문에
  // 이런 경우 유저에게 경고를 표시해줌
  // 가끔씩 바보같이 coingecko에 올라가있지도 않은데 지 맘대로 coingecko id를 넣는 얘들도 있어서
  // 실제로 쿼리를 해보고 있는지 아닌지 판단하는 로직도 있음
  // coingecko로부터 가격이 undefined거나 0이면 알 수 없는 것으로 처리함.
  // 근데 쿼리에 걸리는 시간도 있으니 이 경우는 1000초 쉼.
  const [inOrOutChangedDelay, setInOrOutChangedDelay] = useState(true);
  useEffect(() => {
    setInOrOutChangedDelay(true);
    const timeoutId = setTimeout(() => {
      setInOrOutChangedDelay(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amountConfig.currency.coinMinimalDenom,
    amountConfig.outCurrency.coinMinimalDenom,
  ]);

  const unableToPopulatePrices = (() => {
    const r: string[] = [];

    const inCurrency = amountConfig.currency;
    const outCurrency = amountConfig.outCurrency;

    if (!inCurrency.coinGeckoId) {
      if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
        r.push(
          CoinPretty.makeCoinDenomPretty(inCurrency.originCurrency.coinDenom)
        );
      } else {
        r.push(CoinPretty.makeCoinDenomPretty(inCurrency.coinDenom));
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(inCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
          r.push(
            CoinPretty.makeCoinDenomPretty(inCurrency.originCurrency.coinDenom)
          );
        } else {
          r.push(CoinPretty.makeCoinDenomPretty(inCurrency.coinDenom));
        }
      }
    }
    if (!outCurrency.coinGeckoId) {
      if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
        r.push(
          CoinPretty.makeCoinDenomPretty(outCurrency.originCurrency.coinDenom)
        );
      } else {
        r.push(CoinPretty.makeCoinDenomPretty(outCurrency.coinDenom));
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(outCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
          r.push(
            CoinPretty.makeCoinDenomPretty(outCurrency.originCurrency.coinDenom)
          );
        } else {
          r.push(CoinPretty.makeCoinDenomPretty(outCurrency.coinDenom));
        }
      }
    }

    return r;
  })();
  // --------------------------

  useEffectOnce(() => {
    const disposal = autorun(() => {
      if (amountConfig.amount.length > 0) {
        const amt = amountConfig.amount[0];
        // priceStore.calculatePrice를 여기서 먼저 실행하는건 의도적인 행동임.
        // 유저가 amount를 입력하기 전에 미리 fecth를 해놓기 위해서임.
        const inPrice = priceStore.calculatePrice(amt, "usd");
        let outPrice = priceStore.calculatePrice(amountConfig.outAmount, "usd");
        if (outPrice) {
          // otherFees는 브릿징 수수료를 의미힌다.
          // slippage 경고에서 브릿징 수수료를 포함시키지 않으면 경고가 너무 자주 뜨게 되므로
          // 브릿징 수수료를 out price에 감안한다.
          for (const otherFee of amountConfig.otherFees) {
            const price = priceStore.calculatePrice(otherFee, "usd");
            if (price) {
              outPrice = outPrice.add(price);
            }
          }
        }
        if (amt.toDec().gt(new Dec(0))) {
          if (
            inPrice &&
            // in price가 아주 낮으면 오히려 price impact가 높아진다.
            // 근데 이 경우는 전혀 치명적인 자산 상의 문제가 생기지 않으므로 0달러가 아니라 1달러가 넘어야 체크한다.
            inPrice.toDec().gt(new Dec(1)) &&
            outPrice &&
            outPrice.toDec().gt(new Dec(0))
          ) {
            if (amountConfig.swapPriceImpact) {
              // price impact가 2.5% 이상이면 경고
              if (
                amountConfig.swapPriceImpact
                  .toDec()
                  .mul(new Dec(100))
                  .gt(new Dec(2.5))
              ) {
                setIsHighPriceImpact(true);
                return;
              }
            }

            if (inPrice.toDec().gt(outPrice.toDec())) {
              const priceImpact = inPrice
                .toDec()
                .sub(outPrice.toDec())
                .quo(inPrice.toDec())
                .mul(new Dec(100));
              // price impact가 2.5% 이상이면 경고
              if (priceImpact.gt(new Dec(2.5))) {
                setIsHighPriceImpact(true);
                return;
              }
            }
          }
        }
      }

      setIsHighPriceImpact(false);
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  });

  return {
    isHighPriceImpact,
    unableToPopulatePrices,
  };
};
