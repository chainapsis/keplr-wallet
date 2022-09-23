import { AddressQrCodeScannerModal } from "../src/app/screens/components/address-qr-code-scanner-modal";

export default (
  <AddressQrCodeScannerModal
    visible
    onScan={(address) => {
      console.log("onScan", address);
    }}
    onClose={() => {
      console.log("onClose");
    }}
  />
);
