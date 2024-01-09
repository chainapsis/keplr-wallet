import React, {FunctionComponent, PropsWithChildren} from 'react';
import FastImage from 'react-native-fast-image';
import {Text} from 'react-native';
import {useStyle} from '../../styles';

export const CustomIcon: FunctionComponent = () => {
  return (
    <FastImage
      style={{width: 48, height: 48}}
      source={require('../../public/assets/img/sign/sign-custom.png')}
    />
  );
};

export const UnknownMessageContent: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();

  return (
    <Text style={style.flatten(['body3', 'color-text-middle'])}>
      {children}
    </Text>
  );
};
