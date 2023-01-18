import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { useSceneTransition } from "../../../components/transition";
import { TextInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { VerifyingMnemonicBox } from "./verifying-box";

export const SetAccountInfoScene: FunctionComponent<{
  mnemonic?: string;
  needVerifyMnemonic?: boolean;
  privateKeyHex?: string;
}> = ({ mnemonic, needVerifyMnemonic, privateKeyHex }) => {
  const sceneTransition = useSceneTransition();

  useLayoutEffect(() => {
    if (!mnemonic && !privateKeyHex) {
      throw new Error("Mnemonic or private key should be provided");
    }
  }, [mnemonic, privateKeyHex]);

  const [verifyingWords, setVerifyingWords] = useState<
    {
      index: number;
      word: string;
    }[]
  >([]);

  useLayoutEffect(() => {
    if (mnemonic) {
      if (mnemonic.trim() === "") {
        throw new Error("Empty mnemonic");
      }

      if (needVerifyMnemonic) {
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
        setVerifyingWords(
          [
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
          })
        );
      } else {
        setVerifyingWords([]);
      }
    }
  }, [mnemonic, needVerifyMnemonic]);

  console.log(verifyingWords);

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>Create Account</RegisterSceneBoxHeader>
      {verifyingWords.length > 0 ? (
        <React.Fragment>
          <VerifyingMnemonicBox words={verifyingWords} />
          <Gutter size="1.75rem" />
        </React.Fragment>
      ) : null}
      <Stack>
        <form>
          <TextInput label="Name" />
          <TextInput label="Password" />
          <TextInput label="Verify password" />
          <Gutter size="1rem" />
          <Button
            text="Next"
            onClick={() => {
              alert("TODO");
            }}
          />
        </form>
      </Stack>
    </RegisterSceneBox>
  );
};
