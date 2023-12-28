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
import {GuideBox} from '../../components/guide-box';
import {XAxis} from '../../components/axis';
import {SVGLoadingIcon} from '../../components/spinner';
import {NeedHelpModal} from '../../components/modal';

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
  const [isMigrationSecondPhase, setIsMigrationSecondPhase] = useState(false);
  // 유저가 enter를 누르고 처리하는 딜레이 동안 키보드를 또 누를수도 있다...
  // 그 경우를 위해서 따로 state를 관리한다.
  const [migrationSecondPhasePassword, setMigrationSecondPhasePassword] =
    useState('');

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

  const tryBiometric = useCallback(async () => {
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
    } finally {
      setIsBiometricLoading(false);
    }
  }, [keychainStore, navigation, waitAccountInit]);

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
      if (keyRingStore.needMigration) {
        //migration 확인 페이지로 이동
        return;
      }
      navigation.replace('Migration.Welcome');
    } catch (e) {
      console.log(e);

      setIsLoading(false);
      setError(e.message);
    }
  };

  const onPressSubmit = async () => {
    if (isMigrationSecondPhase) {
      // Migration은 enter를 눌러서 진행할 수 없고 명시적으로 버튼을 눌러야한다.
      // 근데 사실 migration 버튼은 type이 button이라 onSubmit이 발생할일은 없음.
      return;
    }

    if (keyRingStore.needMigration) {
      try {
        setIsLoading(true);

        await keyRingStore.checkLegacyKeyRingPassword(password);
        setIsMigrationSecondPhase(true);
        setMigrationSecondPhasePassword(password);

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
      style={style.flatten(['padding-x-24'])}>
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

            {!isMigrationSecondPhase ? (
              <Text style={style.flatten(['subtitle4', 'color-gray-200'])}>
                <FormattedMessage id="page.unlock.paragraph-section.enter-password-to-upgrade" />
              </Text>
            ) : null}
          </React.Fragment>
        ) : (
          <Text style={style.flatten(['h1', 'color-text-high'])}>
            <FormattedMessage id="page.unlock.paragraph-section.welcome-back" />
          </Text>
        )}

        <Gutter size={70} />

        {isMigrationSecondPhase || keyRingStore.isMigrating ? (
          <Box width="100%">
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: 'page.unlock.bottom-section.guide-title',
              })}
              paragraph={intl.formatMessage({
                id: 'page.unlock.bottom-section.guide-paragraph',
              })}
            />
          </Box>
        ) : (
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
        )}

        <Gutter size={34} />

        {(() => {
          if (isMigrationSecondPhase || keyRingStore.isMigrating) {
            if (keyRingStore.isMigrating) {
              return (
                <XAxis alignY="center">
                  <Text style={style.flatten(['subtitle4', 'color-gray-200'])}>
                    <FormattedMessage id="page.unlock.upgrade-in-progress" />
                  </Text>

                  <Gutter size={8} />

                  <SVGLoadingIcon
                    color={style.get('color-gray-200').color}
                    size={16}
                  />
                </XAxis>
              );
            } else {
              return (
                <Button
                  text={intl.formatMessage({
                    id: 'page.unlock.star-migration-button',
                  })}
                  size="large"
                  onPress={async () => {
                    await tryUnlock(migrationSecondPhasePassword);
                  }}
                  loading={isLoading}
                  containerStyle={{width: '100%'}}
                />
              );
            }
          }

          return (
            <Button
              text={intl.formatMessage({id: 'page.unlock.unlock-button'})}
              size="large"
              onPress={onPressSubmit}
              loading={isLoading}
              containerStyle={{width: '100%'}}
            />
          );
        })()}

        <Gutter size={32} />

        {keychainStore.isBiometryOn && !keyRingStore.needMigration ? (
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
