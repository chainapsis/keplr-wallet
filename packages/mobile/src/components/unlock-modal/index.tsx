import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {ScreenBackground} from '../page';
import {
  BackHandler,
  Dimensions,
  Platform,
  ScaledSize,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Box} from '../box';
import LottieView from 'lottie-react-native';
import {Gutter} from '../gutter';
import {TextInput} from '../input';
import {Button} from '../button';
import {TextButton} from '../text-button';
import delay from 'delay';
import {NeedHelpModal} from '../modal';
import Bugsnag from '@bugsnag/react-native';
import Animated from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAutoLock} from './provider';
import {registerModal} from '../modal/v2';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView,
);
const AutoLockLockModalBase: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [deviceSize, setDeviceSize] = useState<{
    width: number;
    height: number;
  }>(() => {
    const window = Dimensions.get('window');
    return {
      width: window.width,
      height: window.height,
    };
  });
  useLayoutEffect(() => {
    const fn = ({window}: {window: ScaledSize}) => {
      setDeviceSize({
        width: window.width,
        height: window.height,
      });
    };

    const listener = Dimensions.addEventListener('change', fn);
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <View
      style={{
        height: deviceSize.height,
      }}>
      {children}
    </View>
  );
};

export const AutoLockUnlockModal = registerModal(
  observer(() => {
    const {keyRingStore, keychainStore} = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);

    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricLoading, setIsBiometricLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();
    const autoUnlock = useAutoLock();

    //NOTE 안드로이드에서 Lock 모달이 있을때 뒤로가기 하면 기존 unlock페이지의 로직처럼 앱을 닫게 해야함

    const tryBiometric = async () => {
      try {
        setIsBiometricLoading(true);
        //NOTE 실제 lock 페이지와 비슷한 로딩 효과를 주기위해서 의도적으로 500 밀리초로 설정함
        await delay(500);
        const bioPassword = await keychainStore.getPasswordWithBiometry();
        const isCorrect = await keyRingStore.checkPassword(bioPassword);
        if (isCorrect) {
          autoUnlock.unlock();
        }
      } catch (e) {
        console.log(e);

        if (
          e.message !== 'User password mac unmatched' &&
          !e.message?.includes('User canceled the operation') &&
          !e.message?.includes('msg: Cancel') &&
          !e.message?.includes('msg: Fingerprint operation cancelled.') &&
          !e.message?.includes('password not set') &&
          !e.message?.includes('Failed to get credentials from keychain') &&
          !e.message?.includes('Failed to authenticate') &&
          !e.message?.includes(
            'The user name or passphrase you entered is not correct.',
          ) &&
          !e.message?.includes('Wrapped error: User not authenticated')
        ) {
          Bugsnag.notify(e);
        }
      } finally {
        setIsBiometricLoading(false);
      }
    };

    const tryUnlock = async (password: string) => {
      try {
        setIsLoading(true);
        await delay(500);
        const isCorrect = await keyRingStore.checkPassword(password);
        if (isCorrect) {
          autoUnlock.unlock();
          setIsLoading(false);
          return;
        }
        setError({name: 'invalid password', message: 'invalid password'});
      } catch (e) {
        console.log(e);

        if (
          e.message !== 'User password mac unmatched' &&
          !e.message?.includes('User canceled the operation') &&
          !e.message?.includes('msg: Cancel') &&
          !e.message?.includes('msg: Fingerprint operation cancelled.') &&
          !e.message?.includes('password not set') &&
          !e.message?.includes('Failed to get credentials from keychain') &&
          !e.message?.includes('Failed to authenticate') &&
          !e.message?.includes(
            'The user name or passphrase you entered is not correct.',
          ) &&
          !e.message?.includes('Wrapped error: User not authenticated')
        ) {
          Bugsnag.notify(e);
        }

        setIsLoading(false);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    const onPressSubmit = async () => {
      await tryUnlock(password);
    };

    return (
      <Box style={{flexGrow: 1}}>
        <ScreenBackground backgroundMode={'default'} />
        <View
          style={StyleSheet.flatten([
            style.flatten(
              ['flex-grow-1'],
              /*
             In android, overflow of container view is hidden by default.
             That's why even if you make overflow visible to the scroll view's style, it will behave like hidden unless you change the overflow property of this container view.
             This is done by the following reasons.
                - On Android, header or bottom tabbars are opaque by default, so overflow hidden is usually not a problem.
                - Bug where overflow visible is ignored for unknown reason if ScrollView has RefreshControl .
                - If the overflow of the container view is not hidden, even if the overflow of the scroll view is hidden, there is a bug that the refresh control created from above still appears outside the scroll view.
             */
              [Platform.OS !== 'ios' && 'overflow-hidden'],
            ),
          ])}>
          <AnimatedKeyboardAwareScrollView
            keyboardOpeningTime={0}
            extraHeight={100}
            enableOnAndroid={true}
            indicatorStyle={'white'}
            contentContainerStyle={style.flatten([
              'flex-grow-1',
              'padding-x-24',
            ])}>
            <Box style={{flex: 1}} alignY="center">
              <Box style={{flex: 1}} />

              <Box
                alignX="center"
                style={{zIndex: 2}}
                // backgroundColor={'red'}
              >
                <LottieView
                  source={require('../../public/assets/lottie/wallet/logo.json')}
                  style={{width: 200, height: 155}}
                />
                <Text style={style.flatten(['h1', 'color-text-high'])}>
                  <FormattedMessage id="page.unlock.paragraph-section.welcome-back" />
                </Text>
              </Box>

              <Box>
                <Gutter size={70} />

                <TextInput
                  label={intl.formatMessage({
                    id: 'page.unlock.bottom-section.password-input-label',
                  })}
                  value={password}
                  secureTextEntry={true}
                  returnKeyType="done"
                  onChangeText={setPassword}
                  onSubmitEditing={onPressSubmit}
                  error={
                    error
                      ? intl.formatMessage({id: 'error.invalid-password'})
                      : undefined
                  }
                />

                <Gutter size={34} />

                <Button
                  text={
                    keyRingStore.needMigration
                      ? intl.formatMessage({id: 'page.unlock.migration-button'})
                      : intl.formatMessage({id: 'page.unlock.unlock-button'})
                  }
                  size="large"
                  onPress={onPressSubmit}
                  loading={isLoading}
                  containerStyle={{width: '100%'}}
                />

                <Gutter size={32} />

                {keychainStore.isBiometryOn ? (
                  <TextButton
                    text="Use Biometric Authentication"
                    size="large"
                    loading={isBiometricLoading}
                    onPress={async () => {
                      await tryBiometric();
                    }}
                  />
                ) : null}
              </Box>

              <Box style={{flex: 1}} />

              <Box>
                <TextButton
                  color="faint"
                  text={intl.formatMessage({
                    id: 'page.unlock.need-help-button',
                  })}
                  size="large"
                  onPress={() => setIsOpenHelpModal(true)}
                />

                <Gutter size={32} />
              </Box>
            </Box>

            <NeedHelpModal
              isOpen={isOpenHelpModal}
              setIsOpen={setIsOpenHelpModal}
            />
          </AnimatedKeyboardAwareScrollView>
        </View>
      </Box>
    );
  }),
  {
    container: AutoLockLockModalBase,
    backHandler: () => {
      BackHandler.exitApp();
      return false;
    },
  },
);
