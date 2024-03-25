import React, {FunctionComponent, useEffect, useMemo, useRef} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import {Text, View, StyleSheet} from 'react-native';
import {Button} from '../../components/button';
import {useStyle} from '../../styles';
import LottieView from 'lottie-react-native';
import * as WebBrowser from 'expo-web-browser';
import {SimpleGradient} from '../../components/svg';
import {Box} from '../../components/box';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {StackNavProp} from '../../navigation';
import {ChainIdentifierToTxExplorerMap} from '../../config';
import {TextButton} from '../../components/text-button';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useNotification} from '../../hooks/notification';
import {FormattedMessage, useIntl} from 'react-intl';
import {ChainIdHelper} from '@keplr-wallet/cosmos';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

export const TxSuccessResultScreen: FunctionComponent = observer(() => {
  const successAnimProgress = useSharedValue(0);
  const animationRef = useRef<LottieView>(null);
  const intl = useIntl();
  const animatedProps = useAnimatedProps(() => {
    return {
      progress: successAnimProgress.value,
    };
  });
  const notification = useNotification();

  useEffect(() => {
    const animateLottie = () => {
      animationRef.current?.play();
      successAnimProgress.value = withTiming(1, {duration: 1000});
    };

    const timeoutId = setTimeout(animateLottie, 200);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    notification.disable(true);

    return () => {
      //NOTE setTimeout을 건이유는 해당 페이지가 보이자 말자 바로 main으로 이동하면 토스트가 보임해서
      //해당 토스트가 사라지는 시간을 대강 계산해서 800밀리초 후 disable을 false로 설정
      setTimeout(() => {
        notification.disable(false);
      }, 800);
    };
  }, [notification]);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          txHash: string;
          isEvmTx?: boolean;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId;
  const txExplorer = useMemo(() => {
    return ChainIdentifierToTxExplorerMap[
      ChainIdHelper.parse(chainId).identifier
    ];
  }, [chainId]);
  const txHash = route.params.txHash;
  const isEvmTx = route.params.isEvmTx;

  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  return (
    <Box style={style.flatten(['flex-grow-1', 'items-center'])}>
      <View style={style.flatten(['absolute-fill'])}>
        <SimpleGradient
          degree={
            style.get('tx-result-screen-success-gradient-background').degree
          }
          stops={
            style.get('tx-result-screen-success-gradient-background').stops
          }
          fallbackAndroidImage={
            style.get('tx-result-screen-success-gradient-background')
              .fallbackAndroidImage
          }
        />
      </View>
      <View style={style.flatten(['flex-2'])} />
      <View
        style={style.flatten([
          'width-122',
          'height-122',
          'justify-center',
          'items-center',
        ])}>
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...style.flatten(['absolute', 'justify-center', 'items-center']),
          }}>
          <AnimatedLottieView
            source={require('../../public/assets/lottie/tx/success.json')}
            colorFilters={[
              {
                keypath: 'Success Icon',
                color: style.flatten(['color-green-400']).color,
              },
            ]}
            //NOTE 정상작동 되는 타입인데 타입에러가 떠서 일단은 any로 처리후 나중애 한번더 봐야함
            ref={animationRef as any}
            animatedProps={animatedProps}
            loop={false}
            style={{width: 150, height: 150}}
          />
        </View>
      </View>

      <Text
        style={style.flatten([
          'mobile-h3',
          'color-text-high',
          'margin-top-82',
          'margin-bottom-32',
        ])}>
        <FormattedMessage id="page.tx-result-success.title" />
      </Text>

      {/* To match the height of text with other tx result screens,
         set the explicit height to upper view*/}
      <View
        style={StyleSheet.flatten([
          style.flatten(['padding-x-36']),
          {
            overflow: 'visible',
          },
        ])}>
        <Text
          style={style.flatten([
            'subtitle2',
            'text-center',
            'color-text-middle',
          ])}>
          <FormattedMessage id="page.tx-result-success.paragraph-1" />
        </Text>
        <Text
          style={style.flatten([
            'subtitle2',
            'text-center',
            'color-text-middle',
          ])}>
          <FormattedMessage id="page.tx-result-success.paragraph-2" />
        </Text>
      </View>

      <Box paddingX={48} height={116} marginTop={58} alignX="center">
        <View style={style.flatten(['flex-row', 'width-full'])}>
          <Button
            containerStyle={style.flatten(['flex-1'])}
            size="large"
            text={intl.formatMessage({id: 'button.done'})}
            onPress={() => {
              navigation.navigate('Home');
            }}
          />
        </View>
        {!!txExplorer && !isEvmTx ? (
          <TextButton
            containerStyle={style.flatten(['margin-top-16'])}
            size="large"
            text={intl.formatMessage(
              {
                id: 'page.tx-result.components.go-to-explorer',
              },
              {
                name: txExplorer.name,
              },
            )}
            rightIcon={color => (
              <View style={style.flatten(['margin-left-8'])}>
                <ArrowRightIcon color={color} size={18} />
              </View>
            )}
            onPress={() => {
              if (txExplorer) {
                WebBrowser.openBrowserAsync(
                  txExplorer.txUrl.replace('{txHash}', txHash.toUpperCase()),
                );
              }
            }}
          />
        ) : null}
      </Box>
      <View style={style.flatten(['flex-2'])} />
    </Box>
  );
});
