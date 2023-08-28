/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FunctionComponent} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {StoreProvider, useStore} from './src/stores';
import {observer} from 'mobx-react-lite';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

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
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StoreProvider>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <Test />
        </SafeAreaView>
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
