import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IRecipientConfig,
} from "./types";

export const useStarknetTxConfigsQueryString = (configs: {
  amountConfig: IAmountConfig;
  recipientConfig?: IRecipientConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  gasSimulator: IGasSimulator;
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
      // AmountInput에는 price based 모드가 있다.
      // 하지만 이 state는 AmountInput Component에서 다뤄지므로 여기서 처리하기가 힘들다.
      // 어쨋든 처음에는 non price mode로 시작히므로 이렇게 해도 큰 문제는 없다.
      // TODO: 나중에 해결한다.
      configs.amountConfig.setValue(initialAmount);
    }
    const initialRecipient = searchParams.get("initialRecipient");
    if (initialRecipient) {
      configs.recipientConfig?.setValue(initialRecipient);
    }

    const initialFeeCoinDenom = searchParams.get("initialFeeCoinDenom") as
      | "ETH"
      | "STRK";
    if (initialFeeCoinDenom) {
      configs.feeConfig.setType(initialFeeCoinDenom);
    }

    const initialGasAmount = searchParams.get("initialGasAmount");
    if (initialGasAmount) {
      configs.gasConfig.setValue(initialGasAmount);
      configs.gasSimulator.setEnabled(false);
    } else {
      const initialGasAdjustment = searchParams.get("initialGasAdjustment");
      if (initialGasAdjustment) {
        configs.gasSimulator.setGasAdjustmentValue(initialGasAdjustment);
        configs.gasSimulator.setEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (
          configs.recipientConfig &&
          configs.recipientConfig.value.trim().length > 0
        ) {
          prev.set("initialRecipient", configs.recipientConfig.value);
        } else {
          prev.delete("initialRecipient");
        }
        // Fraction and amount value are exclusive
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
        if (configs.feeConfig.fee != null) {
          prev.set(
            "initialFeeCoinDenom",
            configs.feeConfig.fee?.currency.coinDenom
          );
        }

        if (configs.gasSimulator.enabled) {
          prev.set(
            "initialGasAdjustment",
            configs.gasSimulator.gasAdjustment.toString()
          );
          prev.delete("initialGasAmount");
        } else {
          prev.set("initialGasAmount", configs.gasConfig.value.toString());
          prev.delete("initialGasAdjustment");
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
    configs.feeConfig.fee,
    configs.feeConfig.type,
    configs.gasConfig.value,
    configs.gasSimulator.enabled,
    configs.gasSimulator.gasAdjustment,
    configs.recipientConfig,
    setSearchParams,
  ]);
};
