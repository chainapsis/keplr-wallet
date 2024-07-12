import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';

export const ItemLogo: FunctionComponent<{
  center: React.ReactElement;
  backgroundColor?: string;
}> = ({center, backgroundColor}) => {
  const style = useStyle();

  return (
    <Box
      width={40}
      height={40}
      backgroundColor={backgroundColor}
      borderWidth={1}
      borderColor={style.get('color-gray-400').color}
      borderRadius={999999}
      alignX="center"
      alignY="center">
      {center}
    </Box>
  );
};
