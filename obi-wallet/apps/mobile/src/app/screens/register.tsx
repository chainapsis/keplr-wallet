import { AdditionalSignInPrepend, Text } from "@obi-wallet/common";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../stores";

export const RegisterScreen = observer(() => {
  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(keyRingStore, [
    ...(AdditionalSignInPrepend ?? []),
    // {
    //   type: TypeNewMnemonic,
    //   intro: NewMnemonicIntro,
    //   page: NewMnemonicPage,
    // },
    // {
    //   type: TypeRecoverMnemonic,
    //   intro: RecoverMnemonicIntro,
    //   page: RecoverMnemonicPage,
    // },
    // {
    //   type: TypeImportLedger,
    //   intro: ImportLedgerIntro,
    //   page: ImportLedgerPage,
    // },
  ]);

  return (
    <SafeAreaView>
      <Text>see packages/extension/src/pages/register/index.tsx</Text>
    </SafeAreaView>
  );
});
