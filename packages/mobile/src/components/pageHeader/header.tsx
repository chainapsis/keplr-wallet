import React, {FunctionComponent, PropsWithChildren} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {MenuIcon, QRScanIcon} from '../icon';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {Box} from '../box';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderBackButtonIcon} from './icon/back';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack';

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

  return (
    <Box
      alignY="center"
      style={StyleSheet.flatten([
        style.flatten([
          'padding-bottom-18',
          'padding-x-20',
          'background-color-gray-700',
          'border-width-bottom-1',
          'border-color-gray-600',
        ]),
        {
          height: insect.top + 48,
          paddingTop: insect.top,
        },
      ])}>
      <View
        style={StyleSheet.flatten([
          style.flatten(['flex-row', 'justify-between', 'width-full']),
        ])}>
        <HomeScreenHeaderLeft />
        <Box>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={StyleSheet.flatten([
              style.flatten([
                'color-white',
                'h4',
                'width-160',
                'overflow-scroll',
                'text-center',
              ]),
            ])}>
            {keyRingStore.selectedKeyInfo?.name || 'Keplr Account'}
          </Text>
        </Box>
        <HomeScreenHeaderRight />
      </View>
    </Box>
  );
});

// const DefaultScreenHeader: FunctionComponent<NativeStackHeaderProps> = ({
//   route,
//   options,
// }) => {
//   const title = getHeaderTitle(options, route.name);
//   const style = useStyle();
//   const insect = useSafeAreaInsets();
//   return (
//     <View
//       style={StyleSheet.flatten([
//         style.flatten([
//           'text-center',
//           'flex-column',
//           'justify-center',
//           'padding-bottom-18',
//           'background-color-background-default',
//           'border-width-bottom-1',
//           'border-color-gray-600',
//         ]),
//         {
//           height: insect.top + 64,
//           paddingTop: insect.top,
//         },
//         options.headerStyle,
//       ])}>
//       <Text
//         style={StyleSheet.flatten([
//           style.flatten(['h4', 'color-white', 'text-center']),
//           options.headerStyle,
//         ])}>
//         {title}
//       </Text>
//     </View>
//   );
// };

const DefaultScreenHeaderTitle: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  return (
    <View style={StyleSheet.flatten([style.flatten(['padding-bottom-18'])])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['h4', 'color-white', 'text-center']),
        ])}>
        {children}
      </Text>
    </View>
  );
};
const DefaultScreenHeaderLeft: FunctionComponent<
  StackHeaderLeftButtonProps
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
  headerStyle: {
    backgroundColor: ColorPalette['gray-700'],
  },
  contentStyle: {
    borderTopWidth: 1,
    borderTopColor: ColorPalette['gray-600'],
  },
  headerLeft: (props: any) => <DefaultScreenHeaderLeft {...props} />,
};
