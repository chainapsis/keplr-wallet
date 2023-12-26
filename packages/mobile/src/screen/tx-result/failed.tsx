import React, {FunctionComponent, useEffect, useRef} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import {Text, View, StyleSheet} from 'react-native';
import {Button} from '../../components/button';
import {useStyle} from '../../styles';
import LottieView from 'lottie-react-native';
import * as WebBrowser from 'expo-web-browser';
import {SimpleGradient} from '../../components/svg';
import {Box} from '../../components/box';
import {EmbedChainInfos} from '../../config';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {StackNavProp} from '../../navigation';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {TextButton} from '../../components/text-button';
import {useNotification} from '../../hooks/notification';
import {FormattedMessage, useIntl} from 'react-intl';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const animationRef = useRef<LottieView>(null);
  const failedAnimProgress = useSharedValue(0);
  const notification = useNotification();
  const intl = useIntl();
  const animatedProps = useAnimatedProps(() => {
    return {
      progress: failedAnimProgress.value,
    };
  });
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          txHash: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId;
  const txExplorer = EmbedChainInfos.find(
    chain => chain.chainId === chainId,
  )?.txExplorer;
  const txHash = route.params.txHash;

  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  useEffect(() => {
    notification.disable(true);
    return () => {
      //NOTE setTimeout을 건이유는 해당 페이지가 보이자 말자 바로 main으로 이동하면 토스트가 보임해서
      //해당 토스트가 사라지는 시간을 대강 계산해서 800밀리초 후 disable을 false로 설정
      setTimeout(() => notification.disable(false), 800);
    };
  }, [notification]);

  useEffect(() => {
    const animateLottie = () => {
      animationRef.current?.play();
      failedAnimProgress.value = withTiming(1, {duration: 500});
    };

    const timeoutId = setTimeout(animateLottie, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box style={style.flatten(['flex-grow-1', 'items-center'])}>
      <View style={style.flatten(['absolute-fill'])}>
        <SimpleGradient
          degree={
            style.get('tx-result-screen-failed-gradient-background').degree
          }
          stops={style.get('tx-result-screen-failed-gradient-background').stops}
          fallbackAndroidImage={
            style.get('tx-result-screen-failed-gradient-background')
              .fallbackAndroidImage
          }
        />
      </View>
      <View style={style.flatten(['flex-2'])} />
      <View style={style.flatten(['width-122', 'height-122'])}>
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...style.flatten(['absolute', 'justify-center', 'items-center']),
          }}>
          <AnimatedLottieView
            source={require('../../public/assets/lottie/tx/failed.json')}
            colorFilters={[
              {
                keypath: 'Error Icon',
                color: style.flatten(['color-red-400']).color,
              },
            ]}
            animatedProps={animatedProps}
            loop={false}
            ref={animationRef}
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
        <FormattedMessage id="page.tx-result.fail-title" />
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
          <FormattedMessage id="page.tx-result.fail-text" />
        </Text>
      </View>
      <Box paddingX={48} height={116} marginTop={78} alignX="center">
        <View style={style.flatten(['flex-row', 'width-full'])}>
          <Button
            containerStyle={style.flatten(['flex-1'])}
            size="large"
            text="Done"
            onPress={() => {
              navigation.navigate('Home');
            }}
          />
        </View>
        {txExplorer ? (
          <TextButton
            containerStyle={style.flatten(['margin-top-16'])}
            size="large"
            text={intl.formatMessage(
              {
                id: 'page.tx-result.go-to-explorer',
              },
              {name: txExplorer.name},
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
