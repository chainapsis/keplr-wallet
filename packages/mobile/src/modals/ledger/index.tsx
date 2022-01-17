import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { PermissionsAndroid, Platform, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { State } from "react-native-ble-plx";
import TransportBLE, {
  bleManager,
} from "@ledgerhq/react-native-hw-transport-ble";
import { LoadingSpinner } from "../../components/spinner";
import { Ledger, LedgerInitErrorOn } from "@keplr-wallet/background";
import { getLastUsedLedgerDeviceId } from "../../utils/ledger";
import { RectButton } from "../../components/rect-button";
import { useUnmount } from "../../hooks";
import Svg, { Path } from "react-native-svg";

const AlertIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 100 100">
      <Path
        stroke={color}
        strokeMiterlimit="10"
        strokeWidth="6.25"
        d="M87.5 50c0-20.703-16.797-37.5-37.5-37.5S12.5 29.297 12.5 50 29.297 87.5 50 87.5 87.5 70.703 87.5 50z"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.167"
        d="M48.62 30.329l1.12 23.828 1.12-23.818a1.12 1.12 0 00-1.131-1.172v0a1.12 1.12 0 00-1.11 1.162v0z"
      />
      <Path
        fill={color}
        d="M49.74 69.754a3.906 3.906 0 110-7.812 3.906 3.906 0 010 7.812z"
      />
    </Svg>
  );
};

