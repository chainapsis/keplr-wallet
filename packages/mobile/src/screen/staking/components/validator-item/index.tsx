import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {StyleSheet, Text, TextStyle} from 'react-native';
import {Gutter} from '../../../../components/gutter';
import FastImage from 'react-native-fast-image';
import {CoinPretty} from '@keplr-wallet/unit';
import {Stack} from '../../../../components/stack';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {StakingIcon} from '../../../../components/icon/stacking';

export interface ViewValidator {
  coin?: CoinPretty;
  name?: string;
  imageUrl: string | undefined;
  subString?: string;
  isDelegation?: boolean;
  validatorAddress: string;
}

export const ValidatorItem: FunctionComponent<{
  viewValidator: ViewValidator;
  isNotReady?: boolean;
  subStringStyle?: TextStyle;
  coinTextStyle?: TextStyle;
  coinMaxDecimal?: number;
  warning?: boolean;
  afterSelect: () => void;
}> = ({
  viewValidator,
  coinTextStyle,
  coinMaxDecimal,
  subStringStyle,
  afterSelect,
}) => {
  const style = useStyle();

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      style={style.flatten(['border-radius-6', 'background-color-gray-600'])}
      activeOpacity={0.5}
      onPress={async () => {
        afterSelect();
      }}>
      <Box paddingLeft={16} paddingRight={8} paddingY={16} borderRadius={6}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Box>
            <ValidatorImage
              imageUrl={viewValidator.imageUrl}
              name={viewValidator.name}
              isDelegation={viewValidator.isDelegation}
            />
          </Box>
          <Gutter size={12} />
          <Column weight={6}>
            <Text
              numberOfLines={1}
              style={style.flatten(['subtitle2', 'color-text-high'])}>
              {viewValidator.name}
            </Text>
            <Gutter size={4} />
          </Column>
          <Column weight={1} />
          <Stack alignX="right" gutter={4}>
            {viewValidator.coin ? (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['subtitle1', 'color-text-high']),
                  coinTextStyle,
                ])}>
                {viewValidator.coin
                  .maxDecimals(coinMaxDecimal || 6)
                  .trim(true)
                  .shrink(true)
                  .toString()}
              </Text>
            ) : null}

            {viewValidator.subString ? (
              <Columns sum={1}>
                <Text
                  style={StyleSheet.flatten([
                    style.flatten(['subtitle2', 'color-text-low']),
                    subStringStyle,
                  ])}>
                  {viewValidator.subString}
                </Text>
              </Columns>
            ) : null}
          </Stack>
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
};

const ValidatorImage = ({
  imageUrl,
  name,
  isDelegation,
}: {
  imageUrl?: string;
  isDelegation?: boolean;
  name?: string;
}) => {
  const style = useStyle();
  return (
    <React.Fragment>
      {imageUrl ? (
        isDelegation ? (
          <Box>
            <FastImage
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
              }}
              source={{uri: imageUrl}}
            />
            <Box
              position="absolute"
              width={16}
              height={16}
              borderRadius={16}
              backgroundColor={style.get('color-gray-400').color}
              alignX="center"
              alignY="center"
              style={{bottom: -3, right: -3}}>
              <StakingIcon
                size={9.6}
                color={style.get('color-green-300').color}
              />
            </Box>
          </Box>
        ) : (
          <FastImage
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
            }}
            source={{uri: imageUrl}}
          />
        )
      ) : isDelegation ? (
        <Box>
          <Box
            width={32}
            height={32}
            borderRadius={999}
            alignX="center"
            alignY="center"
            backgroundColor={style.get('color-gray-450').color}>
            <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
              {name ? name[0].toUpperCase() : null}
            </Text>
          </Box>
          <Box
            position="absolute"
            width={16}
            height={16}
            borderRadius={16}
            backgroundColor={style.get('color-gray-400').color}
            alignX="center"
            alignY="center"
            style={{bottom: -3, right: -3}}>
            <StakingIcon
              size={9.6}
              color={style.get('color-green-300').color}
            />
          </Box>
        </Box>
      ) : (
        <Box
          width={32}
          height={32}
          borderRadius={999}
          alignX="center"
          alignY="center"
          backgroundColor={style.get('color-gray-450').color}>
          <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
            {name ? name[0].toUpperCase() : null}
          </Text>
        </Box>
      )}
    </React.Fragment>
  );
};
