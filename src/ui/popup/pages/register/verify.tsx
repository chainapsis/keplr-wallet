import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import { Button } from "../../../components/button";

export const VerifyInPage: FunctionComponent<{
  words: string;
  onVerify: (words: string) => void;
  isLoading: boolean;
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
    <div>
      <div style={{ minHeight: "8.25rem" }}>
        <div className="buttons">
          {suggestedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
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
      <div style={{ minHeight: "8.25rem" }}>
        <div className="buttons">
          {randomizedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
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
      </div>
      <Button
        color="primary"
        type="submit"
        size="medium"
        disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
        onClick={() => {
          props.onVerify(suggestedWords.join(" "));
        }}
        loading={props.isLoading}
        fullwidth
        style={{
          marginTop: "30px"
        }}
      >
        Register
      </Button>
    </div>
  );
};
