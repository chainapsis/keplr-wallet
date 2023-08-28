/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FunctionComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {StoreProvider, useStore} from './src/stores';
import {observer} from 'mobx-react-lite';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';

const Test: FunctionComponent = observer(() => {
  const {queriesStore} = useStore();
  const queries = queriesStore.get('cosmoshub');
  const balance = queries.queryBalances.getQueryBech32Address(
    'cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k',
  ).balances;

  return (
    <View style={styles.sectionContainer}>
      <Text>{balance.map(bal => bal.balance.toString()).join(', ')}</Text>
    </View>
  );
});

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StoreProvider>
        <NavigationContainer>
          <Test />
        </NavigationContainer>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
