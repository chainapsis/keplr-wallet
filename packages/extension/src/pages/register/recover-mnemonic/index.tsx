import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { TextInput } from "../../../components/input";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";

interface FormData {
  name: string;
  password: string;
  mnemonic: string;
}

export const RecoverMnemonicScene: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      mnemonic: "",
    },
  });

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>Recover Mnemonic</RegisterSceneBoxHeader>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          await keyRingStore.newMnemonicKey(
            data.mnemonic,
            {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            data.name,
            data.password
          );

          window.close();
        })}
      >
        <TextInput
          label="Mnemonic"
          {...form.register("mnemonic", {
            required: true,
          })}
        />

        <TextInput
          label="Name"
          {...form.register("name", {
            required: true,
          })}
        />

        <TextInput
          label="Password"
          type="password"
          {...form.register("password", {
            required: true,
          })}
        />

        <Button text="Next" type="submit" />
      </form>
    </RegisterSceneBox>
  );
});
