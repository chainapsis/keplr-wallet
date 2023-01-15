import React, { FunctionComponent, useMemo, useState } from "react";
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

export const NewMnemonicScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const [words, setWords] = useState(
    "bag edit veteran phrase catch seat injury fade pact tomorrow pact charge".split(
      " "
    )
  );

  const threeWords: string[][] = useMemo(() => {
    let temp: string[] = [];
    const r: string[][] = [];
    for (const word of words) {
      temp.push(word);
      if (temp.length === 3) {
        r.push(temp);
        temp = [];
      }
    }

    if (temp.length !== 0) {
      r.push(temp);
    }

    return r;
  }, [words]);

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>New mnemonic</RegisterSceneBoxHeader>
      <Stack>
        <Bleed left="1rem">
          <VerticalResizeTransition
            springConfig={{
              precision: 1,
            }}
          >
            <Stack gutter="0.75rem">
              {threeWords.map((words, i) => {
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
        <Button
          mode="light"
          size="small"
          text="Set BIP Path"
          onClick={() => {
            if (words.length === 12) {
              setWords(
                "bag edit veteran phrase catch seat injury fade pact tomorrow pact charge bag edit veteran phrase catch seat injury fade pact tomorrow pact charge".split(
                  " "
                )
              );
            } else {
              setWords(
                "bag edit veteran phrase catch seat injury fade pact tomorrow pact charge".split(
                  " "
                )
              );
            }
          }}
        />
        <Gutter size="1rem" />
        <Button
          text="Next"
          onClick={() => {
            sceneTransition.pop();
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
