import React, {
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { useSceneTransition } from "../../../components/transition";
import { TextInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { VerifyingMnemonicBox, VerifyingMnemonicBoxRef } from "./verifying-box";

export const SetAccountInfoScene: FunctionComponent<{
  mnemonic?: string;
  needVerifyMnemonic?: boolean;
  bip44Path?: {
    account: number;
    change: number;
    addressIndex: number;
  };
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

  const verifyingBoxRef = useRef<VerifyingMnemonicBoxRef | null>(null);

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>Create Account</RegisterSceneBoxHeader>
      <form>
        {verifyingWords.length > 0 ? (
          <React.Fragment>
            <VerifyingMnemonicBox
              ref={verifyingBoxRef}
              words={verifyingWords}
            />
            <Gutter size="1.75rem" />
          </React.Fragment>
        ) : null}
        <Stack>
          <TextInput label="Name" />
          <TextInput label="Password" />
          <TextInput label="Verify password" />
          <Gutter size="1rem" />
          <Button
            text="Next"
            onClick={() => {
              if (
                !needVerifyMnemonic ||
                (verifyingBoxRef.current && verifyingBoxRef.current.validate())
              ) {
                alert("TODO");
                sceneTransition.pop();
              }
            }}
          />
        </Stack>
      </form>
    </RegisterSceneBox>
  );
};
