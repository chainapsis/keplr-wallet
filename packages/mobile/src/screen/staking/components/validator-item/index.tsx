import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {YAxis} from '../../../../components/axis';
import {Text} from 'react-native';
import {Gutter} from '../../../../components/gutter';
import FastImage from 'react-native-fast-image';
import {CoinPretty, PricePretty} from '@keplr-wallet/unit';
import {Stack} from '../../../../components/stack';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';

export const ValidatorItem: FunctionComponent<{
  name: string;
  address: string;
  chainId: string;
  imageUrl: string | undefined;
  coin?: CoinPretty;
  price?: PricePretty;
  isNotReady?: boolean;
  afterSelect: (address: string, chainId: string) => void;
}> = ({name, address, imageUrl, chainId, coin, price, afterSelect}) => {
  const style = useStyle();

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      style={style.flatten(['border-radius-6', 'background-color-gray-600'])}
      activeOpacity={0.5}
      onPress={async () => {
        // e.preventDefault();
        afterSelect(address, chainId);
      }}>
      <Box paddingLeft={16} paddingRight={8} paddingY={18} borderRadius={6}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Box>
            <FastImage
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
              }}
              source={{uri: imageUrl}}
            />
          </Box>
          <Gutter size={12} />
          <YAxis>
            <Text
              numberOfLines={1}
              style={style.flatten(['subtitle2', 'color-text-high'])}>
              {name}
            </Text>
            <Gutter size={4} />
          </YAxis>
          <Column weight={2} />
          <Stack alignX="right" gutter={4}>
            {coin ? (
              <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
                {coin.maxDecimals(6).trim(true).shrink(true).toString()}
              </Text>
            ) : null}
            {price ? (
              <Text style={style.flatten(['subtitle2', 'color-text-low'])}>
                {price?.inequalitySymbol(true).toString()}
              </Text>
            ) : null}
          </Stack>
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
};
