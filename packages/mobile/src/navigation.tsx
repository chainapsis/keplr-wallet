import {observer} from 'mobx-react-lite';
import {FunctionComponent, useEffect} from 'react';
import {useStore} from './stores';
import {
  DarkTheme,
  DefaultTheme,
  DrawerActions,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {useStyle} from './styles';
import React from 'react';
import {
  NativeStackHeaderProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {RegisterScreen} from './screen/register';
import {HomeScreen} from './screen/home';
import {LockedScreen} from './screen/locked';
import {RegisterEnableChainScreen} from './screen/register/enable-chain';
import {createDrawerNavigator, useDrawerStatus} from '@react-navigation/drawer';
import {DrawerContent} from './components/drawer';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {QRScanIcon} from './components/icon';
import {MenuIcon} from './components/icon/menu';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from './provider/focused-screen';
import {SettingIcon} from './components/icon/setting';
import {BrowserIcon} from './components/icon/browser';
import {WalletIcon} from './components/icon/wallet';
import {getHeaderTitle} from '@react-navigation/elements';
import {Box} from './components/box';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  'Register.Intro': undefined;
  'Register.EnableChain': undefined;
  'Setting.Intro': undefined;
  Locked: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

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

const HomeScreenHeader = observer(() => {
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
          height: insect.top + 64,
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

// const DefaultScreenHeaderTitle: FunctionComponent<PropsWithChildren> = ({
//   children,
// }) => {
//   const style = useStyle();
//   return (
//     <View style={style.flatten(['padding-bottom-20', 'text-center'])}>
//       <Text style={style.flatten(['h4', 'color-white', 'text-center'])}>
//         {children}
//       </Text>
//     </View>
//   );
// };

const DefaultScreenHeader: FunctionComponent<NativeStackHeaderProps> = ({
  route,
  options,
}) => {
  const title = getHeaderTitle(options, route.name);
  const style = useStyle();
  const insect = useSafeAreaInsets();
  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          'text-center',
          'flex-column',
          'justify-center',
          'padding-bottom-18',
          'background-color-background-default',
          'border-width-bottom-1',
          'border-color-gray-600',
        ]),
        {
          height: insect.top + 64,
          paddingTop: insect.top,
        },
        options.headerStyle,
      ])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['h4', 'color-white', 'text-center']),
          options.headerStyle,
        ])}>
        {title}
      </Text>
    </View>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName="Register.Intro"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Register.Intro" component={RegisterScreen} />
      <Stack.Screen
        name="Register.EnableChain"
        component={RegisterEnableChainScreen}
      />
    </Stack.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  const style = useStyle();

  const focused = useFocusedScreen();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'slide',
        overlayColor: style.flatten(['color-gray-700@50%']).color,
        gestureHandlerProps: {
          hitSlop: {},
        },
        swipeEnabled: focused.name === 'Home',
        headerShown: false,
      }}
      drawerContent={DrawerContent}>
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const focusedScreen = useFocusedScreen();
  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    if (focusedScreen.name !== 'Home' && isDrawerOpen) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({color}) => {
          const size = 24;
          switch (route.name) {
            case 'Home':
              return <WalletIcon size={size} color={color} />;
            case 'Web':
              return <BrowserIcon size={size} color={color} />;
            case 'Settings':
              return <SettingIcon size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: style.flatten(['color-gray-50']).color,
        tabBarInactiveTintColor: style.flatten(['color-gray-400']).color,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: style.get('color-gray-600').color,
          backgroundColor: style.get('color-gray-700').color,
          elevation: 0,
          paddingLeft: 30,
          paddingRight: 30,
        },
        tabBarShowLabel: false,
      })}>
      <Tab.Screen
        name="Home"
        options={{
          header: () => <HomeScreenHeader />,
        }}
        component={HomeScreen}
      />
      <Tab.Screen name="Web" component={LockedScreen} />
      <Tab.Screen
        name="Settings"
        options={{headerShown: false}}
        component={SettingNavigation}
      />
    </Tab.Navigator>
  );
};

const SettingNavigation = () => {
  const style = useStyle();
  return (
    <Stack.Navigator initialRouteName="Setting.Intro">
      <Stack.Screen
        name="Setting.Intro"
        options={{
          title: 'Setting',
          header: DefaultScreenHeader,
          headerStyle: {...style.get('h3')} as any,
        }}
        component={LockedScreen}
      />
    </Stack.Navigator>
  );
};

//TODO 이후 상태가 not-loaded일때 스플레시 스크린화면 처리 필요
export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();

  if (keyRingStore.status === 'not-loaded') {
    return null;
  }
  return (
    <FocusedScreenProvider>
      <NavigationContainer
        theme={style.theme === 'light' ? DefaultTheme : DarkTheme}>
        <Stack.Navigator
          initialRouteName={(() => {
            switch (keyRingStore.status) {
              case 'locked':
                return 'Locked';
              case 'unlocked':
                return 'Home';
              case 'empty':
                return 'Register';
              default:
                throw new Error('Unknown status');
            }
          })()}>
          <Stack.Screen
            name="Home"
            options={{headerShown: false}}
            component={MainTabNavigationWithDrawer}
          />
          <Stack.Screen
            options={{
              header: DefaultScreenHeader,
            }}
            name="Locked"
            component={LockedScreen}
          />
          <Stack.Screen
            name="Register"
            options={{
              header: DefaultScreenHeader,
            }}
            component={RegisterNavigation}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FocusedScreenProvider>
  );
});
