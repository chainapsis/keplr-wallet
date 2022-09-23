import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, ModalProps } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../button";
import { useStore } from "../../../stores";

export interface AddressQrCodeScannerModalProps extends ModalProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

export const AddressQrCodeScannerModal = observer(
  ({ onClose, onScan, ...props }: AddressQrCodeScannerModalProps) => {
    const safeArea = useSafeAreaInsets();
    const { chainStore } = useStore();
    const { prefix } = chainStore.currentChainInformation;

    return (
      <Modal {...props}>
        <QRCodeScanner
          onRead={({ data }) => {
            if (data.startsWith(prefix)) {
              onScan(data);
            }
          }}
          cameraStyle={{ height: "100%" }}
          bottomContent={
            <Button
              flavor="green"
              label="Cancel"
              onPress={() => {
                onClose();
              }}
            />
          }
          bottomViewStyle={{
            paddingHorizontal: 20,
            position: "absolute",
            marginVertical: safeArea.left,
            bottom: safeArea.bottom,
          }}
          reactivate
          showMarker
        />
      </Modal>
    );
  }
);

export function useAddressQrCodeScannerModal(
  onScan: (address: string) => void
) {
  const [visible, setVisible] = useState(false);

  return {
    open() {
      setVisible(true);
    },
    render() {
      return (
        <AddressQrCodeScannerModal
          visible={visible}
          onScan={(address) => {
            onScan(address);
            setVisible(false);
          }}
          onClose={() => {
            setVisible(false);
          }}
        />
      );
    },
  };
}
