import React, { FunctionComponent, useMemo, useRef } from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { TextInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { VerifyingMnemonicBox, VerifyingMnemonicBoxRef } from "./verifying-box";
import { Styles } from "./styles";
import { useForm } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterHeader } from "../components/header";
import { useSceneEvents } from "../../../components/transition";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const VerifyMnemonicScene: FunctionComponent<{
  mnemonic?: string;
  bip44Path?: {
    account: number;
    change: number;
    addressIndex: number;
  };
}> = observer(({ mnemonic, bip44Path }) => {
  if (!mnemonic || !bip44Path) {
    throw new Error("Mnemonic and bip44Path should be provided");
  }

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Verify Your Recovery Phrase",
        paragraphs: [
          <React.Fragment key="1">
            Fill out the words according to their numbers to <br />
            verify that you have stored your phrase safely.
          </React.Fragment>,
        ],
        stepCurrent: 2,
        stepTotal: 6,
      });
    },
  });

  const { keyRingStore } = useStore();

  const verifyingWords = useMemo(() => {
    if (mnemonic.trim() === "") {
      throw new Error("Empty mnemonic");
    }

    const words = mnemonic.split(" ").map((w) => w.trim());
    const num = words.length;
    const one = Math.floor(Math.random() * num);
    const two = (() => {
      let r = Math.floor(Math.random() * num);
      while (r === one) {
        r = Math.floor(Math.random() * num);
      }
      return r;
    })();

    return [
      {
        index: one,
        word: words[one],
      },
      {
        index: two,
        word: words[two],
      },
    ].sort((word1, word2) => {
      return word1.index < word2.index ? -1 : 1;
    });
  }, [mnemonic]);

  const verifyingBoxRef = useRef<VerifyingMnemonicBoxRef | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>Back Up Your Mnemonic</RegisterSceneBoxHeader>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!verifyingBoxRef.current) {
            throw new Error("Ref of verify box is null");
          }

          if (verifyingBoxRef.current.validate()) {
            await keyRingStore.newMnemonicKey(
              mnemonic,
              bip44Path,
              data.name,
              data.password
            );

            alert("TODO: Next page");
            window.close();
          }
        })}
      >
        <Styles.VerifyInfoText>
          Confirm your mnemonic by filling in the words according to their
          number.
        </Styles.VerifyInfoText>
        <Gutter size="0.75rem" />
        <VerifyingMnemonicBox ref={verifyingBoxRef} words={verifyingWords} />
        <Gutter size="1.75rem" />
        <Stack>
          <TextInput
            label="Name"
            {...form.register("name", {
              required: true,
            })}
            error={
              form.formState.errors.name && form.formState.errors.name.message
            }
          />
          <TextInput
            label="Password"
            {...form.register("password", {
              required: true,
            })}
            error={
              form.formState.errors.password &&
              form.formState.errors.password.message
            }
          />
          <TextInput
            label="Verify password"
            {...form.register("confirmPassword", {
              required: true,
            })}
            error={
              form.formState.errors.confirmPassword &&
              form.formState.errors.confirmPassword.message
            }
          />
          <Gutter size="1rem" />
          <Button text="Next" type="submit" />
        </Stack>
      </form>
    </RegisterSceneBox>
  );
});
