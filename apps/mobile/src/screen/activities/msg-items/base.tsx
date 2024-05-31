import React, {FunctionComponent, useMemo} from 'react';
import {CoinPretty, Dec, PricePretty} from '@keplr-wallet/unit';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {XAxis, YAxis} from '../../../components/axis';
import {Text, ViewStyle} from 'react-native';
import {ItemLogo} from './logo.tsx';
import {Gutter} from '../../../components/gutter';
import * as ExpoImage from 'expo-image';
import {RectButton} from '../../../components/rect-button';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation.tsx';

export const MsgItemBase: FunctionComponent<{
  logo: React.ReactElement;
  chainId: string;
  title: string;
  paragraph?: string;
  paragraphStyle?: ViewStyle;
  bottom?: React.ReactElement;
  amount: CoinPretty | string;
  overrideAmountColor?: string;
  prices: Record<string, Record<string, number | undefined> | undefined>;
  msg: MsgHistory;
  targetDenom: string;
  amountDeco?: {
    prefix: 'none' | 'plus' | 'minus';
    color: 'none' | 'green';
  };
  isInAllActivitiesPage: boolean | undefined;
}> = observer(
  ({
    logo,
    chainId,
    title,
    paragraph,
    paragraphStyle,
    bottom,
    amount,
    overrideAmountColor,
    prices,
    msg,
    targetDenom,
    amountDeco,
    isInAllActivitiesPage,
  }) => {
    const {chainStore, priceStore, queriesStore} = useStore();

    const style = useStyle();
    const navigation = useNavigation<StackNavProp>();

    const chainInfo = chainStore.getChain(chainId);

    // mobx와 useMemo의 조합 문제로... 값 몇개를 밖으로 뺀다.
    const foundCurrency = chainInfo.findCurrency(targetDenom);
    const defaultVsCurrency = priceStore.defaultVsCurrency;
    const sendAmountPricePretty = useMemo(() => {
      if (typeof amount === 'string') {
        return undefined;
      }

      if (foundCurrency && foundCurrency.coinGeckoId) {
        const price = prices[foundCurrency.coinGeckoId];
        if (price != null && price[defaultVsCurrency] != null) {
          const dec = amount.toDec();
          const priceDec = new Dec(price[defaultVsCurrency]!.toString());
          const fiatCurrency = priceStore.getFiatCurrency(defaultVsCurrency);
          if (fiatCurrency) {
            return new PricePretty(fiatCurrency, dec.mul(priceDec));
          }
        }
      }
      return;
    }, [defaultVsCurrency, foundCurrency, priceStore, prices, amount]);

    const queryExplorer = queriesStore.simpleQuery.queryGet<{
      link: string;
    }>(
      process.env['KEPLR_EXT_CONFIG_SERVER'] || '',
      `/tx-history/explorer/${chainInfo.chainIdentifier}`,
    );

    const explorerUrl = queryExplorer.response?.data.link || '';

    const clickable = !!explorerUrl;

    return (
      <Box borderRadius={6} backgroundColor={style.get('color-gray-600').color}>
        <RectButton
          disabled={!clickable}
          onPress={() => {
            if (explorerUrl) {
              navigation.navigate('Web', {
                url: explorerUrl
                  .replace('{txHash}', msg.txHash.toUpperCase())
                  .replace('{txHash:lowercase}', msg.txHash.toLowerCase())
                  .replace('{txHash:uppercase}', msg.txHash.toUpperCase()),
                isExternal: true,
              });
            }
          }}
          style={style.flatten(['padding-x-16', 'padding-y-14'])}>
          <XAxis alignY="center">
            <Box>
              <ItemLogo center={logo} />
              {isInAllActivitiesPage ? (
                <ExpoImage.Image
                  style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    bottom: 0,
                    right: 0,
                    borderRadius: 999999,
                  }}
                  source={
                    chainInfo.chainSymbolImageUrl
                      ? chainInfo.chainSymbolImageUrl
                      : require('../../../public/assets/img/chain-icon-alt.png')
                  }
                  contentFit="contain"
                />
              ) : null}
            </Box>

            <Gutter size={12} />

            <XAxis alignY="center">
              <YAxis>
                <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
                  {title}
                </Text>

                {paragraph ? (
                  <React.Fragment>
                    <Gutter size={4} />

                    <Text
                      style={{
                        ...style.flatten(['body3', 'color-gray-300']),
                        ...paragraphStyle,
                      }}>
                      {paragraph}
                    </Text>
                  </React.Fragment>
                ) : null}
              </YAxis>
            </XAxis>

            <Box style={style.flatten(['flex-1'])} />

            <YAxis alignX="right">
              {(() => {
                if (msg.code !== 0) {
                  return (
                    <Text
                      style={style.flatten(['subtitle3', 'color-yellow-400'])}>
                      Failed
                    </Text>
                  );
                }

                return (
                  <React.Fragment>
                    <Text
                      style={{
                        ...style.flatten(['subtitle3']),
                        color: overrideAmountColor
                          ? overrideAmountColor
                          : amountDeco
                          ? amountDeco.color === 'green'
                            ? style.get('color-green-400').color
                            : style.get('color-white').color
                          : style.get('color-white').color,
                      }}>
                      {(() => {
                        if (!amountDeco) {
                          return '';
                        }

                        if (amountDeco.prefix === 'plus') {
                          return '+';
                        }

                        if (amountDeco.prefix === 'minus') {
                          return '-';
                        }

                        return '';
                      })()}
                      {typeof amount === 'string'
                        ? amount
                        : amount
                            .maxDecimals(2)
                            .shrink(true)
                            .hideIBCMetadata(true)
                            .inequalitySymbol(true)
                            .inequalitySymbolSeparator('')
                            .toString()}
                    </Text>

                    {sendAmountPricePretty ? (
                      <React.Fragment>
                        <Gutter size={4} />
                        <Text
                          style={style.flatten(['body3', 'color-gray-300'])}>
                          {sendAmountPricePretty.toString()}
                        </Text>
                      </React.Fragment>
                    ) : null}
                  </React.Fragment>
                );
              })()}
            </YAxis>
          </XAxis>
        </RectButton>

        {bottom}
      </Box>
    );
  },
);
