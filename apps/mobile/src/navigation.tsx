import {observer} from 'mobx-react-lite';
import {FunctionComponent, useEffect} from 'react';
import {useStore} from './stores';
import {
  DarkTheme,
  DefaultTheme,
  DrawerActions,
  NavigationContainer,
  NavigatorScreenParams,
  useNavigation,
} from '@react-navigation/native';
import {useStyle} from './styles';
import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets,
} from '@react-navigation/stack';
import {HomeScreen} from './screen/home';
import {UnlockScreen} from './screen/unlock';
import {SendSelectAssetScreen} from './screen/send/select-asset';
import {createDrawerNavigator, useDrawerStatus} from '@react-navigation/drawer';
import {DrawerContent} from './components/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from './provider/focused-screen';
import {
  BrowserIcon,
  SettingIcon,
  HomeFilledIcon,
  HomeOutlinedIcon,
  SettingOutlinedIcon,
} from './components/icon';
import {
  HomeScreenHeaderTitle,
  defaultHeaderOptions,
  homeHeaderOptions,
  SuggestScreenHeaderRightFunc,
} from './components/pageHeader';
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
import {SettingSecurityChangePasswordScreen} from './screen/setting/screens/security/change-password';
import {SettingSecurityPermissionScreen} from './screen/setting/screens/security/permission';
import {SettingGeneralLanguageScreen} from './screen/setting/screens/general/language';
import {RegisterIntroScreen} from './screen/register/intro';
import {RegisterIntroNewUserScreen} from './screen/register/intro-new-user';
import {NewMnemonicScreen} from './screen/register/new-mnemonic';
import {VerifyMnemonicScreen} from './screen/register/verify-mnemonic';
import {RegisterIntroExistingUserScene} from './screen/register/intro-existing-user';
import {WebScreen} from './screen/web';
import {WebpageScreen} from './screen/web/webpage';
import {GovernanceListScreen} from './screen/governance/list';
import {GovernanceScreen} from './screen/governance';
import {FinalizeKeyScreen} from './screen/register/finalize-key';
import {PlainObject} from '@keplr-wallet/background';
import {EnableChainsScreen} from './screen/register/enable-chains';
import {RecoverMnemonicScreen} from './screen/register/recover-mnemonic';
import {WelcomeScreen} from './screen/register/welcome';
import {SelectDerivationPathScreen} from './screen/register/select-derivation-path';
import {ConnectHardwareWalletScreen} from './screen/register/connect-hardware';
import {ConnectLedgerScreen} from './screen/register/connect-ledger';
import {App} from '@keplr-wallet/ledger-cosmos';
import {
  SignDelegateScreen,
  SignUndelegateScreen,
  ValidatorDetailScreen,
  ValidatorListScreen,
  StakingDashboardScreen,
} from './screen/staking';
import {SignRedelegateScreen} from './screen/staking/redelegate';
import {SettingGeneralDeleteSuggestChainScreen} from './screen/setting/screens/general/delete-suggest-chain';
import {SettingSecurityBio} from './screen/setting/screens/security/bio-authentication';
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from './screen/tx-result';
import {SettingGeneralVersionScreen} from './screen/setting/screens/general/version';
import {CameraScreen} from './screen/camera';
import {SettingGeneralManageWalletConnectScreen} from './screen/setting/screens/security/wallet-connect';
import {
  RegisterHeaderTitleH4,
  registerHeaderOptions,
} from './components/pageHeader/header-register';
import {MigrationWelcomeScreen} from './screen/migration-welcome';
import {RegisterGoogleSignInScreen} from './screen/register/google-sign-in';
import {RegisterAppleSignInScreen} from './screen/register/apple-sign-in';
import {BackUpPrivateKeyScreen} from './screen/register/back-up-private-key';
import Bugsnag from '@bugsnag/react-native';
import {MigrationScreen} from './screen/unlock/migration';
import {BackupAccountListScreen} from './screen/backup/account-list';
import {BackupShowSensitiveScreen} from './screen/backup/show-sensitive';
import {
  ImportFromExtensionScreen,
  FinalizeImportFromExtensionScreen,
  DecryptedKeyRingDatasResponse,
} from './screen/register/import-from-extension';
import {SwapIcon} from './components/icon/swap.tsx';
import {IBCSwapScreen} from './screen/ibc-swap';
import {IBCSwapDestinationSelectAssetScreen} from './screen/ibc-swap/select-asset';
import {EditFavoriteUrlScreen} from './screen/web/edit-favorite';
import {SearchUrlScreen} from './screen/web/search';
import {FavoriteUrl} from './stores/webpage/types.ts';
import {Text} from 'react-native';
import {ActivitiesScreen} from './screen/activities';
import {DocumentFillIcon} from './components/icon/document-fill.tsx';
import {DocumentOutlinedIcon} from './components/icon/document-outliend.tsx';
import {TokenDetailScreen} from './screen/token-detail';

