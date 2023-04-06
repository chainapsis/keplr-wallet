import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Box } from "../../../components/box";
import { FormNamePassword, useFormNamePassword } from "../components/form";
import { useRegisterHeader } from "../components/header";
import { useSceneEvents } from "../../../components/transition";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";

export const RegisterNamePasswordScene: FunctionComponent<{
  mnemonic?: string;
  privateKey?: string;
  bip44Path?: {
    account: number;
    change: number;
    addressIndex: number;
  };
}> = observer(({ mnemonic, privateKey, bip44Path }) => {
  // TODO: Validate props?

  const { keyRingStore } = useStore();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Import Existing Wallet",
        stepCurrent: 3,
        stepTotal: 6,
      });
    },
  });

  const form = useFormNamePassword();

  return (
    <RegisterSceneBox>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (mnemonic && privateKey) {
            throw new Error("Both mnemonic and private key are provided");
          }

          if (mnemonic) {
            if (!bip44Path) {
              throw new Error("BIP44 path should be provided");
            }

            await keyRingStore.newMnemonicKey(
              mnemonic,
              bip44Path,
              data.name,
              data.password
            );
          }

          alert("TODO: Next page");
          window.close();
        })}
      >
        <Box width="22.5rem" marginX="auto">
          <FormNamePassword {...form} />
        </Box>
      </form>
    </RegisterSceneBox>
  );
});
