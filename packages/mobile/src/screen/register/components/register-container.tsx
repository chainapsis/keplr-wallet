import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';

export const RegisterContainer: FunctionComponent<
  PropsWithChildren<{
    bottom?: React.ReactNode;
  }>
> = ({children, bottom}) => {
  const style = useStyle();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          paragraph?: string;
        }
      >,
      string
    >
  >();
  const paragraph = route.params?.paragraph;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Box style={{flex: 1}} marginTop={paragraph ? 18 : 0}>
        {children}
      </Box>

      <Box padding={20} backgroundColor={style.get('color-gray-700').color}>
        {bottom}
      </Box>
    </KeyboardAvoidingView>
  );
};
