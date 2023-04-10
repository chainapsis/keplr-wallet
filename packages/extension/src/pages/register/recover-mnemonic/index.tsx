import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Button } from "../../../components/button";
import { HorizontalRadioGroup } from "../../../components/radio-group";
import { Gutter } from "../../../components/gutter";
import { Box } from "../../../components/box";
import { useRegisterHeader } from "../components/header";
import {
  useFixedWidthScene,
  useSceneEvents,
  useSceneTransition,
  VerticalResizeTransition,
} from "../../../components/transition";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { SetBip44PathCard, useBIP44PathState } from "../components/bip-44-path";
import { Bleed } from "../../../components/bleed";
import { Styles } from "../new-mnemonic/styles";
import { XAxis } from "../../../components/axis";
import { TextInput, TextInputProps } from "../../../components/input";
import { Mnemonic } from "@keplr-wallet/crypto";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, "hex").length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

function validatePrivateKey(value: string): boolean {
  if (isPrivateKey(value)) {
    value = value.replace("0x", "");
    if (value.length !== 64) {
      return false;
    }
    return (
      Buffer.from(value, "hex").toString("hex").toLowerCase() ===
      value.toLowerCase()
    );
  }
  return false;
}

type SeedType = "12words" | "24words" | "private-key";

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

  const sceneTransition = useSceneTransition();

  const [seedType, setSeedType] = useState<SeedType>("12words");
  // Full words should remain 24 length.
  const [fullWords, setFullWords] = useState<string[]>(() =>
    new Array(24).fill("")
  );

  const fixedWidthScene = useFixedWidthScene();
  useEffect(() => {
    if (seedType === "24words") {
      fixedWidthScene.setWidth("41.5rem");
    } else {
      fixedWidthScene.setWidth(undefined);
    }
  }, [fixedWidthScene, seedType]);

  const words = fullWords.slice(
    0,
    (() => {
      switch (seedType) {
        case "12words":
          return 12;
        case "24words":
          return 24;
        case "private-key":
          return 1;
      }
    })()
  );

  const handlePaste = (index: number, value: string) => {
    const words = value
      .trim()
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    if (words.length === 1) {
      // If the length of pasted words is 1 and the word is guessed as a private key,
      // set seed type as private key automatically.
      if (isPrivateKey(words[0])) {
        setSeedType("private-key");
        const newFullWords = new Array(24).fill("").slice();
        newFullWords[0] = words[0];
        setFullWords(newFullWords);
        return;
      }
    }

    if (words.length === 12 || words.length === 24) {
      // 12/24 words are treated specially.
      // Regardless of where it is pasted from, if it is a valid seed, it will be processed directly.
      if (bip39.validateMnemonic(words.join(" "))) {
        if (words.length === 12) {
          setSeedType("12words");
          setFullWords(words.concat(new Array(12).fill("")));
        } else {
          setSeedType("24words");
          setFullWords(words);
        }

        return;
      }
    }

    const newFullWords = fullWords.slice();
    for (let i = index; i < Math.min(index + words.length, 24); i++) {
      newFullWords[i] = words[i - index];
    }

    if (newFullWords.length > 12) {
      setSeedType("24words");
    }

    setFullWords(newFullWords);
  };

  const bip44PathState = useBIP44PathState();
  const [isBIP44CardOpen, setIsBIP44CardOpen] = useState(false);

  return (
    <RegisterSceneBox>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          let words = fullWords.slice();
          if (seedType === "12words") {
            words = words.slice(0, 12);
          }
          if (seedType === "private-key") {
            words = words.slice(0, 1);
          }

          if (seedType === "private-key") {
            if (!validatePrivateKey(words[0])) {
              alert("Invalid private key");
              return;
            }

            sceneTransition.push("name-password", {
              privateKey: words[0].replace("0x", ""),
            });
          } else {
            const text = words.map((w) => w.trim()).join(" ");
            if (!Mnemonic.validateMnemonic(text)) {
              alert("Invalid mnemonic");
              return;
            }
            sceneTransition.push("name-password", {
              mnemonic: text,
              bip44Path: bip44PathState.getPath(),
            });
          }
        }}
      >
        <Box alignX="center">
          <HorizontalRadioGroup
            size="large"
            selectedKey={seedType}
            onSelect={(key) => {
              setSeedType(key as SeedType);
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

        <Bleed left="1rem">
          <VerticalResizeTransition
            springConfig={{
              precision: 1,
            }}
          >
            <Styles.WordsGridContainer columns={words.length > 12 ? 4 : 3}>
              {words.map((word, i) => {
                return (
                  <XAxis key={i} alignY="center">
                    <Styles.IndexText>{i + 1}.</Styles.IndexText>
                    <FocusVisiblePasswordInput
                      value={word}
                      onChange={(e) => {
                        e.preventDefault();

                        const next = fullWords.slice();
                        next[i] = e.target.value;
                        setFullWords(next);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();

                        handlePaste(i, e.clipboardData.getData("text"));
                      }}
                    />
                  </XAxis>
                );
              })}
            </Styles.WordsGridContainer>
            <Gutter size="1rem" />
          </VerticalResizeTransition>
        </Bleed>

        <Gutter size="1.625rem" />
        <Box width="27.25rem" marginX="auto">
          <VerticalCollapseTransition width="100%" collapsed={isBIP44CardOpen}>
            <Box alignX="center">
              <Button
                size="small"
                color="secondary"
                text="Advanced"
                onClick={() => {
                  setIsBIP44CardOpen(true);
                }}
              />
            </Box>
          </VerticalCollapseTransition>
          <VerticalCollapseTransition collapsed={!isBIP44CardOpen}>
            <SetBip44PathCard
              state={bip44PathState}
              onClose={() => {
                setIsBIP44CardOpen(false);
              }}
            />
          </VerticalCollapseTransition>
        </Box>
        <Gutter size="1.25rem" />

        <Box width="22.5rem" marginX="auto">
          <Button text="Import" size="large" type="submit" />
        </Box>
      </form>
    </RegisterSceneBox>
  );
});

const FocusVisiblePasswordInput: FunctionComponent<
  Omit<TextInputProps, "type" | "autoComplete" | "onFocus" | "onBlur"> &
    React.InputHTMLAttributes<HTMLInputElement>
> = (props) => {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      type={focused ? "text" : "password"}
      autoComplete="off"
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
    />
  );
};