type DefaultRegisterParams = {
  hideBackButton?: boolean;
};

export type RootStackParamList = {
  Home?: {showAddressChainId?: string};
  'Home.Main': undefined;
  'Home.Stake.Dashboard': {chainId: string};
  Camera?: {
    importFromExtensionOnly?: boolean;
  };

  Register: undefined;
  'Register.Intro': undefined;
  'Register.Intro.NewUser'?: DefaultRegisterParams;
  'Register.Intro.ConnectHardware'?: DefaultRegisterParams;
  'Register.NewMnemonic'?: DefaultRegisterParams;
  'Register.VerifyMnemonic': {
    mnemonic: string;
    stepPrevious: number;
    stepTotal: number;
  } & DefaultRegisterParams;
  'Register.Intro.ExistingUser'?: DefaultRegisterParams;
  'Register.BackupPrivateKey': {
    name: string;
    password: string;
    privateKey: {
      hexValue: string;
      meta: PlainObject;
    };
    stepPrevious: number;
    stepTotal: number;
  };
  'Register.RecoverMnemonic'?: DefaultRegisterParams;
  'Register.ConnectLedger': {
    name: string;
    password: string;
    stepPrevious: number;
    stepTotal: number;
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    };
    app: App | 'Ethereum';
    // append mode일 경우 위의 name, password는 안쓰인다. 대충 빈 문자열 넣으면 된다.
    appendModeInfo?: {
      vaultId: string;
      afterEnableChains: string[];
    };
  } & DefaultRegisterParams;
  'Register.GoogleSignIn': {};
  'Register.AppleSignIn': {};
  'Register.ImportFromExtension': undefined;
  'Register.FinalizeImportFromExtension': {
    data: DecryptedKeyRingDatasResponse;
  };
  'Register.FinalizeKey': {
    name: string;
    password: string;
    stepPrevious: number;
    stepTotal: number;
    mnemonic?: {
      value: string;
      // If mnemonic is not recovered, but newly generated,
      // it should be set to true.
      isFresh?: boolean;
      bip44Path: {
        account: number;
        change: number;
        addressIndex: number;
      };
    };
    privateKey?: {
      hexValue: string;
      meta: PlainObject;
    };
    ledger?: {
      pubKey: Uint8Array;
      app: string;
      bip44Path: {
        account: number;
        change: number;
        addressIndex: number;
      };
    };
  };
  'Register.EnableChain': {
    vaultId: string;
    candidateAddresses?: {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[];
    isFresh?: boolean;
    skipWelcome?: boolean;
    initialSearchValue?: string;
    fallbackEthereumLedgerApp?: boolean;
    stepPrevious?: number;
    stepTotal?: number;
    password?: string;
  } & DefaultRegisterParams;
  'Register.SelectDerivationPath': {
    chainIds: string[];
    vaultId: string;
    totalCount: number;
    password?: string;
    skipWelcome?: boolean;
  };
  'Register.Welcome': {
    password?: string;
  };
  Send: {chainId: string; coinMinimalDenom: string; recipientAddress?: string};
  'Send.SelectAsset': {
    isIBCSwap?: boolean;
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
  };
  'Setting.Intro': undefined;

  'Setting.General': undefined;
  'Setting.General.Intro': undefined;
  'Setting.General.Lang': undefined;
  'Setting.General.Currency': undefined;
  'Setting.General.ContactList': {chainId?: string} | undefined;
  'Setting.General.ContactAdd': {chainId: string; editIndex?: number};
  'Setting.General.WC': undefined;
  'Setting.General.ManageNonActiveChains': undefined;
  'Setting.General.ManageChainVisibility': undefined;
  'Setting.General.Version': undefined;

  'Setting.SecurityAndPrivacy': undefined;
  'Setting.SecurityAndPrivacy.Intro': undefined;
  'Setting.SecurityAndPrivacy.Permission': undefined;
  'Setting.SecurityAndPrivacy.ManageWalletConnect': undefined;
  'Setting.SecurityAndPrivacy.ChangePassword': undefined;
  'Setting.SecurityAndPrivacy.BioAuthentication': undefined;

  'Setting.ManageTokenList': undefined;
  'Setting.ManageTokenList.Add':
    | {chainId?: string; contractAddress?: string}
    | undefined;

  Unlock?: {
    disableAutoBioAuth?: boolean;
  };
  Migration: {password: string};
  'Migration.Welcome': undefined;
  'Migration.Backup.AccountList': {
    password: string;
  };
  'Migration.Backup.ShowSensitive': {
    index: string;
    password: string;
    type?: 'mnemonic' | 'privateKey' | 'ledger' | 'keystone';
  };

  SelectWallet: undefined;
  'SelectWallet.Intro': undefined;
  'SelectWallet.Delete': {id: string};
  'SelectWallet.ChangeName': {id: string};
  'SelectWallet.ViewRecoveryPhrase': {id: string};

  Stake: NavigatorScreenParams<StakeNavigation>;
  Web: {url: string; isExternal: true};
  WebTab: NavigatorScreenParams<WebStackNavigation>;
  Governance: NavigatorScreenParams<GovernanceNavigation>;

  TxPending: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  TxSuccess: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  TxFail: {
    chainId: string;
    txHash: string;
    isEvmTx?: boolean;
  };
  Swap: {
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
    initialAmountFraction?: string;
    initialAmount?: string;
    initialRecipient?: string;
    initialMemo?: string;
    initialFeeCurrency?: string;
    initialFeeType?: string;
    initialGasAmount?: string;
    initialGasAdjustment?: string;
    tempSwitchAmount?: string;
  };
  'Swap.SelectAsset': {
    excludeKey: string;
    chainId?: string;
    coinMinimalDenom?: string;
    outChainId?: string;
    outCoinMinimalDenom?: string;
    initialAmountFraction?: string;
    initialAmount?: string;
    initialRecipient?: string;
    initialMemo?: string;
    initialFeeCurrency?: string;
    initialFeeType?: string;
    initialGasAmount?: string;
    initialGasAdjustment?: string;
    tempSwitchAmount?: string;
  };
  Activities: undefined;
  TokenDetail: {
    chainId: string;
    coinMinimalDenom: string;
  };
};

