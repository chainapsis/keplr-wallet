/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FunctionComponent} from 'react';

import {StoreProvider} from './src/stores';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleProvider, useStyle} from './src/styles';
import {AppNavigation} from './src/navigation';
import {StatusBar} from 'react-native';

const ThemeStatusBar: FunctionComponent = () => {
  const style = useStyle();

  return (
    <StatusBar
      translucent={true}
      backgroundColor="#FFFFFF00"
      barStyle={style.get('status-bar-style')}
    />
  );
};

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StyleProvider>
        <ThemeStatusBar />
        <StoreProvider>
          <AppNavigation />
        </StoreProvider>
      </StyleProvider>
    </GestureHandlerRootView>
  );
}

export default App;
