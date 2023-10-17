import React, {FunctionComponent, PropsWithChildren} from 'react';
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
import {Box} from '../box';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderBackButtonIcon} from './icon/back';
import {HeaderBackButtonProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import {Column, Columns} from '../column';
import {ArrowDownFillIcon} from '../icon/arrow-donw-fill';
import {IconButton} from '../icon-button';

const HomeScreenHeaderLeft: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}>
      <MenuIcon size={28} color={style.flatten(['color-gray-10']).color} />
    </Pressable>
  );
};

const HomeScreenHeaderRight: FunctionComponent = () => {
  const style = useStyle();

  // const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => {
        //TODO 이후 qr촬영 페이지로 넘겨야 함
        // navigation.navigate('');
      }}>
      <QRScanIcon size={28} color={style.flatten(['color-gray-10']).color} />
    </Pressable>
  );
};

export const HomeScreenHeader = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();
  const insect = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <Box
      alignY="center"
      style={StyleSheet.flatten([
        style.flatten([
          'padding-bottom-18',
          'padding-x-20',
          'background-color-gray-700',
        ]),
        {
          paddingTop: insect.top,
        },
      ])}>
      <Box style={StyleSheet.flatten([style.flatten(['width-full'])])}>
        <Columns sum={2}>
          <HomeScreenHeaderLeft />
          <Column weight={1} />
          <Columns sum={1} alignY="center">
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
            <IconButton
              hasRipple={true}
              icon={
                <ArrowDownFillIcon
                  size={20}
                  color={style.get('color-gray-200').color}
                />
              }
              onPress={() => {
                navigation.dispatch(StackActions.push('SelectWallet'));
              }}
            />
          </Columns>
          <Column weight={1} />

          <HomeScreenHeaderRight />
        </Columns>
      </Box>
    </Box>
  );
});

const DefaultScreenHeaderTitle: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  return (
    <Text
      style={StyleSheet.flatten([
        style.flatten([
          'h4',
          'color-white',
          'text-center',
          'padding-bottom-18',
        ]),
      ])}>
      {children}
    </Text>
  );
};
const DefaultScreenHeaderLeft: FunctionComponent<
  HeaderBackButtonProps
> = props => {
  const style = useStyle();
  const nav = useNavigation();
  return (
    <React.Fragment>
      {props.canGoBack ? (
        <Pressable
          onPress={() => {
            if (nav.canGoBack()) {
              nav.goBack();
            }
          }}
          style={StyleSheet.flatten([style.flatten(['padding-bottom-18'])])}>
          <HeaderBackButtonIcon
            size={28}
            color={style.get('color-white').color}
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
  contentStyle: {
    borderTopWidth: 1,
    borderTopColor: ColorPalette['gray-600'],
  },
  headerLeft: (props: any) => <DefaultScreenHeaderLeft {...props} />,
};