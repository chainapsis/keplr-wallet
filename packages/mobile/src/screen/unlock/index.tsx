import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {useNavigation} from '@react-navigation/native';
import {WalletStatus} from '@keplr-wallet/stores';
import {autorun} from 'mobx';
import {StackNavProp} from '../../navigation';
import {PageWithScrollView} from '../../components/page';
import {Text} from 'react-native';
import {Box} from '../../components/box';
import LottieView from 'lottie-react-native';
import {Gutter} from '../../components/gutter';
import {TextInput} from '../../components/input';
import {Button} from '../../components/button';
import {TextButton} from '../../components/text-button';
import delay from 'delay';
import {NeedHelpModal} from '../../components/modal';
import Bugsnag from '@bugsnag/react-native';

export const UnlockScreen: FunctionComponent = observer(() => {
  const {keyRingStore, keychainStore, accountStore, chainStore} = useStore();

  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const tryBiometricAutoOnce = useRef(false);

  const waitAccountInit = useCallback(async () => {
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
  }, [accountStore, chainStore, keyRingStore]);

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
      await waitAccountInit();
      navigation.replace('Home');
    } catch (e) {
      console.log(e);

      if (
        e.message !== 'User password mac unmatched' &&
        e.message !== 'Failed to authenticate' &&
        !e.message?.includes('User canceled the operation')
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

      // Decryption needs slightly huge computation.
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // before the actually decryption is complete.
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keyRingStore.unlock(password);
      await waitAccountInit();
      navigation.replace('Home');
    } catch (e) {
      console.log(e);

      if (e.message !== 'User password mac unmatched') {
        Bugsnag.notify(e);
      }

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
          await waitAccountInit();

          navigation.replace('Home');
        } catch (e) {
          console.log(e);

          if (e.message !== 'User password mac unmatched') {
            Bugsnag.notify(e);
          }
        } finally {
          setIsBiometricLoading(false);
        }
      })();
    }
  }, [
    keyRingStore.needMigration,
    keyRingStore.status,
    keychainStore,
    keychainStore.isBiometryOn,
    navigation,
    waitAccountInit,
  ]);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.get('flex-grow-1')}
      style={style.flatten(['padding-x-24'])}
      keyboardShouldPersistTaps={'always'}>
      <Box style={{flex: 1}} alignX="center" alignY="center">
        <Box style={{flex: 1}} />

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

        <Gutter size={70} />

        <TextInput
          label={intl.formatMessage({
            id: 'page.unlock.bottom-section.password-input-label',
          })}
          value={password}
          containerStyle={{width: '100%'}}
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

        <Box style={{flex: 1}} />

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

      <NeedHelpModal isOpen={isOpenHelpModal} setIsOpen={setIsOpenHelpModal} />
    </PageWithScrollView>
  );
});
