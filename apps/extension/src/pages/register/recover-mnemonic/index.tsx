import { observer } from "mobx-react-lite";
import React, {
  forwardRef,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { Buffer } from "buffer/";
import { FormattedMessage, useIntl } from "react-intl";
import { isMnemonicWord } from "@keplr-wallet/common";
import { checkButtonPositionAndScrollToButton } from "../utils/check-button-position-and-scroll-to-button";
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
  const firstTextInputRef = useRef<HTMLInputElement | null>(null);

  const header = useRegisterHeader();
  const intl = useIntl();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.recover-mnemonic.title",
        }),
        paragraphs: [
          <div key="paragraphs">
            <FormattedMessage id="pages.register.recover-mnemonic.paragraph-1" />
          </div>,
          <div key="paragraphs">
            <FormattedMessage id="pages.register.recover-mnemonic.paragraph-2" />
          </div>,
        ],
        stepCurrent: 1,
        stepTotal: 3,
      });
    },
    onDidVisible: () => {
      if (firstTextInputRef.current) {
        firstTextInputRef.current.focus();
      }
    },
  });

  const sceneTransition = useSceneTransition();

  // Full words should remain 24 length.
  const [fullWords, setFullWords] = useState<string[]>(() =>
    new Array(24).fill("")
  );
  const [seedType, _setSeedType] = useState<SeedType>("12words");
  const setSeedType = (value: SeedType) => {
    const prev = seedType;

    const prevIsMnemonic = prev === "12words" || prev === "24words";
    const newIsMnemonic = value === "12words" || value === "24words";
    if (prevIsMnemonic !== newIsMnemonic) {
      setFullWords(new Array(24).fill(""));
    }

    _setSeedType(value);
  };

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
      .map((word) => word.toLowerCase().trim())
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
          setFullWords(words.concat(new Array(24).fill("")));
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

    let lastIndexOfNotEmpty = -1;
    for (let i = newFullWords.length - 1; i >= 0; i--) {
      if (newFullWords[i].length > 0) {
        lastIndexOfNotEmpty = i;
        break;
      }
    }
    if (lastIndexOfNotEmpty >= 12) {
      setSeedType("24words");
    }

    setFullWords(newFullWords);
  };

  const bip44PathState = useBIP44PathState();
  const [isBIP44CardOpen, setIsBIP44CardOpen] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

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
              privateKey: {
                value: Buffer.from(words[0].replace("0x", ""), "hex"),
                meta: {},
              },
              stepPrevious: 1,
              stepTotal: 3,
            });
          } else {
            // Trim empty string from back.
            while (
              words.length > 0 &&
              words[words.length - 1].trim().length === 0
            ) {
              words = words.slice(0, words.length - 1);
            }

            if (words.length <= 9) {
              alert(intl.formatMessage({ id: "error.too-short-mnemonic" }));
              return;
            }

            const notMnemonicWords: {
              index: number;
              word: string;
            }[] = [];
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              if (word) {
                if (!isMnemonicWord(word)) {
                  notMnemonicWords.push({
                    index: i,
                    word: word,
                  });
                }
              }
            }
            if (notMnemonicWords.length > 0) {
              alert(
                intl.formatMessage(
                  { id: "error.wrong-mnemonic-word" },
                  {
                    index: notMnemonicWords
                      .map((w) => `#${w.index + 1}`)
                      .join(", "),
                  }
                )
              );
              return;
            }

            const text = words.map((w) => w.trim()).join(" ");
            if (!Mnemonic.validateMnemonic(text)) {
              alert(intl.formatMessage({ id: "error.invalid-mnemonic" }));
              return;
            }
            sceneTransition.push("name-password", {
              mnemonic: text,
              bip44Path: bip44PathState.getPath(),
              stepPrevious: 1,
              stepTotal: 3,
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
                text: intl.formatMessage({
                  id: "pages.register.recover-mnemonic.12-words-tab",
                }),
              },
              {
                key: "24words",
                text: intl.formatMessage({
                  id: "pages.register.recover-mnemonic.24-words-tab",
                }),
              },
              {
                key: "private-key",
                text: intl.formatMessage({
                  id: "pages.register.recover-mnemonic.private-key-tab",
                }),
              },
            ]}
            itemMinWidth="6.25rem"
          />
        </Box>
        <Gutter size="1rem" />

        <Bleed left={seedType === "private-key" ? "0" : "1rem"}>
          <VerticalResizeTransition>
            {seedType === "private-key" ? (
              <Box width="100%">
                <FocusVisiblePasswordInput
                  value={fullWords[0]}
                  disableShowPassword={true}
                  onChange={(e) => {
                    e.preventDefault();

                    const next = new Array(24).fill("");
                    next[0] = e.target.value.trim();
                    setFullWords(next);
                  }}
                  onPaste={(e) => {
                    e.preventDefault();

                    handlePaste(0, e.clipboardData.getData("text"));
                  }}
                />
              </Box>
            ) : (
              <Styles.WordsGridContainer columns={words.length > 12 ? 4 : 3}>
                {words.map((word, i) => {
                  return (
                    <XAxis key={i} alignY="center">
                      <Styles.IndexText>{i + 1}.</Styles.IndexText>
                      <FocusVisiblePasswordInput
                        ref={i === 0 ? firstTextInputRef : undefined}
                        value={word}
                        onChange={(e) => {
                          e.preventDefault();

                          const next = fullWords.slice();
                          next[i] = e.target.value.trim().toLowerCase();
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
            )}
            <Gutter size="1rem" />
          </VerticalResizeTransition>
        </Bleed>

        <Gutter size="1.625rem" />

        {seedType !== "private-key" ? (
          <Box>
            <Box width="27.25rem" marginX="auto">
              <VerticalCollapseTransition
                width="100%"
                collapsed={isBIP44CardOpen}
                onTransitionEnd={() => {
                  if (isBIP44CardOpen) {
                    checkButtonPositionAndScrollToButton(buttonContainerRef);
                  }
                }}
              >
                <Box alignX="center">
                  <Button
                    size="small"
                    color="secondary"
                    text={intl.formatMessage({
                      id: "button.advanced",
                    })}
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
          </Box>
        ) : null}

        <Box width="22.5rem" marginX="auto">
          <div ref={buttonContainerRef}>
            <Button
              text={intl.formatMessage({
                id: "pages.register.recover-mnemonic.import-button",
              })}
              size="large"
              type="submit"
            />
          </div>
        </Box>
      </form>
    </RegisterSceneBox>
  );
});

// eslint-disable-next-line react/display-name
const FocusVisiblePasswordInput = forwardRef<
  HTMLInputElement,
  Omit<TextInputProps, "type" | "autoComplete" | "onFocus" | "onBlur"> &
    React.InputHTMLAttributes<HTMLInputElement> & {
      disableShowPassword?: boolean;
    }
>((props, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      ref={ref}
      type={(() => {
        if (props.disableShowPassword) {
          return "password";
        }

        return focused ? "text" : "password";
      })()}
      autoComplete="off"
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
    />
  );
});
