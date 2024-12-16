import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {IAccountStore, IChainStore, WalletStatus} from '@keplr-wallet/stores';
import {autorun} from 'mobx';
import {RootStackParamList, StackNavProp} from '../../navigation';
import {Keyboard, Platform, Text} from 'react-native';
import {Box} from '../../components/box';
import LottieView from 'lottie-react-native';
import {Gutter} from '../../components/gutter';
import {TextInput} from '../../components/input';
import {Button} from '../../components/button';
import {TextButton} from '../../components/text-button';
import delay from 'delay';
import {NeedHelpModal} from '../../components/modal';
import Bugsnag from '@bugsnag/react-native';
import {useAppUpdate} from '../../provider/app-update';
import {KeyRingStore} from '@keplr-wallet/stores-core';
import Reanimated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const waitAccountInit = async (
  chainStore: IChainStore,
  accountStore: IAccountStore,
  keyRingStore: KeyRingStore,
) => {
  if (keyRingStore.status === 'unlocked') {
    for (const chainInfo of chainStore.chainInfos) {
      const account = accountStore.getAccount(chainInfo.chainId);
      if (account.walletStatus === WalletStatus.NotInit) {
        account.init();
      }
    }

    await new Promise<void>(resolve => {
      const disposal = autorun(() => {
        // account init은 동시에 발생했을때 debounce가 되므로
        // 첫번째꺼 하나만 확인해도 된다.
        if (
          accountStore.getAccount(chainStore.chainInfos[0].chainId)
            .bech32Address
        ) {
          resolve();
          if (disposal) {
            disposal();
          }
        }
      });
    });
  }
};

