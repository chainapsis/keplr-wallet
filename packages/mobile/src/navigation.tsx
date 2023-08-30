import {observer} from 'mobx-react-lite';
import {FunctionComponent} from 'react';
import {useStore} from './stores';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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

export const AppNavigation: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const Stack = createNativeStackNavigator();
  const style = useStyle();

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={style.theme === 'light' ? DefaultTheme : DarkTheme}>
        <Stack.Navigator
          initialRouteName={
            keyRingStore.status === 'locked'
              ? 'Locked'
              : keyRingStore.status === 'unlocked'
              ? 'Home'
              : 'Register'
          }>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Unlocked" component={LockedScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});
