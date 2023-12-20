import React, {FunctionComponent, PropsWithChildren} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {Pressable, Text} from 'react-native';
import {HeaderBackButtonIcon} from './icon/back';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

export const RegisterHeaderTitle: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  return (
    <Text style={style.flatten(['h3', 'color-text-high', 'text-center'])}>
      {children}
    </Text>
  );
};
export const registerHeaderOptions = {
  headerTitle: RegisterHeaderTitle,
  headerTitleAlign: 'center' as 'center' | 'left',
  headerBackVisible: false,
  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  headerShadowVisible: false,
  headerLeft: (props: any) => <HeaderBackButton {...props} />,
};

export const HeaderBackButton: FunctionComponent = () => {
  const style = useStyle();
  const navigation = useNavigation();
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
  const hideBackButton = route.params?.hideBackButton;

  return (
    <React.Fragment>
      {!hideBackButton ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={style.flatten(['padding-left-20'])}>
          <HeaderBackButtonIcon
            size={28}
            color={style.get('color-gray-300').color}
          />
        </Pressable>
      ) : null}
    </React.Fragment>
  );
};
