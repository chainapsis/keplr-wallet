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
import {NotificationProvider} from './src/hooks/notification';
import {ModalBaseProvider} from './src/components/modal/v2/provider';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {ErrorBoundary} from './error-boundary';

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

const ChangeNavigationColor: FunctionComponent = () => {
  const style = useStyle();

  if (style.theme === 'dark') {
    changeNavigationBarColor(style.get('color-gray-700').color);
    return null;
  }
  changeNavigationBarColor('white');
  return null;
};

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <LoadingIconAnimationProvider>
        <StyleProvider>
          <SafeAreaProvider>
            <ThemeStatusBar />
            <ChangeNavigationColor />
            <StoreProvider>
              <AppIntlProvider>
                <NotificationProvider>
                  <ModalBaseProvider>
                    <BottomSheetModalProvider>
                      <ConfirmProvider>
                        <InteractionModalsProvider>
                          <ErrorBoundary>
                            <AppNavigation />
                          </ErrorBoundary>
                        </InteractionModalsProvider>
                      </ConfirmProvider>
                    </BottomSheetModalProvider>
                  </ModalBaseProvider>
                </NotificationProvider>
              </AppIntlProvider>
            </StoreProvider>
          </SafeAreaProvider>
        </StyleProvider>
      </LoadingIconAnimationProvider>
    </GestureHandlerRootView>
  );
}

export default App;
