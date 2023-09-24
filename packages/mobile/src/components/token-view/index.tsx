import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {Pressable, StyleSheet, Text} from 'react-native';
import {ViewToken} from '@keplr-wallet/extension/src/pages/main';
import {useStyle} from '../../styles';
import {Column, Columns} from '../column';
import {useStore} from '../../stores';
import {Stack} from '../stack';
import FastImage from 'react-native-fast-image';
import {Gutter} from '../gutter';
import {XAxis} from '../axis';
import {Tag} from '../tag';

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({viewToken}) => {
    const style = useStyle();

    const {priceStore} = useStore();

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const isIBC = useMemo(() => {
      return viewToken.token.currency.coinMinimalDenom.startsWith('ibc/');
    }, [viewToken.token.currency]);

    const coinDenom = useMemo(() => {
      if (
        'originCurrency' in viewToken.token.currency &&
        viewToken.token.currency.originCurrency
      ) {
        return viewToken.token.currency.originCurrency.coinDenom;
      }
      return viewToken.token.currency.coinDenom;
    }, [viewToken.token.currency]);

    return (
      <Pressable
        style={StyleSheet.flatten([
          style.flatten([
            'padding-16',
            'border-radius-6',
            'background-color-gray-600',
          ]),
        ])}>
        <Columns sum={1} alignY="center">
          <FastImage
            style={style.flatten(['width-32', 'height-32'])}
            source={{uri: viewToken.token.currency.coinImageUrl}}
            resizeMode={FastImage.resizeMode.contain}
          />

          <Gutter size={12} />

          <Stack>
            <XAxis>
              <Text
                numberOfLines={1}
                style={{
                  ...style.flatten([
                    'color-gray-10',
                    'subtitle2',
                    'flex-shrink-1',
                  ]),
                }}>
                {coinDenom}
              </Text>

              <Gutter size={4} />
              {isIBC ? <Tag text="IBC" /> : null}
            </XAxis>

            <Text style={style.flatten(['color-gray-300', 'body3'])}>
              {viewToken.chainInfo.chainName}
            </Text>
          </Stack>

          <Column weight={1} />

          <Stack>
            <Text style={style.flatten(['color-gray-10', 'subtitle1'])}>
              {viewToken.token
                .hideDenom(true)
                .maxDecimals(6)
                .inequalitySymbol(true)
                .shrink(true)
                .toString()}
            </Text>

            <Text style={style.flatten(['color-gray-300', 'subtitle2'])}>
              {pricePretty
                ? pricePretty.inequalitySymbol(true).toString()
                : '-'}
            </Text>
          </Stack>
        </Columns>
      </Pressable>
    );
  },
);
