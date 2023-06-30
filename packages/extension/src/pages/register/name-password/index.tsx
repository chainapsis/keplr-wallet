import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { FormNamePassword, useFormNamePassword } from "../components/form";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { observer } from "mobx-react-lite";
import { PlainObject } from "@keplr-wallet/background";
import { useIntl } from "react-intl";

export const RegisterNamePasswordScene: FunctionComponent<{
  mnemonic?: string;
  privateKey?: {
    value: Uint8Array;
    meta: PlainObject;
    needBackUpPrivateKey?: boolean;
  };
  bip44Path?: {
    account: number;
    change: number;
    addressIndex: number;
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({ mnemonic, privateKey, bip44Path, stepPrevious, stepTotal }) => {
    const sceneTransition = useSceneTransition();
    const intl = useIntl();

    const header = useRegisterHeader();
    useSceneEvents({
      onWillVisible: () => {
        header.setHeader({
          mode: "step",
          title: intl.formatMessage({
            id: "pages.register.name-password.title",
          }),
          stepCurrent: stepPrevious + 1,
          stepTotal: stepTotal,
        });
      },
    });

    const form = useFormNamePassword();

    return (
      <RegisterSceneBox>
        <form
          onSubmit={form.handleSubmit((data) => {
            if (mnemonic && privateKey) {
              throw new Error("Both mnemonic and private key are provided");
            }

            if (mnemonic) {
              if (!bip44Path) {
                throw new Error(
                  intl.formatMessage({
                    id: "error.bip44-path-required",
                  })
                );
              }

              sceneTransition.replaceAll("finalize-key", {
                name: data.name,
                password: data.password,
                mnemonic: {
                  value: mnemonic,
                  bip44Path,
                },
                stepPrevious: stepPrevious + 1,
                stepTotal,
              });
            }

            if (privateKey) {
              if (privateKey.needBackUpPrivateKey) {
                sceneTransition.push("back-up-private-key", {
                  name: data.name,
                  password: data.password,
                  privateKey,
                  stepPrevious: stepPrevious + 1,
                  stepTotal,
                });
              } else {
                sceneTransition.replaceAll("finalize-key", {
                  name: data.name,
                  password: data.password,
                  privateKey,
                  stepPrevious: stepPrevious + 1,
                  stepTotal,
                });
              }
            }
          })}
        >
          <FormNamePassword {...form} autoFocus={true} />
        </form>
      </RegisterSceneBox>
    );
  }
);
