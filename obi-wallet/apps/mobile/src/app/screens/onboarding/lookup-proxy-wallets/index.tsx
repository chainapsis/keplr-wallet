import { observer } from "mobx-react-lite";

import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet } from "../../../stores";
import { Lookup } from "./lookup";

export const LookupProxyWallets = observer(() => {
  const wallet = useMultisigWallet();
  const { navigate } = useRootNavigation();
  const address = wallet.nextAdmin.phoneNumber?.address;

  if (!address) return null;

  return (
    <Lookup
      address={address}
      onCancel={() => {
        navigate("create-multisig-phone-number");
      }}
      onSelect={(recoveryWallet) => {
        wallet.walletInRecovery = recoveryWallet;
        navigate("create-multisig-social");
      }}
    />
  );
});
