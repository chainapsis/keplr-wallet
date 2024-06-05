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
      width={32}
      height={32}
      backgroundColor={backgroundColor || style.get('color-gray-500').color}
      borderRadius={999999}
      alignX="center"
      alignY="center">
      {center}
    </Box>
  );
};
