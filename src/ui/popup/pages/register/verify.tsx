import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import style from "./style.module.scss";
import { Button } from "../../../components/button";

export const VerifyInPage: FunctionComponent<{
  words: string;
  onVerify: () => void;
}> = props => {
  const wordsSlice = useMemo(() => {
    const words = props.words.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    return words;
  }, [props.words]);

  const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

  useEffect(() => {
    // Set randomized words.
    const words = props.words.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    words.sort(() => {
      return Math.random() > 0.5 ? -1 : 1;
    });
    setRandomizedWords(words);
    // Clear suggested words.
    setSuggestedWords([]);
  }, [props.words]);

  return (
    <div className={style.container}>
      <div className={style.intro}>Verify your mnemonic</div>
      <div style={{ minHeight: "11rem" }}>
        <div className="buttons">
          {suggestedWords.map((word, i) => {
            return (
              <Button
                key={word}
                onClick={() => {
                  const word = suggestedWords[i];
                  setSuggestedWords(
                    suggestedWords
                      .slice(0, i)
                      .concat(suggestedWords.slice(i + 1))
                  );
                  randomizedWords.push(word);
                  setRandomizedWords(randomizedWords.slice());
                }}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
      <hr />
      <div className="buttons">
        {randomizedWords.map((word, i) => {
          return (
            <Button
              key={word}
              onClick={() => {
                const word = randomizedWords[i];
                setRandomizedWords(
                  randomizedWords
                    .slice(0, i)
                    .concat(randomizedWords.slice(i + 1))
                );
                suggestedWords.push(word);
                setSuggestedWords(suggestedWords.slice());
              }}
            >
              {word}
            </Button>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <Button
        className={style.button}
        color="primary"
        type="submit"
        size="medium"
        disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
        onClick={() => {
          props.onVerify();
        }}
      >
        Register
      </Button>
    </div>
  );
};
