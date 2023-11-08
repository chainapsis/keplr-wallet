import React, {FunctionComponent} from 'react';
import {GuideBoxProps} from './types';
import {Column, Columns} from '../column';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Stack} from '../stack';
import {Text} from 'react-native';
import {Path, Svg} from 'react-native-svg';
import {IconProps} from '../icon/types';

export const WarningBox: FunctionComponent<Omit<GuideBoxProps, 'color'>> = ({
  title,
  paragraph,
  titleRight,
  bottom,
}) => {
  const style = useStyle();

  return (
    <Box borderRadius={8} padding={18}>
      <Stack gutter={8}>
        <Columns sum={1} alignY="center" gutter={6}>
          <WarningIcon size={20} color={style.get('color-yellow-400').color} />
          <Column weight={1}>
            <Text style={style.flatten(['subtitle4', 'color-yellow-400'])}>
              {title}
            </Text>
          </Column>
          {titleRight}
        </Columns>
        {paragraph ? (
          <Text style={style.flatten(['body3', 'color-white'])}>
            {paragraph}
          </Text>
        ) : null}
        {bottom ? <Box>{bottom}</Box> : null}
      </Stack>
    </Box>
  );
};

const WarningIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.83406 2.50265C8.79613 0.835055 11.2029 0.835055 12.165 2.50265L18.2936 13.1256C19.2551 14.7922 18.0523 16.8749 16.1281 16.8749H3.87091C1.94677 16.8749 0.743912 14.7922 1.70545 13.1256L7.83406 2.50265ZM9.99969 6.87482C10.3449 6.87482 10.6247 7.15464 10.6247 7.49982V10.6248C10.6247 10.97 10.3449 11.2498 9.99969 11.2498C9.65452 11.2498 9.37469 10.97 9.37469 10.6248V7.49982C9.37469 7.15464 9.65452 6.87482 9.99969 6.87482ZM9.99969 13.7498C10.3449 13.7498 10.6247 13.47 10.6247 13.1248C10.6247 12.7796 10.3449 12.4998 9.99969 12.4998C9.65452 12.4998 9.37469 12.7796 9.37469 13.1248C9.37469 13.47 9.65452 13.7498 9.99969 13.7498Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
