import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {Pressable, Text} from 'react-native';
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
    <Box
      alignX="center"
      alignY="center"
      //NOTE 240을 준 이유는 왼쪽에 아이콘이 생길 경우 자체적인 header 길이가 제목을 짜를때가 있음
      //해서 그냥 find 튜닝으로 안짤리는 최소 값을 지정함
      minWidth={240}
      marginBottom={paragraph ? 2 : 0}>
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
