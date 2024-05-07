import React, {FunctionComponent} from 'react';
import {useStore} from '../../../../stores';
import {
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {XAxis} from '../../../../components/axis';
import {Text, View} from 'react-native';
import {CoinPretty, Dec, PricePretty} from '@keplr-wallet/unit';
import {Gutter} from '../../../../components/gutter';
import {GuideBox} from '../../../../components/guide-box';

export const FeeSummary: FunctionComponent<{
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = observer(({feeConfig, gasConfig}) => {
  const {priceStore, chainStore} = useStore();

  const intl = useIntl();
  const style = useStyle();

  return (
    <React.Fragment>
      <Box
        padding={16}
        backgroundColor={style.get('color-gray-500').color}
        borderRadius={6}>
        <XAxis alignY="center">
          <Text style={style.flatten(['color-text-high', 'subtitle3'])}>
            <FormattedMessage id="page.sign.components.fee-summary.fee" />
          </Text>

          <View style={{flex: 1}} />

          {(() => {
            if (feeConfig.fees.length > 0) {
              return feeConfig.fees;
            }
            const chainInfo = chainStore.getChain(feeConfig.chainId);
            return [
              new CoinPretty(
                chainInfo.stakeCurrency || chainInfo.currencies[0],
                new Dec(0),
              ),
            ];
          })()
            .map(fee =>
              fee
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .shrink(true)
                .hideIBCMetadata(true)
                .toString(),
            )
            .map(text => {
              return (
                <Text style={style.flatten(['color-text-high', 'subtitle3'])}>
                  {text}
                </Text>
              );
            })}

          <Gutter size={4} />

          <Text style={style.flatten(['body2', 'color-gray-300'])}>
            {(() => {
              let total: PricePretty | undefined;
              let hasUnknown = false;
              for (const fee of feeConfig.fees) {
                if (!fee.currency.coinGeckoId) {
                  hasUnknown = true;
                  break;
                } else {
                  const price = priceStore.calculatePrice(fee);
                  if (price) {
                    if (!total) {
                      total = price;
                    } else {
                      total = total.add(price);
                    }
                  }
                }
              }

              if (hasUnknown || !total) {
                return '(-)';
              }
              return `(${total.toString()})`;
            })()}
          </Text>
        </XAxis>
      </Box>

      {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
        <Box width="100%">
          <Gutter size={16} />

          <GuideBox
            hideInformationIcon={true}
            color="warning"
            title={
              (() => {
                if (feeConfig.uiProperties.error) {
                  if (
                    feeConfig.uiProperties.error instanceof InsufficientFeeError
                  ) {
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
              })() ?? ''
            }
            titleStyle={{textAlign: 'center'}}
          />
        </Box>
      ) : null}
    </React.Fragment>
  );
});
