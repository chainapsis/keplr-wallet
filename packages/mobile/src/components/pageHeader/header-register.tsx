import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {StatusBar, Pressable, Text, SafeAreaView} from 'react-native';
import {Gutter} from '../gutter';
import {HeaderBackButtonIcon} from './icon/back';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Box} from '../box';

export const RegisterHeaderTitle: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          paragraph?: string;
          hideBackButton?: boolean;
        }
      >,
      string
    >
  >();
  const navigation = useNavigation();
  const paragraph = route.params?.paragraph;
  const hideBackButton = route.params?.hideBackButton;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: hideBackButton ? null : () => <HeaderBackButton />,
    });
  }, [hideBackButton, navigation]);
  return (
    <Box alignX="center" alignY="center" marginBottom={paragraph ? 2 : 0}>
      <Text style={style.flatten(['h3', 'color-text-high'])}>{children}</Text>
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
export const registerHeaderTitleFunc = () => <RegisterHeaderTitle />;
export const registerHeaderOptions = {
  headerTitle: RegisterHeaderTitle,
  headerTitleAlign: 'center' as 'center' | 'left',
  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  headerShadowVisible: false,
};

export const RegisterHeader: FunctionComponent<{
  title: string;
  paragraph?: string;
  hideBackButton?: boolean;
}> = ({title, paragraph, hideBackButton}) => {
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

        {hideBackButton ? null : <HeaderBackButton />}
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
