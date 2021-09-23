import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { PermissionsAndroid, Platform, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { BleManager, State } from "react-native-ble-plx";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { LoadingSpinner } from "../../components/spinner";
import { Ledger, LedgerInitErrorOn } from "@keplr-wallet/background";
import { getLastUsedLedgerDeviceId } from "../../utils/ledger";
import { RectButton } from "../../components/rect-button";
import { useUnmount } from "../../hooks";

export const LedgerGranterModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { ledgerInitStore } = useStore();

    const style = useStyle();

    const [bleManager] = useState(() => new BleManager());

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
    }, [bleManager]);

    useEffect(() => {
      if (Platform.OS === "android" && !isAvailable) {
        // If the platform is android and can't use the bluetooth,
        // try to turn on the bluetooth.
        // Below API can be called only in android.
        bleManager.enable();
      }
    }, [bleManager, isAvailable]);

    const [isFinding, setIsFinding] = useState(false);

    const [devices, setDevices] = useState<
      {
        id: string;
        name: string;
      }[]
    >([]);

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
            <Text style={style.flatten(["subtitle3", "color-text-black-high"])}>
              1. Open the Cosmos app on your Ledger device
            </Text>
            <Text style={style.flatten(["subtitle3", "color-text-black-high"])}>
              2. Select the hardware wallet you’d like to pair
            </Text>
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
