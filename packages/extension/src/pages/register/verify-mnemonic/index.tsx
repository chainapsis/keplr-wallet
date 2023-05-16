import React, { FunctionComponent, useMemo, useRef } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Gutter } from "../../../components/gutter";
import { VerifyingMnemonicBox, VerifyingMnemonicBoxRef } from "./verifying-box";
import { observer } from "mobx-react-lite";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { Box } from "../../../components/box";
import { FormNamePassword, useFormNamePassword } from "../components/form";

export const VerifyMnemonicScene: FunctionComponent<{
  mnemonic?: string;
  bip44Path?: {
    account: number;
    change: number;
    addressIndex: number;
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ mnemonic, bip44Path, stepPrevious, stepTotal }) => {
  if (!mnemonic || !bip44Path) {
    throw new Error("Mnemonic and bip44Path should be provided");
  }

  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Verify Your Recovery Phrase",
        paragraphs: [
          <div key="paragraphs">
            Fill out the words according to their numbers to
            <br />
            verify that you have stored your phrase safely.
          </div>,
        ],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

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

  const form = useFormNamePassword();

  return (
    <RegisterSceneBox>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (!verifyingBoxRef.current) {
            throw new Error("Ref of verify box is null");
          }

          if (verifyingBoxRef.current.validate()) {
            sceneTransition.replaceAll("finalize-key", {
              name: data.name,
              password: data.password,
              mnemonic: {
                value: mnemonic,
                bip44Path,
                isFresh: true,
              },
            });
          }
        })}
      >
        <VerifyingMnemonicBox ref={verifyingBoxRef} words={verifyingWords} />
        <Gutter size="1.25rem" />
        <Box width="22.5rem" marginX="auto">
          <FormNamePassword {...form} />
        </Box>
      </form>
    </RegisterSceneBox>
  );
});
