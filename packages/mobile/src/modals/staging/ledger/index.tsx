import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { PermissionsAndroid, Platform, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
import { BleManager, State } from "react-native-ble-plx";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { LoadingSpinner } from "../../../components/staging/spinner";
import { RectButton } from "react-native-gesture-handler";
import { Ledger, LedgerInitErrorOn } from "@keplr-wallet/background";

export const LedgerGranterModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const style = useStyle();

    const [bleManager] = useState(() => new BleManager());

    const [isAvailable, setIsAvailable] = useState(false);

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
        title="Grant Ledger Nano X"
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
              Check the connection wiht the Ledger Nano X
            </Text>
            {devices.map((device) => {
              return (
                <LedgerNanoBLESelector
                  key={device.id}
                  deviceId={device.id}
                  name={device.name}
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
}> = observer(({ deviceId, name }) => {
  const { ledgerInitStore, interactionModalStore } = useStore();

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
          interactionModalStore.popAll("/ledger-grant");
          await ledgerInitStore.resume(deviceId);
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
});
