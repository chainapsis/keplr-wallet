import {
  FeeRateType,
  IAmountConfig,
  IFeeConfig,
  IFeeRateConfig,
  IRecipientConfig,
} from "@keplr-wallet/hooks-bitcoin";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useBitcoinTxConfigsQueryString = (configs: {
  amountConfig: IAmountConfig;
  recipientConfig: IRecipientConfig;
  feeConfig: IFeeConfig;
  feeRateConfig: IFeeRateConfig;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const initialAmountFraction = searchParams.get("initialAmountFraction");
    if (
      initialAmountFraction &&
      !Number.isNaN(parseFloat(initialAmountFraction))
    ) {
      configs.amountConfig.setFraction(
        Number.parseFloat(initialAmountFraction)
      );
    }
    const initialAmount = searchParams.get("initialAmount");
    if (initialAmount) {
      configs.amountConfig.setValue(initialAmount);
    }
    const initialRecipient = searchParams.get("initialRecipient");
    if (initialRecipient) {
      configs.recipientConfig?.setValue(initialRecipient);
    }

    const initialFeeRateType = searchParams.get("initialFeeRateType");
    if (initialFeeRateType) {
      configs.feeRateConfig.setFeeRateType(initialFeeRateType as FeeRateType);
    }

    const initialFeeRate = searchParams.get("initialFeeRate");
    if (initialFeeRate) {
      configs.feeRateConfig.setValue(initialFeeRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (configs.amountConfig.fraction <= 0) {
          prev.delete("initialAmountFraction");
          if (configs.amountConfig.value.trim().length > 0) {
            prev.set("initialAmount", configs.amountConfig.value);
          } else {
            prev.delete("initialAmount");
          }
        } else {
          prev.delete("initialAmount");
          prev.set(
            "initialAmountFraction",
            configs.amountConfig.fraction.toString()
          );
        }

        if (configs.recipientConfig.value.trim().length > 0) {
          prev.set("initialRecipient", configs.recipientConfig.value);
        } else {
          prev.delete("initialRecipient");
        }

        if (configs.feeRateConfig.feeRateType != null) {
          prev.set("initialFeeRateType", configs.feeRateConfig.feeRateType);
        } else {
          prev.delete("initialFeeRateType");
        }

        if (configs.feeRateConfig.value != null) {
          prev.set("initialFeeRate", configs.feeRateConfig.value.toString());
        }

        return prev;
      },
      {
        replace: true,
      }
    );
  }, [
    configs.amountConfig.fraction,
    configs.amountConfig.value,
    configs.feeRateConfig.feeRateType,
    configs.feeRateConfig.value,
    configs.recipientConfig.value,
    setSearchParams,
  ]);
};