export type StakeNavigation = {
  'Stake.Dashboard': {chainId: string};
  'Stake.Staking': {chainId: string};
  'Stake.ValidateList': {
    chainId: string;
    validatorSelector?: (
      validatorAddress: string,
      validatorName: string,
    ) => void;
    fromDeepLink?: {
      userIdentifier: string;
      activityName: string;
    };
  };
  'Stake.ValidateDetail': {
    chainId: string;
    validatorAddress: string;
    validatorSelector?: (
      validatorAddress: string,
      validatorName: string,
    ) => void;
    fromDeepLink?: {
      userIdentifier: string;
      activityName: string;
    };
  };
  'Stake.Delegate': {
    chainId: string;
    validatorAddress: string;
    fromDeepLink?: {
      userIdentifier: string;
      activityName: string;
    };
  };
  'Stake.Undelegate': {
    chainId: string;
    validatorAddress: string;
  };
  'Stake.Redelegate': {
    chainId: string;
    validatorAddress: string;
  };
};

export type GovernanceNavigation = {
  'Governance.intro': undefined;
  'Governance.list': {chainId: string; isGovV1Supported?: boolean};
};

export type WebStackNavigation = {
  'Web.Intro': undefined;
  'Web.WebPage': {url: string};
  'Web.EditFavorite': {url: FavoriteUrl};
  'Web.Search': undefined;
};

