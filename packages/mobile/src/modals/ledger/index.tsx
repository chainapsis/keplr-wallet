import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { CardModal } from "../card";
import {
  AppState,
  AppStateStatus,
  Image,
  Platform,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "styles/index";
import { useStore } from "stores/index";
import { observer } from "mobx-react-lite";
import { State } from "react-native-ble-plx";
import TransportBLE, {
  bleManager,
} from "@ledgerhq/react-native-hw-transport-ble";
import { getLastUsedLedgerDeviceId } from "utils/ledger";
import { useUnmount } from "hooks/use-unmount";
import LottieView from "lottie-react-native";
import { Button } from "components/button";
import { BlurButton } from "components/new/button/blur-button";
import { CheckIcon } from "components/new/icon/check";
import Toast from "react-native-toast-message";
import { LedgerErrorView } from "./ledger-error-view";
import { LedgerNanoBLESelector } from "./ledger-selector";

enum BLEPermissionGrantStatus {
  NotInit = "notInit",
  Failed = "failed",
  // When it failed but need to try again.
  // For example, when the bluetooth permission is turned off, but user allows the permission in the app setting page and return to the app.
  FailedAndRetry = "failed-and-retry",
  Granted = "granted",
}

export enum BluetoothMode {
  Ledger = "Ledger",
  Device = "DeviceLedger",
  Connecting = "ConnectingLedger",
  Pairing = "PairingLedger",
  Paired = "PairedLedger",
}

export const LedgerGranterModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = observer(({ isOpen, close }) => {
  const { ledgerInitStore } = useStore();

  const style = useStyle();

  const resumed = useRef(false);
  const [isBLEAvailable, setIsBLEAvailable] = useState(false);
  const [mainContent, setMainContent] = useState<string>(
    "press and hold two buttons at the same time and enter your pin"
  );
  const [pairingText, setIsPairingText] = useState<string>(
    "Waiting for bluetooth signal..."
  );
  const [paired, setIsPaired] = useState<boolean>(false);
  const [isFinding, setIsFinding] = useState(false);

  const [devices, setDevices] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const [errorOnListen, setErrorOnListen] = useState<string | undefined>();

  const [permissionStatus, setPermissionStatus] =
    useState<BLEPermissionGrantStatus>(() => {
      if (Platform.OS === "android") {
        // If android, there is need to request the permission.
        // You should ask for the permission on next effect.
        return BLEPermissionGrantStatus.Granted;
      } else {
        // If not android, there is no need to request the permission
        return BLEPermissionGrantStatus.Granted;
      }
    });
  const [bluetoothMode, setBluetoothMode] = useState<BluetoothMode>(
    BluetoothMode.Ledger
  );

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
    if (!resumed.current) {
      ledgerInitStore.abortAll();
    }
  });

  useEffect(() => {
    const subscription = bleManager.onStateChange((newState) => {
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
    const listener = (state: AppStateStatus) => {
      if (
        state === "active" &&
        permissionStatus === BLEPermissionGrantStatus.Failed
      ) {
        // When the app becomes active, the user may have granted permission on the setting page, so request the grant again.
        setPermissionStatus(BLEPermissionGrantStatus.FailedAndRetry);
      }
    };

    const callback = AppState.addEventListener("change", listener);

    return () => {
      callback.remove();
    };
  }, [permissionStatus]);

  useEffect(() => {
    let unsubscriber: (() => void) | undefined;
    setErrorOnListen(undefined);

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
                setMainContent("Choose a wallet to connect");
                setBluetoothMode(BluetoothMode.Device);
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
      setIsPairingText("Waiting for bluetooth signal...");
      setMainContent(
        "press and hold two buttons at the same time and enter your pin"
      );
      setBluetoothMode(BluetoothMode.Ledger);
      setIsFinding(false);
    }

    return () => {
      if (unsubscriber) {
        unsubscriber();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBLEAvailable, permissionStatus]);

  const decideLedgerImage = (bluetoothMode: BluetoothMode) => {
    switch (bluetoothMode) {
      case BluetoothMode.Ledger:
        return require("assets/image/ledger/ledger.png");

      case BluetoothMode.Device:
        return require("assets/image/ledger/device-ledger.png");

      case BluetoothMode.Connecting:
        return require("assets/image/ledger/connecting-ledger.png");

      case BluetoothMode.Pairing:
        return require("assets/image/ledger/pairing-ledger.png");

      case BluetoothMode.Paired:
        return require("assets/image/ledger/paired-ledger.png");
    }
  };

  return (
    <CardModal
      isOpen={isOpen}
      title="Pair hardware wallet to continue"
      close={() => close()}
    >
      {isFinding ? (
        <View
          style={
            style.flatten([
              "justify-center",
              "items-center",
              "margin-y-14",
            ]) as ViewStyle
          }
        >
          <Image
            source={decideLedgerImage(bluetoothMode)}
            style={{
              height: 52,
              width: 292,
              aspectRatio: 2.977,
              position: "absolute",
            }}
            resizeMode="contain"
            fadeDuration={0}
          />

          <View
            style={
              [
                style.flatten(["flex-row", "margin-left-4"]),
                { width: 290 },
              ] as ViewStyle
            }
          >
            {BluetoothMode.Ledger == bluetoothMode ||
            BluetoothMode.Pairing == bluetoothMode ? (
              <React.Fragment>
                <LottieView
                  source={require("assets/lottie/single_button.json")}
                  autoPlay
                  speed={2}
                  loop={true}
                  style={style.flatten(["height-44"]) as ViewStyle}
                />
                <LottieView
                  source={require("assets/lottie/single_button.json")}
                  autoPlay
                  speed={2}
                  loop={true}
                  style={
                    [
                      style.flatten(["height-44"]),
                      { marginLeft: Platform.OS === "android" ? 37 : 24.5 },
                    ] as ViewStyle
                  }
                />
              </React.Fragment>
            ) : (
              <View style={style.flatten(["height-44"]) as ViewStyle} />
            )}
          </View>
        </View>
      ) : undefined}
      {isBLEAvailable &&
      permissionStatus === BLEPermissionGrantStatus.Granted ? (
        <React.Fragment>
          {!errorOnListen && bluetoothMode == BluetoothMode.Ledger ? (
            <Text
              style={style.flatten(["subtitle3", "color-white", "text-center"])}
            >
              To unlock your ledger device,
            </Text>
          ) : null}
          {!errorOnListen && mainContent ? (
            <Text
              style={
                style.flatten([
                  "subtitle3",
                  "color-white",
                  "text-center",
                  "margin-y-10",
                ]) as ViewStyle
              }
            >
              {mainContent}
            </Text>
          ) : null}

          {!errorOnListen && bluetoothMode !== BluetoothMode.Device ? (
            <View style={style.flatten(["items-center"]) as ViewStyle}>
              <BlurButton
                text={pairingText}
                backgroundBlur={false}
                leftIcon={paired ? <CheckIcon color="black" size={14} /> : null}
                leftIconStyle={style.flatten(["margin-right-8"]) as ViewStyle}
                textStyle={
                  style.flatten(
                    ["text-caption1"],
                    [paired && "color-black"]
                  ) as ViewStyle
                }
                containerStyle={
                  style.flatten(
                    ["margin-y-6", "padding-x-12"],
                    [
                      paired
                        ? "background-color-vibrant-green-500"
                        : "background-color-indigo-800",
                    ]
                  ) as ViewStyle
                }
              />
            </View>
          ) : null}
          {errorOnListen ? <LedgerErrorView text={errorOnListen} /> : null}
          {(BluetoothMode.Ledger == bluetoothMode ||
            BluetoothMode.Pairing == bluetoothMode) &&
          !errorOnListen ? (
            <Button
              text="Stuck? Read our ‘how to’ article"
              size="large"
              mode="outline"
              containerStyle={
                style.flatten([
                  "margin-y-20",
                  "border-color-platinum-300",
                  "border-radius-32",
                ]) as ViewStyle
              }
              textStyle={style.flatten(["color-white", "body2"])}
              onPress={() =>
                Toast.show({
                  type: "error",
                  text1: "Under development",
                })
              }
            />
          ) : null}

          {devices.map((device) => {
            return (
              <LedgerNanoBLESelector
                key={device.id}
                deviceId={device.id}
                name={device.name}
                setMainContent={setMainContent}
                setBluetoothMode={setBluetoothMode}
                setIsPairingText={setIsPairingText}
                setIsPaired={setIsPaired}
                onCanResume={async () => {
                  resumed.current = true;
                  await ledgerInitStore.resumeAll(device.id);
                }}
              />
            );
          })}
        </React.Fragment>
      ) : (
        <Text
          style={
            style.flatten([
              "subtitle3",
              "color-white",
              "text-center",
              "margin-y-20",
            ]) as ViewStyle
          }
        >
          Please turn on Bluetooth
        </Text>
      )}
    </CardModal>
  );
});
