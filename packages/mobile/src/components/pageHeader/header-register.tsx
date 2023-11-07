import React, {FunctionComponent} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {Box} from '../box';
import {Pressable, Text} from 'react-native';
import {Gutter} from '../gutter';
import {HeaderBackButtonIcon} from './icon/back';
import {useNavigation} from '@react-navigation/native';

export const RegisterHeader: FunctionComponent<{
  title: string;
  paragraph?: string;
}> = ({title, paragraph}) => {
  const style = useStyle();

  return (
    <Box alignX="center">
      <Text style={style.flatten(['h3', 'color-text-high'])}>{title}</Text>

      {paragraph ? (
        <React.Fragment>
          <Gutter size={4} />

          <Text style={style.flatten(['body2', 'color-text-low'])}>
            {paragraph}
          </Text>
        </React.Fragment>
      ) : null}
    </Box>
  );
};

export const HeaderBackButton: FunctionComponent = () => {
  const style = useStyle();
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()}>
      <HeaderBackButtonIcon
        size={28}
        color={style.get('color-gray-300').color}
      />
    </Pressable>
  );
};

export const registerHeaderOptions = {
  headerTitleAlign: 'center' as 'center' | 'left',
  headerBackVisible: false,
  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  headerLeft: HeaderBackButton,
};
