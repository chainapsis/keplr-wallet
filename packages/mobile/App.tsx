/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FunctionComponent, Component} from 'react';

import {StoreProvider} from './src/stores';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleProvider, useStyle} from './src/styles';
import {AppNavigation} from './src/navigation';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
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
    newVersionAvailable?: string;
  };
}

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
    // Ensure that any CodePush updates which are
    // synchronized in the background can't trigger
    // a restart while this component is mounted.
    codePush.disallowRestart();

    let once = false;

    // 1초 안에 결과를 받지 못하면 그냥 업데이트 없는걸로 친다...
    setTimeout(() => {
      if (once) {
        return;
      }
      once = true;
      this.setState({
        ...this.state,
        codepushInitTestCompleted: true,
        codepushInitNewVersionExists: false,
      });
    }, 1000);

    codePush
      .checkForUpdate()
      .then(update => {
        if (once) {
          return;
        }
        once = true;

        if (update) {
          this.setState({
            ...this.state,
            codepushInitTestCompleted: true,
            codepushInitNewVersionExists: true,
            codepush: {
              ...this.state.codepush,
              newVersionDownloadProgress: 0,
            },
          });

          codePush.sync(
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

                codePush.allowRestart();
                // TODO: 이거 실제로는 restart를 못 시키고 그냥 exit 시키는 경우가 많음.
                //       코드푸쉬의 버그인 것 같은데 다른 방법을 찾아야함.
                //       아니면 코드푸쉬의 버그를 해결하던가...
                codePush.restartApp();
              }
            },
            ({receivedBytes, totalBytes}) => {
              this.setState({
                ...this.state,
                codepush: {
                  ...this.state.codepush,
                  newVersionDownloadProgress: Math.min(
                    receivedBytes / totalBytes,
                    // 1은 sync status handler가 처리함.
                    0.99,
                  ),
                },
              });
            },
          );
        } else {
          this.setState({
            ...this.state,
            codepushInitTestCompleted: true,
            codepushInitNewVersionExists: false,
          });
        }
      })
      .catch(err => {
        console.log(err);
        if (once) {
          return;
        }
        once = true;
        this.setState({
          ...this.state,
          codepushInitTestCompleted: true,
          codepushInitNewVersionExists: false,
        });
      });
  }

  override render() {
    return (
      <AppUpdateProvider value={this.state}>
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
      </AppUpdateProvider>
    );
  }
}

export default codePush({
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
})(AppUpdateWrapper);
