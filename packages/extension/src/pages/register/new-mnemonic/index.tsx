import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneEvents,
  useSceneTransition,
  VerticalResizeTransition,
} from "../../../components/transition";
import { Column, Columns } from "../../../components/column";
import { TextInput } from "../../../components/input";
import { XAxis } from "../../../components/axis";
import { Styles } from "./styles";
import { Gutter } from "../../../components/gutter";
import { Bleed } from "../../../components/bleed";
import { Box } from "../../../components/box";
import { Mnemonic } from "@keplr-wallet/crypto";
import { useBIP44PathState } from "../components/bip-44-path";
import { observer } from "mobx-react-lite";
import lottie from "lottie-web";
import AnimSeed from "../../../public/assets/lottie/register/seed.json";
import { useRegisterHeader } from "../components/header";

type WordsType = "12words" | "24words";

export const NewMnemonicScene: FunctionComponent = observer(() => {
  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "New Recovery Phrase",
        stepCurrent: 1,
        stepTotal: 6,
      });
    },
  });

  const animDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (animDivRef.current) {
      lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "canvas",
        loop: true,
        autoplay: true,
        animationData: AnimSeed,
      });
    }
  }, []);

  const [policyDelayRemaining, setPolicyDelayRemaining] = useState(3000);
  const [policyVerified, setPolicyVerified] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPolicyDelayRemaining((v) => Math.max(v - 1000, 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const sceneTransition = useSceneTransition();

  const [wordsType, _setWordsType] = useState<WordsType>("12words");

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
  const [_isBIP44CardOpen, _setIsBIP44CardOpen] = useState(false);

  return (
    <RegisterSceneBox>
      <Box position="relative">
        {!policyVerified ? (
          <BlurBackdrop>
            <div style={{ width: "10rem", height: "10rem" }} ref={animDivRef} />
          </BlurBackdrop>
        ) : null}
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
                            <TextInput value={word} readOnly={true} />
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
      </Box>
      <Box paddingX="2.375rem">
        {policyVerified ? (
          <Button
            text="Next"
            size="large"
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
        ) : (
          <Button
            text={`I understood. Show my phrase.${
              policyDelayRemaining > 0
                ? ` (${Math.ceil(policyDelayRemaining / 1000)})`
                : ""
            }`}
            size="large"
            disabled={policyDelayRemaining > 0}
            onClick={() => {
              setPolicyVerified(true);
            }}
          />
        )}
      </Box>
    </RegisterSceneBox>
  );
});

const BlurBackdrop: FunctionComponent = ({ children }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "-1.625rem",
        bottom: 0,
        left: "-1rem",
        right: "-1rem",
        background: "rgba(51, 51, 51, 0.5)",
        borderRadius: "1rem",
        backdropFilter: "blur(13.5px)",
        zIndex: 1000,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
};
