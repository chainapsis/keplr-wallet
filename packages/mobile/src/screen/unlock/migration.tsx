import React, {FunctionComponent, useCallback, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {WalletStatus} from '@keplr-wallet/stores';
import {autorun} from 'mobx';
import {RootStackParamList, StackNavProp} from '../../navigation';
import {PageWithScrollView} from '../../components/page';
import {Text} from 'react-native';
import {Box} from '../../components/box';
import LottieView from 'lottie-react-native';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import delay from 'delay';
import {GuideBox} from '../../components/guide-box';
import {XAxis} from '../../components/axis';
import {SVGLoadingIcon} from '../../components/spinner';
import Bugsnag from '@bugsnag/react-native';

export const MigrationScreen: FunctionComponent = observer(() => {
  const {keyRingStore, accountStore, chainStore} = useStore();

  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Migration'>>();
  const password = route.params?.password;

  const [isLoading, setIsLoading] = useState(false);

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
      navigation.replace('Migration.Welcome');
    } catch (e) {
      console.log(e);
      if (e.message !== 'User password mac unmatched') {
        Bugsnag.notify(e);
      }
      setIsLoading(false);
    }
  };

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
          autoPlay
          loop
        />

        <React.Fragment>
          <Text style={style.flatten(['h1', 'color-text-high'])}>
            <FormattedMessage id="page.unlock.paragraph-section.keplr-here" />
          </Text>
        </React.Fragment>

        <Gutter size={70} />

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

        <Gutter size={20} />

        {(() => {
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
                  await tryUnlock(password);
                }}
                loading={isLoading}
                containerStyle={{width: '100%'}}
              />
            );
          }
        })()}

        <Gutter size={32} />
        <Box style={{flex: 1}} />
        <Gutter size={32} />
      </Box>
    </PageWithScrollView>
  );
});
