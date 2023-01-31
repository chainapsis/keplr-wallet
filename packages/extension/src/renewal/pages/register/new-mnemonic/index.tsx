import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneTransition,
  VerticalResizeTransition,
} from "../../../components/transition";
import { Column, Columns } from "../../../components/column";
import { TextInput } from "../../../components/input";
import { XAxis } from "../../../components/axis";
import { Styles } from "./styles";
import { Gutter } from "../../../components/gutter";
import { Bleed } from "../../../components/bleed";
import { HorizontalButtonGroup } from "../../../components/button-group";
import { Box } from "../../../components/box";
import { Mnemonic } from "@keplr-wallet/crypto";
import { SetBip44PathCard, useBIP44PathState } from "../components/bip-44-path";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { observer } from "mobx-react-lite";

type WordsType = "12words" | "24words";

export const NewMnemonicScene: FunctionComponent = observer(() => {
  const sceneTransition = useSceneTransition();

  const [wordsType, setWordsType] = useState<WordsType>("12words");

  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const rng = (array: any) => {
      return Promise.resolve(crypto.getRandomValues(array));
    };

    if (wordsType === "12words") {
      Mnemonic.generateSeed(rng, 128).then((str) => setWords(str.split(" ")));
    } else if (wordsType === "24words") {
      Mnemonic.generateSeed(rng, 256).then((str) => setWords(str.split(" ")));
    } else {
      throw new Error(`Unknown words type: ${wordsType}`);
    }
  }, [wordsType]);

  const threeColumnWords: [string, string, string][] = useMemo(() => {
    const minRows = 4;

    let temp: string[] = [];
    const r: [string, string, string][] = [];
    for (const word of words) {
      temp.push(word);
      if (temp.length === 3) {
        r.push([temp[0], temp[1], temp[2]]);
        temp = [];
      }
    }

    if (temp.length !== 0) {
      r.push([temp[0] ?? "", temp[1] ?? "", temp[2] ?? ""]);
    }

    while (r.length < minRows) {
      r.push(["", "", ""]);
    }

    return r;
  }, [words]);

  const bip44PathState = useBIP44PathState();
  const [isBIP44CardOpen, setIsBIP44CardOpen] = useState(false);

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>New mnemonic</RegisterSceneBoxHeader>
      <Stack>
        <Styles.WarningContainer>
          <b>Backup your mnemonic seed securely.</b>
          <ul>
            <li>Anyone with your mnemonic seed can take your assets.</li>
            <li>{`Lost mnemonic seed can't be recovered.`}</li>
          </ul>
        </Styles.WarningContainer>
        <Gutter size="2rem" />
        <Box alignX="center">
          <HorizontalButtonGroup
            buttons={[
              {
                key: "12words",
                text: "12 words",
              },
              {
                key: "24words",
                text: "24 words",
              },
            ]}
            selectedKey={wordsType}
            onSelect={(key) => {
              setWordsType(key as WordsType);
            }}
            buttonMinWidth="5.625rem"
          />
        </Box>
        <Gutter size="2rem" />
        <Bleed left="1rem">
          <VerticalResizeTransition
            springConfig={{
              precision: 1,
            }}
          >
            <Stack gutter="0.75rem">
              {threeColumnWords.map((words, i) => {
                return (
                  <Columns key={i} sum={3}>
                    {words.map((word, j) => {
                      return (
                        <Column key={j} weight={1}>
                          <XAxis alignY="center">
                            <Styles.IndexText>
                              {i * 3 + j + 1}.
                            </Styles.IndexText>
                            <TextInput
                              value={word}
                              readOnly={true}
                              removeBottomMargin={true}
                            />
                          </XAxis>
                        </Column>
                      );
                    })}
                  </Columns>
                );
              })}
            </Stack>
            <Gutter size="1rem" />
          </VerticalResizeTransition>
        </Bleed>
        <Gutter size="1rem" />
        <VerticalCollapseTransition width="100%" collapsed={isBIP44CardOpen}>
          <Box alignX="center">
            <Button
              mode="light"
              size="small"
              text="Set BIP Path"
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

        <Gutter size="1rem" />
        <Button
          text="Next"
          disabled={!bip44PathState.isValid()}
          onClick={() => {
            if (words.join(" ").trim() !== "") {
              sceneTransition.push("verify-mnemonic", {
                mnemonic: words.join(" "),
                needVerifyMnemonic: true,
                bip44Path: bip44PathState.getPath(),
              });
            }
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
});