export type StackNavProp = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const StakeStack = createStackNavigator<StakeNavigation>();
const GovernanceStack = createStackNavigator<GovernanceNavigation>();
const WebStack = createStackNavigator<WebStackNavigation>();

export const RegisterNavigation: FunctionComponent = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator
      initialRouteName="Register.Intro"
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        // headerShown: false,
      }}>
      <Stack.Screen
        name="Register.Intro"
        options={{headerShown: false}}
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        name="Register.Intro.NewUser"
        options={{
          title: intl.formatMessage({
            id: 'pages.register.intro-new-user.title',
          }),
          ...registerHeaderOptions,
        }}
        component={RegisterIntroNewUserScreen}
      />
      <Stack.Screen
        name="Register.Intro.ExistingUser"
        options={{
          title: intl.formatMessage({
            id: 'pages.register.intro-existing-user.title',
          }),
          ...registerHeaderOptions,
        }}
        component={RegisterIntroExistingUserScene}
      />
      <Stack.Screen
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.intro-new-user.title',
          }),
          ...registerHeaderOptions,
        }}
      />

      <Stack.Screen
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.verify-mnemonic.title',
          }),
          ...registerHeaderOptions,
        }}
      />

      <Stack.Screen
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.recover-mnemonic.title',
          }),
          ...registerHeaderOptions,
        }}
      />

      <Stack.Screen
        name="Register.GoogleSignIn"
        component={RegisterGoogleSignInScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.intro-new-user.sign-up-google-button',
          }),
          ...registerHeaderOptions,
        }}
      />

      <Stack.Screen
        name="Register.AppleSignIn"
        component={RegisterAppleSignInScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.intro-new-user.sign-up-apple-button',
          }),
          ...registerHeaderOptions,
        }}
      />
      <Stack.Screen
        name="Register.ImportFromExtension"
        component={ImportFromExtensionScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.import-from-extension.title',
          }),
          ...registerHeaderOptions,
        }}
      />

      <Stack.Screen
        name="Register.Intro.ConnectHardware"
        component={ConnectHardwareWalletScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.connect-hardware.header.title',
          }),
          ...registerHeaderOptions,
          headerTitle: RegisterHeaderTitleH4,
        }}
      />

      <Stack.Screen
        name="Register.BackupPrivateKey"
        component={BackUpPrivateKeyScreen}
        options={{
          title: intl.formatMessage({
            id: 'pages.register.back-up-private-key.title',
          }),
          ...registerHeaderOptions,
        }}
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
        swipeEnabled: focused.name === 'Home',
        swipeEdgeWidth: 9999,
        swipeMinDistance: 20,
        headerShown: false,
      }}
      drawerContent={DrawerContentFunc}>
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

