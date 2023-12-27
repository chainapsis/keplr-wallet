import {observer} from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useStyle} from '../../styles';
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Box} from '../../components/box';
import {Button} from '../../components/button';
import Svg, {Path} from 'react-native-svg';
import {Gutter} from '../../components/gutter';
import {CloseIcon} from '../../components/icon';
import {DepositModal} from '../home/components/deposit-modal/deposit-modal';
import {useStore} from '../../stores';
import {
  StackActions,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {SVGLoadingIcon} from '../../components/spinner';
import {GuideBox} from '../../components/guide-box';
import {FormattedMessage, useIntl} from 'react-intl';
import {useEffectOnce} from '../../hooks';

export const CameraScreen: FunctionComponent = observer(() => {
  const {chainStore, walletConnectStore} = useStore();
  const style = useStyle();
  const device = useCameraDevice('back');
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();

  const isFocused = useIsFocused();
  const appState = AppState.currentState;
  const [isActive, setIsActive] = useState(
    isFocused && appState === 'active' ? true : false,
  );
  const isActiveRef = useRef(isActive);

  const {hasPermission, requestPermission} = useCameraPermission();
  const [isLoading, setIsLoading] = useState(false);
  // To prevent the reading while changing to other screen after processing the result.
  // Expectedly, screen should be moved to other after processing the result.
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // If the other screen is pushed according to the qr code data,
      // the `isCompleted` state would remain as true because the screen in the stack is not unmounted.
      // So, we should reset the `isComplete` state whenever getting focused.
      setIsCompleted(false);
    }, []),
  );

  //NOTE 안드로이드에서는 뒤로가기시 먼저 camera가 뷰에서 사라지고 난뒤 뒤로가야 home에서
  //view가 밀리는 버그를 해결 할수 있어서 일단 이렇게 처리함
  useEffectOnce(() => {
    if (Platform.OS === 'android') {
      navigation.addListener('beforeRemove', e => {
        setIsActive(false);
        if (isActiveRef.current) {
          isActiveRef.current = false;
          e.preventDefault();
        }
      });
    }
  });
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (!isActive && !isActiveRef.current) {
        setTimeout(() => {
          navigation.goBack();
        }, 0);
      }
    }
  }, [isActive, navigation]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async codes => {
      if (codes.length > 0) {
        const data = codes[0].value;

        if (!isLoading && !isCompleted && data) {
          setIsLoading(true);

          try {
            if (data.startsWith('wc:')) {
              if (data.includes('@2')) {
                await walletConnectStore.pair(data);
              }

              navigation.reset({routes: [{name: 'Home'}]});
            } else {
              const isBech32Address = (() => {
                try {
                  // Check that the data is bech32 address.
                  // If this is not valid bech32 address, it will throw an error.
                  Bech32Address.validate(data);
                } catch {
                  return false;
                }
                return true;
              })();

              if (isBech32Address) {
                const prefix = data.slice(0, data.indexOf('1'));
                const chainInfo = chainStore.chainInfosInUI.find(
                  chainInfo =>
                    chainInfo.bech32Config.bech32PrefixAccAddr === prefix,
                );
                if (chainInfo) {
                  // TODO: StackActions 제거해서 진행해야함
                  navigation.dispatch({
                    ...StackActions.replace('Send', {
                      chainId: chainInfo.chainId,
                      coinMinimalDenom:
                        chainInfo.currencies[0].coinMinimalDenom,
                    }),
                  });
                } else {
                  navigation.reset({routes: [{name: 'Home'}]});
                }
              } else {
                // TODO: Import from extension
              }
            }

            setIsCompleted(true);
          } catch (e) {
            console.log(e);
          } finally {
            setIsLoading(false);
          }
        }
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      (async () => {
        requestPermission();
      })();
    }
  }, [hasPermission, requestPermission]);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <React.Fragment>
      {isFocused && device && hasPermission && isActive ? (
        <Camera
          style={style.flatten(['absolute-fill'])}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
      ) : null}

      <SafeAreaView
        style={style.flatten([
          'absolute-fill',
          'justify-center',
          'items-center',
        ])}>
        <Box
          style={{top: 50, right: 30, position: 'absolute'}}
          onClick={() => navigation.goBack()}>
          <CloseIcon size={38} color={style.get('color-text-high').color} />
        </Box>

        <Text style={style.flatten(['color-text-high', 'h1'])}>
          <FormattedMessage id="page.camera.main-title" />
        </Text>

        <Gutter size={40} />

        <AimIcon />

        {isLoading ? (
          <View
            style={style.flatten([
              'absolute-fill',
              'items-center',
              'justify-center',
            ])}>
            <SVGLoadingIcon
              color={style.get('color-blue-200').color}
              size={42}
            />
          </View>
        ) : null}

        <Gutter size={40} />

        <Button
          text={intl.formatMessage({id: 'page.camera.button-show-qr-code'})}
          color="secondary"
          containerStyle={{opacity: 0.8}}
          onPress={() => {
            setIsDepositModalOpen(true);
          }}
        />

        {hasPermission ? null : (
          <React.Fragment>
            <Gutter size={30} />

            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: 'page.camera.warning-guide-title',
              })}
              paragraph={intl.formatMessage({
                id: 'page.camera.warning-guide-paragraph',
              })}
              bottom={
                <Text
                  style={StyleSheet.flatten([
                    style.flatten(['body2', 'color-yellow-400']),
                    {textDecorationLine: 'underline'},
                  ])}
                  onPress={async () => await Linking.openSettings()}>
                  <FormattedMessage id="page.camera.warning-guide-button" />
                </Text>
              }
            />
          </React.Fragment>
        )}
      </SafeAreaView>

      <DepositModal
        isOpen={isDepositModalOpen}
        setIsOpen={setIsDepositModalOpen}
      />
    </React.Fragment>
  );
});

const AimIcon: FunctionComponent = () => {
  return (
    <Svg width="216" height="216" viewBox="0 0 216 216" fill="none">
      <Path d="M33.8531 3H3V33.8531" stroke="#FEFEFE" strokeWidth="6" />
      <Path d="M3 182.147V213H33.8531" stroke="#FEFEFE" strokeWidth="6" />
      <Path d="M182.147 3H213V33.8531" stroke="#FEFEFE" strokeWidth="6" />
      <Path d="M213 182.147V213H182.147" stroke="#FEFEFE" strokeWidth="6" />
    </Svg>
  );
};
