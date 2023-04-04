import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { TextInput } from "../../../components/input";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { HorizontalRadioGroup } from "../../../components/radio-group";
import { Gutter } from "../../../components/gutter";
import { Box } from "../../../components/box";
import { useRegisterHeader } from "../components/header";
import { useSceneEvents } from "../../../components/transition";

type WordsType = "12words" | "24words" | "private-key";

interface FormData {
  name: string;
  password: string;
  mnemonic: string;
}

export const RecoverMnemonicScene: FunctionComponent = observer(() => {
  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Import Existing Wallet",
        paragraphs: [
          <React.Fragment key="1">
            Enter your recovery phrase here to restore your wallet.
            <br />
            Click on any blank to paste the entire phrase.
          </React.Fragment>,
          <React.Fragment key="2">
            Please make sure that you have selected the right option.
          </React.Fragment>,
        ],
        stepCurrent: 1,
        stepTotal: 6,
      });
    },
  });

  const { keyRingStore } = useStore();

  const [wordsType, setWordsType] = useState<WordsType>("12words");

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      mnemonic: "",
    },
  });

  return (
    <RegisterSceneBox>
      <Box alignX="center">
        <HorizontalRadioGroup
          size="large"
          selectedKey={wordsType}
          onSelect={(key) => {
            setWordsType(key as WordsType);
          }}
          items={[
            {
              key: "12words",
              text: "12 words",
            },
            {
              key: "24words",
              text: "24 words",
            },
            {
              key: "private-key",
              text: "Private key",
            },
          ]}
          itemMinWidth="6.25rem"
        />
      </Box>

      <Gutter size="1rem" />
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
