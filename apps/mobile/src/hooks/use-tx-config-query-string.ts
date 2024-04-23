import {useEffectOnce} from './use-effect-once';
import {useEffect} from 'react';
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IMemoConfig,
  IRecipientConfig,
} from '@keplr-wallet/hooks';
import {useStore} from '../stores';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../navigation.tsx';

export const useTxConfigsQueryString = (
  chainId: string,
  configs: {
    amountConfig: IAmountConfig;
    recipientConfig?: IRecipientConfig;
    memoConfig: IMemoConfig;
    feeConfig: IFeeConfig;
    gasConfig: IGasConfig;

    gasSimulator: IGasSimulator;
  },
) => {
  const {chainStore} = useStore();

  const navigation = useNavigation<StackNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Swap'>>();

  useEffectOnce(() => {
    const initialAmountFraction = route.params?.initialAmountFraction;
    if (
      initialAmountFraction &&
      !Number.isNaN(parseFloat(initialAmountFraction))
    ) {
      configs.amountConfig.setFraction(
        Number.parseFloat(initialAmountFraction),
      );
    }
    const initialAmount = route.params?.initialAmount;
    if (initialAmount) {
      // AmountInput에는 price based 모드가 있다.
      // 하지만 이 state는 AmountInput Component에서 다뤄지므로 여기서 처리하기가 힘들다.
      // 어쨋든 처음에는 non price mode로 시작히므로 이렇게 해도 큰 문제는 없다.
      // TODO: 나중에 해결한다.
      configs.amountConfig.setValue(initialAmount);
    }
    const initialRecipient = route.params?.initialRecipient;
    if (initialRecipient) {
      configs.recipientConfig?.setValue(initialRecipient);
    }
    const initialMemo = route.params?.initialMemo;
    if (initialMemo) {
      configs.memoConfig.setValue(initialMemo);
    }

    const initialFeeCurrency = route.params?.initialFeeCurrency;
    const initialFeeType = route.params?.initialFeeType;
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

    const initialGasAmount = route.params?.initialGasAmount;
    if (initialGasAmount) {
      configs.gasConfig.setValue(initialGasAmount);
      configs.gasSimulator.setEnabled(false);
    } else {
      const initialGasAdjustment = route.params?.initialGasAdjustment;
      if (initialGasAdjustment) {
        configs.gasSimulator.setGasAdjustmentValue(initialGasAdjustment);
        configs.gasSimulator.setEnabled(true);
      }
    }
  });

  useEffect(() => {
    let initialAmountFraction = route.params?.initialAmountFraction;
    let initialRecipient = route.params?.initialRecipient;
    let initialAmount = route.params?.initialAmount;
    let initialMemo = route.params?.initialMemo;
    let initialFeeCurrency = route.params?.initialFeeCurrency;
    let initialFeeType = route.params?.initialFeeType;
    let initialGasAdjustment = route.params?.initialGasAdjustment;
    let initialGasAmount = route.params?.initialGasAmount;

    if (
      configs.recipientConfig &&
      configs.recipientConfig.value.trim().length > 0
    ) {
      initialRecipient = configs.recipientConfig.value;
    } else {
      initialRecipient = undefined;
    }

    // Fraction and amount value are exclusive
    if (configs.amountConfig.fraction <= 0) {
      initialAmountFraction = undefined;
      if (configs.amountConfig.value.trim().length > 0) {
        initialAmount = configs.amountConfig.value;
      } else {
        initialAmount = undefined;
      }
    } else {
      initialAmount = undefined;
      initialAmountFraction = configs.amountConfig.fraction.toString();
    }

    if (configs.memoConfig.value.trim().length > 0) {
      initialMemo = configs.memoConfig.value;
    } else {
      initialMemo = undefined;
    }

    if (
      configs.feeConfig.fees.length > 0 &&
      configs.feeConfig.type !== 'manual'
    ) {
      initialFeeCurrency = configs.feeConfig.fees[0].currency.coinMinimalDenom;
      initialFeeType = configs.feeConfig.type;
    } else {
      initialFeeCurrency = undefined;
      initialFeeType = undefined;
    }

    if (configs.gasSimulator.enabled) {
      initialGasAdjustment = configs.gasSimulator.gasAdjustment.toString();
      initialGasAmount = undefined;
    } else {
      initialGasAmount = configs.gasConfig.value.toString();
      initialGasAdjustment = undefined;
    }

    navigation.setParams({
      initialAmountFraction,
      initialRecipient,
      initialAmount,
      initialMemo,
      initialFeeCurrency,
      initialFeeType,
      initialGasAdjustment,
      initialGasAmount,
    });
  }, [
    configs.amountConfig.fraction,
    configs.amountConfig.value,
    configs.feeConfig.fees,
    configs.feeConfig.type,
    configs.gasConfig.value,
    configs.gasSimulator.enabled,
    configs.gasSimulator.gasAdjustment,
    configs.memoConfig.value,
    configs.recipientConfig,
    configs.recipientConfig?.value,
    navigation,
    route.params?.initialAmount,
    route.params?.initialAmountFraction,
    route.params?.initialFeeCurrency,
    route.params?.initialFeeType,
    route.params?.initialGasAdjustment,
    route.params?.initialGasAmount,
    route.params?.initialMemo,
    route.params?.initialRecipient,
  ]);
};
