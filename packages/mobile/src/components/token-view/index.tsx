import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {StyleSheet, Text} from 'react-native';
import {useStyle} from '../../styles';
import {Column, Columns} from '../column';
import {useStore} from '../../stores';
import FastImage from 'react-native-fast-image';
import {Gutter} from '../gutter';
import {XAxis} from '../axis';
import {Tag} from '../tag';
import {CoinPretty} from '@keplr-wallet/unit';
import {IChainInfoImpl, QueryError} from '@keplr-wallet/stores';
import {Box} from '../box';
import {ArrowRightIcon} from '../icon/arrow-right';
import {RectButton} from '../rect-button';

export interface ViewToken {
  token: CoinPretty;
  chainInfo: IChainInfoImpl;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({viewToken, onClick, disabled, forChange}) => {
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
      <React.Fragment>
        {disabled ? (
          <Box
            style={StyleSheet.flatten([
              style.flatten([
                'padding-16',
                'border-radius-6',
                'background-color-card-default',
              ]),
            ])}>
            <Columns sum={1} alignY="center">
              <FastImage
                style={style.flatten(['width-32', 'height-32'])}
                source={
                  viewToken.token.currency.coinImageUrl
                    ? {uri: viewToken.token.currency.coinImageUrl}
                    : require('../../public/assets/img/chain-icon-alt.png')
                }
                resizeMode={FastImage.resizeMode.contain}
              />

              <Gutter size={12} />

              <Box style={style.flatten(['flex-column', 'flex-shrink-1'])}>
                <XAxis>
                  <Text
                    style={{
                      ...style.flatten(['color-gray-10', 'subtitle2']),
                    }}>
                    {coinDenom}
                  </Text>

                  <Gutter size={4} />
                  {isIBC ? <Tag text="IBC" /> : null}
                </XAxis>

                <Text style={style.flatten(['color-gray-300', 'body3'])}>
                  {viewToken.chainInfo.chainName}
                </Text>
              </Box>

              <Column weight={1} />

              <Box
                style={style.flatten([
                  'flex-column',
                  'flex-shrink-1',
                  'items-end',
                ])}>
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
              </Box>

              <Gutter size={4} />

              {forChange ? (
                <Box>
                  <ArrowRightIcon
                    size={24}
                    color={style.get('color-gray-300').color}
                  />
                </Box>
              ) : null}
            </Columns>
          </Box>
        ) : (
          <RectButton
            onPress={onClick}
            style={StyleSheet.flatten([
              style.flatten([
                'padding-16',
                'border-radius-6',
                'background-color-card-default',
              ]),
            ])}
            rippleColor={style.get('color-card-pressing-default').color}
            underlayColor={style.get('color-card-pressing-default').color}>
            <Columns sum={1} alignY="center">
              <FastImage
                style={style.flatten(['width-32', 'height-32'])}
                source={
                  viewToken.token.currency.coinImageUrl
                    ? {uri: viewToken.token.currency.coinImageUrl}
                    : require('../../public/assets/img/chain-icon-alt.png')
                }
                resizeMode={FastImage.resizeMode.contain}
              />

              <Gutter size={12} />

              <Box style={style.flatten(['flex-column', 'flex-shrink-1'])}>
                <XAxis>
                  <Text
                    style={{
                      ...style.flatten(['color-gray-10', 'subtitle2']),
                    }}>
                    {coinDenom}
                  </Text>

                  <Gutter size={4} />
                  {isIBC ? <Tag text="IBC" /> : null}
                </XAxis>

                <Text style={style.flatten(['color-gray-300', 'body3'])}>
                  {viewToken.chainInfo.chainName}
                </Text>
              </Box>

              <Column weight={1} />

              <Box
                style={style.flatten([
                  'flex-column',
                  'flex-shrink-1',
                  'items-end',
                ])}>
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
              </Box>

              <Gutter size={4} />

              {forChange ? (
                <Box>
                  <ArrowRightIcon
                    size={24}
                    color={style.get('color-gray-300').color}
                  />
                </Box>
              ) : null}
            </Columns>
          </RectButton>
        )}
      </React.Fragment>
    );
  },
);