const DrawerBottomTabLabel: FunctionComponent<{
  routeName: string;
  color: string;
}> = ({routeName, color}) => {
  const intl = useIntl();

  switch (routeName) {
    case 'Home':
      return (
        <Text style={{color}}>
          {intl.formatMessage({id: 'bottom-tabs.home'})}
        </Text>
      );
    case 'Swap':
      return (
        <Text style={{color}}>
          {intl.formatMessage({id: 'bottom-tabs.swap'})}
        </Text>
      );
    case 'WebTab':
      return (
        <Text style={{color}}>
          {intl.formatMessage({id: 'bottom-tabs.browser'})}
        </Text>
      );
    case 'Settings':
      return (
        <Text style={{color}}>
          {intl.formatMessage({id: 'bottom-tabs.settings'})}
        </Text>
      );
    case 'Activities':
      return (
        <Text style={{color}}>
          {intl.formatMessage({id: 'bottom-tabs.activity'})}
        </Text>
      );
  }

  return <></>;
};

const HomeScreenHeaderTitleFunc = () => <HomeScreenHeaderTitle />;
export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const focusedScreen = useFocusedScreen();
  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    if (
      focusedScreen.name !== 'Home' &&
      focusedScreen.name !== 'Swap' &&
      focusedScreen.name !== 'Activities' &&
      isDrawerOpen
    ) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({focused, color}) => {
          const size = 28;
          switch (route.name) {
            case 'Home':
              return focused ? (
                <HomeFilledIcon size={size} color={color} />
              ) : (
                <HomeOutlinedIcon size={size} color={color} />
              );
            case 'Swap':
              return <SwapIcon size={size} color={color} />;
            case 'WebTab':
              return <BrowserIcon size={size} color={color} />;
            case 'Settings':
              return focused ? (
                <SettingIcon size={size} color={color} />
              ) : (
                <SettingOutlinedIcon size={size} color={color} />
              );
            case 'Activities':
              return focused ? (
                <DocumentFillIcon size={size} color={color} />
              ) : (
                <DocumentOutlinedIcon size={size} color={color} />
              );
          }
        },
        tabBarLabel: ({color}) =>
          DrawerBottomTabLabel({routeName: route.name, color}),
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
      })}>
      <Tab.Screen
        name="Home"
        options={{
          headerTitle: HomeScreenHeaderTitleFunc,
          ...homeHeaderOptions,
        }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="Swap"
        options={{
          headerTitle: HomeScreenHeaderTitleFunc,
          ...homeHeaderOptions,
        }}
        component={IBCSwapScreen}
      />
      <Tab.Screen
        name="WebTab"
        options={{headerShown: false}}
        component={WebNavigation}
      />
      <Tab.Screen
        name="Activities"
        options={{
          headerTitle: HomeScreenHeaderTitleFunc,
          ...homeHeaderOptions,
        }}
        component={ActivitiesScreen}
      />
      <Tab.Screen
        name="Settings"
        options={{headerShown: false}}
        component={SettingNavigation}
      />
    </Tab.Navigator>
  );
};

const WebNavigation = () => {
  const intl = useIntl();

  return (
    <WebStack.Navigator
      initialRouteName="Web.Intro"
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
      <WebStack.Screen
        name="Web.Intro"
        options={{
          headerShown: false,
        }}
        component={WebScreen}
      />
      <WebStack.Screen
        name="Web.WebPage"
        options={{headerShown: false}}
        component={WebpageScreen}
      />

      <WebStack.Screen
        name="Web.EditFavorite"
        options={{
          title: intl.formatMessage({
            id: 'page.browser.edit-favorite.title',
          }),
          ...defaultHeaderOptions,
        }}
        component={EditFavoriteUrlScreen}
      />

      <WebStack.Group
        screenOptions={{...TransitionPresets.ModalSlideFromBottomIOS}}>
        <WebStack.Screen
          name="Web.Search"
          options={{headerShown: false}}
          component={SearchUrlScreen}
        />
      </WebStack.Group>
    </WebStack.Navigator>
  );
};

const SettingNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator
      initialRouteName="Setting.Intro"
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
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
    <Stack.Navigator
      initialRouteName="Setting.General"
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
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
        component={SettingGeneralLanguageScreen}
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
            id: 'page.setting.contacts.add.add-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingContactsAddScreen}
      />
      <Stack.Screen
        name="Setting.General.ManageNonActiveChains"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.manage-non-native-chains-title',
          }),
          headerRight: SuggestScreenHeaderRightFunc,
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralDeleteSuggestChainScreen}
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
      <Stack.Screen
        name="Setting.General.Version"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.general.version-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralVersionScreen}
      />
    </Stack.Navigator>
  );
};

const SettingSecurityAndPrivacyNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator
      initialRouteName="Setting.SecurityAndPrivacy.Intro"
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
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
        name="Setting.SecurityAndPrivacy.Permission"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security.connected-websites-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingSecurityPermissionScreen}
      />
      <Stack.Screen
        name="Setting.SecurityAndPrivacy.ManageWalletConnect"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security.manage-WC-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingGeneralManageWalletConnectScreen}
      />
      <Stack.Screen
        name="Setting.SecurityAndPrivacy.ChangePassword"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security.change-password-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingSecurityChangePasswordScreen}
      />
      <Stack.Screen
        name="Setting.SecurityAndPrivacy.BioAuthentication"
        options={{
          title: intl.formatMessage({
            id: 'page.setting.security.enable-bio-authentication-title',
          }),
          ...defaultHeaderOptions,
        }}
        component={SettingSecurityBio}
      />
    </Stack.Navigator>
  );
};

