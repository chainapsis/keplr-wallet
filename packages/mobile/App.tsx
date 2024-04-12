/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component, FunctionComponent} from 'react';

import {StoreProvider} from './src/stores';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleProvider, useStyle} from './src/styles';
import {AppNavigation} from './src/navigation';
import {I18nManager, Platform, Settings, StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppIntlProvider} from './src/languages';
import {AppUpdateProvider} from './src/provider/app-update';

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
import {APP_VERSION, CODEPUSH_VERSION} from './constants';
import {UpdateProgress} from './update-progress';
import {APP_STORE_URL, PLAY_STORE_URL} from './src/config';
import {simpleFetch} from '@keplr-wallet/simple-fetch';
import {LedgerBLEProvider} from './src/provider/ledger-ble';
import Bugsnag from '@bugsnag/react-native';
import {ImportFromExtensionProvider} from 'keplr-wallet-mobile-private';
import {AutoLock} from './src/components/unlock-modal';
import {setJSExceptionHandler} from 'react-native-exception-handler';
const semver = require('semver');

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
    changeNavigationBarColor(style.get('color-gray-700').color, false, true);
    return null;
  }
  changeNavigationBarColor('white', true, true);
  return null;
};

const BugSnagErrorBoundary =
  Bugsnag.getPlugin('react').createErrorBoundary(React);

interface AppUpdateWrapperState {
  codepushInitTestCompleted: boolean;
  codepushInitNewVersionExists: boolean;

  appVersion: string;
  codepush: {
    newVersion?: string;
    newVersionDownloadProgress?: number;
    currentVersion?: string;
  };
  store: {
    newVersionAvailable?: boolean;
    updateURL?: string;
  };

  restartAfter?: boolean;
}

setJSExceptionHandler((error: any) => {
  if (error instanceof Error) {
    Bugsnag.notify(error);
  } else if (typeof error === 'string') {
    Bugsnag.notify(new Error(error));
  } else {
    if (
      error &&
      typeof error === 'object' &&
      error.message &&
      typeof error.message === 'string'
    ) {
      Bugsnag.notify(new Error(error.message));
    }
  }
});

// API 구조상 꼭 class 형일 필요는 없는 것 같기도 하지만...
// codepush docs가 class 형으로만 설명하기 때문에 그냥 class 형으로 작성함.
class AppUpdateWrapper extends Component<{}, AppUpdateWrapperState> {
  override state: AppUpdateWrapperState = {
    codepushInitTestCompleted: false,
    codepushInitNewVersionExists: false,

    appVersion: APP_VERSION,
    codepush: {
      currentVersion: CODEPUSH_VERSION,
    },
    store: {},
  };

  override componentDidMount() {
    let once = false;

    const updateNotExists = () => {
      if (once) {
        return;
      }
      once = true;
      this.setState({
        ...this.state,
        codepushInitTestCompleted: true,
        codepushInitNewVersionExists: false,
      });
    };

    updateNotExists();

    this.init();
  }

  protected async init(): Promise<void> {
    this.crawlStoreUpdate();
  }

  protected async crawlStoreUpdate(): Promise<void> {
    while (true) {
      this.testStoreUpdate();

      // 10min
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }

  protected async testStoreUpdate(): Promise<void> {
    const baseURL = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

    const country =
      (() => {
        try {
          if (Platform.OS === 'ios') {
            const settings = Settings.get('AppleLocale');
            const locale: string = settings || settings?.[0];
            if (locale) {
              return locale.split('-')[0];
            }
          } else {
            const locale = I18nManager.getConstants().localeIdentifier;
            if (locale) {
              return locale.split('_')[0];
            }
          }
        } catch (e) {
          console.log(e);
          return 'en';
        }
      })() || 'en';

    const storeApiUrl =
      Platform.OS === 'ios'
        ? '/lookup?bundleId=com.chainapsis.keplrwallet'
        : '/store/apps/details?id=com.chainapsis.keplr';

    const response = await simpleFetch(baseURL, storeApiUrl);

    let iosTrackId: number | undefined;
    const versionFromStore = (() => {
      if (Platform.OS === 'ios') {
        // XXX: 어째서 results가 여러개일 수 있는지 모르겠음.
        const data = response.data as {
          resultCount: number;
          results: [{version: string; trackId: number}];
        };
        iosTrackId = data?.results[0]?.trackId;
        return data?.results[0]?.version;
      }

      return (() => {
        const text = response?.data as string;
        const match = text?.match(/Current Version.+?>([\d.-]+)<\/span>/);
        if (match) {
          return match[1].trim();
        }
        const matchNewLayout = text?.match(/\[\[\["([\d-.]+?)"\]\]/);
        if (matchNewLayout) {
          return matchNewLayout[1].trim();
        }
      })();
    })();

    try {
      if (
        versionFromStore &&
        semver.gt(versionFromStore, this.state.appVersion)
      ) {
        this.setState({
          ...this.state,
          store: {
            ...this.state.store,
            newVersionAvailable: true,
            updateURL:
              Platform.OS === 'ios'
                ? `https://apps.apple.com/${country}/app/keplr-wallet/id${iosTrackId}`
                : `https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=${country}`,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  restartApp() {
    // TODO
  }

  override render() {
    if (this.state.restartAfter) {
      return null;
    }

    return (
      <AppUpdateProvider
        value={{
          ...this.state,
          restartApp: () => {
            this.restartApp();
          },
        }}>
        <GestureHandlerRootView style={{flex: 1}}>
          <LoadingIconAnimationProvider>
            <StyleProvider>
              <SafeAreaProvider>
                <ThemeStatusBar />
                <ChangeNavigationColor />
                <StoreProvider>
                  <AppIntlProvider>
                    <NotificationProvider>
                      <LedgerBLEProvider>
                        <ModalBaseProvider>
                          <ConfirmProvider>
                            <InteractionModalsProvider>
                              <BugSnagErrorBoundary
                                FallbackComponent={ErrorBoundary}>
                                <AutoLock />
                                <ImportFromExtensionProvider>
                                  {(() => {
                                    if (
                                      this.state.codepushInitTestCompleted &&
                                      this.state.codepushInitNewVersionExists &&
                                      this.state.codepush
                                        .newVersionDownloadProgress != null
                                    ) {
                                      return (
                                        <UpdateProgress
                                          progress={
                                            this.state.codepush
                                              .newVersionDownloadProgress
                                          }
                                        />
                                      );
                                    }

                                    return <AppNavigation />;
                                  })()}
                                </ImportFromExtensionProvider>
                              </BugSnagErrorBoundary>
                            </InteractionModalsProvider>
                          </ConfirmProvider>
                        </ModalBaseProvider>
                      </LedgerBLEProvider>
                    </NotificationProvider>
                  </AppIntlProvider>
                </StoreProvider>
              </SafeAreaProvider>
            </StyleProvider>
          </LoadingIconAnimationProvider>
        </GestureHandlerRootView>
      </AppUpdateProvider>
    );
  }
}

export default AppUpdateWrapper;
