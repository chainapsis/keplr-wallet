import { observer } from "mobx-react-lite";

import { useStore } from "../../../stores";
import { useOnboardingNavigation } from "../onboarding-stack";
import { Lookup } from "./lookup";

export const LookupProxyWallets = observer(() => {
  const { multisigStore } = useStore();
  const { navigate } = useOnboardingNavigation();
  const address = multisigStore.nextAdmin.phoneNumber?.address;

  if (!address) return null;

  return (
    <Lookup
      address={address}
      onCancel={() => {
        navigate("create-multisig-phone-number");
      }}
      onSelect={(wallet) => {
        multisigStore.setWalletInRecovery(wallet);
        navigate("create-multisig-social");
      }}
    />
  );
});
