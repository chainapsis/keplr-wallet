import React, {FunctionComponent, PropsWithChildren} from 'react';
import {Text} from 'react-native';
import {useStyle} from '../../styles';
import {ItemLogo} from '../activities/msg-items/logo.tsx';
import {MessageCustomIcon} from '../../components/icon/msg-custom.tsx';

export const CustomIcon: FunctionComponent = () => {
  const style = useStyle();

  return (
    <ItemLogo
      center={
        <MessageCustomIcon
          size={40}
          color={style.get('color-gray-100').color}
        />
      }
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
