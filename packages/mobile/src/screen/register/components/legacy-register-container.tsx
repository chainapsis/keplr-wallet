import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {KeyboardAvoidingView, Platform, StyleSheet, Text} from 'react-native';

export const LegacyRegisterContainer: FunctionComponent<
  PropsWithChildren<{
    bottom?: React.ReactNode;
    paragraph?: string;
  }>
> = ({children, bottom, paragraph}) => {
  const style = useStyle();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      {paragraph ? (
        <React.Fragment>
          <Text
            style={StyleSheet.flatten([
              style.flatten(['body2', 'text-center', 'color-text-low']),
              {marginTop: -3},
            ])}>
            {paragraph}
          </Text>
        </React.Fragment>
      ) : null}
      <Box style={{flex: 1}} marginTop={paragraph ? 18 : 0}>
        {children}
      </Box>

      <Box padding={20} backgroundColor={style.get('color-gray-700').color}>
        {bottom}
      </Box>
    </KeyboardAvoidingView>
  );
};
