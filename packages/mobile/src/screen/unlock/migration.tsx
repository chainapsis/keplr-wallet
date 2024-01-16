import React, {FunctionComponent, useCallback, useEffect, useRef} from 'react';
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

  const once = useRef(false);
  useEffect(() => {
    if (once.current) {
      return;
    }
    once.current = true;
    (async () => {
      try {
        await keyRingStore.unlock(route.params.password);
        await waitAccountInit();
        navigation.reset({routes: [{name: 'Migration.Welcome'}]});
      } catch (e) {
        console.log(e);
        if (e.message !== 'User password mac unmatched') {
          Bugsnag.notify(e);
        }
      }
    })();
  }, [keyRingStore, navigation, route.params?.password, waitAccountInit]);

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

        <Gutter size={37} />

        {keyRingStore.isMigrating ? (
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
        ) : null}

        <Gutter size={32} />
        <Box style={{flex: 1}} />
        <Gutter size={32} />
      </Box>
    </PageWithScrollView>
  );
});
