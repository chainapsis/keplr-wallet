import React, {FunctionComponent} from 'react';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Text} from 'react-native';

export const Tag: FunctionComponent<{
  text: string;
  // tooltip?: string;
}> = ({text}) => {
  const style = useStyle();

  return (
    // <Tooltip enabled={!!tooltip} content={tooltip}>
    <Box
      alignX="center"
      alignY="center"
      backgroundColor={style.flatten(['color-gray-400']).color}
      borderRadius={4}
      height={20}
      paddingX={10}>
      <Text style={style.flatten(['color-gray-100'])}>{text}</Text>
    </Box>
    // </Tooltip>
  );
};
