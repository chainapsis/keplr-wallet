import React, {FunctionComponent, useEffect, useState} from 'react';
import {useStyle} from '../../styles';
import TransportBLE, {
  bleManager,
} from '@ledgerhq/react-native-hw-transport-ble';
import {State} from 'react-native-ble-plx';
import {
  AppState,
  AppStateStatus,
  Linking,
  PermissionsAndroid,
  Platform,
  Text,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {registerCardModal} from '../../components/modal/card';
import Transport from '@ledgerhq/hw-transport';
import {Box} from '../../components/box';
import {XAxis, YAxis} from '../../components/axis';
import {Gutter} from '../../components/gutter';
import {SVGLoadingIcon} from '../../components/spinner';
import {GuideBox} from '../../components/guide-box';
import {Button} from '../../components/button';
import Svg, {Path, Rect} from 'react-native-svg';
import {RectButton} from 'react-native-gesture-handler';

enum BLEPermissionGrantStatus {
  NotInit = 'notInit',
  Failed = 'failed',
  // When it failed but need to try again.
  // For example, when the bluetooth permission is turned off, but user allows the permission in the app setting page and return to the app.
  FailedAndRetry = 'failed-and-retry',
  Granted = 'granted',
}

export const LedgerBLETransportModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  resolver: ((transport: Transport) => void) | undefined;
  rejecter: ((error: Error) => void) | undefined;
}>(({resolver, setIsOpen}) => {
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
          PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION'],
            PermissionsAndroid.PERMISSIONS['BLUETOOTH_SCAN'],
            PermissionsAndroid.PERMISSIONS['BLUETOOTH_CONNECT'],
          ]).then(granted => {
            if (
              granted[
                PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION']
              ] === PermissionsAndroid.RESULTS['GRANTED'] &&
              granted[PermissionsAndroid.PERMISSIONS['BLUETOOTH_SCAN']] ===
                PermissionsAndroid.RESULTS['GRANTED'] &&
              granted[PermissionsAndroid.PERMISSIONS['BLUETOOTH_CONNECT']] ===
                PermissionsAndroid.RESULTS['GRANTED']
            ) {
              setPermissionStatus(BLEPermissionGrantStatus.Granted);
            } else {
              setPermissionStatus(BLEPermissionGrantStatus.Failed);
            }
          });
        } else {
          PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION'],
          ]).then(granted => {
            if (
              granted[
                PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION']
              ] === PermissionsAndroid.RESULTS['GRANTED']
            ) {
              setPermissionStatus(BLEPermissionGrantStatus.Granted);
            } else {
              setPermissionStatus(BLEPermissionGrantStatus.Failed);
            }
          });
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
    <Box style={style.flatten(['padding-12'])}>
      <XAxis alignY="center">
        <Gutter size={8} />

        <Text style={style.flatten(['color-white', 'text-left', 'h4'])}>
          Finding Ledger
        </Text>

        <Gutter size={6} />

        {isFinding ? (
          <SVGLoadingIcon color={style.get('color-gray-100').color} size={16} />
        ) : null}
      </XAxis>

      <Gutter size={12} />

      {(() => {
        if (permissionStatus === BLEPermissionGrantStatus.Granted) {
          if (errorOnListen) {
            return <GuideBox color="danger" title={errorOnListen} />;
          }

          if (devices.length === 0) {
            return (
              <Box paddingX={8} paddingBottom={32}>
                <Text style={style.flatten(['color-text-low', 'body2'])}>
                  • Make sure Bluetooth is enabled on your mobile device.
                </Text>
                <Text style={style.flatten(['color-text-low', 'body2'])}>
                  • Turn on and unlock your Ledger.
                </Text>
              </Box>
            );
          }

          return (
            <React.Fragment>
              {devices.map(device => {
                return (
                  <LedgerNanoBLESelector
                    key={device.id}
                    deviceId={device.id}
                    deviceName={device.name}
                    resolve={transport => {
                      if (resolver) {
                        resolver(transport);
                      }
                      setIsOpen(false);
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        }

        if (
          permissionStatus === BLEPermissionGrantStatus.Failed ||
          permissionStatus === BLEPermissionGrantStatus.FailedAndRetry
        ) {
          return (
            <Box paddingY={32} alignX="center" alignY="center">
              <Svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                <Rect width="40" height="40" fill="#3971FF" rx="20" />
                <Path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.633"
                  d="M13.418 14.735l13.164 10.531L20 30.532V9.469l6.582 5.266-13.164 10.531"
                />
              </Svg>
              <Gutter size={16} />
              <Text
                style={style.flatten([
                  'body2',
                  'color-text-high',
                  'text-center',
                ])}>
                Keplr doesn’t have permission to use bluetooth
              </Text>
              <Gutter size={16} />
              <Button
                containerStyle={style.flatten(['margin-top-16'])}
                textStyle={style.flatten(['margin-x-8', 'normal-case'])}
                text="Open app setting"
                onPress={async () => {
                  await Linking.openSettings();
                }}
              />
            </Box>
          );
        }
      })()}
    </Box>
  );
});

const LedgerNanoBLESelector: FunctionComponent<{
  deviceId: string;
  deviceName: string;
  resolve: (transport: Transport) => void;
}> = ({deviceId, deviceName, resolve}) => {
  const style = useStyle();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const testLedgerConnection = async () => {
    setError(undefined);
    setIsConnecting(true);

    try {
      const transport = await TransportBLE.open(deviceId);
      resolve(transport);
    } catch (e) {
      setError(e);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <RectButton
      rippleColor={style.get('color-rect-button-default-ripple').color}
      underlayColor={style.get('color-rect-button-default-underlay').color}
      activeOpacity={0.2}
      style={{
        borderRadius: 8,
      }}
      onPress={async () => {
        await testLedgerConnection();
      }}>
      <Box style={style.flatten(['height-74', 'padding-x-16'])} alignY="center">
        <XAxis alignY="center">
          <Svg width="32" height="32" fill="none" viewBox="0 0 32 32">
            <Rect width="32" height="32" fill="#2E2E32" rx="16" />
            <Path
              fill="#72747B"
              d="M19.23 22.992V24H24v-4.543h-1.073v3.535H19.23zM19.23 8v1.007h3.697v3.536H24V8h-4.77zm-4.513 4.543h-1.072v6.914h4.837v-.909h-3.765v-6.005zM8 19.457V24h4.77v-1.008H9.073v-3.535H8zM8 8v4.543h1.073V9.007h3.697V8H8z"
            />
          </Svg>
          <Gutter size={12} />
          <YAxis>
            <Text style={style.flatten(['subtitle2', 'color-gray-10'])}>
              {deviceName}
            </Text>

            {error ? (
              <React.Fragment>
                <Gutter size={6} />
                <Text style={style.flatten(['subtitle3', 'color-gray-300'])}>
                  {`Failed to connect: ${error.message || error.toString()}`}
                </Text>
              </React.Fragment>
            ) : null}

            {isConnecting ? (
              <React.Fragment>
                <Gutter size={6} />
                <Text style={style.flatten(['subtitle3', 'color-gray-300'])}>
                  Connecting...
                </Text>
              </React.Fragment>
            ) : null}
          </YAxis>
        </XAxis>
      </Box>
    </RectButton>
  );
};