const SelectWalletNavigation = () => {
  const intl = useIntl();
  return (
    <Stack.Navigator
      initialRouteName="SelectWallet.Intro"
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
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

const StakeNavigation = () => {
  const intl = useIntl();
  return (
    <StakeStack.Navigator
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
      <StakeStack.Screen
        name="Stake.Dashboard"
        options={{
          title: '',
          ...defaultHeaderOptions,
        }}
        component={StakingDashboardScreen}
      />
      <StakeStack.Screen
        name="Stake.ValidateDetail"
        options={{
          title: intl.formatMessage({id: 'page.stake.validator-detail.title'}),
          ...defaultHeaderOptions,
        }}
        component={ValidatorDetailScreen}
      />
      <StakeStack.Screen
        name="Stake.ValidateList"
        options={{
          title: intl.formatMessage({id: 'page.stake.validator-list.title'}),
          ...defaultHeaderOptions,
        }}
        component={ValidatorListScreen}
      />
      <StakeStack.Screen
        name="Stake.Delegate"
        options={{
          title: intl.formatMessage({id: 'page.stake.delegate.title'}),
          ...defaultHeaderOptions,
        }}
        component={SignDelegateScreen}
      />
      <StakeStack.Screen
        name="Stake.Undelegate"
        options={{
          title: intl.formatMessage({id: 'page.stake.undelegate.title'}),
          ...defaultHeaderOptions,
        }}
        component={SignUndelegateScreen}
      />
      <StakeStack.Screen
        name="Stake.Redelegate"
        options={{
          title: intl.formatMessage({id: 'page.stake.redelegate.title'}),
          ...defaultHeaderOptions,
        }}
        component={SignRedelegateScreen}
      />
    </StakeStack.Navigator>
  );
};
const GovernanceNavigation = () => {
  const intl = useIntl();
  return (
    <GovernanceStack.Navigator
      screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
      <GovernanceStack.Screen
        name="Governance.intro"
        options={{
          title: intl.formatMessage({id: 'page.governance.intro.title'}),
          ...defaultHeaderOptions,
        }}
        component={GovernanceScreen}
      />
      <GovernanceStack.Screen
        name="Governance.list"
        options={{
          title: intl.formatMessage({id: 'page.governance.list.title'}),
          ...defaultHeaderOptions,
        }}
        component={GovernanceListScreen}
      />
    </GovernanceStack.Navigator>
  );
};

const {createNavigationContainer} = Bugsnag.getPlugin('reactNavigation') as any;
const BugsnagNavigationContainer =
  createNavigationContainer(NavigationContainer);

//TODO 이후 상태가 not-loaded일때 스플레시 스크린화면 처리 필요
export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();
  const intl = useIntl();
  style.setTheme('dark');

  if (keyRingStore.status === 'not-loaded') {
    return null;
  }
  return (
    <FocusedScreenProvider>
      <BugsnagNavigationContainer
        theme={style.theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator
          initialRouteName={(() => {
            switch (keyRingStore.status) {
              case 'locked':
                return 'Unlock';
              case 'unlocked':
                return 'Home';
              case 'empty':
                return 'Register';
              default:
                throw new Error('Unknown status');
            }
          })()}
          screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
          }}>
          <Stack.Screen
            name="Home"
            options={{headerShown: false}}
            component={MainTabNavigationWithDrawer}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Unlock"
            component={UnlockScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Migration"
            component={MigrationScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Migration.Welcome"
            component={MigrationWelcomeScreen}
          />
          <Stack.Screen
            name="Migration.Backup.AccountList"
            component={BackupAccountListScreen}
            options={{
              title: intl.formatMessage({id: 'page.migration.backup.title'}),
              ...defaultHeaderOptions,
            }}
          />
          <Stack.Screen
            name="Migration.Backup.ShowSensitive"
            component={BackupShowSensitiveScreen}
            options={{
              headerTitleAlign: 'center',
              headerStyle: {
                backgroundColor: style.get('color-gray-700').color,
              },
            }}
          />
          <Stack.Screen
            name="Register"
            options={{
              headerShown: false,
            }}
            component={RegisterNavigation}
          />
          <Stack.Screen
            name="Register.FinalizeImportFromExtension"
            component={FinalizeImportFromExtensionScreen}
            options={{
              title: 'Import from Keplr Extension',
              ...registerHeaderOptions,
            }}
          />
          <Stack.Screen
            name="Send"
            options={{
              title: intl.formatMessage({id: 'page.send.amount.title'}),
              ...defaultHeaderOptions,
            }}
            component={SendAmountScreen}
          />
          <Stack.Screen
            name="Send.SelectAsset"
            options={{
              title: intl.formatMessage({id: 'page.send.select-asset.title'}),
              ...defaultHeaderOptions,
            }}
            component={SendSelectAssetScreen}
          />
          <Stack.Screen
            name="SelectWallet"
            options={{headerShown: false}}
            component={SelectWalletNavigation}
          />
          <Stack.Screen
            name="Stake"
            options={{headerShown: false}}
            component={StakeNavigation}
          />
          <Stack.Screen
            name={'Web'}
            options={{headerShown: false}}
            component={WebpageScreen}
          />

          {/*NOTE Register와 Home을 통해서 이동하여 route를 최상위에도 올렸습니다*/}
          <Stack.Screen
            name="Register.FinalizeKey"
            options={{headerShown: false}}
            component={FinalizeKeyScreen}
          />

          <Stack.Screen
            name="Register.EnableChain"
            options={{
              title: intl.formatMessage({
                id: 'pages.register.enable-chains.title',
              }),
              ...registerHeaderOptions,
            }}
            component={EnableChainsScreen}
          />

          <Stack.Screen
            name="Register.Welcome"
            options={{headerShown: false}}
            component={WelcomeScreen}
          />

          <Stack.Screen
            name="Register.SelectDerivationPath"
            options={{
              title: intl.formatMessage({
                id: 'pages.register.select-derivation-path.title',
              }),
              ...registerHeaderOptions,
            }}
            component={SelectDerivationPathScreen}
          />

          <Stack.Screen
            name="Register.ConnectLedger"
            options={{
              title: intl.formatMessage({
                id: 'pages.register.connect-ledger.title',
              }),
              ...registerHeaderOptions,
              headerTitle: RegisterHeaderTitleH4,
            }}
            component={ConnectLedgerScreen}
          />

          <Stack.Screen
            name="Camera"
            options={{headerShown: false}}
            component={CameraScreen}
          />

          {/*NOTE 사이드바를 통해서 세팅으로 이동시 뒤로가기때 다시 메인으로 오기 위해서 해당 route들은 최상위에도 올렸습니다*/}
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
            name="Governance"
            options={{headerShown: false}}
            component={GovernanceNavigation}
          />
          <Stack.Screen
            name="TxPending"
            options={{headerShown: false}}
            component={TxPendingResultScreen}
          />
          <Stack.Screen
            name="TxSuccess"
            options={{headerShown: false}}
            component={TxSuccessResultScreen}
          />
          <Stack.Screen
            name="TxFail"
            options={{headerShown: false}}
            component={TxFailedResultScreen}
          />
          <Stack.Screen
            name="Swap.SelectAsset"
            options={{
              title: intl.formatMessage({
                id: 'page.send.select-asset.title',
              }),
              ...defaultHeaderOptions,
            }}
            component={IBCSwapDestinationSelectAssetScreen}
          />
          <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
        </Stack.Navigator>

        <DeepLinkNavigationComponent />
      </BugsnagNavigationContainer>
    </FocusedScreenProvider>
  );
});

export const DeepLinkNavigationComponent: FunctionComponent = observer(() => {
  const navigation = useNavigation<StackNavProp>();
  const {chainStore, deepLinkStore, keyRingStore} = useStore();

  (async () => {
    if (keyRingStore.status === 'unlocked' && deepLinkStore.needToNavigation) {
      // DeepLink, Applink, UniversalLink 등을 통해서 들어온 경우 체인이 enable 되어 있지 않으면 자동으로 enable 하도록 함.
      if (deepLinkStore.needToNavigation.params['chainId']) {
        if (
          !chainStore.isEnabledChain(
            deepLinkStore.needToNavigation.params['chainId'] as string,
          )
        ) {
          await chainStore.enableChainInfoInUI(
            deepLinkStore.needToNavigation.params['chainId'] as string,
          );
        }
      }

      // Wait for the navigation to be completed.
      setTimeout(() => {
        if (deepLinkStore.needToNavigation) {
          switch (deepLinkStore.needToNavigation.route) {
            case 'Coinbase.Staking.ValidateList': {
              navigation.navigate('Stake', {
                screen: 'Stake.ValidateList',
                params: {
                  chainId: deepLinkStore.needToNavigation.params[
                    'chainId'
                  ] as string,
                  fromDeepLink: {
                    userIdentifier: deepLinkStore.needToNavigation.params[
                      'userIdentifier'
                    ] as string,
                    activityName: deepLinkStore.needToNavigation.params[
                      'activityName'
                    ] as string,
                  },
                },
              });
              break;
            }
            case 'Coinbase.ShowAddress': {
              navigation.navigate('Home', {
                showAddressChainId: deepLinkStore.needToNavigation.params[
                  'showAddressChainId'
                ] as string,
              });

              break;
            }
            case 'Staking.ValidateDetail': {
              navigation.navigate('Stake', {
                screen: 'Stake.ValidateDetail',
                params: {
                  chainId: deepLinkStore.needToNavigation.params[
                    'chainId'
                  ] as string,
                  validatorAddress: deepLinkStore.needToNavigation.params[
                    'validatorAddress'
                  ] as string,
                },
              });
              break;
            }

            case 'Web.WebPage': {
              navigation.navigate('WebTab', {
                screen: 'Web.WebPage',
                params: {
                  url: deepLinkStore.needToNavigation.params['url'] as string,
                },
              });
              break;
            }
          }
        }

        deepLinkStore.clearNeedToNavigation();
      }, 0);
    }
  })();

  return <></>;
});
