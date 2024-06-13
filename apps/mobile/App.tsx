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
import {
  I18nManager,
  Linking,
  PermissionsAndroid,
  Platform,
  Settings,
  StatusBar,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppIntlProvider} from './src/languages';
import codePush from 'react-native-code-push';
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
import {AsyncKVStore} from './src/common';
import {AutoLock} from './src/components/unlock-modal';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

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

  protected lastTimeout?: number;

  protected firebaseForegroundNotification?: () => void;
  protected notifeeForegroundNotification?: () => void;
  protected firebaseOpenApp?: () => void;

  override componentDidMount() {
    // Ensure that any CodePush updates which are
    // synchronized in the background can't trigger
    // a restart while this component is mounted.
    codePush.disallowRestart();

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

      codePush.notifyAppReady().catch(err => {
        console.log(err);
      });
    };

    // 1초 안에 결과를 받지 못하면 그냥 업데이트 없는걸로 친다...
    // (하지만 install 후 최초의 시도일 경우 3초 동안 기다린다)
    const kvStore = new AsyncKVStore('app-update');
    kvStore.get('first-codepush-check').then(firstCheck => {
      if (firstCheck) {
        setTimeout(() => {
          updateNotExists();
        }, 1000);
      } else {
        setTimeout(() => {
          updateNotExists();
        }, 3000);
        kvStore.set('first-codepush-check', true);
      }
    });

    codePush
      .checkForUpdate()
      .then(update => {
        if (update) {
          if (once) {
            return;
          }
          once = true;

          this.setState({
            ...this.state,
            codepushInitTestCompleted: true,
            codepushInitNewVersionExists: true,
            codepush: {
              ...this.state.codepush,
              newVersion: update.label,
              newVersionDownloadProgress: 0,
            },
          });

          codePush
            .sync(
              {
                installMode: codePush.InstallMode.ON_NEXT_RESTART,
              },
              status => {
                if (status === codePush.SyncStatus.UPDATE_INSTALLED) {
                  this.setState({
                    ...this.state,
                    codepush: {
                      ...this.state.codepush,
                      newVersionDownloadProgress: 1,
                    },
                  });

                  this.restartApp();
                }
              },
              ({receivedBytes, totalBytes}) => {
                const beforeNewVersionDownloadProgress =
                  this.state.codepush.newVersionDownloadProgress || 0;
                const _newVersionDownloadProgress = Math.min(
                  receivedBytes / totalBytes,
                  // 1은 sync status handler가 처리함.
                  0.99,
                );

                // XXX 여기서 매번 업데이트 시키면 context api에 의해서
                // 매번 렌더링이 일어나서 성능이 떨어질 수 있음.
                // 이 문제를 완화하기 위해서 0.1 단위로만 업데이트를 시킴.
                if (
                  Math.floor(beforeNewVersionDownloadProgress * 10) !==
                  Math.floor(_newVersionDownloadProgress * 10)
                ) {
                  this.setState({
                    ...this.state,
                    codepush: {
                      ...this.state.codepush,
                      newVersionDownloadProgress: _newVersionDownloadProgress,
                    },
                  });
                }
              },
            )
            .catch(err => {
              console.log(err);
            });
        } else {
          updateNotExists();
        }
      })
      .catch(err => {
        console.log(err);
        updateNotExists();
      });

    this.init();
  }

  protected async init(): Promise<void> {
    this.crawlStoreUpdate();
    this.crawlCodepushUpdate();
    this.initPushNotification();
  }

  protected async crawlStoreUpdate(): Promise<void> {
    while (true) {
      this.testStoreUpdate();

      // 10min
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }

  protected async crawlCodepushUpdate(): Promise<void> {
    while (true) {
      // 5min
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

      codePush
        .checkForUpdate()
        .then(update => {
          if (update) {
            this.setState({
              ...this.state,
              codepush: {
                ...this.state.codepush,
                newVersion: update.label,
                newVersionDownloadProgress: 0,
              },
            });

            codePush
              .sync(
                {
                  installMode: codePush.InstallMode.ON_NEXT_RESTART,
                },
                status => {
                  if (status === codePush.SyncStatus.UPDATE_INSTALLED) {
                    this.setState({
                      ...this.state,
                      codepush: {
                        ...this.state.codepush,
                        newVersionDownloadProgress: 1,
                      },
                    });
                  }
                },
                () => {
                  // noop
                  // XXX: 이 경우 아직 UI에서 progress를 보여주지 않는다...
                  //      그러므로 굳이 context를 업데이트해서 re-rendering을 일으키지 않도록 한다.
                },
              )
              .catch(err => {
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });
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

  protected async initPushNotification(): Promise<void> {
    let enabled = false;

    // 각 플랫폼별로 권한을 요청함.
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['POST_NOTIFICATIONS'],
      );

      if (status === 'granted') {
        enabled = true;
      }
    }

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    }

    if (enabled) {
      this.firebaseForegroundNotification = messaging().onMessage(
        async remoteMessage => {
          // Create a channel (required for Android)
          const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
          });

          if (
            remoteMessage.notification?.title &&
            remoteMessage.notification?.body
          ) {
            // Firebase를 통해 노티가 왔을 때 Notifee를 통해 노티를 띄움
            await notifee.displayNotification({
              title: remoteMessage.notification?.title,
              body: remoteMessage.notification?.body,
              android: {
                channelId,
              },
            });
          }
        },
      );

      this.notifeeForegroundNotification = notifee.onForegroundEvent(
        ({type}) => {
          if (type === EventType.PRESS) {
            // 유저가 내부 알림을 눌렀을 때 딥링크 테스트
            Linking.openURL(
              'keplrwallet://staking?chainId=cosmoshub-4&validatorAddress=cosmosvaloper1gf3dm2mvqhymts6ksrstlyuu2m8pw6dhfp9md2',
            );
          }
        },
      );

      this.firebaseOpenApp = messaging().onNotificationOpenedApp(
        notification => {
          console.log(
            'Notification opened by tapping on the notification',
            JSON.stringify(notification),
          );

          // 유저가 백그라운드 알람을 눌렀을 때 딥링크 테스트
          Linking.openURL(
            'keplrwallet://staking?chainId=cosmoshub-4&validatorAddress=cosmosvaloper1gf3dm2mvqhymts6ksrstlyuu2m8pw6dhfp9md2',
          );
        },
      );
    }
  }

  override componentWillUnmount() {
    if (this.firebaseForegroundNotification) {
      this.firebaseForegroundNotification();
    }

    if (this.notifeeForegroundNotification) {
      this.notifeeForegroundNotification();
    }

    if (this.firebaseOpenApp) {
      this.firebaseOpenApp();
    }
  }

  restartApp() {
    if (Platform.OS === 'ios') {
      codePush.allowRestart();
      codePush.restartApp();
    } else {
      codePush.allowRestart();
      // https://github.com/microsoft/react-native-code-push/issues/2567#issuecomment-1820827232
      this.setState({
        ...this.state,
        restartAfter: true,
      });

      setTimeout(() => {
        codePush.restartApp();
      }, 500);
    }
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

export default codePush({
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
})(AppUpdateWrapper);
