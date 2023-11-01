import React, {FunctionComponent, PropsWithChildren} from 'react';
import FastImage from 'react-native-fast-image';
import {Text} from 'react-native';

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
  return <Text>{children}</Text>;
};
