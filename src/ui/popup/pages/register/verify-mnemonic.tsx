import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Button } from "reactstrap";

import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import { RegisterStatus, useRegisterState } from "../../../contexts/register";
import { TypeNewMnemonic } from "./new-mnemonic";
import { BackButton } from "./index";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const VerifyMnemonicPage: FunctionComponent<{
  modeAdd: boolean;
}> = ({ modeAdd }) => {
  const registerState = useRegisterState();

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.VERIFY &&
      registerState.type === TypeNewMnemonic ? (
        <VerifyMnemonicPageIn modeAdd={modeAdd} />
      ) : null}
    </React.Fragment>
  );
};

export const VerifyMnemonicPageIn: FunctionComponent<{
  modeAdd: boolean;
}> = observer(({ modeAdd }) => {
  const registerState = useRegisterState();

  const { keyRingStore } = useStore();

  const wordsSlice = useMemo(() => {
    if (
      registerState.type === TypeNewMnemonic &&
      registerState.status === RegisterStatus.VERIFY
    ) {
      if (!registerState.value) {
        throw new Error("Mnemonic is undefined");
      }

      const words = registerState.value.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      return words;
    }
    return [];
  }, [registerState]);

  const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

  useEffect(() => {
    if (
      registerState.type === TypeNewMnemonic &&
      registerState.status === RegisterStatus.VERIFY
    ) {
      if (!registerState.value) {
        throw new Error("Mnemonic is undefined");
      }

      // Set randomized words.
      const words = registerState.value.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      words.sort((word1, word2) => {
        return word1 > word2 ? 1 : -1;
      });
      setRandomizedWords(words);
      // Clear suggested words.
      setSuggestedWords([]);
    }
  }, [registerState]);

  const [isLoading, setIsLoading] = useState(false);

  const onBackButtonClick = useCallback(() => {
    registerState.setStatus(RegisterStatus.REGISTER);
  }, [registerState]);

  const onCreateButtonClick = useCallback(
    async (e: MouseEvent) => {
      e.preventDefault();
      if (
        suggestedWords.join(" ") === registerState.value.split(" ").join(" ")
      ) {
        try {
          setIsLoading(true);

          if (modeAdd) {
            await keyRingStore.addMnemonicKey(registerState.value);
          } else {
            await keyRingStore.createMnemonicKey(
              registerState.value,
              registerState.password
            );
          }
          await keyRingStore.save();
          registerState.setStatus(RegisterStatus.COMPLETE);
        } catch (e) {
          alert(e.message ? e.message : e.toString());
          registerState.clear();
        }
      } else {
        alert("Mnemonic unmatched");
        registerState.clear();
      }
    },
    [keyRingStore, modeAdd, registerState, suggestedWords]
  );

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.VERIFY &&
      registerState.type === TypeNewMnemonic ? (
        <div>
          <div style={{ minHeight: "153px" }}>
            <div className={style.buttons}>
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
          <div style={{ minHeight: "153px" }}>
            <div className={style.buttons}>
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
            disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
            block
            style={{
              marginTop: "30px"
            }}
            onClick={onCreateButtonClick}
            data-loading={isLoading}
          >
            <FormattedMessage id="register.verify.button.register" />
          </Button>
          <BackButton onClick={onBackButtonClick} />
        </div>
      ) : null}
    </React.Fragment>
  );
});
