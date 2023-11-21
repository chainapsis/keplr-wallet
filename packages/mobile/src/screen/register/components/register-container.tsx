import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {RegisterHeader} from '../../../components/pageHeader/header-register';
import {KeyboardAvoidingView, Platform} from 'react-native';

export const RegisterContainer: FunctionComponent<
  PropsWithChildren<{
    title: string;
    paragraph?: string;
    bottom?: React.ReactNode;
  }>
> = ({title, paragraph, children, bottom}) => {
  const style = useStyle();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <RegisterHeader title={title} paragraph={paragraph} />

      {children}

      <Box style={{flex: 1}} />

      <Box padding={20} backgroundColor={style.get('color-gray-700').color}>
        {bottom}
      </Box>
    </KeyboardAvoidingView>
  );
};
