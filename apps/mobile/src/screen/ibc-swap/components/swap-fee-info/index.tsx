import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {Text, View} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {useStore} from '../../../../stores';
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from '@keplr-wallet/hooks';
import {autorun} from 'mobx';
import {Dec, PricePretty} from '@keplr-wallet/unit';
import {IBCSwapAmountConfig} from '@keplr-wallet/hooks-internal';
import {TransactionFeeModal} from '../../../../components/input/fee-control/transaction-fee-modal.tsx';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {SVGLoadingIcon} from '../../../../components/spinner';
import {InformationOutlinedIcon} from '../../../../components/icon/information-outlined.tsx';
import {InformationModal} from '../../../../components/modal/infoModal.tsx';
import {SwapFeeBps} from '../../../../config.ui.ts';

export const SwapFeeInfo: FunctionComponent<{
  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator: IGasSimulator;
}> = observer(
  ({senderConfig, amountConfig, feeConfig, gasConfig, gasSimulator}) => {
    const intl = useIntl();
    const style = useStyle();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const {uiConfigStore, queriesStore, chainStore, priceStore} = useStore();

    useLayoutEffect(() => {
      const disposal = autorun(() => {
        // Require to invoke effect whenever chain is changed,
        // even though it is not used in logic.
        noop(feeConfig.chainId);

        // TODO: 이 로직은 FeeControl에서 가져온건데 다른 부분이 있음.
        //       기존 FeeControl은 실수로 인해서 fee를 자동으로 average로 설정하는 로직이
        //       체인이 바꼈을때는 작동하지 않음
        //       사실 기존 send page는 체인이 바뀌려면 select-asset page를 통해서만 가능했기 때문에
        //       이게 문제가 안됐는데 ibc-swap에서는 swtich in-out 등으로 인해서 체인이 동적으로 바뀔 수 있음
        //       이 문제 때문에 일단 땜빵으로 해결함
        //       이후에 FeeControl을 살펴보고 문제가 없는 방식을 찾아서 둘 다 수정하던가 해야함
        const selectableFeeCurrenciesMap = new Map<string, boolean>();
        for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
          selectableFeeCurrenciesMap.set(feeCurrency.coinMinimalDenom, true);
        }

        if (
          feeConfig.selectableFeeCurrencies.length > 0 &&
          (feeConfig.fees.length === 0 ||
            feeConfig.fees.find(
              fee =>
                !selectableFeeCurrenciesMap.get(fee.currency.coinMinimalDenom),
            ) != null)
        ) {
          if (
            uiConfigStore.rememberLastFeeOption &&
            uiConfigStore.lastFeeOption
          ) {
            feeConfig.setFee({
              type: uiConfigStore.lastFeeOption,
              currency: feeConfig.selectableFeeCurrencies[0],
            });
          } else {
            feeConfig.setFee({
              type: 'average',
              currency: feeConfig.selectableFeeCurrencies[0],
            });
          }
        }
      });

      return () => {
        if (disposal) {
          disposal();
        }
      };
    }, [
      feeConfig,
      feeConfig.chainId,
      feeConfig.fees,
      feeConfig.selectableFeeCurrencies,
      uiConfigStore.lastFeeOption,
      uiConfigStore.rememberLastFeeOption,
    ]);

    useLayoutEffect(() => {
      // Require to invoke effect whenever chain is changed,
      // even though it is not used in logic.
      noop(feeConfig.chainId);

      // Try to find other fee currency if the account doesn't have enough fee to pay.
      // This logic can be slightly complex, so use mobx's `autorun`.
      // This part fairly different with the approach of react's hook.
      let skip = false;
      // Try until 500ms to avoid the confusion to user.
      const timeoutId = setTimeout(() => {
        skip = true;
      }, 500);

      const disposer = autorun(() => {
        if (
          !skip &&
          feeConfig.type !== 'manual' &&
          feeConfig.selectableFeeCurrencies.length > 1 &&
          feeConfig.fees.length > 0
        ) {
          const queryBalances = queriesStore
            .get(feeConfig.chainId)
            .queryBalances.getQueryBech32Address(senderConfig.sender);

          const currentFeeCurrency = feeConfig.fees[0].currency;
          const currentFeeCurrencyBal =
            queryBalances.getBalanceFromCurrency(currentFeeCurrency);

          const currentFee = feeConfig.getFeeTypePrettyForFeeCurrency(
            currentFeeCurrency,
            feeConfig.type,
          );
          if (currentFeeCurrencyBal.toDec().lt(currentFee.toDec())) {
            const isOsmosis =
              chainStore.hasChain(feeConfig.chainId) &&
              chainStore
                .getChain(feeConfig.chainId)
                .hasFeature('osmosis-txfees');

            // Not enough balances for fee.
            // Try to find other fee currency to send.
            for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
              const feeCurrencyBal =
                queryBalances.getBalanceFromCurrency(feeCurrency);
              const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
                feeCurrency,
                feeConfig.type,
              );

              // Osmosis의 경우는 fee의 spot price를 알아야 fee를 계산할 수 있다.
              // 그런데 문제는 이게 쿼리가 필요하기 때문에 비동기적이라 response를 기다려야한다.
              // 어쨋든 스왑에 의해서만 fee 계산이 이루어지기 때문에 fee로 Osmo가 0이였다면 이 로직까지 왔을리가 없고
              // 어떤 갯수의 Osmo던지 스왑 이후에 fee가 0이 될수는 없기 때문에
              // 0라면 단순히 response 준비가 안된것이라 확신할 수 있다.
              if (isOsmosis && fee.toDec().lte(new Dec(0))) {
                continue;
              }

              if (feeCurrencyBal.toDec().gte(fee.toDec())) {
                feeConfig.setFee({
                  type: feeConfig.type,
                  currency: feeCurrency,
                });
                const uiProperties = feeConfig.uiProperties;
                skip =
                  !uiProperties.loadingState &&
                  uiProperties.error == null &&
                  uiProperties.warning == null;
                return;
              }
            }
          }
        }
      });

      return () => {
        clearTimeout(timeoutId);
        skip = true;
        disposer();
      };
    }, [
      chainStore,
      feeConfig,
      feeConfig.chainId,
      queriesStore,
      senderConfig.sender,
    ]);

    const error = (() => {
      if (feeConfig.uiProperties.error) {
        if (feeConfig.uiProperties.error instanceof InsufficientFeeError) {
          return intl.formatMessage({
            id: 'components.input.fee-control.error.insufficient-fee',
          });
        }

        return (
          feeConfig.uiProperties.error.message ||
          feeConfig.uiProperties.error.toString()
        );
      }

      if (feeConfig.uiProperties.warning) {
        return (
          feeConfig.uiProperties.warning.message ||
          feeConfig.uiProperties.warning.toString()
        );
      }

      if (gasConfig.uiProperties.error) {
        return (
          gasConfig.uiProperties.error.message ||
          gasConfig.uiProperties.error.toString()
        );
      }

      if (gasConfig.uiProperties.warning) {
        return (
          gasConfig.uiProperties.warning.message ||
          gasConfig.uiProperties.warning.toString()
        );
      }
    })();

    return (
      <React.Fragment>
        <Box
          paddingX={16}
          paddingTop={12}
          paddingBottom={16}
          borderColor={
            error != null ? style.get('color-yellow-400').color : undefined
          }
          borderWidth={error != null ? 1 : 0}
          borderRadius={6}
          backgroundColor={style.get('color-gray-600').color}>
          {feeConfig.fees.length > 0 ? (
            <XAxis alignY="center">
              <TouchableWithoutFeedback
                style={style.flatten(['padding-y-4'])}
                onPress={() => {
                  setIsModalOpen(true);
                }}>
                <Text
                  style={style.flatten([
                    'subtitle3',
                    'color-text-middle',
                    'text-underline',
                  ])}>
                  <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.transaction-fee" />
                </Text>
              </TouchableWithoutFeedback>

              {uiConfigStore.rememberLastFeeOption ? (
                <React.Fragment>
                  <Gutter size={4} />

                  <Box
                    width={6}
                    height={6}
                    borderRadius={3}
                    backgroundColor={style.get('color-blue-400').color}
                  />
                </React.Fragment>
              ) : null}

              {feeConfig.uiProperties.loadingState ||
              gasSimulator.uiProperties.loadingState ? (
                <React.Fragment>
                  <Gutter size={4} />
                  <View
                    style={style.flatten(['justify-center', 'items-center'])}>
                    <SVGLoadingIcon
                      color={style.get('color-text-middle').color}
                      size={16}
                    />
                  </View>
                </React.Fragment>
              ) : null}

              <Box style={{flex: 1}} />

              <Text style={style.flatten(['body2', 'color-text-low'])}>
                {(() => {
                  let totalPrice: PricePretty | undefined;
                  if (feeConfig.fees.length > 0) {
                    const fee = feeConfig.fees[0];
                    const price = priceStore.calculatePrice(fee);
                    if (price) {
                      if (totalPrice) {
                        totalPrice = totalPrice.add(price);
                      } else {
                        totalPrice = price;
                      }
                    } else {
                      return '-';
                    }
                  }

                  if (totalPrice) {
                    return totalPrice.toString();
                  }
                  return '-';
                })()}
              </Text>

              <Gutter size={4} />

              <Text style={style.flatten(['body2', 'color-text-high'])}>
                {feeConfig.fees.map(fee => {
                  return (
                    <React.Fragment key={fee.currency.coinMinimalDenom}>
                      {fee
                        .maxDecimals(6)
                        .trim(true)
                        .shrink(true)
                        .inequalitySymbol(true)
                        .hideIBCMetadata(true)
                        .toString()}
                    </React.Fragment>
                  );
                })}
              </Text>
            </XAxis>
          ) : null}

          <Gutter size={8} />

          <XAxis alignY="center">
            <Text style={style.flatten(['subtitle3', 'color-text-middle'])}>
              <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.service-fee" />
            </Text>

            <TouchableWithoutFeedback
              style={{padding: 4}}
              onPress={() => {
                setIsInfoModalOpen(true);
              }}>
              <InformationOutlinedIcon
                size={20}
                color={style.get('color-gray-300').color}
              />
            </TouchableWithoutFeedback>

            {amountConfig.isFetching ? (
              <React.Fragment>
                <Gutter size={4} />
                <View style={style.flatten(['justify-center', 'items-center'])}>
                  <SVGLoadingIcon
                    color={style.get('color-text-middle').color}
                    size={16}
                  />
                </View>
              </React.Fragment>
            ) : null}

            <Box style={{flex: 1}} />

            <Text style={style.flatten(['body2', 'color-text-middle'])}>
              {amountConfig.swapFee
                .map(fee =>
                  fee
                    .maxDecimals(6)
                    .trim(true)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .hideIBCMetadata(true)
                    .toString(),
                )
                .join(', ')}
            </Text>
          </XAxis>
        </Box>

        <Gutter size={4} />

        {error ? (
          <Text style={style.flatten(['text-caption2', 'color-yellow-400'])}>
            {error}
          </Text>
        ) : null}

        <TransactionFeeModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          senderConfig={senderConfig}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          gasSimulator={gasSimulator}
        />

        <InformationModal
          isOpen={isInfoModalOpen}
          setIsOpen={setIsInfoModalOpen}
          title={intl.formatMessage({
            id: 'page.ibc-swap.components.swap-fee-info.keplr-swap-fee-information.title',
          })}
          paragraph={intl.formatMessage(
            {
              id: 'page.ibc-swap.components.swap-fee-info.keplr-swap-fee-information.paragraph',
            },
            {
              swapFeePercent: `${SwapFeeBps.value / 100}%`,
            },
          )}
        />
      </React.Fragment>
    );
  },
);

const noop = (..._args: any[]) => {
  // noop
};
