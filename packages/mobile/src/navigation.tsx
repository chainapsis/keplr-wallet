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
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {RegisterScreen} from './screen/register';
import {HomeScreen} from './screen/home';
import {LockedScreen} from './screen/locked';
import {RegisterEnableChainScreen} from './screen/register/enable-chain';
import {createDrawerNavigator, useDrawerStatus} from '@react-navigation/drawer';
import {DrawerContent} from './components/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from './provider/focused-screen';
import {WalletIcon, BrowserIcon, SettingIcon} from './components/icon';

import {HomeScreenHeader, defaultHeaderOptions} from './components/pageHeader';
import {SettingScreen} from './screen/setting';
import {SettingGeneralScreen} from './screen/setting/screens/general';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  'Register.Intro': undefined;
  'Register.EnableChain': undefined;
  'Setting.Intro': undefined;
  'Setting.General': undefined;
  Locked: undefined;
};
export type StackNavProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

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
        drawerType: 'front',
        overlayColor: style.flatten(['color-gray-700@50%']).color,
        gestureHandlerProps: {
          hitSlop: {},
        },
        swipeEnabled: focused.name === 'Home',
        headerShown: false,
      }}
      drawerContent={() => <DrawerContent />}>
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
  return (
    <Stack.Navigator initialRouteName="Setting.Intro">
      <Stack.Screen
        name="Setting.Intro"
        options={{
          title: 'Setting',
          ...defaultHeaderOptions,
        }}
        component={SettingScreen}
      />
      <Stack.Screen
        name="Setting.General"
        options={{
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
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
              ...defaultHeaderOptions,
            }}
            name="Locked"
            component={LockedScreen}
          />
          <Stack.Screen
            name="Register"
            options={{
              ...defaultHeaderOptions,
            }}
            component={RegisterNavigation}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FocusedScreenProvider>
  );
});
