import React, {FunctionComponent} from 'react';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {YAxis} from '../../../components/axis';
import {Box} from '../../../components/box';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const CircleButton: FunctionComponent<{
  onClick: () => void;
  icon: React.ReactElement;
  text: string;
  disabled?: boolean;
}> = ({onClick, icon, text, disabled}) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onClick}
      style={{opacity: disabled ? 0.4 : 1}}>
      <YAxis alignX="center">
        <Box
          width={44}
          height={44}
          borderRadius={99999}
          backgroundColor={style.get('color-gray-400').color}
          alignX="center"
          alignY="center">
          {icon}
        </Box>

        <Gutter size={6} />

        <Text style={style.flatten(['body3', 'color-gray-100'])}>{text}</Text>
      </YAxis>
    </TouchableWithoutFeedback>
  );
};
