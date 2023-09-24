import {FunctionComponent} from 'react';
import {Box} from '../box';
import {Text} from 'react-native';
import {useStyle} from '../../styles';

export const Tag: FunctionComponent<{
  text: string;
}> = ({text}) => {
  const style = useStyle();
  return (
    <Box
      alignX="center"
      alignY="center"
      borderRadius={4}
      paddingX={6}
      backgroundColor={style.flatten(['color-gray-400']).color}>
      <Text style={style.flatten(['color-gray-100', 'text-caption1'])}>
        {text}
      </Text>
    </Box>
  );
};