export const UnlockScreen: FunctionComponent = observer(() => {
  const {keyRingStore, keychainStore, accountStore, chainStore, uiConfigStore} =
    useStore();

  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const appUpdate = useAppUpdate();
  const route = useRoute<RouteProp<RootStackParamList, 'Unlock'>>();
  const {disableAutoBioAuth} = route.params ?? {};

  const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // 코드푸쉬 업데이트가 있는지 확인되기 전에 interaction을 하면 애매해지기 때문에
    // 그 전에는 UI로부터의 interaction을 막는다.
    if (appUpdate.codepushInitTestCompleted) {
      if (appUpdate.codepushInitNewVersionExists) {
        setIsReady(false);
      } else {
        setIsReady(true);
      }
    } else {
      setIsReady(false);
    }
  }, [
    appUpdate.codepushInitNewVersionExists,
    appUpdate.codepushInitTestCompleted,
  ]);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const tryBiometricAutoOnce = useRef(false);

  const tryBiometric = async () => {
    try {
      setIsBiometricLoading(true);
      await delay(10);

      if (keyRingStore.needMigration) {
        const bioPassword = await keychainStore.getPasswordWithBiometry();
        await keyRingStore.checkLegacyKeyRingPassword(bioPassword);
        navigation.reset({
          routes: [
            {
              name: 'Migration.Backup.AccountList',
              params: {password: bioPassword},
            },
          ],
        });
        return;
      }

      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // So to make sure that the loading state changes, just wait very short time.
      await keychainStore.tryUnlockWithBiometry();
      await waitAccountInit(chainStore, accountStore, keyRingStore);
      navigation.replace('Home');
    } catch (e) {
      console.log(e);

      Bugsnag.notify(e);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const tryUnlock = async (password: string) => {
    try {
      setIsLoading(true);

      // Decryption needs slightly huge computation.
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // before the actually decryption is complete.
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keyRingStore.unlock(password);
      uiConfigStore.setUserPassword(password);
      await waitAccountInit(chainStore, accountStore, keyRingStore);
      navigation.replace('Home');
    } catch (e) {
      console.log(e);

      Bugsnag.notify(e);

      setIsLoading(false);
      setError(e.message);
    }
  };

  const onPressSubmit = async () => {
    if (keyRingStore.needMigration) {
      try {
        setIsLoading(true);

        await keyRingStore.checkLegacyKeyRingPassword(password);

        navigation.reset({
          routes: [{name: 'Migration.Backup.AccountList', params: {password}}],
        });

        setError(undefined);
      } catch (e) {
        console.log(e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    } else {
      await tryUnlock(password);
    }
  };

  //For a one-time biometric authentication
  useEffect(() => {
    if (
      !tryBiometricAutoOnce.current &&
      isReady &&
      !disableAutoBioAuth &&
      keychainStore.isBiometryOn &&
      keyRingStore.status === 'locked' &&
      !keyRingStore.needMigration
    ) {
      tryBiometricAutoOnce.current = true;
      (async () => {
        try {
          setIsBiometricLoading(true);
          // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
          // So to make sure that the loading state changes, just wait very short time.
          await delay(10);

          await keychainStore.tryUnlockWithBiometry();
          await waitAccountInit(chainStore, accountStore, keyRingStore);

          navigation.replace('Home');
        } catch (e) {
          console.log(e);

          Bugsnag.notify(e);
        } finally {
          setIsBiometricLoading(false);
        }
      })();
    }
  }, [
    accountStore,
    chainStore,
    disableAutoBioAuth,
    isReady,
    keyRingStore,
    keyRingStore.needMigration,
    keyRingStore.status,
    keychainStore,
    keychainStore.isBiometryOn,
    navigation,
  ]);

  const safeAreaInsets = useSafeAreaInsets();

  const keyboard = (() => {
    // ios에서만 keyboard height를 고려한다.
    // 안드로이드는 의외로 지혼자 keyboard 처리가 잘 된다...
    // 당연히 platform이 동적으로 바뀔 순 없으므로 linter를 무시한다.
    if (Platform.OS === 'ios') {
      return useAnimatedKeyboard();
    } else {
      return {
        height: {
          value: 0,
        },
      };
    }
  })();

  const viewStyle = useAnimatedStyle(() => {
    return {
      paddingTop: safeAreaInsets.top,
      paddingBottom: Math.max(safeAreaInsets.bottom, keyboard.height.value),
    };
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Reanimated.View
        style={[
          viewStyle,
          {...style.flatten(['height-full', 'padding-x-24'])},
        ]}>
        <Box alignY="center" style={{flexGrow: 1}}>
          <Box style={{flex: 1}} />

          <Box alignX="center">
            <LottieView
              source={require('../../public/assets/lottie/wallet/logo.json')}
              style={{width: 200, height: 155}}
              autoPlay={keyRingStore.needMigration}
              loop={keyRingStore.needMigration}
            />

            {keyRingStore.needMigration ? (
              <React.Fragment>
                <Text style={style.flatten(['h1', 'color-text-high'])}>
                  <FormattedMessage id="page.unlock.paragraph-section.keplr-here" />
                </Text>

                <Gutter size={12} />

                <Text style={style.flatten(['subtitle4', 'color-gray-200'])}>
                  <FormattedMessage id="page.unlock.paragraph-section.enter-password-to-upgrade" />
                </Text>
              </React.Fragment>
            ) : (
              <Text style={style.flatten(['h1', 'color-text-high'])}>
                <FormattedMessage id="page.unlock.paragraph-section.welcome-back" />
              </Text>
            )}
          </Box>

          <Box
            style={{
              opacity: isReady ? 1 : 0,
            }}>
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
                text={intl.formatMessage({
                  id: 'page.setting.security.bio-authentication-title',
                })}
                size="large"
                loading={isBiometricLoading}
                onPress={async () => {
                  await tryBiometric();
                }}
              />
            ) : null}
          </Box>

          <Box style={{flex: 1}} />

          <Box
            style={{
              opacity: isReady ? 1 : 0,
            }}>
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
      </Reanimated.View>

      <NeedHelpModal isOpen={isOpenHelpModal} setIsOpen={setIsOpenHelpModal} />
    </TouchableWithoutFeedback>
  );
});
