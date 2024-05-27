import React, {useEffect, useRef, useState} from 'react';
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  ISenderConfig,
} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {Box} from '../../box';
import {BaseModalHeader} from '../../modal';
import {Label} from '../label';
import {useStyle} from '../../../styles';
import {FeeSelector} from './fee-selector';
import {Toggle} from '../../toggle';
import {Columns} from '../../column';
import {Gutter} from '../../gutter';
import {Text, View} from 'react-native';
import {Button} from '../../button';
import {TextInput} from '../text-input/text-input';
import {Dropdown} from '../../dropdown';
import {Dec} from '@keplr-wallet/unit';
import {registerCardModal} from '../../modal/card';
import {VerticalCollapseTransition} from '../../transition';
import {GuideBox} from '../../guide-box';
import {XAxis} from '../../axis';

export const TransactionFeeModal = registerCardModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;

    senderConfig: ISenderConfig;
    feeConfig: IFeeConfig;
    gasConfig: IGasConfig;
    gasSimulator?: IGasSimulator;
    disableAutomaticFeeSet?: boolean;
  }>(
    ({
      senderConfig,
      feeConfig,
      gasConfig,
      gasSimulator,
      setIsOpen,
      disableAutomaticFeeSet,
    }) => {
      const {queriesStore, uiConfigStore} = useStore();
      const intl = useIntl();
      const style = useStyle();

      const isGasSimulatorUsable = (() => {
        if (!gasSimulator) {
          return false;
        }

        if (
          gasSimulator.gasEstimated == null &&
          gasSimulator.uiProperties.error
        ) {
          return false;
        }

        return true;
      })();

      const isGasSimulatorEnabled = (() => {
        if (!isGasSimulatorUsable) {
          return false;
        }
        return gasSimulator?.enabled;
      })();

      useEffect(() => {
        if (uiConfigStore.rememberLastFeeOption) {
          if (feeConfig.type !== 'manual') {
            uiConfigStore.setLastFeeOption(feeConfig.type);
          }
        } else {
          uiConfigStore.setLastFeeOption(false);
        }
      }, [feeConfig.type, uiConfigStore, uiConfigStore.rememberLastFeeOption]);

      const [showChangesApplied, setShowChangesApplied] = useState(false);
      const feeConfigCurrencyString = feeConfig
        .toStdFee()
        .amount.map(x => x.denom)
        .join(',');
      const prevFeeConfigType = useRef(feeConfig.type);
      const prevFeeConfigCurrency = useRef(feeConfigCurrencyString);
      const prevGasConfigGas = useRef(gasConfig.gas);
      const prevGasSimulatorEnabled = useRef(isGasSimulatorEnabled);
      const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined>(
        undefined,
      );
      useEffect(() => {
        if (
          prevFeeConfigType.current !== feeConfig.type ||
          prevFeeConfigCurrency.current !== feeConfigCurrencyString ||
          prevGasConfigGas.current !== gasConfig.gas ||
          prevGasSimulatorEnabled.current !== isGasSimulatorEnabled
        ) {
          if (lastShowChangesAppliedTimeout.current) {
            clearTimeout(lastShowChangesAppliedTimeout.current);
            lastShowChangesAppliedTimeout.current = undefined;
          }
          setShowChangesApplied(true);
          lastShowChangesAppliedTimeout.current = setTimeout(() => {
            setShowChangesApplied(false);
            lastShowChangesAppliedTimeout.current = undefined;
          }, 2500);
        }

        prevFeeConfigType.current = feeConfig.type;
        prevFeeConfigCurrency.current = feeConfigCurrencyString;
        prevGasConfigGas.current = gasConfig.gas;
        prevGasSimulatorEnabled.current = isGasSimulatorEnabled;
      }, [
        feeConfig.type,
        feeConfigCurrencyString,
        gasConfig.gas,
        isGasSimulatorEnabled,
      ]);

      return (
        <Box paddingX={12} paddingBottom={12}>
          <BaseModalHeader
            title={intl.formatMessage({
              id: 'components.input.fee-control.modal.title',
            })}
            titleStyle={style.flatten(['h4', 'text-left'])}
            style={style.flatten(['padding-left-8'])}
          />

          <Gutter size={12} />

          <XAxis alignY="center">
            <Label
              content={intl.formatMessage({
                id: 'components.input.fee-control.modal.fee-title',
              })}
            />

            <View style={{flex: 1}} />

            {!disableAutomaticFeeSet ? (
              <React.Fragment>
                <Box
                  width={6}
                  height={6}
                  borderRadius={999}
                  backgroundColor={style.get('color-blue-400').color}
                />
                <Gutter size={8} />

                <Text style={style.flatten(['subtitle3', 'color-gray-200'])}>
                  <FormattedMessage id="components.input.fee-control.modal.remember-last-fee-option" />
                </Text>

                <Gutter size={8} />

                <Toggle
                  isOpen={uiConfigStore.rememberLastFeeOption}
                  setIsOpen={v => uiConfigStore.setRememberLastFeeOption(v)}
                />
              </React.Fragment>
            ) : null}
          </XAxis>

          <Gutter size={6} />

          <FeeSelector feeConfig={feeConfig} />

          <Gutter size={12} />

          <Dropdown
            label={intl.formatMessage({
              id: 'components.input.fee-control.modal.fee-token-dropdown-label',
            })}
            items={feeConfig.selectableFeeCurrencies
              .filter((cur, i) => {
                if (i === 0) {
                  return true;
                }

                const balance = queriesStore
                  .get(feeConfig.chainId)
                  .queryBalances.getQueryBech32Address(senderConfig.sender)
                  .getBalanceFromCurrency(cur);

                return balance.toDec().gt(new Dec(0));
              })
              .map(cur => {
                return {
                  key: cur.coinMinimalDenom,
                  label: cur.coinDenom,
                };
              })}
            selectedItemKey={feeConfig.fees[0]?.currency.coinMinimalDenom}
            onSelect={key => {
              const currency = feeConfig.selectableFeeCurrencies.find(
                cur => cur.coinMinimalDenom === key,
              );
              if (currency) {
                if (feeConfig.type !== 'manual') {
                  feeConfig.setFee({
                    type: feeConfig.type,
                    currency: currency,
                  });
                } else {
                  feeConfig.setFee({
                    type: 'average',
                    currency: currency,
                  });
                }
              }
            }}
            size="large"
          />

          <Gutter size={12} />

          {(() => {
            if (gasSimulator) {
              if (gasSimulator.uiProperties.error) {
                return (
                  <GuideBox
                    color="danger"
                    title={intl.formatMessage({
                      id: 'components.input.fee-control.modal.guide-title',
                    })}
                    paragraph={
                      gasSimulator.uiProperties.error.message ||
                      gasSimulator.uiProperties.error.toString()
                    }
                  />
                );
              }

              if (gasSimulator.uiProperties.warning) {
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'components.input.fee-control.modal.guide-title',
                    })}
                    paragraph={
                      gasSimulator.uiProperties.warning.message ||
                      gasSimulator.uiProperties.warning.toString()
                    }
                  />
                );
              }
            }
          })()}

          {isGasSimulatorEnabled ? (
            <TextInput
              label={intl.formatMessage({
                id: 'components.input.fee-control.modal.gas-adjustment-label',
              })}
              value={gasSimulator?.gasAdjustmentValue}
              onChangeText={text => {
                gasSimulator?.setGasAdjustmentValue(text);
              }}
              rightLabel={
                isGasSimulatorUsable && gasSimulator ? (
                  <React.Fragment>
                    <Columns sum={1} alignY="center">
                      <Text
                        style={style.flatten(['subtitle3', 'color-gray-200'])}>
                        <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                      </Text>

                      <Gutter size={8} />
                      <Toggle
                        isOpen={gasSimulator.enabled}
                        setIsOpen={isOpen => {
                          gasSimulator?.setEnabled(isOpen);
                        }}
                      />
                    </Columns>

                    <Gutter size={6} />
                  </React.Fragment>
                ) : null
              }
            />
          ) : (
            <TextInput
              label={intl.formatMessage({
                id: 'components.input.fee-control.modal.gas-amount-label',
              })}
              value={gasConfig.value}
              onChangeText={text => {
                gasConfig.setValue(text);
              }}
              rightLabel={
                isGasSimulatorUsable && gasSimulator ? (
                  <React.Fragment>
                    <Columns sum={1} alignY="center">
                      <Text
                        style={style.flatten(['subtitle3', 'color-gray-200'])}>
                        <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                      </Text>

                      <Gutter size={8} />
                      <Toggle
                        isOpen={gasSimulator.enabled}
                        setIsOpen={isOpen => {
                          gasSimulator?.setEnabled(isOpen);
                        }}
                      />
                    </Columns>

                    <Gutter size={6} />
                  </React.Fragment>
                ) : null
              }
            />
          )}

          {disableAutomaticFeeSet ? (
            <React.Fragment>
              <Gutter size={12} />
              <GuideBox
                title={intl.formatMessage({
                  id: 'components.input.fee-control.modal.guide.external-fee-set',
                })}
                backgroundColor={style.get('color-gray-500').color}
              />
            </React.Fragment>
          ) : null}

          <VerticalCollapseTransition collapsed={!showChangesApplied}>
            <Gutter size={12} />

            <GuideBox
              color="safe"
              title={intl.formatMessage({
                id: 'components.input.fee-control.modal.notification.changes-applied',
              })}
            />
          </VerticalCollapseTransition>

          <Gutter size={12} />

          <Button
            text={intl.formatMessage({
              id: 'button.close',
            })}
            color="secondary"
            size="large"
            onPress={() => setIsOpen(false)}
          />
        </Box>
      );
    },
  ),
);
