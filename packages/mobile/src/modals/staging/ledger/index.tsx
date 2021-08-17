import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { PermissionsAndroid, Platform, Text } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";

export const LedgerGranterModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const style = useStyle();

    const { ledgerInitStore } = useStore();

    const [devices, setDevices] = useState<
      {
        id: string;
        name: string;
      }[]
    >([]);

    const findDevices = async (): Promise<void> => {
      await new Promise<void>((resolve, reject) => {
        TransportBLE.observeState({
          next: (e: { available: boolean }) => {
            if (e.available) {
              resolve();
            } else {
              reject(new Error("Bluetooth is unsupported"));
            }
          },
          complete: () => {
            console.log("BLE observe complete");
            // QUESTION: What should I do?
          },
          error: reject,
        });
      });

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error("Failed to get permission from OS");
        }
      }

      let devices: {
        id: string;
        name: string;
      }[] = [];

      await new Promise<void>((resolve, reject) => {
        TransportBLE.listen({
          complete: resolve,
          next: (e: { type: string; descriptor: any }) => {
            if (e.type === "add") {
              const device = e.descriptor;

              if (!devices.find((d) => d.id === device.id)) {
                console.log(
                  `Ledger device found (id: ${device.id}, name: ${device.name})`
                );
                devices = [
                  ...devices,
                  {
                    id: device.id,
                    name: device.name,
                  },
                ];
                setDevices(devices);
              }
            }
          },
          error: reject,
        });
      });
    };

    const [isFinding, setIsFinding] = useState(false);

    return (
      <CardModal title="Grant Ledger Nano X">
        <Text style={style.flatten(["body1", "color-text-black-high"])}>
          Check the connection wiht the Ledger Nano X
        </Text>
        {devices.map((device) => {
          return (
            <Button
              key={device.id}
              mode="text"
              text={device.name}
              textStyle={style.flatten(["normal-case"])}
              onPress={async () => {
                await ledgerInitStore.resume(device.id);
              }}
            />
          );
        })}
        <Button
          text="Find"
          loading={isFinding}
          onPress={async () => {
            setIsFinding(true);

            try {
              await findDevices();
            } finally {
              setIsFinding(false);
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
