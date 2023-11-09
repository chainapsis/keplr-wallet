import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../styles';
import {StatusBar, Pressable, Text, SafeAreaView} from 'react-native';
import {Gutter} from '../gutter';
import {HeaderBackButtonIcon} from './icon/back';
import {useNavigation} from '@react-navigation/native';
import {Box} from '../box';

export const RegisterHeader: FunctionComponent<{
  title: string;
  paragraph?: string;
}> = ({title, paragraph}) => {
  const style = useStyle();
  const statusBarHeight = StatusBar.currentHeight;

  return (
    <SafeAreaView>
      <Box
        alignX="center"
        alignY="center"
        marginTop={statusBarHeight}
        paddingY={18}>
        <Text style={style.flatten(['h3', 'color-text-high'])}>{title}</Text>

        {paragraph ? (
          <React.Fragment>
            <Gutter size={4} />

            <Text style={style.flatten(['body2', 'color-text-low'])}>
              {paragraph}
            </Text>
          </React.Fragment>
        ) : null}

        <HeaderBackButton />
      </Box>
    </SafeAreaView>
  );
};

export const HeaderBackButton: FunctionComponent = () => {
  const style = useStyle();
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={{position: 'absolute', left: 20}}>
      <HeaderBackButtonIcon
        size={28}
        color={style.get('color-gray-300').color}
      />
    </Pressable>
  );
};
