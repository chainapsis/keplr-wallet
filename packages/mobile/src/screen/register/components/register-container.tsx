import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {RegisterHeader} from '../../../components/pageHeader/header-register';

export const RegisterContainer: FunctionComponent<
  PropsWithChildren<{
    title: string;
    paragraph?: string;
    bottom?: React.ReactNode;
  }>
> = ({title, paragraph, children, bottom}) => {
  const style = useStyle();

  return (
    <React.Fragment>
      <RegisterHeader title={title} paragraph={paragraph} />

      {children}

      <Box padding={20} backgroundColor={style.get('color-gray-700').color}>
        {bottom}
      </Box>
    </React.Fragment>
  );
};
