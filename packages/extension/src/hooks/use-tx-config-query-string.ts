import { useEffectOnce } from "./use-effect-once";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IMemoConfig,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../stores";

export const useTxConfigsQueryString = (
  chainId: string,
  configs: {
    amountConfig: IAmountConfig;
    recipientConfig?: IRecipientConfig;
    memoConfig: IMemoConfig;
    feeConfig: IFeeConfig;
    gasConfig: IGasConfig;

    gasSimulator: IGasSimulator;
  }
) => {
  const { chainStore } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffectOnce(() => {
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
    const initialMemo = searchParams.get("initialMemo");
    if (initialMemo) {
      configs.memoConfig.setValue(initialMemo);
    }

    const initialFeeCurrency = searchParams.get("initialFeeCurrency");
    const initialFeeType = searchParams.get("initialFeeType");
    if (initialFeeCurrency && initialFeeType) {
      const currency = chainStore
        .getChain(chainId)
        .forceFindCurrency(initialFeeCurrency);
      configs.feeConfig.setFee({
        currency,
        // XXX: 일단 귀찮아서 any로 처리...
        type: initialFeeType as any,
      });
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
  });

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
        if (configs.memoConfig.value.trim().length > 0) {
          prev.set("initialMemo", configs.memoConfig.value);
        } else {
          prev.delete("initialMemo");
        }

        // XXX: Manual type에 대해서는 처리하지 않음.
        if (
          configs.feeConfig.fees.length > 0 &&
          configs.feeConfig.type !== "manual"
        ) {
          prev.set(
            "initialFeeCurrency",
            configs.feeConfig.fees[0].currency.coinMinimalDenom
          );
          prev.set("initialFeeType", configs.feeConfig.type);
        } else {
          prev.delete("initialFeeCurrency");
          prev.delete("initialFeeType");
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
    configs.feeConfig.fees,
    configs.feeConfig.type,
    configs.gasConfig.value,
    configs.gasSimulator.enabled,
    configs.gasSimulator.gasAdjustment,
    configs.memoConfig.value,
    configs.recipientConfig?.value,
    setSearchParams,
  ]);
};
