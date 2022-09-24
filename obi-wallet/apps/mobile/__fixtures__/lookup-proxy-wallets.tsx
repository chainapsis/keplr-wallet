import { LookupProxyWallets } from "../src/app/screens/components/lookup-proxy-wallets";
import { useStore } from "../src/app/stores";

export default () => {
  const { multisigStore } = useStore();
  const address = multisigStore.currentAdmin?.phoneNumber?.address;

  return (
    <LookupProxyWallets
      address={address!}
      onSelect={(wallet) => {
        console.log(wallet);
      }}
      onCancel={() => {
        console.log("cancel");
      }}
    />
  );
};
