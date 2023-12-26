import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {Button} from '../../../components/button';
import {LegacyRegisterContainer} from '../components';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {Box} from '../../../components/box';
import {ScrollView, Text} from 'react-native';
import {XAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';
import {
  CheckIcon,
  CosmosIcon,
  EthereumIcon,
  LedgerIcon,
  TerraIcon,
} from '../../../components/icon';
import {LedgerGrantModal} from './modal';
import {useStore} from '../../../stores';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {LedgerUtils} from '../../../utils';

export type Step = 'unknown' | 'connected' | 'app';

export const ConnectLedgerScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Register.ConnectLedger'>>();
  const navigation = useNavigation<StackNavProp>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {stepPrevious, stepTotal, app, bip44Path, appendModeInfo} =
    route.params;

  const [step, setStep] = useState<Step>('unknown');
  const [publicKey, setPublicKey] = useState<Uint8Array>();

  const {keyRingStore, chainStore} = useStore();

  useLayoutEffect(() => {
    navigation.setParams({
      hideBackButton: appendModeInfo !== undefined,
    });
  }, [appendModeInfo, navigation, stepPrevious, stepTotal]);

  useEffect(() => {
    // If this modal appears, it's probably because there was a problem with the ledger connection.
    // Ledger transport library for BLE seems to cache the transport internally.
    // But this can be small problem when the ledger connection is failed.
    // So, when this modal appears, try to disconnect the bluetooth connection for nano X.
    LedgerUtils.getLastUsedLedgerDeviceId().then(deviceId => {
      if (deviceId) {
        TransportBLE.disconnect(deviceId);
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (step === 'app' && publicKey) {
        setIsModalOpen(false);

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(
            appendModeInfo.vaultId,
            publicKey,
            app,
          );
          await chainStore.enableChainInfoInUI(
            ...appendModeInfo.afterEnableChains,
          );

          navigation.reset({
            routes: [
              {
                name: 'Register.Welcome',
                params: {password: route.params.password},
              },
            ],
          });
        } else {
          navigation.reset({
            routes: [
              {
                name: 'Register.FinalizeKey',
                params: {
                  name: route.params.name,
                  password: route.params.password,
                  stepPrevious: route.params.stepPrevious + 1,
                  stepTotal: route.params.stepTotal,
                  ledger: {
                    pubKey: publicKey,
                    bip44Path: route.params.bip44Path,
                    app: route.params.app,
                  },
                },
              },
            ],
          });
        }
      }
    })();
  }, [
    route.params,
    publicKey,
    step,
    navigation,
    appendModeInfo,
    keyRingStore,
    app,
    chainStore,
  ]);

  return (
    <LegacyRegisterContainer
      paragraph={
        appendModeInfo === undefined
          ? `Step ${stepPrevious + 1}/${stepTotal}`
          : undefined
      }
      bottom={
        <Button
          text={intl.formatMessage({
            id: 'button.next',
          })}
          size="large"
          onPress={() => {
            setIsModalOpen(true);
          }}
        />
      }>
      <ScrollView style={{padding: 20, flex: 1}}>
        <Box
          backgroundColor={style.get('color-gray-600').color}
          borderRadius={25}
          paddingX={30}
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
              {app: app},
            )}
            icon={
              <Box style={{opacity: step !== 'connected' ? 0.5 : 1}}>
                {(() => {
                  switch (app) {
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
      </ScrollView>

      <LedgerGrantModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        app={app}
        bip44Path={bip44Path}
        setStep={(step: Step) => setStep(step)}
        setPublicKey={(publicKey: Uint8Array) => setPublicKey(publicKey)}
      />
    </LegacyRegisterContainer>
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
