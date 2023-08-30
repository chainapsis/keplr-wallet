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

//TODO 이후 상태가 not-loaded일때 스플레시 스크린화면 처리 필요
export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const Stack = createNativeStackNavigator();
  const style = useStyle();

  return (
    <NavigationContainer
      theme={style.theme === 'light' ? DefaultTheme : DarkTheme}>
      <Stack.Navigator
        initialRouteName={
          keyRingStore.status === 'locked'
            ? 'Locked'
            : keyRingStore.status === 'unlocked'
            ? 'Home'
            : keyRingStore.status === 'empty'
            ? 'Register'
            : 'Splash'
        }>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Locked" component={LockedScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Splash" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
