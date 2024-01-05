import React, {FunctionComponent} from 'react';
import {IFeeConfig} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {Column, Columns} from '../../column';
import {useStyle} from '../../../styles';
import {Text} from 'react-native';
import {Box} from '../../box';
import {FormattedMessage} from 'react-intl';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({feeConfig}) => {
  const {priceStore} = useStore();
  const style = useStyle();

  const feeCurrency =
    feeConfig.fees.length > 0
      ? feeConfig.fees[0].currency
      : feeConfig.selectableFeeCurrencies[0];

  if (!feeCurrency) {
    return null;
  }

  return (
    <Columns sum={3}>
      <Column weight={1}>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: 'low',
              currency: feeCurrency,
            });
          }}>
          <Box
            alignX="center"
            alignY="center"
            paddingY={12}
            backgroundColor={
              feeConfig.type === 'low'
                ? style.get('color-blue-400').color
                : style.get('color-gray-500').color
            }
            style={{
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderRightWidth: 1,
              borderRightColor: style.get('color-gray-400').color,
            }}>
            <Text
              style={style.flatten([
                'h5',
                feeConfig.type === 'low' ? 'color-gray-50' : 'color-gray-200',
              ])}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.low" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text
                style={style.flatten([
                  'text-caption2',
                  feeConfig.type === 'low'
                    ? 'color-blue-200'
                    : 'color-gray-300',
                ])}>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(
                      feeCurrency,
                      'low',
                    ),
                  )
                  ?.toString() || '-'}
              </Text>
            ) : null}

            <Text
              style={style.flatten([
                'text-caption1',
                feeConfig.type === 'low' ? 'color-blue-100' : 'color-gray-300',
              ])}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, 'low')
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </Box>
        </TouchableWithoutFeedback>
      </Column>

      <Column weight={1}>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: 'average',
              currency: feeCurrency,
            });
          }}>
          <Box
            alignX="center"
            alignY="center"
            paddingY={12}
            backgroundColor={
              feeConfig.type === 'average'
                ? style.get('color-blue-400').color
                : style.get('color-gray-500').color
            }>
            <Text
              style={style.flatten([
                'h5',
                feeConfig.type === 'average'
                  ? 'color-gray-50'
                  : 'color-gray-200',
              ])}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.average" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text
                style={style.flatten([
                  'text-caption2',
                  feeConfig.type === 'average'
                    ? 'color-blue-200'
                    : 'color-gray-300',
                ])}>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(
                      feeCurrency,
                      'average',
                    ),
                  )
                  ?.toString() || '-'}
              </Text>
            ) : null}

            <Text
              style={style.flatten([
                'text-caption1',
                feeConfig.type === 'average'
                  ? 'color-blue-100'
                  : 'color-gray-300',
              ])}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, 'average')
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </Box>
        </TouchableWithoutFeedback>
      </Column>

      <Column weight={1}>
        <TouchableWithoutFeedback
          onPress={() => {
            feeConfig.setFee({
              type: 'high',
              currency: feeCurrency,
            });
          }}>
          <Box
            alignX="center"
            alignY="center"
            paddingY={12}
            backgroundColor={
              feeConfig.type === 'high'
                ? style.get('color-blue-400').color
                : style.get('color-gray-500').color
            }
            style={{
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderLeftWidth: 1,
              borderLeftColor: style.get('color-gray-400').color,
            }}>
            <Text
              style={style.flatten([
                'h5',
                feeConfig.type === 'high' ? 'color-gray-50' : 'color-gray-200',
              ])}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.high" />
            </Text>

            {feeCurrency.coinGeckoId ? (
              <Text
                style={style.flatten([
                  'text-caption2',
                  feeConfig.type === 'high'
                    ? 'color-blue-200'
                    : 'color-gray-300',
                ])}>
                {priceStore
                  .calculatePrice(
                    feeConfig.getFeeTypePrettyForFeeCurrency(
                      feeCurrency,
                      'high',
                    ),
                  )
                  ?.toString() || '-'}
              </Text>
            ) : null}

            <Text
              style={style.flatten([
                'text-caption1',
                feeConfig.type === 'high' ? 'color-blue-100' : 'color-gray-300',
              ])}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, 'high')
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .hideIBCMetadata(true)
                .toString()}
            </Text>
          </Box>
        </TouchableWithoutFeedback>
      </Column>
    </Columns>
  );
});
