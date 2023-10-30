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
import {SendSelectAssetScreen} from './screen/send/select-asset';
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

import {
  WalletSelectScreen,
  WalletDeleteScreen,
  WalletShowSensitiveScreen,
  WalletChangeNameScreen,
} from './screen/wallet';
import {useIntl} from 'react-intl';
import {SendAmountScreen} from './screen/send/amount';
import {
  SettingGeneralFiatScreen,
  SettingGeneralScreen,
} from './screen/setting/screens';
import {SettingContactsListScreen} from './screen/setting/screens/contacts/list';
import {SettingContactsAddScreen} from './screen/setting/screens/contacts/add';
import {SettingTokenListScreen} from './screen/setting/screens/token/manage';
import {SettingTokenAddScreen} from './screen/setting/screens/token/add';
import {SettingSecurityAndPrivacyScreen} from './screen/setting/screens/security/security';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  'Register.Intro': undefined;
  'Register.EnableChain': undefined;
  Send: undefined;
  'Send.SelectAsset': undefined;
  'Setting.Intro': undefined;

  'Setting.General': undefined;
  'Setting.General.Intro': undefined;
  'Setting.General.Lang': undefined;
  'Setting.General.Currency': undefined;
  'Setting.General.ContactList': {chainId?: string};
  'Setting.General.ContactAdd': {chainId: string; editIndex?: number};

  'Setting.General.Theme': undefined;
  'Setting.General.WC': undefined;
  'Setting.General.ManageNonActiveChains': undefined;
  'Setting.General.ManageChainVisibility': undefined;

  'Setting.SecurityAndPrivacy': undefined;
  'Setting.SecurityAndPrivacy.Intro': undefined;
  'Setting.SecurityAndPrivacy.ChangePassword': undefined;

  'Setting.ManageTokenList': undefined;
  'Setting.ManageTokenList.Add': {chainId?: string; contractAddress?: string};

  Locked: undefined;
  SelectWallet: undefined;
  'SelectWallet.Intro': undefined;
  'SelectWallet.Delete': {id: string};
  'SelectWallet.ChangeName': {id: string};
  'SelectWallet.ViewRecoveryPhrase': {id: string};
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

const DrawerContentFunc = () => <DrawerContent />;
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
      drawerContent={DrawerContentFunc}>
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

const HomeScreenHeaderFunc = () => <HomeScreenHeader />;
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
          header: HomeScreenHeaderFunc,
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
  const intl = useIntl();
  return (
    <Stack.Navigator initialRouteName="Setting.Intro">
      <Stack.Screen
        name="Setting.Intro"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingScreen}
      />
      <Stack.Screen
        name="Setting.General"
        options={{
          headerShown: false,
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralNavigation}
      />
      <Stack.Screen
        name="Setting.SecurityAndPrivacy"
        options={{
          headerShown: false,
          ...defaultHeaderOptions,
        }}
        component={SettingSecurityAndPrivacyNavigation}
      />
      <Stack.Screen
        name="Setting.ManageTokenList"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.manage-token-list-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingTokenListScreen}
      />
      <Stack.Screen
        name="Setting.ManageTokenList.Add"
        options={{
          title: intl.formatMessage({id: 'page.setting.token.add.title'}),
          ...defaultHeaderOptions,
        }}
        component={SettingTokenAddScreen}
      />
    </Stack.Navigator>
  );
};

const SettingGeneralNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator initialRouteName="Setting.General">
      <Stack.Screen
        name="Setting.General.Intro"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
      <Stack.Screen
        name="Setting.General.Lang"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.language-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
      <Stack.Screen
        name="Setting.General.Currency"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.currency-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralFiatScreen}
      />
      <Stack.Screen
        name="Setting.General.ContactList"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.contacts-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingContactsListScreen}
      />
      <Stack.Screen
        name="Setting.General.ContactAdd"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.contacts-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingContactsAddScreen}
      />
      <Stack.Screen
        name="Setting.General.Theme"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.theme-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
      <Stack.Screen
        name="Setting.General.ManageNonActiveChains"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.manage-non-native-chains-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
      <Stack.Screen
        name="Setting.General.ManageChainVisibility"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.manage-chain-visibility-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
    </Stack.Navigator>
  );
};

const SettingSecurityAndPrivacyNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator initialRouteName="Setting.SecurityAndPrivacy.Intro">
      <Stack.Screen
        name="Setting.SecurityAndPrivacy.Intro"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security-privacy-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingSecurityAndPrivacyScreen}
      />
      <Stack.Screen
        name="Setting.SecurityAndPrivacy.ChangePassword"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security.change-password-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralScreen}
      />
    </Stack.Navigator>
  );
};

const SelectWalletNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator initialRouteName="SelectWallet.Intro">
      <Stack.Screen
        name="SelectWallet.Intro"
        options={{
          title: intl.formatMessage({id: 'page.wallet.title'}),
          ...defaultHeaderOptions,
        }}
        component={WalletSelectScreen}
      />
      <Stack.Screen
        name="SelectWallet.Delete"
        options={{
          title: intl.formatMessage({
            id: 'page.wallet.keyring-item.dropdown.delete-wallet-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={WalletDeleteScreen}
      />
      <Stack.Screen
        name="SelectWallet.ChangeName"
        options={{
          title: intl.formatMessage({
            id: 'page.wallet.keyring-item.dropdown.change-wallet-name-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={WalletChangeNameScreen}
      />
      <Stack.Screen
        name="SelectWallet.ViewRecoveryPhrase"
        options={{
          ...defaultHeaderOptions,
        }}
        component={WalletShowSensitiveScreen}
      />
    </Stack.Navigator>
  );
};

//TODO 이후 상태가 not-loaded일때 스플레시 스크린화면 처리 필요
export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();
  style.setTheme('dark');

  if (keyRingStore.status === 'not-loaded') {
    return null;
  }
  return (
    <FocusedScreenProvider>
      <NavigationContainer
        theme={style.theme === 'dark' ? DarkTheme : DefaultTheme}>
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
          <Stack.Screen
            name="Send"
            options={{
              ...defaultHeaderOptions,
            }}
            component={SendAmountScreen}
          />
          <Stack.Screen
            name="Send.SelectAsset"
            options={{
              ...defaultHeaderOptions,
              headerTitle: 'Send',
            }}
            component={SendSelectAssetScreen}
          />
          <Stack.Screen
            name="SelectWallet"
            options={{headerShown: false}}
            component={SelectWalletNavigation}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FocusedScreenProvider>
  );
});
