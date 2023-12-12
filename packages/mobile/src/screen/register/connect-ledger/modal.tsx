import React, {FunctionComponent, useEffect, useState} from 'react';
import {useStyle} from '../../../styles';
import TransportBLE, {
  bleManager,
} from '@ledgerhq/react-native-hw-transport-ble';
import {State} from 'react-native-ble-plx';
import {
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  Text,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';
import {App, CosmosApp} from '@keplr-wallet/ledger-cosmos';
import {RectButton} from '../../../components/rect-button';
import {GuideBox} from '../../../components/guide-box';
import {Button} from '../../../components/button';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import {SVGLoadingIcon} from '../../../components/spinner';
import {Step} from './index';
import {PubKeySecp256k1} from '@keplr-wallet/crypto';
import {Buffer} from 'buffer';
import Eth from '@ledgerhq/hw-app-eth';
import {LedgerUtils} from '../../../utils';
import {registerCardModal} from '../../../components/modal/card';
import {Box} from '../../../components/box';

enum BLEPermissionGrantStatus {
  NotInit = 'notInit',
  Failed = 'failed',
  // When it failed but need to try again.
  // For example, when the bluetooth permission is turned off, but user allows the permission in the app setting page and return to the app.
  FailedAndRetry = 'failed-and-retry',
  Granted = 'granted',
}

export const LedgerGrantModal = registerCardModal(
  ({
    app,
    bip44Path,
    setStep,
    setPublicKey,
  }: {
    app: App | 'Ethereum';
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    };
    setStep: (step: Step) => void;
    setPublicKey: (publicKey: Uint8Array) => void;
  }) => {
    const style = useStyle();

    const [isBLEAvailable, setIsBLEAvailable] = useState(false);
    const [isFinding, setIsFinding] = useState(false);
    const [devices, setDevices] = useState<
      {
        id: string;
        name: string;
      }[]
    >([]);
    const [errorOnListen, setErrorOnListen] = useState<string | undefined>();

    useEffect(() => {
      const subscription = bleManager.onStateChange(newState => {
        if (newState === State.PoweredOn) {
          setIsBLEAvailable(true);
        } else {
          setIsBLEAvailable(false);
        }
      }, true);

      return () => {
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      if (
        Platform.OS === 'android' &&
        parseFloat(DeviceInfo.getSystemVersion()) < 12 &&
        !isBLEAvailable
      ) {
        // If the platform is android(<12) and can't use the bluetooth,
        // try to turn on the bluetooth.
        // Below API can be called only in android.
        bleManager.enable();
      }
    }, [isBLEAvailable]);

    const [permissionStatus, setPermissionStatus] =
      useState<BLEPermissionGrantStatus>(() => {
        if (Platform.OS === 'android') {
          // If android, there is need to request the permission.
          // You should ask for the permission on next effect.
          return BLEPermissionGrantStatus.NotInit;
        } else {
          // If not android, there is no need to request the permission
          return BLEPermissionGrantStatus.Granted;
        }
      });

    useEffect(() => {
      const listener = (state: AppStateStatus) => {
        if (
          state === 'active' &&
          permissionStatus === BLEPermissionGrantStatus.Failed
        ) {
          // When the app becomes active, the user may have granted permission on the setting page, so request the grant again.
          setPermissionStatus(BLEPermissionGrantStatus.FailedAndRetry);
        }
      };

      const subscription = AppState.addEventListener('change', listener);

      return () => {
        subscription.remove();
      };
    }, [permissionStatus]);

    useEffect(() => {
      // It is processed only in case of not init at first or re-request after failure.
      if (
        permissionStatus === BLEPermissionGrantStatus.NotInit ||
        permissionStatus === BLEPermissionGrantStatus.FailedAndRetry
      ) {
        if (Platform.OS === 'android') {
          if (parseFloat(DeviceInfo.getSystemVersion()) >= 12) {
            requestMultiple([
              PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
              PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            ]).then(granted => {
              if (
                granted[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
                  RESULTS.GRANTED &&
                granted[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] ===
                  RESULTS.GRANTED &&
                granted[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] ===
                  RESULTS.GRANTED
              ) {
                setPermissionStatus(BLEPermissionGrantStatus.Granted);
              } else {
                setPermissionStatus(BLEPermissionGrantStatus.Failed);
              }
            });
          } else {
            requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
              granted => {
                if (
                  granted[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
                  RESULTS.GRANTED
                ) {
                  setPermissionStatus(BLEPermissionGrantStatus.Granted);
                } else {
                  setPermissionStatus(BLEPermissionGrantStatus.Failed);
                }
              },
            );
          }
        }
      }
    }, [permissionStatus]);

    useEffect(() => {
      let unsubscriber: (() => void) | undefined;

      if (
        isBLEAvailable &&
        permissionStatus === BLEPermissionGrantStatus.Granted
      ) {
        setIsFinding(true);

        (async () => {
          let _devices: {
            id: string;
            name: string;
          }[] = devices.slice();

          unsubscriber = TransportBLE.listen({
            complete: () => {
              setIsFinding(false);
            },
            next: (e: {type: string; descriptor: any}) => {
              if (e.type === 'add') {
                const device = e.descriptor;

                if (!_devices.find(d => d.id === device.id)) {
                  console.log(
                    `Ledger device found (id: ${device.id}, name: ${device.name})`,
                  );
                  _devices = [
                    ..._devices,
                    {
                      id: device.id,
                      name: device.name,
                    },
                  ];
                  setDevices(_devices);
                }
              }
            },
            error: (e?: Error | any) => {
              if (!e) {
                setErrorOnListen('Unknown error');
              } else {
                if ('message' in e && typeof e.message === 'string') {
                  setErrorOnListen(e.message);
                } else if ('toString' in e) {
                  setErrorOnListen(e.toString());
                } else {
                  setErrorOnListen('Unknown error');
                }
              }
              setIsFinding(false);
            },
          }).unsubscribe;
        })();
      } else {
        setDevices([]);
        setIsFinding(false);
      }

      return () => {
        if (unsubscriber) {
          unsubscriber();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBLEAvailable, permissionStatus]);

    return (
      <Box style={style.flatten(['padding-20'])}>
        <XAxis alignY="center">
          <Text style={style.flatten(['color-white', 'text-left', 'h4'])}>
            Pair Hardware Wallet
          </Text>

          <Gutter size={4} />

          {isFinding ? (
            <SVGLoadingIcon
              color={style.get('color-blue-200').color}
              size={16}
            />
          ) : null}
        </XAxis>

        <Gutter size={12} />

        {(() => {
          if (isBLEAvailable) {
            if (permissionStatus === BLEPermissionGrantStatus.Granted) {
              return (
                <React.Fragment>
                  {errorOnListen ? (
                    <GuideBox color="danger" title={errorOnListen} />
                  ) : (
                    <React.Fragment>
                      <Text
                        style={style.flatten(['subtitle3', 'color-text-high'])}>
                        {`1. Open the ${app} app on your Ledger device`}
                      </Text>

                      <Text
                        style={style.flatten(['subtitle3', 'color-text-high'])}>
                        2. Select the hardware wallet you’d like to pair
                      </Text>

                      {devices.map(device => {
                        return (
                          <LedgerNanoBLESelector
                            key={device.id}
                            deviceId={device.id}
                            deviceName={device.name}
                            app={app}
                            bip44Path={bip44Path}
                            setStep={setStep}
                            setPublicKey={setPublicKey}
                          />
                        );
                      })}
                    </React.Fragment>
                  )}
                </React.Fragment>
              );
            }

            if (
              permissionStatus === BLEPermissionGrantStatus.Failed ||
              permissionStatus === BLEPermissionGrantStatus.FailedAndRetry
            ) {
              return (
                <React.Fragment>
                  <GuideBox
                    color="danger"
                    title="Keplr doesn't have permission to use bluetooth"
                  />

                  <Gutter size={4} />

                  <Button
                    containerStyle={style.flatten(['margin-top-16'])}
                    textStyle={style.flatten(['margin-x-8', 'normal-case'])}
                    text="Open app setting"
                    size="small"
                    onPress={async () => {
                      await Linking.openSettings();
                    }}
                  />
                </React.Fragment>
              );
            }
          }
        })()}
      </Box>
    );
  },
);

const LedgerNanoBLESelector: FunctionComponent<{
  deviceId: string;
  deviceName: string;
  app: App | 'Ethereum';
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  };
  setStep: (step: Step) => void;
  setPublicKey: (publicKey: Uint8Array) => void;
}> = ({deviceId, deviceName, app, bip44Path, setStep, setPublicKey}) => {
  const style = useStyle();

  const [isConnecting, setIsConnecting] = useState(false);
  const [initErrorOn, setInitErrorOn] = useState<string | undefined>(undefined);

  const testLedgerConnection = async (): Promise<boolean> => {
    setInitErrorOn('');
    setIsConnecting(true);

    let transport = await TransportBLE.open(deviceId);

    if (app === 'Ethereum') {
      let ethApp = new Eth(transport);

      // Ensure that the keplr can connect to ethereum app on ledger.
      // getAppConfiguration() works even if the ledger is on screen saver mode.
      // To detect the screen saver mode, we should request the address before using.
      try {
        await ethApp.getAddress("m/44'/60'/'0/0/0");
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

          setIsConnecting(false);
          return false;
        }
      }

      transport = await LedgerUtils.tryAppOpen(transport, app, deviceId);
      ethApp = new Eth(transport);

      try {
        const res = await ethApp.getAddress(
          `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
        );

        const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));
        setPublicKey(pubKey.toBytes(true));

        setStep('app');

        return true;
      } catch (e) {
        console.log('error', e);
        setStep('connected');

        setInitErrorOn(e.message);
        return false;
      } finally {
        setIsConnecting(false);

        await transport.close();
        await TransportBLE.disconnect(deviceId);
      }
    }

    let cosmosApp = new CosmosApp(app, transport);

    try {
      const version = await cosmosApp.getVersion();

      if (version.device_locked) {
        throw new Error('Device is locked');
      }

      setStep('connected');
    } catch (e) {
      console.log('error', e);
      setStep('unknown');

      await transport.close();

      setIsConnecting(false);
      return false;
    }

    transport = await LedgerUtils.tryAppOpen(transport, app, deviceId);
    cosmosApp = new CosmosApp(app, transport);

    try {
      const appInfo = await cosmosApp.getAppInfo();
      if (appInfo.app_name && appInfo.app_name !== app) {
        await CosmosApp.openApp(transport, app);
        throw new Error(`Please open ${app} App`);
      }

      if (appInfo.error_message !== 'No errors') {
        throw new Error(appInfo.error_message);
      }

      const res = await cosmosApp.getPublicKey(
        bip44Path.account,
        bip44Path.change,
        bip44Path.addressIndex,
      );

      if (res.error_message === 'No errors') {
        setStep('app');

        setPublicKey(res.compressed_pk);
      }

      return true;
    } catch (e) {
      console.log('error', e);
      setStep('connected');

      setInitErrorOn(e.message);
      return false;
    } finally {
      setIsConnecting(false);

      await transport.close();
      await TransportBLE.disconnect(deviceId);
    }
  };

  return (
    <RectButton
      style={style.flatten(['padding-y-12'])}
      onPress={async () => {
        await testLedgerConnection();
      }}>
      <View style={style.flatten(['min-height-44'])}>
        <Text style={style.flatten(['h5', 'color-text-middle'])}>
          {deviceName}
        </Text>
        {isConnecting ? (
          <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
            Connecting...
          </Text>
        ) : null}
        {!isConnecting && initErrorOn ? (
          <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
            {initErrorOn}
          </Text>
        ) : null}
      </View>
    </RectButton>
  );
};
