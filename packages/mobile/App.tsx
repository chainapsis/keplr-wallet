/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FunctionComponent} from 'react';
import {Text, View} from 'react-native';

import {StoreProvider, useStore} from './src/stores';
import {observer} from 'mobx-react-lite';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {StyleProvider, useStyle} from './src/styles';

const Test: FunctionComponent = observer(() => {
  const {queriesStore} = useStore();
  const queries = queriesStore.get('cosmoshub');
  const balance = queries.queryBalances.getQueryBech32Address(
    'cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k',
  ).balances;

  const style = useStyle();

  return (
    <View style={style.flatten(['flex-1', 'padding-top-16', 'padding-x-16'])}>
      <Text>{balance.map(bal => bal.balance.toString()).join(', ')}</Text>
    </View>
  );
});

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StyleProvider>
        <StoreProvider>
          <NavigationContainer>
            <Test />
          </NavigationContainer>
        </StoreProvider>
      </StyleProvider>
    </GestureHandlerRootView>
  );
}

export default App;
