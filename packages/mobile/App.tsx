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
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppIntlProvider} from './src/languages';

//NOTE - ios,android 둘다 폴리필 해줘야 해서 해당 방식으로 import 함
//import 순서가 중요함
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/ko';
import '@formatjs/intl-numberformat/polyfill';
import '@formatjs/intl-numberformat/locale-data/en';
import '@formatjs/intl-numberformat/locale-data/ko';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/ko'; // locale-data for en
import {ConfirmProvider} from './src/hooks/confirm';
import {InteractionModalsProvider} from './src/provider/interaction-modals-provider';
import {LoadingIconAnimationProvider} from './src/provider/loading-icon-animation';

const ThemeStatusBar: FunctionComponent = () => {
  const style = useStyle();

  style.setTheme('dark');

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
      <LoadingIconAnimationProvider>
        <StyleProvider>
          <SafeAreaProvider>
            <ThemeStatusBar />
            <StoreProvider>
              <AppIntlProvider>
                <BottomSheetModalProvider>
                  <ConfirmProvider>
                    <InteractionModalsProvider>
                      <AppNavigation />
                    </InteractionModalsProvider>
                  </ConfirmProvider>
                </BottomSheetModalProvider>
              </AppIntlProvider>
            </StoreProvider>
          </SafeAreaProvider>
        </StyleProvider>
      </LoadingIconAnimationProvider>
    </GestureHandlerRootView>
  );
}

export default App;
