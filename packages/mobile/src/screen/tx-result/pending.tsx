import React, {FunctionComponent, useEffect} from 'react';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {Text, View, StyleSheet} from 'react-native';
import {useStyle} from '../../styles';
import {TendermintTxTracer} from '@keplr-wallet/cosmos';
import {Buffer} from 'buffer/';
import LottieView from 'lottie-react-native';
import {SimpleGradient} from '../../components/svg';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {StackNavProp} from '../../navigation';
import {Box} from '../../components/box';
import {TextButton} from '../../components/text-button';

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const {chainStore} = useStore();

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

  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const isFocused = useIsFocused();

  useEffect(() => {
    const txHash = route.params.txHash;
    const chainInfo = chainStore.getChain(chainId);
    let txTracer: TendermintTxTracer | undefined;

    if (isFocused) {
      txTracer = new TendermintTxTracer(chainInfo.rpc, '/websocket');
      txTracer
        .traceTx(Buffer.from(txHash, 'hex'))
        .then(tx => {
          if (tx.code == null || tx.code === 0) {
            navigation.replace('TxSuccess', {chainId, txHash});
          } else {
            navigation.replace('TxFail', {chainId, txHash});
          }
        })
        .catch(e => {
          console.log(`Failed to trace the tx (${txHash})`, e);
        });
    }

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [chainId, chainStore, isFocused, navigation, route.params.txHash]);

  return (
    <Box style={style.flatten(['flex-grow-1', 'items-center'])}>
      <View style={style.flatten(['absolute-fill'])}>
        <SimpleGradient
          degree={
            style.get('tx-result-screen-pending-gradient-background').degree
          }
          stops={
            style.get('tx-result-screen-pending-gradient-background').stops
          }
          fallbackAndroidImage={
            style.get('tx-result-screen-pending-gradient-background')
              .fallbackAndroidImage
          }
        />
      </View>
      <View style={style.flatten(['flex-2'])} />
      <View
        style={style.flatten([
          'width-122',
          'height-122',
          'border-width-8',
          'border-color-blue-300',
          'border-radius-64',
        ])}>
        <Box
          alignX="center"
          alignY="center"
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 10,
            ...style.flatten(['absolute']),
          }}>
          <LottieView
            source={require('../../public/assets/lottie/tx/pending.json')}
            colorFilters={[
              {
                keypath: '#dot01',
                color: style.flatten(['color-blue-300']).color,
              },
              {
                keypath: '#dot02',
                color: style.flatten(['color-blue-300']).color,
              },
              {
                keypath: '#dot03',
                color: style.flatten(['color-blue-300']).color,
              },
            ]}
            autoPlay
            loop
            style={{width: 150, height: 150}}
          />
        </Box>
      </View>

      <Text
        style={style.flatten([
          'mobile-h3',
          'color-text-high',
          'margin-top-82',
          'margin-bottom-32',
        ])}>
        Transaction pending
      </Text>

      {/* To match the height of text with other tx result screens,
         set the explicit height to upper view*/}
      <View
        style={StyleSheet.flatten([
          style.flatten(['padding-x-66']),
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
          Transaction has been broadcasted to the blockchain and pending
          confirmation.
        </Text>
      </View>

      <Box paddingX={48} height={116} marginTop={58} alignX="center">
        <View style={style.flatten(['flex-row', 'width-full'])}>
          <TextButton
            containerStyle={style.flatten(['flex-1'])}
            size="large"
            text="Go to homescreen"
            rightIcon={color => (
              <View style={style.flatten(['margin-left-8'])}>
                <ArrowRightIcon color={color} size={18} />
              </View>
            )}
            onPress={() => {
              navigation.navigate('Home');
            }}
          />
        </View>
      </Box>

      <View style={style.flatten(['flex-2'])} />
    </Box>
  );
});
