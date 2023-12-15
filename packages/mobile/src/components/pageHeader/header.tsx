import React, {FunctionComponent, PropsWithChildren, useState} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {
  DrawerActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {Pressable, StyleSheet, Text} from 'react-native';
import {MenuIcon, QRScanIcon} from '../icon';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {HeaderBackButtonIcon} from './icon/back';
import {Columns} from '../column';
import {ArrowDownFillIcon} from '../icon/arrow-donw-fill';
import {StackNavProp} from '../../navigation';

const HomeScreenHeaderLeft: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
      style={style.flatten(['margin-left-20'])}>
      <MenuIcon size={28} color={style.flatten(['color-gray-10']).color} />
    </Pressable>
  );
};

const HomeScreenHeaderRight: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation<StackNavProp>();

  return (
    <Pressable
      onPress={() => {
        navigation.navigate('Camera');
      }}
      style={style.flatten(['margin-right-20'])}>
      <QRScanIcon size={28} color={style.flatten(['color-gray-10']).color} />
    </Pressable>
  );
};

export const HomeScreenHeaderTitle = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();
  const navigation = useNavigation();
  const [isPress, setInsPress] = useState(false);

  return (
    <Pressable
      onPressIn={() => setInsPress(true)}
      onPressOut={() => setInsPress(false)}
      onPress={() => {
        navigation.dispatch(StackActions.push('SelectWallet'));
      }}
      style={style.flatten(
        ['border-radius-6', 'padding-x-16', 'padding-y-8'],
        [isPress && 'background-color-gray-600'],
      )}>
      <Columns sum={1} alignY="center" gutter={6}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={StyleSheet.flatten([
            style.flatten([
              'color-white',
              'h4',
              'max-width-160',
              'overflow-scroll',
              'text-center',
            ]),
          ])}>
          {keyRingStore.selectedKeyInfo?.name || 'Keplr Account'}
        </Text>
        <ArrowDownFillIcon
          size={20}
          color={style.get('color-gray-400').color}
        />
      </Columns>
    </Pressable>
  );
});

export const homeHeaderOptions = {
  headerTitleAlign: 'center' as 'center' | 'left',
  headerBackVisible: false,
  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  headerShadowVisible: false,
  headerLeft: () => <HomeScreenHeaderLeft />,
  headerRight: () => <HomeScreenHeaderRight />,
};

const DefaultScreenHeaderTitle: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  return (
    <Text
      style={StyleSheet.flatten([
        style.flatten(['h4', 'color-white', 'text-center']),
      ])}>
      {children}
    </Text>
  );
};
const DefaultScreenHeaderLeft: FunctionComponent = () => {
  const style = useStyle();
  const nav = useNavigation();
  const isSettingIntro =
    nav.getState().routes[0].name === 'Setting.Intro' &&
    nav.getState().routes.length === 1;

  return (
    <React.Fragment>
      {nav.canGoBack() && !isSettingIntro ? (
        <Pressable
          onPress={() => {
            if (nav.canGoBack()) {
              nav.goBack();
            }
          }}
          style={StyleSheet.flatten([style.flatten(['padding-left-20'])])}>
          <HeaderBackButtonIcon
            size={28}
            color={style.get('color-gray-300').color}
          />
        </Pressable>
      ) : null}
    </React.Fragment>
  );
};

export const defaultHeaderOptions = {
  headerTitle: DefaultScreenHeaderTitle,
  headerTitleAlign: 'center' as 'center' | 'left',
  headerBackVisible: false,

  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  headerShadowVisible: false,
  headerLeft: (props: any) => <DefaultScreenHeaderLeft {...props} />,
};
