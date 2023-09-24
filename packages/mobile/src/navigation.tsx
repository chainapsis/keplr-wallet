import {observer} from 'mobx-react-lite';
import {FunctionComponent} from 'react';
import {useStore} from './stores';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useStyle} from './styles';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RegisterScreen} from './screen/register';
import {HomeScreen} from './screen/home';
import {LockedScreen} from './screen/locked';
import {RegisterEnableChainScreen} from './screen/register/enable-chain';
import {SendScreen} from './screen/send/select-asset';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  'Register.Intro': undefined;
  'Register.EnableChain': undefined;
  Send: undefined;
  Locked: undefined;
};

export type RegisterStackParamList = {
  Intro: undefined;
  EnableChain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

//TODO 이후 상태가 not-loaded일때 스플레시 스크린화면 처리 필요
export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const style = useStyle();

  if (keyRingStore.status === 'not-loaded') {
    return null;
  }
  return (
    <NavigationContainer
      theme={style.theme === 'dark' ? DefaultTheme : DarkTheme}>
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Locked" component={LockedScreen} />
        <Stack.Screen name="Register" component={RegisterNavigation} />
        <Stack.Screen name="Send" component={SendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
