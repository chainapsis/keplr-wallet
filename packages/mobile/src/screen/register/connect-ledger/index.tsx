import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {Box} from '../../../components/box';
import {InteractionManager, Text} from 'react-native';
import {XAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';
import {
  CheckIcon,
  CosmosIcon,
  EthereumIcon,
  LedgerIcon,
  TerraIcon,
} from '../../../components/icon';
import {useStore} from '../../../stores';
import {LedgerUtils} from '../../../utils';
import {useLedgerBLE} from '../../../provider/ledger-ble';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {AppHRP, CosmosApp} from '@keplr-wallet/ledger-cosmos';
import Transport from '@ledgerhq/hw-transport';
import Eth from '@ledgerhq/hw-app-eth';
import {PubKeySecp256k1} from '@keplr-wallet/crypto';

export type Step = 'unknown' | 'connected' | 'app';

export const ConnectLedgerScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Register.ConnectLedger'>>();
  const navigation = useNavigation<StackNavProp>();
  const {keyRingStore, chainStore} = useStore();

  const {
    stepPrevious,
    stepTotal,
    app: propApp,
    bip44Path,
    appendModeInfo,
    name,
    password,
  } = route.params;

  if (!Object.keys(AppHRP).includes(propApp) && propApp !== 'Ethereum') {
    throw new Error(`Unsupported app: ${propApp}`);
  }

  const ledgerBLE = useLedgerBLE();

  const [step, setStep] = useState<Step>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  const connectLedger = async () => {
    setIsLoading(true);

    let transport: Transport;

    try {
      transport = await ledgerBLE.getTransport();
    } catch {
      setStep('unknown');
      setIsLoading(false);
      return;
    }

    if (propApp === 'Ethereum') {
      let ethApp = new Eth(transport);

      // Ensure that the keplr can connect to ethereum app on ledger.
      // getAppConfiguration() works even if the ledger is on screen saver mode.
      // To detect the screen saver mode, we should request the address before using.
      try {
        await ethApp.getAddress(`m/44'/60'/'0/0/0`);
      } catch (e) {
        // Device is locked or user is in home sceen or other app.
        if (
          e?.message.includes('(0x6b0c)') ||
          e?.message.includes('(0x6511)') ||
          e?.message.includes('(0x6e00)')
        ) {
          setStep('connected');
        } else {
          console.log(e);
          setStep('unknown');
          await transport.close();

          setIsLoading(false);
          return;
        }
      }

      transport = await LedgerUtils.tryAppOpen(transport, propApp);
      ethApp = new Eth(transport);

      try {
        const res = await ethApp.getAddress(
          `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
        );

        const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));

        setStep('app');

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(
            appendModeInfo.vaultId,
            pubKey.toBytes(true),
            propApp,
          );
          await chainStore.enableChainInfoInUI(
            ...appendModeInfo.afterEnableChains,
          );
          navigation.reset({
            routes: [{name: 'Register.Welcome', params: {password}}],
          });
        } else {
          navigation.reset({
            routes: [
              {
                name: 'Register.FinalizeKey',
                params: {
                  name,
                  password,
                  stepPrevious: stepPrevious + 1,
                  stepTotal,
                  ledger: {
                    pubKey: pubKey.toBytes(),
                    bip44Path,
                    app: propApp,
                  },
                },
              },
            ],
          });
        }
      } catch (e) {
        console.log(e);
        setStep('connected');
      }

      await transport.close();

      setIsLoading(false);

      return;
    }

    let app = new CosmosApp(propApp, transport);

    try {
      const version = await app.getVersion();
      if (version.device_locked) {
        throw new Error('Device is locked');
      }

      // XXX: You must not check "error_message".
      //      If "error_message" is not "No errors",
      //      probably it doesn't mean that the device is not connected.
      setStep('connected');
    } catch (e) {
      console.log(e);
      setStep('unknown');
      await transport.close();

      setIsLoading(false);
      return;
    }

    transport = await LedgerUtils.tryAppOpen(transport, propApp);
    app = new CosmosApp(propApp, transport);

    const res = await app.getPublicKey(
      bip44Path.account,
      bip44Path.change,
      bip44Path.addressIndex,
    );
    if (res.error_message === 'No errors') {
      setStep('app');

      if (appendModeInfo) {
        await keyRingStore.appendLedgerKeyApp(
          appendModeInfo.vaultId,
          res.compressed_pk,
          propApp,
        );
        await chainStore.enableChainInfoInUI(
          ...appendModeInfo.afterEnableChains,
        );
        navigation.reset({
          routes: [{name: 'Register.Welcome', params: {password}}],
        });
      } else {
        navigation.reset({
          routes: [
            {
              name: 'Register.FinalizeKey',
              params: {
                name,
                password,
                stepPrevious: stepPrevious + 1,
                stepTotal,
                ledger: {
                  pubKey: res.compressed_pk,
                  bip44Path,
                  app: propApp,
                },
              },
            },
          ],
        });
      }
    } else {
      setStep('connected');
    }

    await transport.close();

    setIsLoading(false);
  };

  // 최초에 자동으로 ledger 연결을 한번 시도함.
  useFocusEffect(
    React.useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        connectLedger();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <ScrollViewRegisterContainer
      paragraph={`Step ${stepPrevious + 1}/${stepTotal}`}
      bottomButton={{
        text: 'Connect',
        size: 'large',
        loading: isLoading,
        onPress: connectLedger,
      }}
      paddingX={20}>
      <Box
        backgroundColor={style.get('color-gray-600').color}
        borderRadius={25}
        paddingX={30}
        marginTop={12}
        paddingY={36}>
        <StepView
          step={1}
          paragraph={intl.formatMessage({
            id: 'pages.register.connect-ledger.connect-ledger-step-paragraph',
          })}
          icon={
            <Box style={{opacity: step !== 'unknown' ? 0.5 : 1}}>
              <LedgerIcon size={60} />
            </Box>
          }
          focused={step === 'unknown'}
          completed={step !== 'unknown'}
        />

        <Gutter size={20} />

        <StepView
          step={2}
          paragraph={intl.formatMessage(
            {id: 'pages.register.connect-ledger.open-app-step-paragraph'},
            {app: propApp},
          )}
          icon={
            <Box style={{opacity: step !== 'connected' ? 0.5 : 1}}>
              {(() => {
                switch (propApp) {
                  case 'Terra':
                    return <TerraIcon size={60} />;
                  case 'Ethereum':
                    return <EthereumIcon size={60} />;
                  default:
                    return <CosmosIcon size={60} />;
                }
              })()}
            </Box>
          }
          focused={step === 'connected'}
          completed={step === 'app'}
        />
      </Box>
    </ScrollViewRegisterContainer>
  );
});

const StepView: FunctionComponent<{
  step: number;
  paragraph: string;
  icon?: React.ReactNode;

  focused: boolean;
  completed: boolean;
}> = ({step, paragraph, icon, focused, completed}) => {
  const style = useStyle();
  return (
    <Box
      borderRadius={18}
      backgroundColor={
        focused ? style.get('color-gray-500').color : 'transparent'
      }
      paddingX={16}
      paddingY={20}>
      <XAxis alignY="center">
        {icon}

        <Gutter size={20} />

        <Box style={{flex: 1}}>
          <XAxis alignY="center">
            <Text style={style.flatten(['h3', 'color-text-high'])}>
              <FormattedMessage
                id="pages.register.connect-ledger.step-text"
                values={{step}}
              />
            </Text>
            {completed ? (
              <React.Fragment>
                <Gutter size={4} />

                <CheckIcon
                  size={24}
                  color={style.get('color-text-high').color}
                />
              </React.Fragment>
            ) : null}
          </XAxis>

          <Text style={style.flatten(['body2', 'color-text-middle'])}>
            {paragraph}
          </Text>
        </Box>
      </XAxis>
    </Box>
  );
};