export const LedgerGranterModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { ledgerInitStore } = useStore();

    const style = useStyle();

    const resumed = useRef(false);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
      // If this modal appears, it's probably because there was a problem with the ledger connection.
      // Ledger transport library for BLE seems to cache the transport internally.
      // But this can be small problem when the ledger connection is failed.
      // So, when this modal appears, try to disconnect the bluetooth connection for nano X.
      getLastUsedLedgerDeviceId().then((deviceId) => {
        if (deviceId) {
          TransportBLE.disconnect(deviceId);
        }
      });
    }, []);

    useUnmount(() => {
      // When the modal is closed without resuming, abort all the ledger init interactions.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!resumed.current) {
        ledgerInitStore.abortAll();
      }
    });

    useEffect(() => {
      const subscription = bleManager.onStateChange((newState) => {
        if (newState === State.PoweredOn) {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      }, true);

      return () => {
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      if (Platform.OS === "android" && !isAvailable) {
        // If the platform is android and can't use the bluetooth,
        // try to turn on the bluetooth.
        // Below API can be called only in android.
        bleManager.enable();
      }
    }, [isAvailable]);

    const [isFinding, setIsFinding] = useState(false);

    const [devices, setDevices] = useState<
      {
        id: string;
        name: string;
      }[]
    >([]);
    const [errorOnListen, setErrorOnListen] = useState<string | undefined>();

    useEffect(() => {
      let unsubscriber: (() => void) | undefined;

      if (isAvailable) {
        setIsFinding(true);

        (async () => {
          if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              throw new Error("Failed to get permission from OS");
            }
          }

          let _devices: {
            id: string;
            name: string;
          }[] = devices.slice();

          unsubscriber = TransportBLE.listen({
            complete: () => {
              setIsFinding(false);
            },
            next: (e: { type: string; descriptor: any }) => {
              if (e.type === "add") {
                const device = e.descriptor;

                if (!_devices.find((d) => d.id === device.id)) {
                  console.log(
                    `Ledger device found (id: ${device.id}, name: ${device.name})`
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
                setErrorOnListen("Unknown error");
              } else {
                if ("message" in e && typeof e.message === "string") {
                  setErrorOnListen(e.message);
                } else if ("toString" in e) {
                  setErrorOnListen(e.toString());
                } else {
                  setErrorOnListen("Unknown error");
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
    }, [isAvailable]);

    return (
      <CardModal
        title="Pair Hardware Wallet"
        right={
          isFinding ? (
            <View style={style.flatten(["margin-left-8"])}>
              {/* Styling trick for positioning in the middle without occupying space */}
              <View
                style={style.flatten([
                  "absolute",
                  "height-1",
                  "flex-row",
                  "items-center",
                ])}
              >
                <LoadingSpinner
                  size={20}
                  color={style.get("color-primary").color}
                />
              </View>
            </View>
          ) : undefined
        }
      >
        {isAvailable ? (
          <React.Fragment>
            {errorOnListen ? (
              <View style={style.flatten(["items-center"])}>
                <AlertIcon size={100} color={style.get("color-danger").color} />
                <Text style={style.flatten(["h4", "color-danger"])}>Error</Text>
                <Text
                  style={style.flatten([
                    "subtitle3",
                    "color-text-black-medium",
                    "margin-top-16",
                  ])}
                >
                  {errorOnListen}
                </Text>
              </View>
            ) : (
              <React.Fragment>
                <Text
                  style={style.flatten(["subtitle3", "color-text-black-high"])}
                >
                  1. Open the Cosmos app on your Ledger device
                </Text>
                <Text
                  style={style.flatten(["subtitle3", "color-text-black-high"])}
                >
                  2. Select the hardware wallet you’d like to pair
                </Text>
              </React.Fragment>
            )}

            {devices.map((device) => {
              return (
                <LedgerNanoBLESelector
                  key={device.id}
                  deviceId={device.id}
                  name={device.name}
                  onCanResume={async () => {
                    resumed.current = true;
                    await ledgerInitStore.resumeAll(device.id);
                  }}
                />
              );
            })}
          </React.Fragment>
        ) : (
          <Text style={style.flatten(["subtitle3", "color-text-black-high"])}>
            Please turn on Bluetooth
          </Text>
        )}
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

const LedgerNanoBLESelector: FunctionComponent<{
  deviceId: string;
  name: string;

  onCanResume: () => void;
}> = ({ deviceId, name, onCanResume }) => {
  const style = useStyle();

  const [isConnecting, setIsConnecting] = useState(false);
  const [initErrorOn, setInitErrorOn] = useState<LedgerInitErrorOn | undefined>(
    undefined
  );

  const testLedgerConnection = async (): Promise<boolean> => {
    let initErrorOn: LedgerInitErrorOn | undefined;

    try {
      setIsConnecting(true);
      const ledger = await Ledger.init(() => TransportBLE.open(deviceId));
      await ledger.close();

      return true;
    } catch (e) {
      console.log(e);
      if (e.errorOn != null) {
        initErrorOn = e.errorOn;
      } else {
        initErrorOn = LedgerInitErrorOn.Unknown;
      }

      await TransportBLE.disconnect(deviceId);

      return false;
    } finally {
      setInitErrorOn(initErrorOn);
      setIsConnecting(false);
    }
  };

  return (
    <RectButton
      style={style.flatten(["padding-y-12"])}
      onPress={async () => {
        if (await testLedgerConnection()) {
          onCanResume();
        }
      }}
    >
      <View style={style.flatten(["min-height-44"])}>
        <Text style={style.flatten(["h5", "color-text-black-medium"])}>
          {name}
        </Text>
        {isConnecting ? (
          <Text style={style.flatten(["subtitle3", "color-text-black-low"])}>
            Connecting...
          </Text>
        ) : null}
        {!isConnecting && initErrorOn === LedgerInitErrorOn.Transport ? (
          <Text style={style.flatten(["subtitle3", "color-text-black-low"])}>
            Please unlock ledger nano X
          </Text>
        ) : null}
        {!isConnecting && initErrorOn === LedgerInitErrorOn.App ? (
          <Text style={style.flatten(["subtitle3", "color-text-black-low"])}>
            Please open Cosmos App
          </Text>
        ) : null}
        {!isConnecting && initErrorOn === LedgerInitErrorOn.Unknown ? (
          <Text style={style.flatten(["subtitle3", "color-text-black-low"])}>
            Unknown error
          </Text>
        ) : null}
      </View>
    </RectButton>
  );
};
