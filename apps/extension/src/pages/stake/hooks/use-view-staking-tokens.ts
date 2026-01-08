import { useMemo } from "react";
import { useIntl } from "react-intl";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../../stores";
import {
  ViewStakedToken,
  ViewUnbondingToken,
} from "../../../stores/huge-queries";

function parseTimeToMs(time: string | number): number {
  if (typeof time === "number") {
    return time;
  }

  const parsed = Number(time);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return new Date(time).getTime();
}

function formatRelativeTime(
  time: string | number,
  discardDecimal?: boolean
): {
  unit: "minute" | "hour" | "day";
  value: number;
} {
  const timeMs = parseTimeToMs(time);

  const remaining = timeMs - Date.now();

  if (remaining <= 0) {
    return {
      unit: "minute",
      value: 1,
    };
  }

  const round = discardDecimal ? Math.floor : Math.ceil;

  const remainingSeconds = remaining / 1000;
  const remainingMinutes = remainingSeconds / 60;
  if (remainingMinutes < 1) {
    return {
      unit: "minute",
      value: 1,
    };
  }

  const remainingHours = remainingMinutes / 60;
  const remainingDays = remainingHours / 24;

  if (remainingDays >= 1) {
    return {
      unit: "day",
      value: round(remainingDays),
    };
  }

  if (remainingHours >= 1) {
    return {
      unit: "hour",
      value: round(remainingHours),
    };
  }

  return {
    unit: "minute",
    value: round(remainingMinutes),
  };
}

export function useViewStakingTokens() {
  const { hugeQueriesStore, priceStore } = useStore();
  const intl = useIntl();

  const delegations: ViewStakedToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter((token) => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations]
  );

  const unbondings: {
    unbonding: ViewUnbondingToken;
    altSentence: string;
  }[] = useMemo(() => {
    const currentTime = Date.now();
    return hugeQueriesStore.unbondings
      .filter((unbonding) => {
        if (!unbonding.token.toDec().gt(new Dec(0))) {
          return false;
        }

        if (unbonding.completeTime) {
          const timeMs = parseTimeToMs(unbonding.completeTime);
          const remaining = timeMs - currentTime;
          if (remaining <= 0) {
            return false;
          }
        }

        return true;
      })
      .map((unbonding) => {
        const relativeTime = formatRelativeTime(
          unbonding.completeTime,
          unbonding.omitCompleteTimeFraction
        );

        return {
          unbonding,
          altSentence: unbonding.completeTime
            ? intl.formatRelativeTime(relativeTime.value, relativeTime.unit)
            : "Calculating",
        };
      });
  }, [hugeQueriesStore.unbondings, intl]);

  const unbondingsTotalPrice = useMemo(() => {
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
    if (!fiat) {
      return undefined;
    }

    let total = new PricePretty(fiat, 0);
    for (const { unbonding } of unbondings) {
      const price = priceStore.calculatePrice(unbonding.token);
      if (price) {
        total = total.add(price);
      }
    }

    return total;
  }, [unbondings, priceStore]);

  return {
    delegations,
    unbondings,
    unbondingsTotalPrice,
  };
}
